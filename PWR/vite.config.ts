import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function normalizeBasePath(value: string | undefined) {
  const requestedPath = value?.trim();

  if (!requestedPath || requestedPath === "." || requestedPath === "./") {
    return "./";
  }

  const withLeadingSlash = requestedPath.startsWith("/")
    ? requestedPath
    : `/${requestedPath}`;

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

export default defineConfig(() => {
  // Relative assets work at the domain root, /pwr/, or any other folder.
  // Set VITE_BASE_PATH=/pwr/ only when an explicit absolute base is preferred.
  const base = normalizeBasePath(process.env.VITE_BASE_PATH);
  const siteUrl = (process.env.VITE_SITE_URL ?? ".").replace(
    /\/$/,
    "",
  );

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
