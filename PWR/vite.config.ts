import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function githubPagesConfig() {
  const repository = process.env.GITHUB_REPOSITORY ?? "";
  const [owner = "", repositoryName = ""] = repository.split("/");
  const isGitHubBuild = process.env.GITHUB_ACTIONS === "true";
  const isUserOrOrganizationSite = repositoryName === `${owner}.github.io`;

  const base =
    isGitHubBuild && repositoryName && !isUserOrOrganizationSite
      ? `/${repositoryName}/`
      : "/";
  const siteUrl =
    isGitHubBuild && owner && repositoryName
      ? `https://${owner}.github.io${isUserOrOrganizationSite ? "" : `/${repositoryName}`}`
      : "http://localhost:5173";

  return { base, siteUrl };
}

export default defineConfig(() => {
  const { base, siteUrl } = githubPagesConfig();

  return {
    base,
    plugins: [
      react(),
      {
        name: "pwr-atlas-html-metadata",
        transformIndexHtml(html) {
          return html.replaceAll("__SITE_URL__", siteUrl);
        },
      },
    ],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: true,
    },
  };
});
