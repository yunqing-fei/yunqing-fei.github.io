#!/usr/bin/env node
import {
  cp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
if (!dist.startsWith(root + path.sep)) {
  throw new Error("Refusing to build outside the project root.");
}

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "client"), { recursive: true });
await mkdir(path.join(dist, "server"), { recursive: true });
await mkdir(path.join(dist, ".openai"), { recursive: true });

await cp(path.join(root, "index.html"), path.join(dist, "client", "index.html"));
await cp(path.join(root, "src"), path.join(dist, "client", "src"), {
  recursive: true,
});
await cp(path.join(root, "data"), path.join(dist, "client", "data"), {
  recursive: true,
});
await cp(
  path.join(root, "worker", "index.js"),
  path.join(dist, "server", "index.js"),
);
await cp(
  path.join(root, "data", "projects.js"),
  path.join(dist, "server", "default-data.js"),
);
await cp(
  path.join(root, ".openai", "hosting.json"),
  path.join(dist, ".openai", "hosting.json"),
);
await cp(path.join(root, "drizzle"), path.join(dist, ".openai", "drizzle"), {
  recursive: true,
});

const htmlPath = path.join(dist, "client", "index.html");
const html = await readFile(htmlPath, "utf8");
await writeFile(
  htmlPath,
  html.replace(
    "</head>",
    '<meta property="og:title" content="Global SMR Atlas" />\n<meta property="og:description" content="Explore and maintain a global SMR project dataset." />\n</head>',
  ),
);

console.log("Built Global SMR Atlas for Sites.");
