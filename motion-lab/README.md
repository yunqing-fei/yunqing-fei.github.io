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

The GitHub Pages-ready static site is emitted to `dist/client`. Asset URLs are relative, so the build works from a repository subpath such as `https://username.github.io/motion-lab/`.

## Publish on GitHub Pages

1. Push the project to a GitHub repository whose default branch is `main`.
2. In the repository, open **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Run the included **Deploy Motion Lab to GitHub Pages** workflow, or push to `main`.
