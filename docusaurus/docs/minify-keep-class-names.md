---
id: minify-keep-class-names
title: Minify Keep Class names
---

The production build of Create React App uses the [terser-js](https://github.com/terser-js/terser) Webpack Plugin to minify the JS / TS sources. By default the class anmes are minified and replaced. If you want to keep the JavaScript Class Names you can set the env variable `KEEP_CLASS_NAMES` before you run the production build.

Example with [cross-env](https://github.com/kentcdodds/cross-env#readme):

```sh
cross-env KEEP_CLASS_NAMES='true' && react-scripts build
```

In the `package.json` this would look like:

```json
{
    ...
    "scripts": {
        "build": "cross-env KEEP_CLASS_NAMES='true' react-scripts build"
    }
}
```
