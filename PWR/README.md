# PWR Atlas

An interactive bilingual Three.js guide to the major components of the AP1000 and Hualong One pressurized water reactor designs.

## Local development

```bash
npm install
npm run dev
```

## GitHub Pages deployment

1. Create a GitHub repository and upload the contents of this folder to its `main` branch.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Push to `main`, or run **Deploy to GitHub Pages** from the Actions tab.

The workflow in `.github/workflows/deploy-pages.yml` installs dependencies, builds the static site, and publishes the `dist` folder. It automatically handles both project URLs such as `https://username.github.io/repository-name/` and root user-site URLs such as `https://username.github.io/`.

## Static output

```bash
npm run build
```

The deployable static files are generated in `dist/`.
