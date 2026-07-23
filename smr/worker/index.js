import { DEFAULT_DATA } from "./default-data.js";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: JSON_HEADERS });
}

function configuredPassword(env) {
  return env.ADMIN_PASSWORD || "BOCI";
}

async function ensureSchema(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS smr_atlas_data (
        id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    )
    .run();
}

async function readDataset(db) {
  await ensureSchema(db);
  const row = await db
    .prepare("SELECT payload, updated_at FROM smr_atlas_data WHERE id = ?")
    .bind("primary")
    .first();

  if (!row) {
    const payload = JSON.stringify(DEFAULT_DATA);
    await db
      .prepare(
        "INSERT INTO smr_atlas_data (id, payload, updated_at) VALUES (?, ?, ?)",
      )
      .bind("primary", payload, DEFAULT_DATA.updatedAt)
      .run();
    return DEFAULT_DATA;
  }

  try {
    return JSON.parse(row.payload);
  } catch {
    return DEFAULT_DATA;
  }
}

function validateProjects(projects) {
  if (!Array.isArray(projects) || projects.length > 2000) {
    return "Projects must be an array containing no more than 2,000 records.";
  }

  const required = [
    "id",
    "name",
    "country",
    "region",
    "vendor",
    "model",
    "technology",
    "status",
  ];

  for (const project of projects) {
    if (!project || typeof project !== "object") return "Every project must be an object.";
    if (required.some((field) => !String(project[field] || "").trim())) {
      return `Project ${project.id || "(without an id)"} is missing a required field.`;
    }
    if (!Number.isFinite(Number(project.lat)) || !Number.isFinite(Number(project.lon))) {
      return `Project ${project.id} needs valid latitude and longitude values.`;
    }
  }
  return null;
}

async function handleApi(request, env, url) {
  if (url.pathname === "/api/login" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    return body.password === configuredPassword(env)
      ? json({ ok: true })
      : json({ ok: false, error: "Incorrect password." }, 401);
  }

  if (url.pathname === "/api/projects" && request.method === "GET") {
    if (!env.DB) {
      return json({ ...DEFAULT_DATA, storage: "default" });
    }
    const data = await readDataset(env.DB);
    return json({ ...data, storage: "d1" });
  }

  if (url.pathname === "/api/projects" && request.method === "PUT") {
    if (request.headers.get("x-admin-password") !== configuredPassword(env)) {
      return json({ error: "Incorrect password." }, 401);
    }
    if (!env.DB) {
      return json({ error: "Persistent storage is unavailable." }, 503);
    }

    const body = await request.json().catch(() => ({}));
    const validationError = validateProjects(body.projects);
    if (validationError) return json({ error: validationError }, 400);

    const next = {
      updatedAt: new Date().toISOString(),
      sourceNote: String(body.sourceNote || DEFAULT_DATA.sourceNote),
      projects: body.projects,
    };
    await ensureSchema(env.DB);
    await env.DB
      .prepare(
        `INSERT INTO smr_atlas_data (id, payload, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`,
      )
      .bind("primary", JSON.stringify(next), next.updatedAt)
      .run();
    return json({ ok: true, ...next });
  }

  return json({ error: "Not found." }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, url);
    }

    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");

    if (response.status !== 404 || !acceptsHtml || !["GET", "HEAD"].includes(request.method)) {
      return response;
    }

    const indexUrl = new URL(request.url);
    indexUrl.pathname = "/index.html";
    indexUrl.search = "";
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};
