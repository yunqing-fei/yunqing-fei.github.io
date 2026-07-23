#!/usr/bin/env node
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_DATA } from "../data/projects.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const port = Number(valueAfter("--port", process.env.PORT || 4173));
const host = valueAfter("--host", "0.0.0.0");
const dataFile = path.join(root, ".dev-data.json");

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
};

async function body(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function loadData() {
  try {
    return JSON.parse(await readFile(dataFile, "utf8"));
  } catch {
    return DEFAULT_DATA;
  }
}

function sendJson(response, value, status = 200) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(value));
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname === "/api/login" && request.method === "POST") {
    const parsed = JSON.parse((await body(request)) || "{}");
    return parsed.password === "BOCI"
      ? sendJson(response, { ok: true })
      : sendJson(response, { ok: false, error: "Incorrect password." }, 401);
  }

  if (url.pathname === "/api/projects" && request.method === "GET") {
    return sendJson(response, { ...(await loadData()), storage: "local-dev" });
  }

  if (url.pathname === "/api/projects" && request.method === "PUT") {
    if (request.headers["x-admin-password"] !== "BOCI") {
      return sendJson(response, { error: "Incorrect password." }, 401);
    }
    const parsed = JSON.parse((await body(request)) || "{}");
    if (!Array.isArray(parsed.projects)) {
      return sendJson(response, { error: "Projects must be an array." }, 400);
    }
    const next = {
      updatedAt: new Date().toISOString(),
      sourceNote: String(parsed.sourceNote || DEFAULT_DATA.sourceNote),
      projects: parsed.projects,
    };
    await writeFile(dataFile, JSON.stringify(next, null, 2));
    return sendJson(response, { ok: true, ...next });
  }

  let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
  if (url.pathname === "/admin" || !path.extname(url.pathname)) {
    filePath = "/index.html";
  }
  const resolved = path.resolve(root, "." + filePath);
  if (!resolved.startsWith(root + path.sep)) {
    response.writeHead(403);
    return response.end("Forbidden");
  }

  try {
    const content = await readFile(resolved);
    response.writeHead(200, {
      "content-type": types[path.extname(resolved)] || "application/octet-stream",
      "cache-control": "no-cache",
    });
    response.end(content);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`Local URL: http://localhost:${port}/`);
});
