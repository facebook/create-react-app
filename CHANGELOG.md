## 2.2.0 (April 16, 2018)

#### :rocket: New Feature

* components config supports dynamic entries based on contents of components dir files even in subdirectories (`index.js` and `*.static.js`)
* remove renaming index with react-components
* remove react and react-dom from lib build
* remove prop-types from lib and prod builds

#### :bug: Bug Fix

* fix styleguide localTheme generation

#### :tada: version updates

* `lighter-react-scripts@2.2.0`
* `lighter-styleguide@1.0.1`

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
