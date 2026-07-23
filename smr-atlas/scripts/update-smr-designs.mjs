#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_URL =
  "https://world-nuclear.org/information-library/nuclear-power-reactors/small-modular-reactors/small-modular-reactor-smr-design-database";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "data", "smr-designs.json");

const response = await fetch(SOURCE_URL, {
  headers: {
    accept: "text/html",
    "user-agent": "Global SMR Atlas data updater",
  },
});
if (!response.ok) {
  throw new Error(`Source request failed with HTTP ${response.status}.`);
}

const html = await response.text();
const marker = "var reactors = ";
const start = html.indexOf(marker);
const end = html.indexOf("\n];", start);
if (start < 0 || end < 0) {
  throw new Error("The embedded SMR design dataset was not found.");
}

const reactors = JSON.parse(
  html.slice(start + marker.length, end + 2),
);
if (!Array.isArray(reactors) || reactors.length === 0) {
  throw new Error("The embedded SMR design dataset is empty.");
}

const slug = (value, fallback) =>
  String(value || fallback)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || fallback;

const sourceDateText =
  html
    .match(
      /Updated\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}/i,
    )?.[0]
    ?.replace(/^Updated\s+/i, "") || "";
const sourceDate = new Date(sourceDateText);

const payload = {
  source: {
    title: "Small Modular Reactor (SMR) Design Database",
    publisher: "World Nuclear Association",
    url: SOURCE_URL,
    sourceUpdatedAt: Number.isNaN(sourceDate.getTime())
      ? null
      : sourceDate.toISOString().slice(0, 10),
    extractedAt: new Date().toISOString(),
    coordinateMeaning:
      "Developer headquarters city supplied by the source database; coordinates do not necessarily identify a reactor project site.",
  },
  designs: reactors.map((reactor, index) => ({
    id: slug(reactor.name, `design-${index + 1}`),
    ...reactor,
  })),
};

const ids = payload.designs.map((design) => design.id);
if (new Set(ids).size !== ids.length) {
  throw new Error("The source contains duplicate design names/IDs.");
}

await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(
  `Updated ${path.relative(root, outputPath)} with ${payload.designs.length} designs.`,
);
