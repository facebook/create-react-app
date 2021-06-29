# backpack-react-scripts

### **Important:** The currently supported version of **CRA** by `backpack-react-scripts` is up to `v4.0.3`. Versions above this may not work.

This package is a fork of [Create React App](https://github.com/facebookincubator/create-react-app) (specifically the
`react-scripts` package). It's intended to be used in conjuction with `create-react-app` like so:

```sh
npx create-react-app@4.0.3 my-app --scripts-version=@skyscanner/backpack-react-scripts --template @skyscanner/backpack --use-npm

# start your app development like you normally would with `create-react-app`
cd my-app
npm start
```

## What is different in our fork?

- Compilation of uncompiled Backpack components (specifically JSX).
- Skyscanner specific template with Backpack components integrated out of the box. Published as `@skyscanner/cra-template-backpack`
- CSS Modules enabled by default for all `.css` & `.scss` files.
- Ability to create a bundle for server side rending.
- Automatic chunking is disabled by default.
- **`css.html` & `js.html`**: New files in the `build/` output folder. These are html partials that include `<script />` and `<link />` references to the various static assets output by webpack. Useful if automatic chunking is turned on and you don't want to worry about order.
- A bunch of configuration options via `"backpack-react-scripts"` field in `package.json`:
  - `crossOriginLoading`: Modify the default behaviour, see [docs](https://webpack.js.org/configuration/output/#output-crossoriginloading).
  - `babelIncludePrefixes`: An array of module name prefixes to opt into babel compilation. Includes `["@skyscanner/bpk-", "bpk-", "saddlebag-"]` by default.
  - `enableAutomaticChunking`: Boolean, opt in to automatic chunking of vendor, common and app code.
  - `vendorsChunkRegex`: String, Regex for picking what goes into the `vendors` chunk. See `cacheGroups` in webpack docs. Dependent on `enableAutomaticChunking` being enabled
  - `amdExcludes`: Array of module names to exclude from AMD parsing. Incldues `["lodash"]` by default.
  - `externals`: exposing the Webpack config to modify externals, see [docs](https://webpack.js.org/configuration/externals/).
  - `ssrExternals`: Similar to above, but for `ssr.js` only.
  - `cssModules`: Boolean, true by default.
  - `sriEnabled`: Sets if SRI is to be used during build to add integrity hash for files, see [docs](https://github.com/waysact/webpack-subresource-integrity/blob/master/README.md).
    - **Note** if this is enabled, `crossOriginLoading` value is overriden with `anonymous` in order for it to output with the integrity value.
  - `ignoreCssWarnings`: Boolean, false by default. Allows the ability to supress CSS ordering issues when its safe to allow mixed order when it has not effect on output, see [docs](https://github.com/webpack-contrib/mini-css-extract-plugin#remove-order-warnings). False by default
