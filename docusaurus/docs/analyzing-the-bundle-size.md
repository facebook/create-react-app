---
id: analyzing-the-bundle-size
title: Analyzing the Bundle Size
sidebar_label: Analyzing Bundle Size
---

Bundle size analysis is a technique/process that allows us to visually identify what is bloating our bundle file in our generated JavaScript files using visualization tools.

Using these tools can help you strategize what sections to [code split](code-splitting.md) or identify extraneous files which you are not using.

## Getting Started

[Source map explorer](https://www.npmjs.com/package/source-map-explorer) analyzes
JavaScript bundles using the source maps.

To add Source map explorer to a Create React App project, follow these steps:

```sh
npm install --save-dev source-map-explorer
```

Alternatively you may use `yarn`:

```sh
yarn add source-map-explorer -D
```

Then in `package.json`, add the following line to `scripts`:

```diff
   "scripts": {
+    "analyze": "source-map-explorer build/static/js/main.*",
     "start": "react-scripts start",
     "build": "react-scripts build",
     "test": "react-scripts test",
```

Then to analyze the bundle run the production build then run the analyze
script.

```
npm run build
npm run analyze
```

## Outputting Webpack Stats Data

> Note: this feature is natively available with react-scripts@2.0.3 and higher.

[Webpack stats data](https://webpack.js.org/api/stats/) is a JSON document containing statistics on modules which were generated during build time. This file is useful for many tools like [Webpack Visualizer](https://chrisbateman.github.io/webpack-visualizer/) or the [Webpack bundle analyzer web app](http://webpack.github.io/analyse/).

To output this stats file simply pass the `--stats` flag during build time.

```bash
npm run build --stats

# or

yarn build --stats
```

The generated stats can be found in `build/bundle-stats.json`

> Note:
> Although the stats file does not contain any sensitive data we recommend deleting the bundle stats file before making any deployments.  
> Making this apart of your deployment process can reduce the risk of publishing this file.

## Analyzing Multi-Chunk Bundle Sizes

`source-map-explorer` [currently does not support analyzing bundle sizes with multiple chunks](https://github.com/danvk/source-map-explorer/issues/25) like projects that utilize [code splitting](code-splitting.md). To analyze multiple chunks at once we need to use [`webpack-bundle-analyzer`](https://github.com/webpack-contrib/webpack-bundle-analyzer) with the [generated stats file](analyzing-the-bundle-size.md#outputting-webpack-stats-data) instead.

To get started with `webpack-bundle-analyzer`, follow these steps:

Install `webpack-bundle-analyzer`

```bash
npm install --save-dev webpack-bundle-analyzer

# or

yarn add webpack-bundle-analyzer -D
```

> Note: If you installed `source-map-explorer` we recommend removing it since `webpack-bundle-analyzer` does the same and more

Update or add the `analyze` script

```diff
   "scripts": {
-    "analyze": "source-map-explorer build/static/js/main.*",
+    "analyze": "webpack-bundle-analyzer build/bundle-stats.json",
     "start": "react-scripts start",
     "build": "react-scripts build",
     "test": "react-scripts test",
```

Create a new build with the stats file then run the analyze script

```bash
npm run build -- --stats
npm run analyze

# or

yarn build --stats
yarn analyze
```
