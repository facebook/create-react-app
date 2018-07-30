## 2.4.1 (July 30, 2018)

#### :bug: Bug Fix
* [lighter-react-scripts] bump cssnano package to fix issues with border declaration

#### :tada: version updates

* `lighter-react-scripts@2.4.1`

## 2.4.0 (July 16, 2018)

#### :rocket: New Feature
* [lighter-react-scripts] do not inline images

#### :nail_care: Enhancement
* [lighter-react-scripts] update dependencies
* [lighter-styleguide] update styleguide deps
* [lighter-styleguide] styleguide is now buildable

#### :bug: Bug Fix
* [lighter-styleguide] Refactor styleguide layout to prevent scroll to top on refresh
* [lighter-styleguide] fix Preview iframeHead not working
* [lighter-react-scripts] cssnano no logner applies not safe optimalizations

#### :tada: version updates

* `lighter-react-scripts@2.4.0`
* `lighter-styleguide@1.2.4`

## 2.3.4 (May 20, 2018)

#### :bug: Bug Fix

* [lighter-react-scripts] fix do not remove unused font-face declarations from css

#### :tada: version updates

* `lighter-react-scripts@2.3.4`

## 2.3.3 (May 11, 2018)

#### :bug: Bug Fix

* [lighter-styleguide] fix for Warning: Received `true` for non-boolean attribute `fill`
* [lighter-react-scripts] fix css nano minimizing keyframes

#### :tada: version updates

* `lighter-react-scripts@2.3.3`
* `lighter-styleguide@1.2.3`

## 2.3.2 (May 11, 2018)

#### :bug: Bug Fix

* [lighter-styleguide] fix <PageLayout /> scrolling and overflow issue in FF

#### :tada: version updates

* `lighter-styleguide@1.2.2`

## 2.3.2 (May 2, 2018)

#### :nail-care: Enhancement

* [lighter-styleguide] refactor <PageLayout />, <PageHeader />, <PageBody /> and <PageSidebar /> styles to use flexbox

#### :tada: version updates

* `lighter-styleguide@1.2.1`

## 2.3.2 (April 30, 2018)

#### :rocket: New Feature

* [lighter-styleguide] (breaking-change) refactor <ColorPalette /> component - `colors` prop become `color` and `name`

#### :tada: version updates

* `lighter-styleguide@1.2.0`

## 2.3.2 (April 26, 2018)

#### :bug: Bug Fix

* [lighter-react-scripts] fix issue with stylint linting node-modules

#### :tada: version updates

* `lighter-react-scripts@2.3.2`

## 2.3.1 (April 20, 2018)

#### :bug: Bug Fix

* [lighter-react-scripts] fix weback.config.lib issues with windows style path in entries

#### :tada: version updates

* `lighter-react-scripts@2.3.1`

## 2.3.0 (April 17, 2018)

#### :rocket: New Feature

* rename `webpack.config.components.js` to  `webpack.config.lib.js`

#### :nail_care: Enhancement
* [lighter-react-scripts] rename `webpack.config.components.js` to  `webpack.config.lib.js`
* [lighter-react-scripts] lib builds to `components/` and `patterns/` folder

#### :tada: version updates

* `lighter-react-scripts@2.3.0`

## 2.2.0 (April 17, 2018)

#### :rocket: New Feature

* components config supports dynamic entries based on contents of components dir files even in subdirectories (`index.js` and `*.static.js`)
* remove renaming index with react-components
* remove react and react-dom from lib build
* remove prop-types from lib and prod builds

#### :nail_care: Enhancement
* styleguide allows to override `typeToColorMap` of <InfoBadge />
* styleguide <ComponentInfo /> is more flexible

#### :bug: Bug Fix

* fix styleguide localTheme generation

#### :tada: version updates

* `lighter-react-scripts@2.2.0`
* `lighter-styleguide@1.1.0`

## 2.1.0 (April 5, 2018)

#### :rocket: New Feature

* components config supports dynamic entries based on contents of components dir files
* add `eslint-config-lighter` package
* add `stylelint-config-lighter` package

#### :tada: version updates

* `lighter-react-scripts@2.1.0`
* `eslint-config-lighter@1.0.0`
* `stylelint-config-lighter@1.0.0`

## 2.0.1 (April 2, 2018)

#### :bug: Bug Fix

* check if `lighter-styleguide` exists

#### :tada: version updates

* `lighter-react-scripts@2.0.2`

## 2.0.1 (April 2, 2018)

#### :bug: Bug Fix

* do not check if `styleguide.html` exists

#### :tada: version updates

* `lighter-react-scripts@2.0.1`

## 2.0.0 (April 1, 2018)

#### :rocket: New Feature

* This is initial release of `lighter-styleguide`
* Update `lighter-react-scripts` to work with `lighter-styleguide`
* Styleguide entry can be optional

#### :tada: version updates

* `lighter-react-scripts@2.0.0`
* `lighter-styleguide@1.0.0`

## 1.4.1 (March 11, 2018)

#### :bug: Bug Fix
  * fix missing node-sass in package.json

#### :tada: version updates

* `lighter-react-scripts@1.4.1`

## 1.4.0 (February 26, 2018)

#### :nail_care: Enhancement
  * use `uglifyjs-webpack-plugin` instead webpack build-in plugin

#### :tada: version updates

* `lighter-react-scripts@1.4.0`
## 1.3.0 (February 26, 2018)

#### :nail_care: Enhancement
  * rename `public/index.html` => `public/styleguide.html`

#### :house: Internal
  * update dependencies, normalize verzions, remove unnecessary dependecies
  * remove unused imports

#### :tada: version updates

* `lighter-react-scripts@1.3.0`

## 1.2.0 (February 23, 2018)

#### :rocket: New Feature
  * add `__lighterIsServer__` global passed via static-site-generator-webpack-plugin

#### :tada: version updates

* `lighter-react-scripts@1.2.0`

## 1.1.4 (February 12, 2018)

#### :bug: Bug Fix
  * fix SVG loading via file-loader

#### :tada: version updates

* `lighter-react-scripts@1.1.4`

## 1.1.3 (February 12, 2018)

#### :bug: Bug Fix
  * rename `sprite-app.svg` to `sprite.svg`

#### :tada: version updates

* `lighter-react-scripts@1.1.3`

## 1.1.2 (February 12, 2018)

#### :bug: Bug Fix
  * remove hashes from static assets when building components

#### :tada: version updates

* `lighter-react-scripts@1.1.2`

## 1.1.1 (February 9, 2018)

#### :bug: Bug Fix
  * sort webpack entries correctly in html (sortChunkMode)
  * remove unnecessary plugins from components webpack config

#### :tada: version updates

* `lighter-react-scripts@1.1.1`

## 1.1.0 (February 8, 2018)

#### :rocket: New Feature
* `lighter-react-scripts`
  * css is minified in production
  * add support for `lighter-react-scripts components` to build components imported in `src/app/components/index.js`

#### :tada: version updates

* `lighter-react-scripts@1.1.0`

## 1.0.0 (February 5, 2018) (Initial release)

#### :tada: version updates

* `lighter-react-scripts@1.0.0`
* `lighter-react-dev-utils@1.0.0`
