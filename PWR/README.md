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

### Hosting under `/pwr/` in an existing `username.github.io` repository

Do not upload this project's raw TypeScript source as the public `/pwr/` folder. Build it first:

```bash
npm install
npm run build
```

The normal build uses relative JavaScript and CSS paths, so the same `dist` output works at `/`, `/pwr/`, or another folder. Copy the **contents** of `dist/` into the host repository's `pwr/` folder:

```text
username.github.io repository/
├── index.html
└── pwr/
    ├── index.html
    ├── og.png
    └── assets/
```

The resulting page is available at `https://username.github.io/pwr/`.

If you prefer absolute `/pwr/` asset URLs, use:

```bash
npm run build:pwr
```

For correct social-preview image URLs, you may optionally build with:

```bash
VITE_SITE_URL=https://username.github.io/pwr npm run build
```

## Static output

```bash
npm run build
```

The deployable static files are generated in `dist/`.
