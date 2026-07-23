import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("includes the complete extracted SMR design catalogue", async () => {
  const catalogue = JSON.parse(
    await readFile(new URL("data/smr-designs.json", projectRoot), "utf8"),
  );

  assert.equal(catalogue.source.publisher, "World Nuclear Association");
  assert.match(catalogue.source.url, /smr-design-database$/);
  assert.equal(catalogue.designs.length, 133);
  assert.equal(
    new Set(catalogue.designs.map((design) => design.id)).size,
    catalogue.designs.length,
  );
  assert.ok(
    catalogue.designs.every(
      (design) =>
        design.name &&
        design.developer &&
        design.country &&
        Number.isFinite(Number(design.latitude)) &&
        Number.isFinite(Number(design.longitude)),
    ),
  );
});

test("exposes the catalogue route and design headquarters map layer", async () => {
  const source = await readFile(new URL("src/app.js", projectRoot), "utf8");

  assert.match(source, /#designs/);
  assert.match(source, /renderDesignCatalogue/);
  assert.match(source, /map-design-toggle/);
  assert.match(source, /developer HQ/i);
});
