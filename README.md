# niteshacars

This repository holds two separate things, plus the CI that builds them.

| Path | What it is |
| --- | --- |
| `my-app/` | A React single-page app (Vite + TypeScript + Tailwind), deployed to GitHub Pages at [niteshacars.in](https://niteshacars.in) |
| `public_html/` | Static assets and PHP for the niteshacars.in site, including the admin area under `admin.niteshacars.in/` |

## my-app

See [`my-app/README.md`](my-app/README.md) for setup, scripts, and layout.

```bash
cd my-app
npm install
npm run dev
```

Requires Node.js 20.19+ or 22.12+, which is what Vite 8 supports.

## Deployment

Pushes to `main` that touch `my-app/` trigger
[`.github/workflows/deploy-my-app.yml`](.github/workflows/deploy-my-app.yml),
which builds the app and publishes it to GitHub Pages. It can also be run by
hand from the Actions tab.

The custom domain lives in `my-app/public/CNAME`. Vite copies `public/` into
`dist/` verbatim, so the file lands at the site root where Pages expects it.

## CI

[`.github/workflows/node.js.yml`](.github/workflows/node.js.yml) installs,
lints, and builds `my-app/` on every pull request and push to `main`, across
Node 20.x and 22.x.

`public_html/` is PHP and static files, deployed outside this repository, so no
workflow covers it.

## History

This repository began as a fork of
[facebook/create-react-app](https://github.com/facebook/create-react-app), and
for a while carried that project's whole monorepo — `packages/`, `docusaurus/`,
release tasks, integration tests, and its CI. None of it was developed here, and
its workflows could not pass once the root `package.json` was replaced, so it has
been removed. `LICENSE` is retained from that lineage.
