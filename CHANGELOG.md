## 3.2.1 (Jan 20, 2020)

#### :bug: Bug Fix

- [lighter-react-scripts] fix sass-vars-loader files not being array
  ([#187](https://github.com/lightingbeetle/lighter/pull/187))

#### :tada: version updates

- `lighter-react-scripts@3.2.0`

## 3.2.0 (Jan 19, 2020)

#### :rocket: New Feature

- [lighter-react-scripts] enable js/json import to scss from `lib/tokens.js`
  ([#181](https://github.com/lightingbeetle/lighter/pull/181))

#### :bug: Bug Fix

- [lighter-react-scripts] update eslint plugins to fix sort-prop-types autofix
  ([#182](https://github.com/lightingbeetle/lighter/pull/182))
- [lighter-react-scripts] scripts entry is optional
  ([#183](https://github.com/lightingbeetle/lighter/pull/183))

#### :house: Internal

- [lighter-react-scripts] fix github actions for Lighter
  ([#184](https://github.com/lightingbeetle/lighter/pull/184))

#### :tada: version updates

- `lighter-react-scripts@3.2.0`

## 3.1.6 (Jan 16, 2020)

#### :bug: Bug Fix

#### :tada: version updates

- `lighter-react-scripts@3.1.6`

## 3.1.5 (Jan 16, 2020)

#### :bug: Bug Fix

- [lighter-react-scripts] missnamed and missing entires `app` and `static` ([#177](https://github.com/lightingbeetle/lighter/pull/177))

#### :tada: version updates

- `lighter-react-scripts@3.1.5`

## 3.1.4 (Jan 16, 2020)

#### :bug: Bug Fix

- [lighter-react-scripts] fix css entry names ([#176](https://github.com/lightingbeetle/lighter/pull/176))

#### :tada: version updates

- `lighter-react-scripts@3.1.4`

## 3.1.3 (Jan 16, 2020)

#### :bug: Bug Fix

- [lighter-react-scripts] include css entries in lib in ssr too ([#173](https://github.com/lightingbeetle/lighter/pull/173))
- [lighter-react-scripts] include lib files in production ssr ([#174](https://github.com/lightingbeetle/lighter/pull/174))

#### :tada: version updates

- `lighter-react-scripts@3.1.3`

## 3.1.2 (Jan 16, 2020)

#### :bug: Bug Fix

- [lighter-react-scripts] remove replacing slash with dash in entry name ([#170](https://github.com/lightingbeetle/lighter/pull/170))

#### :tada: version updates

- `lighter-react-scripts@3.1.2`

## 3.1.1 (Jan 16, 2020)

Same as 3.1.0.

## 3.1.0 (Jan 16, 2020)

#### :rocket: New Feature

- [lighter-react-scripts] add entries from lib to SSR ([#169](https://github.com/lightingbeetle/lighter/pull/169))

#### :nail_care: Enhancement

- [lighter-styleguide] prevent selecting color name on double-click ([#168](https://github.com/lightingbeetle/lighter/pull/168))

#### :bug: Bug Fix

- [lighter-react-scripts] use mini-css-extract-plugin in development instead of style-loader to fix missing CSS files in SSR ([#167](https://github.com/lightingbeetle/lighter/pull/167))
- [lighter-react-scripts] rename built component stylesheets to style.css (this reverts breaking change in 3.0.0) ([#166](https://github.com/lightingbeetle/lighter/pull/166))

#### :tada: version updates

- `lighter-react-scripts@3.1.0`
- `lighter-styleguide@3.1.1`

## 3.0.2 (Jan 5, 2020)

#### :boom: Breaking Change

- [eslint-config-lighter] replace Airbnb eslint config with CRA config and add few new rules ([#164](https://github.com/lightingbeetle/lighter/pull/164))

#### :house: Internal

- [lighter] update CRA to 3.3.0 ([#163](https://github.com/lightingbeetle/lighter/pull/163))

#### :tada: version updates

- `lighter-react-scripts@3.0.2`
- `eslint-config-lighter@3.0.0`

## 3.0.1 (Dec 6, 2019)

#### :rocket: New Feature

- [lighter-styleguide] added new sidebar ([#156](https://github.com/lightingbeetle/lighter/pull/156))
- [lighter-styleguide] added search in styleguide routes paths ([#158](https://github.com/lightingbeetle/lighter/pull/158))

#### :nail_care: Enhancement

- [lighter-styleguide] update react-select dependency ([#149](https://github.com/lightingbeetle/lighter/pull/149))
- [lighter-react-scripts] update sass-loader dependency ([#151](https://github.com/lightingbeetle/lighter/pull/151))
- [lighter-styleguide] refactor `<ColorPalette />` to hooks ([#154](https://github.com/lightingbeetle/lighter/pull/154))
- [lighter-styleguide] refactor `<Code />` to hooks and replace `prismjs` with `prism-react-renderer` ([#150](https://github.com/lightingbeetle/lighter/pull/150))
- [lighter-styleguide] refactor `<Preview />` to hooks ([#160](https://github.com/lightingbeetle/lighter/pull/160))

#### :bug: Bug Fix

- [lighter-styleguide] fix package json react-select dependency version ([#155](https://github.com/lightingbeetle/lighter/pull/155))
- [lighter-styleguide] remove GA console.log ([#157](https://github.com/lightingbeetle/lighter/pull/157))
- [lighter-styleguide] fix styleguide npm contents ([#161](https://github.com/lightingbeetle/lighter/pull/161))

#### :house: Internal

- [lighter] add `styleguide:install` and `styleguide` scripts ([#152](https://github.com/lightingbeetle/lighter/pull/152))
- [lighter-styleguide] update favicon and app title of styleguide ([#153](https://github.com/lightingbeetle/lighter/pull/153))

#### :tada: version updates

- `lighter-react-scripts@3.0.1`
- `lighter-styleguide@3.1.0`

## 3.0.0 (Oct 31, 2019)

#### :bug: Bug Fix

- [lighter-styleguide] fix CodeExample to respect MDX generated code shape ([#147](https://github.com/lightingbeetle/lighter/pull/147))

#### :tada: version updates

- `lighter-styleguide@3.0.1`

## 3.0.0 (Oct 22, 2019)

### Important release notes from CRA

- Node 6 is no longer supported
- Webpack 4 under hood
- Babel 7 under hood (with support of macros)
- Node modules are transpiled with Babel (@babel/preset-env)
- adds ESLint 6 support
- Jest 24
- React Hooks support
- browserslist support in @babel/preset-env
- Absolute imports using jsconfig.json/tsconfig.json

### Migration guide

#### ESLint and Prettier formatting during compilation

ESLint and Prettier are no longer fixing syntax during compilation. Instead we are formatting and fixing fixable errors during Git commits. If you want instant formatting, you can configure "fix/format on save" in your favorite editor.

#### lighter-react-scripts Webpack entries

In dev mode (`npm start`) entries are:

- `/src/index.js` as entry processed `StaticSiteGeneratorPlugin` or if `src/index.html` or `public/index.html` existed processed with `HtmlWebpackPlugin`
- all `/src/*.js` files which have `[entryName].html` file with corresponding name in `src/` or `public/` folders. This entries are treated as SPA applications and are processed with `HtmlWebpackPlugin`

In build mode (`npm run build`) entries are:

- same as in dev mode
- `src/components/*.{js,scss,css}`
- `src/components/**/index.js`
- `src/components/**/*.static.js`
- `/src/lib/*.{js,scss,css}`

`src/styleguide/index.js` is no longer treated as entry and have to be moved to `src/styleguide.js`. `src/styleguide/styleguide.html` to `public/styleguide.html` or `src/styleguide.html`.

#### lighter-react-scripts paths in SCSS

Import paths in SCSS files are no longer aliased to `src/styles` and full relative paths has to be written.

```diff
- @import 'helpers/main';
- @import 'base/config';
+ @import './../../../styles/helpers/main';
+ @import './../../../styles/base/config';
```

#### lighter-react-scripts removed lib command

Support for `lib` command was removed. Lib files are now builded with `build` command.

```diff
- "build": "npm-run-all build:app build:lib",
- "build:app": "lighter-react-scripts build",
- "build:lib": "lighter-react-scripts lib",
+ "build": "lighter-react-scripts build",
```

#### lighter-styleguide entry file

Due limitation in MDX compiler, we have to change ho `lighter-styleguide` is initialized.

```diff
import React from 'react';
import ReactDOM from 'react-dom';
+ import { MDXProvider } from '@mdx-js/react';

+ import '@lighting-beetle/lighter-styleguide/build/lib/styleguide.css';

- import styleguide from '@lighting-beetle/lighter-styleguide';
+ import {
+  App as StyleguideApp,
+  MDXComponents,
+ } from '@lighting-beetle/lighter-styleguide';

import './styles/before-components.scss';

import config from './project.config';
import routes from './styleguide/routes';

import './styles/after-components.scss';

- styleguide({ config, routes });
+ ReactDOM.render(
+   <MDXProvider components={MDXComponents}>
+     <StyleguideApp config={config} routes={routes} />
+   </MDXProvider>,
+   document.getElementById('root')
+ );
```

#### lighter-styleguide Markdown in JS (`md`) to MDX

`md` function for runtime markdown compilation to React is no longer supported. Use `.mdx` files instead.

```js
// docs.js
import React from 'react';

import { md } from 'lighter-styleguide';

export default md`
# Markdown
`;
```

```mdx
<!-- docs.mdx -->

# Markdown
```

#### lighter-styleguide ComponentDocs `path` and `component`

- Remove support for `ComponentDocs` props `path` and `resolver` for parsing `react-docgen` with Webpack `raw-loader`. Use `component` prop instead which leverages information about props from `babel-plugin-react-docgen`.

```diff
- import ComponentDocs from '../styleguide/ComponentDocs';
+ import { ComponentDocs } from 'lighter-styleguide';

import Button from './';

- <ComponentDocs path="Button/Button.js" title="<Button />" />
+ <ComponentDocs path="Button" title="<Button />" />
```

#### lighter-styleguide Preview `title`

Support for `Preview` `title` prop was removed. Use markdown heading instead.

```diff
+ ## Title
- <Preview title="Title" />
+ <Preview />
```

#### eslint-config-lighter

- Add `eslint-plugin-react-hooks` `^2.x` to dev dependencies

### Changelog

#### :boom: Breaking Change

- [lighter-styleguide] remove support for props documentation in runtime with raw-loader ([#134](https://github.com/lightingbeetle/lighter/pull/134))
- [lighter-styleguide] move mdx utils to MDX component and rename components to `MDXComponents` ([#135](https://github.com/lightingbeetle/lighter/pull/135))
- [lighter-styleguide] remove support for `md` markdown compilation in runtime in favor of MDX ([#136](https://github.com/lightingbeetle/lighter/pull/136))
- [lighter-styleguide] remove support for `ComponentDocs` `path` prop in favor of `component` prop ([#137](https://github.com/lightingbeetle/lighter/pull/137))
- [lighter-styleguide] remove support for `Preview` `title` prop in favor of header above preview ([#139](https://github.com/lightingbeetle/lighter/pull/139))

#### :bug: Bug Fix

- [lighter-react-scripts] turn back on clearConsole ([#141](https://github.com/lightingbeetle/lighter/pull/141))

#### :memo: Docs

- [lighter-styleguide] add `App` docs ([#138](https://github.com/lightingbeetle/lighter/pull/138))

#### :tada: version updates

- `lighter-styleguide@3.0.0`
- `lighter-react-scripts@3.0.0`

## 3.0.0-beta.2 (Oct 3, 2019)

#### :rocket: New Feature

- [eslint-config-lighter] add eslint react-hooks plugin ([#132](https://github.com/lightingbeetle/lighter/pull/132))

#### :bug: Bug Fix

- [lighter-react-scripts] move react-scripts devDependencies to dependencies ([#131](https://github.com/lightingbeetle/lighter/pull/131))
- [eslint-config-lighter] move eslint-config-lighter dependencies to peerDependencies ([#132](https://github.com/lightingbeetle/lighter/pull/132))

- `lighter-styleguide@3.0.0-beta.2`
- `lighter-react-scripts@3.0.0-beta.2`
- `eslint-config-lighter@2.1.0`

## 3.0.0-beta.1 (Oct 2, 2019)

#### :boom: Breaking Change

- [eslint-config-lighter] improve eslint rules ([#126](https://github.com/lightingbeetle/lighter/pull/126))
- [all] update to CRA 3.1.2 ([#129](https://github.com/lightingbeetle/lighter/pull/129))

#### :rocket: New Feature

- [lighter-styleguide] code splittings for separate parts of page and routes ([#128](https://github.com/lightingbeetle/lighter/pull/128))

#### :bug: Bug Fix

- [lighter-styleguide], [lighter-react-scripts] update browserlist to avoid autoprefixer/cssnano changing 'transparent' to 'initial' ([#125](https://github.com/lightingbeetle/lighter/pull/125))
- [lighter-styleguide] fix components with name Preview and description of preview in docs ([#127](https://github.com/lightingbeetle/lighter/pull/127))

#### :tada: version updates

- `lighter-styleguide@3.0.0-beta.1`
- `lighter-react-scripts@3.0.0-beta.1`
- `eslint-config-lighter@2.0.0`

## 2.7.0 (Aug 30, 2019)

#### :bug: Bug Fix

- [lighter-styleguide] runs GA in production mode only ([#123](https://github.com/lightingbeetle/lighter/pull/123))

#### :tada: version updates

- `lighter-styleguide@2.3.2`

## 2.7.0 (Aug 30, 2019)

#### :bug: Bug Fix

- [lighter-styleguide] remove GA debug flag ([#120](https://github.com/lightingbeetle/lighter/pull/120))

#### :house: Internal

- [lighter-styleguide] remove ComponentDocs util
  ([#121](https://github.com/lightingbeetle/lighter/pull/121)

#### :tada: version updates

- `lighter-styleguide@2.3.1`

## 2.7.0 (Aug 30, 2019)

#### :rocket: New Feature

- [lighter-styleguide] add support for GA tracking of pages and Preview ([#118](https://github.com/lightingbeetle/lighter/pull/118))

#### :nail_care: Enhancement

- [lighter-styleguide] Preview interactive refactor and improvments ([#115](https://github.com/lightingbeetle/lighter/pull/115))

#### :bug: Bug Fix

- [lighter-styleguide] fix HTML code example not working ([#117](https://github.com/lightingbeetle/lighter/pull/117))

#### :tada: version updates

- `lighter-styleguide@2.3.0`

## 2.7.0 (Aug 15, 2019)

#### :bug: Bug Fix

- [lighter-styleguide] try to fix netlify redirects issues ([#108](https://github.com/lightingbeetle/lighter/pull/108))
- [lighter-styleguide] Fix menu category text wrapping ([#109](https://github.com/lightingbeetle/lighter/pull/109))
- [lighter-styleguide] fix category color ([#113](https://github.com/lightingbeetle/lighter/pull/113))
- [lighter-styleguide] fix double scrollbar ([#114](https://github.com/lightingbeetle/lighter/pull/114))

#### :rocket: New Feature

- [lighter-styleguide] Fullscreen preview ([#111](https://github.com/lightingbeetle/lighter/pull/111))

#### :tada: version updates

- `lighter-styleguide@2.2.0`

## 2.7.0 (March 31, 2019)

#### :bug: Bug Fix

- [lighter-styleguide] fix issues with interactivity of HTML elements ([#106](https://github.com/lightingbeetle/lighter/pull/106))
- [lighter-styleguide] fix how interact handles string prop formats ([#106](https://github.com/lightingbeetle/lighter/pull/106))
- [lighter-styleguide] fix interact show code placement ([#106](https://github.com/lightingbeetle/lighter/pull/106))

#### :tada: version updates

- `lighter-styleguide@2.1.1`

## 2.7.0 (March 26, 2019)

#### :rocket: New Feature

- [lighter-styleguide] add interactivity into Preview component ([#102](https://github.com/lightingbeetle/lighter/pull/102))

#### :tada: version updates

- `lighter-styleguide@2.1.0`

## 2.7.0 (March 21, 2019)

#### :bug: Bug Fix

- [lighter-styleguide] update sg deps (fix react-router-dom 4.4.0 was unpublished from NPM) ([#103](https://github.com/lightingbeetle/lighter/pull/103))

#### :tada: version updates

- `lighter-styleguide@2.0.2`

## 2.7.0 (March 17, 2019)

#### :bug: Bug Fix

- [lighter-styleguide] fix react-router-dom deprecated imports in lighter-app ([#100](https://github.com/lightingbeetle/lighter/pull/100))

#### :tada: version updates

- `lighter-styleguide@2.0.1`

## 2.7.0 (March 16, 2019)

#### :boom: Breaking Change

- [lighter-styleguide] do not export unnecessary components from styleguide ([#95](https://github.com/lightingbeetle/lighter/pull/95))

#### :rocket: New Feature

- [lighter-styleguide] add `babel-plugin-react-docgen` plugin and parse information from this plugin with `<ComponentDocs component={Component} />` which replace `path` prop which is now deprecated ([#64](https://github.com/lightingbeetle/lighter/pull/64))
- [lighter-styleguide] add `<Preview />` `bgThemeColors` colors prop ([#66](https://github.com/lightingbeetle/lighter/pull/66))
- [lighter-styleguide] `<Code />` will highlight `scss` language instead of `sass` ([#80](https://github.com/lightingbeetle/lighter/pull/80))
- [lighter-react-scripts] add `babel-plugin-react-docgen` to webpack config ([#85](https://github.com/lightingbeetle/lighter/pull/85))

#### :nail_care: Enhancement

- [lighter-styleguide] update styleguide deps ([#65](https://github.com/lightingbeetle/lighter/pull/65), [#68](https://github.com/lightingbeetle/lighter/pull/68), [#86](https://github.com/lightingbeetle/lighter/pull/86))
- [lighter-styleguide] make ComponentsDocs title computed from displayName prop if possible ([#70](https://github.com/lightingbeetle/lighter/pull/70))
- [lighter-styleguide] update `Preview` `codeJSXOptions` prop defaults ([#71](https://github.com/lightingbeetle/lighter/pull/71))
- [lighter-styleguide] add Lighter logo ([#94](https://github.com/lightingbeetle/lighter/pull/94))

#### :bug: Bug Fix

- [lighter-styleguide] fix heading levels in Typography ([#67](https://github.com/lightingbeetle/lighter/pull/67))
- [lighter-styleguide] fix error when ComponentDocs uses `path` prop ([#70](https://github.com/lightingbeetle/lighter/pull/70))
- [lighter-styleguide] fix error when ComponentDocs uses `path` prop ([#70](https://github.com/lightingbeetle/lighter/pull/70))
  fix rendering components when using npm package
- [lighter-styleguide] fix `<ComponentsDocs />` `component` prop not working after `path` fix ([#79](https://github.com/lightingbeetle/lighter/pull/79))
- [lighter-styleguide] fix `<Code />` prop-type definition ([#89](https://github.com/lightingbeetle/lighter/pull/89))
- [lighter-styleguide] version in header is correct and visible ([#93](https://github.com/lightingbeetle/lighter/pull/93))

#### :memo: Docs

- [lighter-styleguide] update Preview docs
  ([#66](https://github.com/lightingbeetle/lighter/pull/66), [#69](https://github.com/lightingbeetle/lighter/pull/69))
- [lighter-styleguide] add ComponentsDocs docs ([#70](https://github.com/lightingbeetle/lighter/pull/70))
- [lighter-styleguide] add Code docs ([#81](https://github.com/lightingbeetle/lighter/pull/81))
- [lighter-styleguide] add ColorPalette docs ([#82](https://github.com/lightingbeetle/lighter/pull/82))
- [lighter-styleguide] add Badge docs ([#83](https://github.com/lightingbeetle/lighter/pull/83))
- [lighter-styleguide] add Table docs ([#84](https://github.com/lightingbeetle/lighter/pull/84))
- [lighter-styleguide] add ComponentInfo docs ([#87](https://github.com/lightingbeetle/lighter/pull/87))
- [lighter-styleguide] add Note docs ([#88](https://github.com/lightingbeetle/lighter/pull/88))
- [lighter-styleguide] add Page docs ([#90](https://github.com/lightingbeetle/lighter/pull/90))
- [lighter-styleguide] add Typography docs ([#91](https://github.com/lightingbeetle/lighter/pull/91))
- [lighter-styleguide] add Hello page ([#92](https://github.com/lightingbeetle/lighter/pull/92))
- [lighter-styleguide] add Maintaining CRA fork docs ([#96](https://github.com/lightingbeetle/lighter/pull/96))
- [lighter-styleguide] add Contributing guidelines docs ([#97](https://github.com/lightingbeetle/lighter/pull/97))

#### :house: Internal

- [lighter-styleguide] deploy lighter-styleguide on netlify
  ([#72](https://github.com/lightingbeetle/lighter/pull/72), [#73](https://github.com/lightingbeetle/lighter/pull/73))

#### :tada: version updates

- `lighter-react-scripts@2.7.0`
- `lighter-styleguide@2.0.0`

## 2.6.0 (February 4, 2019)

#### :bug: Bug Fix

- [lighter-styleguide] fix rendering components when using npm package ([#76](https://github.com/lightingbeetle/lighter/pull/76))
- [lighter-styleguide] fix ComponentsDocs `path` not displaying props table ([#77](https://github.com/lightingbeetle/lighter/pull/77))

#### :tada: version updates

- `lighter-styleguide@1.4.2`

## 2.6.0 (January 28, 2019)

#### :bug: Bug Fix

- [lighter-styleguide] fix `package-lock.json` issues ([#74](https://github.com/lightingbeetle/lighter/pull/74))

#### :tada: version updates

- `lighter-styleguide@1.4.1`

## 2.6.0 (December 20, 2018)

#### :rocket: New Feature

- [lighter-react-scripts] add automatic src/scripts folder files transpile ([#49](https://github.com/lightingbeetle/lighter/pull/49), [#58](https://github.com/lightingbeetle/lighter/pull/58))
- [lighter-react-scripts] add mdx loader to webpack config ([#59](https://github.com/lightingbeetle/lighter/pull/59), [#61](https://github.com/lightingbeetle/lighter/pull/61))
- [lighter-styleguide] add prism support for diff language ([#52](https://github.com/lightingbeetle/lighter/pull/52))
- [lighter-styleguide] add prism support for scss/sass ([#57](https://github.com/lightingbeetle/lighter/pull/57))
- [lighter-styleguide] add MDX support ([#55](https://github.com/lightingbeetle/lighter/pull/55), [#60](https://github.com/lightingbeetle/lighter/pull/60), [#62](https://github.com/lightingbeetle/lighter/pull/62), [#56](https://github.com/lightingbeetle/lighter/pull/56))

#### :bug: Bug Fix

- [lighter-styleguide] print shape prop values in docs ([#50](https://github.com/lightingbeetle/lighter/pull/50))
- [lighter-styleguide] stretch main height ([#51](https://github.com/lightingbeetle/lighter/pull/51))
- [lighter-styleguide] add support for uknown language to code-block component ([#53](https://github.com/lightingbeetle/lighter/pull/53))
- [lighter-styleguide] fix styleguide not working in IE ([#54](https://github.com/lightingbeetle/lighter/pull/54))

#### :tada: version updates

- `lighter-react-scripts@2.6.0`
- `lighter-styleguide@1.4.0`

## 2.5.0 (November 27, 2018)

#### :bug: Bug Fix

- [lighter-styleguide] allow to pass function to `Preview` `code` prop ([#47](https://github.com/lightingbeetle/lighter/pull/47))

#### :tada: version updates

- `lighter-styleguide@1.3.2`

## 2.5.0 (November 27, 2018)

#### :bug: Bug Fix

- [lighter-styleguide] fix styleguide theme merging ([#45](https://github.com/lightingbeetle/lighter/pull/45))

#### :tada: version updates

- `lighter-styleguide@1.3.1`

## 2.5.0 (November 27, 2018)

#### :rocket: New Feature

- [lighter-react-scripts] added possibility to use urls without '.html' extension ([#44](https://github.com/lightingbeetle/lighter/pull/44))
- [lighter-styleguide] implement background selection on `Preview` component ([#25](https://github.com/lightingbeetle/lighter/pull/25), [#29](https://github.com/lightingbeetle/lighter/pull/29), [#30](https://github.com/lightingbeetle/lighter/pull/30))
- [lighter-styleguide] show pure text in code example of preview ([#36](https://github.com/lightingbeetle/lighter/pull/36))
- [lighter-styleguide] new `Button` component ([#32](https://github.com/lightingbeetle/lighter/pull/32))
- [lighter-styleguide] new `DocsTable` ([#40](https://github.com/lightingbeetle/lighter/pull/40))
- [lighter-styleguide] copy code example to clipboard ([#37](https://github.com/lightingbeetle/lighter/pull/37))
- [lighter-styleguide] new `NoteInfo` variant ([#34](https://github.com/lightingbeetle/lighter/pull/34))
- [eslint-config-lighter] update `no-param-reassign` rule to ignore props ([#42](https://github.com/lightingbeetle/lighter/pull/42))

#### :bug: Bug Fix

- [lighter-styleguide] show html of preview children as function ([#30](https://github.com/lightingbeetle/lighter/pull/30))
- [lighter-styleguide] fix default font size and family for `ComponentDocs` table ([#38](https://github.com/lightingbeetle/lighter/pull/38))
- [lighter-styleguide] add missing `Link` export ([#35](https://github.com/lightingbeetle/lighter/pull/35))
- [lighter-styleguide] allow to override default `codeJSXOptions` ([#41](https://github.com/lightingbeetle/lighter/pull/41))

#### :memo: Docs

- [lighter-styleguide] add Preview docs ([#31](https://github.com/lightingbeetle/lighter/pull/31))

#### :tada: version updates

- `lighter-react-scripts@2.5.0`
- `lighter-styleguide@1.3.0`
- `eslint-config-lighte@1.1.0`

## 2.4.2 (August 20, 2018)

#### :bug: Bug Fix

- [lighter-react-scripts] pass `Element` to JSDOM as global (fixes issue with tabbable)

#### :tada: version updates

- `lighter-react-scripts@2.4.2`

## 2.4.1 (July 30, 2018)

#### :bug: Bug Fix

- [lighter-react-scripts] bump cssnano package to fix issues with border declaration

#### :tada: version updates

- `lighter-react-scripts@2.4.1`

## 2.4.0 (July 16, 2018)

#### :rocket: New Feature

- [lighter-react-scripts] do not inline images

#### :nail_care: Enhancement

- [lighter-react-scripts] update dependencies
- [lighter-styleguide] update styleguide deps
- [lighter-styleguide] styleguide is now buildable

#### :bug: Bug Fix

- [lighter-styleguide] Refactor styleguide layout to prevent scroll to top on refresh
- [lighter-styleguide] fix Preview iframeHead not working
- [lighter-react-scripts] cssnano no logner applies not safe optimalizations

#### :tada: version updates

- `lighter-react-scripts@2.4.0`
- `lighter-styleguide@1.2.4`

## 2.3.4 (May 20, 2018)

#### :bug: Bug Fix

- [lighter-react-scripts] fix do not remove unused font-face declarations from css

#### :tada: version updates

- `lighter-react-scripts@2.3.4`

## 2.3.3 (May 11, 2018)

#### :bug: Bug Fix

- [lighter-styleguide] fix for Warning: Received `true` for non-boolean attribute `fill`
- [lighter-react-scripts] fix css nano minimizing keyframes

#### :tada: version updates

- `lighter-react-scripts@2.3.3`
- `lighter-styleguide@1.2.3`

## 2.3.2 (May 11, 2018)

#### :bug: Bug Fix

- [lighter-styleguide] fix <PageLayout /> scrolling and overflow issue in FF

#### :tada: version updates

- `lighter-styleguide@1.2.2`

## 2.3.2 (May 2, 2018)

#### :nail-care: Enhancement

- [lighter-styleguide] refactor <PageLayout />, <PageHeader />, <PageBody /> and <PageSidebar /> styles to use flexbox

#### :tada: version updates

- `lighter-styleguide@1.2.1`

## 2.3.2 (April 30, 2018)

#### :rocket: New Feature

- [lighter-styleguide](breaking-change) refactor <ColorPalette /> component - `colors` prop become `color` and `name`

#### :tada: version updates

- `lighter-styleguide@1.2.0`

## 2.3.2 (April 26, 2018)

#### :bug: Bug Fix

- [lighter-react-scripts] fix issue with stylint linting node-modules

#### :tada: version updates

- `lighter-react-scripts@2.3.2`

## 2.3.1 (April 20, 2018)

#### :bug: Bug Fix

- [lighter-react-scripts] fix weback.config.lib issues with windows style path in entries

#### :tada: version updates

- `lighter-react-scripts@2.3.1`

## 2.3.0 (April 17, 2018)

#### :rocket: New Feature

- rename `webpack.config.components.js` to `webpack.config.lib.js`

#### :nail_care: Enhancement

- [lighter-react-scripts] rename `webpack.config.components.js` to `webpack.config.lib.js`
- [lighter-react-scripts] lib builds to `components/` and `patterns/` folder

#### :tada: version updates

- `lighter-react-scripts@2.3.0`

## 2.2.0 (April 17, 2018)

#### :rocket: New Feature

- components config supports dynamic entries based on contents of components dir files even in subdirectories (`index.js` and `*.static.js`)
- remove renaming index with react-components
- remove react and react-dom from lib build
- remove prop-types from lib and prod builds

#### :nail_care: Enhancement

- styleguide allows to override `typeToColorMap` of <InfoBadge />
- styleguide <ComponentInfo /> is more flexible

#### :bug: Bug Fix

- fix styleguide localTheme generation

#### :tada: version updates

- `lighter-react-scripts@2.2.0`
- `lighter-styleguide@1.1.0`

## 2.1.0 (April 5, 2018)

#### :rocket: New Feature

- components config supports dynamic entries based on contents of components dir files
- add `eslint-config-lighter` package
- add `stylelint-config-lighter` package

#### :tada: version updates

- `lighter-react-scripts@2.1.0`
- `eslint-config-lighter@1.0.0`
- `stylelint-config-lighter@1.0.0`

## 2.0.1 (April 2, 2018)

#### :bug: Bug Fix

- check if `lighter-styleguide` exists

#### :tada: version updates

- `lighter-react-scripts@2.0.2`

## 2.0.1 (April 2, 2018)

#### :bug: Bug Fix

- do not check if `styleguide.html` exists

#### :tada: version updates

- `lighter-react-scripts@2.0.1`

## 2.0.0 (April 1, 2018)

#### :rocket: New Feature

- This is initial release of `lighter-styleguide`
- Update `lighter-react-scripts` to work with `lighter-styleguide`
- Styleguide entry can be optional

#### :tada: version updates

- `lighter-react-scripts@2.0.0`
- `lighter-styleguide@1.0.0`

## 1.4.1 (March 11, 2018)

#### :bug: Bug Fix

- fix missing node-sass in package.json

#### :tada: version updates

- `lighter-react-scripts@1.4.1`

## 1.4.0 (February 26, 2018)

#### :nail_care: Enhancement

- use `uglifyjs-webpack-plugin` instead webpack build-in plugin

#### :tada: version updates

- `lighter-react-scripts@1.4.0`

## 1.3.0 (February 26, 2018)

#### :nail_care: Enhancement

- rename `public/index.html` => `public/styleguide.html`

#### :house: Internal

- update dependencies, normalize verzions, remove unnecessary dependecies
- remove unused imports

#### :tada: version updates

- `lighter-react-scripts@1.3.0`

## 1.2.0 (February 23, 2018)

#### :rocket: New Feature

- add `__lighterIsServer__` global passed via static-site-generator-webpack-plugin

#### :tada: version updates

- `lighter-react-scripts@1.2.0`

## 1.1.4 (February 12, 2018)

#### :bug: Bug Fix

- fix SVG loading via file-loader

#### :tada: version updates

- `lighter-react-scripts@1.1.4`

## 1.1.3 (February 12, 2018)

#### :bug: Bug Fix

- rename `sprite-app.svg` to `sprite.svg`

#### :tada: version updates

- `lighter-react-scripts@1.1.3`

## 1.1.2 (February 12, 2018)

#### :bug: Bug Fix

- remove hashes from static assets when building components

#### :tada: version updates

- `lighter-react-scripts@1.1.2`

## 1.1.1 (February 9, 2018)

#### :bug: Bug Fix

- sort webpack entries correctly in html (sortChunkMode)
- remove unnecessary plugins from components webpack config

#### :tada: version updates

- `lighter-react-scripts@1.1.1`

## 1.1.0 (February 8, 2018)

#### :rocket: New Feature

- `lighter-react-scripts`
  - css is minified in production
  - add support for `lighter-react-scripts components` to build components imported in `src/app/components/index.js`

#### :tada: version updates

- `lighter-react-scripts@1.1.0`

## 1.0.0 (February 5, 2018) (Initial release)

#### :tada: version updates

- `lighter-react-scripts@1.0.0`
- `lighter-react-dev-utils@1.0.0`
