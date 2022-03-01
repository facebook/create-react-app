Our react scripts fork includes a number of custom configuration items in order to support building web products at Skyscanner. The table below will describe what each of the configs do

## Features Description

| Feature | Description | Default Value |
|:---|:--|:---|
| **babelIncludePrefixes** | Array of module name prefixes to opt into babel compilation. <br> Default includes **@skyscanner/bpk-, bpk- and saddlebag-** packages by default to be compiled | **[@skyscanner/bpk-, bpk- and saddlebag-]** |
| **sriEnabled** | Determines if Subresource Intergrity is used during build to add an integrity hash for files. <br> The SRI is a security feature to enable browsers to verify the files they fetch are unmodified. <br> If enabled crossOriginLoading value is overriden with anonymous to allow output to have integrity value <br> See [webpack subresource integrity docs](https://github.com/waysact/webpack-subresource-integrity/blob/master/README.md) | **false** (this is currently the default in the future security may want to make it true by default but pending them still trying things about) |
| **crossOriginLoading** | Option to enable cross origin loading of chunks to modify the default webpack behaviour of being false. <br> Docs: https://webpack.js.org/configuration/output/#outputcrossoriginloading | **false** |
| **ignoreCssWarnings** | Provides the ablity to supress CSS ordering warnings when its safe and ordering is not of a concern on the output <br> See [mini css extract plugin docs](https://github.com/webpack-contrib/mini-css-extract-plugin#remove-order-warnings) | **false** - by default we should care about order as it can sometimes have an output impact |
| **cssModules** | Determines if cssModules are being used. <br> If enabled supports css modules and configures css-loader for use <br> If not enabled supports sass modules in the project and configures sass-loader for use | **true** |
| **amdExludes** | Array of module names to be excluded from AMD ([Asynchronous Module Definition](https://webpack.js.org/api/module-methods/#amd)) parsing.<br> lodash included by defeault. | **['lodash']** |
| **externals** | Provides a way of excluding dependencies from the bundles and instead relies on them being available at runtime on the clients environment E.g. React libraries.<br> See https://webpack.js.org/configuration/externals/ | **{}** |
| **ssrExternals** | The same as above `externals` except used for server side rendering only in **ssr.js** | **{}** |
| **enableAutomaticChunking** | Opts into automatic chunking of vender, common and app code.<br> When enabled the **splitChunks** plugin creates vender and common chunks which are split and when provided uses the `venderChunkRegex` to specify what is in each chunk.<br> When enabled **runtimeChunk** plugin creates a separate runtime chunk for projects to enable long term caching. | **false** |
| **vendorsChunkRegex** | Regex for picking what goes into the vendors chunk. Requires enableAutomaticChunking to be enabled.<br> See [cacheGroups](https://webpack.js.org/plugins/split-chunks-plugin/#splitchunkscachegroups) docs for further details. |  |
| **sassFunctions** | This function encodes svg content into `base64` when there is a `bpk-icon` in the.scss file. |  |

## How to add new feature

- Add the custom feature to backpack-addons.
- Require features in the file(for example, webpack.config.js) where they are needed.
  - For each line of code that is changed, make sure to add a comment `// #backpack-addon {{featureName}}`
  - Try to keep the lines of code changed outside of the backpack-addons folder to a minimum
`require(...../backpack-addons/...)` files instead of writing it inline as much as possible.
- Add a description of the new feature in the table above the current document.

## How to upgrade from the upstream `facebook/create-react-app` repo

- Replace all of `packages/react-scripts` with the upstream version.
- Restore `packages/react-scripts/backpack-addons` all features.
- Restore (will require manual work+checking) every line which has a `// #backpack-addon` comment.
- Compare [upgrade] document and restore the rest of the content (for example, added files, other modified files).
- Test for project.
