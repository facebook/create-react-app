---
id: migrating-from-create-react-app
title: Migrating from Create React App
---

Create React App is deprecated. The React team recommends moving existing apps to a framework, or to a build tool if you need a custom setup. See [Sunsetting Create React App](https://react.dev/blog/2025/02/14/sunsetting-create-react-app) for background.

## Migration Guides

### Frameworks

- [Next.js](https://nextjs.org/docs/app/building-your-application/upgrading/from-create-react-app)
- [React Router](https://reactrouter.com/upgrading/component-routes)
- [Expo (webpack)](https://docs.expo.dev/router/migrate/from-expo-webpack/)

### Build Tools

- [Vite](https://www.robinwieruch.de/vite-create-react-app/)
- [Parcel](https://parceljs.org/migration/cra/)
- [Rsbuild](https://rsbuild.dev/guide/migration/cra)

## Create React App Conventions to Translate

Some behavior in Create React App is driven by conventions rather than explicit configuration. Check whether your app relies on any of the following, and look up the equivalent in the tool you are moving to.

| Convention | What Create React App does | Docs |
| --- | --- | --- |
| `REACT_APP_*` environment variables | Variables starting with `REACT_APP_` (plus `NODE_ENV` and `PUBLIC_URL`) are embedded into the bundle as `process.env.*` (`config/env.js`). | [Adding Custom Environment Variables](adding-custom-environment-variables.md) |
| `PUBLIC_URL` and `homepage` | The public path is taken from the `PUBLIC_URL` environment variable or the `homepage` field in `package.json` (`config/paths.js`). | [Deployment](deployment.md#building-for-relative-paths) |
| `%PUBLIC_URL%` in `public/index.html` | Replaced with the public path at build time. | [Using the Public Folder](using-the-public-folder.md) |
| `proxy` in `package.json` | Unknown requests in development are proxied to this address. | [Proxying API Requests in Development](proxying-api-requests-in-development.md) |
| `src/setupProxy.js` | Loaded automatically to register custom development proxy middleware (`config/paths.js`). | [Proxying API Requests in Development](proxying-api-requests-in-development.md#configuring-the-proxy-manually) |
| `baseUrl` in `jsconfig.json` / `tsconfig.json` | Enables absolute imports from `src` (`config/modules.js`). | [Importing a Component](importing-a-component.md#absolute-imports) |
| `import { ReactComponent } from './logo.svg'` | SVG files can be imported as React components. | [Adding Images, Fonts, and Files](adding-images-fonts-and-files.md#adding-svgs) |
| `browserslist` in `package.json` | Determines the browsers targeted by the JavaScript and CSS output. | [Supported Browsers and Features](supported-browsers-features.md) |
