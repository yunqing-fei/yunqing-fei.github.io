import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("entry assets stay relative to a GitHub project path", async () => {
  const html = await readFile(new URL("index.html", projectRoot), "utf8");

  assert.match(html, /href="\.\/src\/styles\.css"/);
  assert.match(html, /src="\.\/src\/app\.js"/);
  assert.doesNotMatch(html, /(?:href|src)=["']\/(?!\/)/);

  const projectUrl = new URL("./src/app.js", "https://example.github.io/smr-atlas/");
  assert.equal(projectUrl.pathname, "/smr-atlas/src/app.js");
});

test("client routes and API requests use the detected application root", async () => {
  const source = await readFile(new URL("src/app.js", projectRoot), "utf8");

  assert.match(source, /const APP_ROOT = detectAppRoot\(\)/);
  assert.match(source, /appUrl\(`api\/\$\{resource\}`\)/);
  assert.match(source, /href="\.\/#admin"/);
  assert.doesNotMatch(source, /fetch\(["']\/api\//);
  assert.doesNotMatch(source, /href=["']\/(?:admin)?["']/);
});

test("build emits a Jekyll bypass and static published dataset", async () => {
  await access(new URL("dist/client/.nojekyll", projectRoot));
  const dataset = JSON.parse(
    await readFile(new URL("dist/client/data/projects.json", projectRoot), "utf8"),
  );

  assert.ok(Array.isArray(dataset.projects));
  assert.ok(dataset.projects.length > 0);
});
