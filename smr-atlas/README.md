# Global SMR Atlas

An interactive, mobile-friendly SMR project map, design database, and
lightweight data manager.

## SMR design database

Open **Design database** in the site navigation, or append `#designs` to the
site URL. The catalogue contains the 133 records published in the
[World Nuclear Association SMR Design Database](https://world-nuclear.org/information-library/nuclear-power-reactors/small-modular-reactors/small-modular-reactor-smr-design-database),
updated 1 July 2026.

The source coordinates identify each developer's headquarters rather than a
reactor project site. The map labels them as **SMR design · developer HQ** to
keep that distinction explicit.

Refresh the checked-in catalogue from the source page with:

```sh
npm run update:designs
```

Review the generated `data/smr-designs.json`, then commit and publish it in the
same way as the other static site data.

## GitHub Pages

The site has no package dependencies. The included GitHub Actions workflow
builds `dist/client` and deploys it to Pages whenever `main` is pushed.

1. In the repository, open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push the repository to the `main` branch, or run the
   **Deploy GitHub Pages** workflow manually.

All local assets, navigation, and API probes are application-root-relative, so
the site works at both `https://username.github.io/` and
`https://username.github.io/repository-name/`.

## Data manager on static hosting

Open the **Data manager** link, or append `#admin` to the site URL. The initial
case-sensitive password is `BOCI`.

GitHub Pages cannot run a database or securely protect a client-only page.
There, edits are saved only in the current browser. To publish them:

1. Export **JSON** from the data manager.
2. Put the downloaded `projects.json` at `data/projects.json` in the repository.
3. Commit and push it; the next Pages build will publish that dataset.

On a backend-enabled Sites deployment, the same UI automatically uses its API
and D1 storage instead.

## Local checks

```sh
npm test
```
