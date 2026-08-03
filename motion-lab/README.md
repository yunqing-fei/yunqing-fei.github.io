# Motion Lab

An interactive, responsive physics lesson about speed, distance, acceleration, graph slopes, momentum, kinetic energy, and stopping distance.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The GitHub Pages-ready static site is emitted to `dist/client`. Vite is configured with the explicit `/motion-lab/` repository base path, so production scripts, styles, and images load from `https://username.github.io/motion-lab/`.

## Publish on GitHub Pages

1. Push the project to a GitHub repository whose default branch is `main`.
2. In the repository, open **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Run the included **Deploy Motion Lab to GitHub Pages** workflow, or push to `main`.

Do not select the repository root as a branch-based Pages source. The root `index.html` is Vite source input; the workflow builds it and publishes only `dist/client`.
