## 2.1.1 (October 31, 2018)

Happy Halloween 🎃 👻! This spooky release brings a treat: decorator support in TypeScript files!

#### :bug: Bug Fix

- `babel-preset-react-app`
  - [#5659](https://github.com/facebook/create-react-app/pull/5659) Add support for decorators. ([@Timer](https://github.com/Timer))
- `react-scripts`
  - [#5621](https://github.com/facebook/create-react-app/pull/5621) fix 'Duplicate string index signature' in ProcessEnv. ([@xiaoxiangmoe](https://github.com/xiaoxiangmoe))

#### :nail_care: Enhancement

- `babel-preset-react-app`
  - [#5659](https://github.com/facebook/create-react-app/pull/5659) Add support for decorators. ([@Timer](https://github.com/Timer))

#### :memo: Documentation

- [#5658](https://github.com/facebook/create-react-app/pull/5658) Update making-a-progressive-web-app.md. ([@jakeboone02](https://github.com/jakeboone02))
- [#5635](https://github.com/facebook/create-react-app/pull/5635) Update minimum node version to 8.10 in README. ([@iansu](https://github.com/iansu))
- [#5629](https://github.com/facebook/create-react-app/pull/5629) Add link to cra-ts migration guide. ([@Vinnl](https://github.com/Vinnl))

#### :house: Internal

- `react-error-overlay`
  - [#4709](https://github.com/facebook/create-react-app/pull/4709) Expose `reportRuntimeError`. ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `babel-plugin-named-asset-import`
  - [#5575](https://github.com/facebook/create-react-app/pull/5575) add tests for named-asset-imports plugin. ([@NShahri](https://github.com/NShahri))
- `react-scripts`
  - [#5651](https://github.com/facebook/create-react-app/pull/5651) Make serviceWorker config argument optional in typescript. ([@eddedd88](https://github.com/eddedd88))

#### Committers: 8

- Andrew Lisowski ([hipstersmoothie](https://github.com/hipstersmoothie))
- Eduardo Duran ([eddedd88](https://github.com/eddedd88))
- Ian Sutherland ([iansu](https://github.com/iansu))
- Jake Boone ([jakeboone02](https://github.com/jakeboone02))
- Joe Haddad ([Timer](https://github.com/Timer))
- Nima Shahri ([NShahri](https://github.com/NShahri))
- Vincent ([Vinnl](https://github.com/Vinnl))
- ZHAO Jinxiang ([xiaoxiangmoe](https://github.com/xiaoxiangmoe))

### Migrating from 2.1.0 to 2.1.1

Inside any created project that has not been ejected, run:

```bash
npm install --save --save-exact react-scripts@2.1.1
```

or

```
yarn add --exact react-scripts@2.1.1
```

## 2.1.0 (October 29, 2018)

Create React App 2.1 adds support for TypeScript! Read [the documentation](https://facebook.github.io/create-react-app/docs/adding-typescript) to get started.

New applications can be created using TypeScript by running:

```bash
$ npx create-react-app my-app --typescript
```

#### :rocket: New Feature

- `create-react-app`, `react-scripts`
  - [#5550](https://github.com/facebook/create-react-app/pull/5550) Add TypeScript app creation ([@Timer](https://github.com/Timer))
- `babel-preset-react-app`, `react-scripts`
  - [#4837](https://github.com/facebook/create-react-app/pull/4837) TypeScript support using Babel 7 ([@brunolemos](https://github.com/brunolemos))

#### :bug: Bug Fix

- `react-scripts`
  - [#5611](https://github.com/facebook/create-react-app/pull/5611) Remove react-scripts type reference on eject. ([@Timer](https://github.com/Timer))
  - [#5614](https://github.com/facebook/create-react-app/pull/5614) Ignore json files from TypeScript type checking. ([@brunolemos](https://github.com/brunolemos))
  - [#5609](https://github.com/facebook/create-react-app/pull/5609) Remove unsupported options. ([@Timer](https://github.com/Timer))
  - [#5608](https://github.com/facebook/create-react-app/pull/5608) Ignore test files from reported type errors. ([@Timer](https://github.com/Timer))
  - [#5589](https://github.com/facebook/create-react-app/pull/5589) Update react-app.d.ts. ([@brunolemos](https://github.com/brunolemos))
  - [#5557](https://github.com/facebook/create-react-app/pull/5557) Add typings for process.env. ([@brunolemos](https://github.com/brunolemos))
  - [#5532](https://github.com/facebook/create-react-app/pull/5532) Use TypeScript parser to read tsconfig.json. ([@brunolemos](https://github.com/brunolemos))
  - [#5527](https://github.com/facebook/create-react-app/pull/5527) Update Workbox dependency. ([@jeffposnick](https://github.com/jeffposnick))
- `react-dev-utils`, `react-scripts`
  - [#5549](https://github.com/facebook/create-react-app/pull/5549) Automatically setup TypeScript when detected. ([@Timer](https://github.com/Timer))
  - [#5537](https://github.com/facebook/create-react-app/pull/5537) Respect tsconfig.json extends when validating config. ([@ianschmitz](https://github.com/ianschmitz))

#### :nail_care: Enhancement

- `create-react-app`, `react-scripts`
  - [#5593](https://github.com/facebook/create-react-app/pull/5593) Refine how TypeScript types are handled. ([@Timer](https://github.com/Timer))
- `react-scripts`
  - [#5531](https://github.com/facebook/create-react-app/pull/5531) Enable TypeScript json module resolver. ([@brunolemos](https://github.com/brunolemos))
  - [#5524](https://github.com/facebook/create-react-app/pull/5524) Validate tsconfig when using TypeScript. ([@Timer](https://github.com/Timer))
  - [#5516](https://github.com/facebook/create-react-app/pull/5516) Check for TypeScript install in preflight. ([@Timer](https://github.com/Timer))
  - [#5515](https://github.com/facebook/create-react-app/pull/5515) Always type check TypeScript when being used. ([@Timer](https://github.com/Timer))
- `react-dev-utils`, `react-scripts`
  - [#5529](https://github.com/facebook/create-react-app/pull/5529) Add TypeScript error formatting. ([@Timer](https://github.com/Timer))

#### :memo: Documentation

- Other
  - [#5552](https://github.com/facebook/create-react-app/pull/5552) Fixing Internal Links. ([@ehfeng](https://github.com/ehfeng))
  - [#5551](https://github.com/facebook/create-react-app/pull/5551) Add Algolia search bar to Docusaurus. ([@amyrlam](https://github.com/amyrlam))
  - [#5533](https://github.com/facebook/create-react-app/pull/5533) Simplified TypeScript steps. ([@brunolemos](https://github.com/brunolemos))
  - [#5492](https://github.com/facebook/create-react-app/pull/5492) Add "edit" feature to Docusaurus pages. ([@amyrlam](https://github.com/amyrlam))
  - [#5499](https://github.com/facebook/create-react-app/pull/5499) Fix title on Safari. ([@yuyokk](https://github.com/yuyokk))
  - [#5494](https://github.com/facebook/create-react-app/pull/5494) Fix typo. ([@noelyoo](https://github.com/noelyoo))
  - [#5493](https://github.com/facebook/create-react-app/pull/5493) Fixed typo in getting-started. ([@jessepeterman](https://github.com/jessepeterman))
  - [#5344](https://github.com/facebook/create-react-app/pull/5344) Add some headings to the getting started section. ([@selbekk](https://github.com/selbekk))
  - [#5251](https://github.com/facebook/create-react-app/pull/5251) Add SoMe links to documentation. ([@selbekk](https://github.com/selbekk))
- `react-scripts`
  - [#5512](https://github.com/facebook/create-react-app/pull/5512) Update doc links in template README. ([@iansu](https://github.com/iansu))
  - [#5475](https://github.com/facebook/create-react-app/pull/5475) Fix typo. ([@thompk2](https://github.com/thompk2))
  - [#5449](https://github.com/facebook/create-react-app/pull/5449) Remove dot from the end of the link to fix it when using from GitHub. ([@ranyitz](https://github.com/ranyitz))

#### :house: Internal

- `react-scripts`
  - [#5607](https://github.com/facebook/create-react-app/pull/5607) Turn on certain TypeScript options. ([@Timer](https://github.com/Timer))
  - [#5559](https://github.com/facebook/create-react-app/pull/5559) Change import syntax from typescript declaration. ([@brunolemos](https://github.com/brunolemos))
  - [#5469](https://github.com/facebook/create-react-app/pull/5469) Avoid pushing .pnp folder to git. ([@NShahri](https://github.com/NShahri))
  - [#5527](https://github.com/facebook/create-react-app/pull/5527) Update Workbox dependency. ([@jeffposnick](https://github.com/jeffposnick))
- `eslint-config-react-app`
  - [#5586](https://github.com/facebook/create-react-app/pull/5586) Fixing the code splitting links in the ESLint output. ([@jheijmans](https://github.com/jheijmans))

#### Committers: 15

- Amy Lam ([amyrlam](https://github.com/amyrlam))
- Bruno Lemos ([brunolemos](https://github.com/brunolemos))
- Eric Feng ([ehfeng](https://github.com/ehfeng))
- Ian Schmitz ([ianschmitz](https://github.com/ianschmitz))
- Ian Sutherland ([iansu](https://github.com/iansu))
- Iurii Kucherov ([yuyokk](https://github.com/yuyokk))
- Jeffrey Posnick ([jeffposnick](https://github.com/jeffposnick))
- Jeroen Heijmans ([jheijmans](https://github.com/jheijmans))
- Jesse Peterman ([jessepeterman](https://github.com/jessepeterman))
- Joe Haddad ([Timer](https://github.com/Timer))
- Kit Thompson ([thompk2](https://github.com/thompk2))
- Kristofer Selbekk ([selbekk](https://github.com/selbekk))
- Nima Shahri ([NShahri](https://github.com/NShahri))
- Noel Yoo ([noelyoo](https://github.com/noelyoo))
- Ran Yitzhaki ([ranyitz](https://github.com/ranyitz))

### Migrating from 2.0.5 to 2.1.0

Inside any created project that has not been ejected, run:

```bash
npm install --save --save-exact react-scripts@2.1.0
```

or

```
yarn add --exact react-scripts@2.1.0
```

## 2.0.5 (October 14, 2018)

#### :bug: Bug Fix

- `react-dev-utils`

  - [#5431](https://github.com/facebook/create-react-app/pull/5431) Fix click-to-open on Windows. ([@gaearon](https://github.com/gaearon))
  - [#5335](https://github.com/facebook/create-react-app/pull/5335) Fix file size report after build. ([@OskarPersson](https://github.com/OskarPersson))

- `create-react-app`

  - [#5362](https://github.com/facebook/create-react-app/pull/5362) Fix CI: non-semver compliant Yarn versions. ([@Timer](https://github.com/Timer))

- `react-scripts`
  - [#5301](https://github.com/facebook/create-react-app/pull/5301) Fix TypeError when registering service workers without config. ([@peterbe](https://github.com/peterbe))

#### :nail_care: Enhancement

- `babel-preset-react-app`

  - [#4984](https://github.com/facebook/create-react-app/pull/4984) Use the correct dependency for `babel-plugin-dynamic-import-node`. ([@vikr01](https://github.com/vikr01))

- `react-scripts`
  - [#5354](https://github.com/facebook/create-react-app/pull/5354) Add environment variable to optionaly disable inlining of chunks. ([@0xdeafcafe](https://github.com/0xdeafcafe))
  - [#5330](https://github.com/facebook/create-react-app/pull/5330) Update `eslint-plugin-jsx-a11y` version. ([@AlmeroSteyn](https://github.com/AlmeroSteyn))

#### :memo: Documentation

- `react-scripts`
  - [#5321](https://github.com/facebook/create-react-app/pull/5321) Added note on update to `.flowconfig` for .scss imports. ([@rlueder](https://github.com/rlueder))
  - [#5394](https://github.com/facebook/create-react-app/pull/5394) Correct instructions for HTTPS and PowerShell. ([@gavinbarron](https://github.com/gavinbarron))
  - [#5410](https://github.com/facebook/create-react-app/pull/5410) Updates to clarify the "waiting" SW behavior. ([@jeffposnick](https://github.com/jeffposnick))
  - [#5302](https://github.com/facebook/create-react-app/pull/5302) Update README.md. ([@simonCordovaByte9](https://github.com/simonCordovaByte9))
  - [#5334](https://github.com/facebook/create-react-app/pull/5334) Update README due to deprecation of react-testing-library's toBeInTheDOM. ([@rrebase](https://github.com/rrebase))
  - [#5326](https://github.com/facebook/create-react-app/pull/5326) README link fixes. ([@davidgilbertson](https://github.com/davidgilbertson))
  - [#5327](https://github.com/facebook/create-react-app/pull/5327) Updated the URL in index.html. ([@behzod](https://github.com/behzod))
  - [#5296](https://github.com/facebook/create-react-app/pull/5296) Adding documentation about git init. ([@ryancogswell](https://github.com/ryancogswell))
  - [#5290](https://github.com/facebook/create-react-app/pull/5290) Add react-testing-library documentation/examples (#4679). ([@gnapse](https://github.com/gnapse))
  - [#5286](https://github.com/facebook/create-react-app/pull/5286) Fix broken links to src/serviceWorker.js. ([@adambowles](https://github.com/adambowles))
- Other

  - [#5374](https://github.com/facebook/create-react-app/pull/5374) Add the new SVGs feature from the template README to the root README. ([@neo](https://github.com/neo))
  - [#5371](https://github.com/facebook/create-react-app/pull/5371) Update path to serviceWorker.js in graphical folder structure. ([@jonscottclark](https://github.com/jonscottclark))
  - [#5337](https://github.com/facebook/create-react-app/pull/5337) Fix typo. ([@mvasin](https://github.com/mvasin))

- `eslint-config-react-app`
  - [#5416](https://github.com/facebook/create-react-app/pull/5416) Fix eslint config docs. ([@ludovicofischer](https://github.com/ludovicofischer))

#### :house: Internal

- Other

  - [#5365](https://github.com/facebook/create-react-app/pull/5365) Clean up the behavior tests. ([@Timer](https://github.com/Timer))

- `create-react-app`
  - [#5362](https://github.com/facebook/create-react-app/pull/5362) Fix CI: non-semver compliant Yarn versions. ([@Timer](https://github.com/Timer))
- `react-scripts`
  - [#5317](https://github.com/facebook/create-react-app/pull/5317) Remove unused require for getCacheIdentifier after ejecting. ([@benbrandt](https://github.com/benbrandt))

#### Committers: 23

- Adam Bowles ([adambowles](https://github.com/adambowles))
- Alex Forbes-Reed ([0xdeafcafe](https://github.com/0xdeafcafe))
- Almero Steyn ([AlmeroSteyn](https://github.com/AlmeroSteyn))
- Behzod Saidov ([behzod](https://github.com/behzod))
- Ben Brandt ([benbrandt](https://github.com/benbrandt))
- Dan Abramov ([gaearon](https://github.com/gaearon))
- David Gilbertson ([davidgilbertson](https://github.com/davidgilbertson))
- Ernesto García ([gnapse](https://github.com/gnapse))
- Gavin Barron ([gavinbarron](https://github.com/gavinbarron))
- Jeffrey Posnick ([jeffposnick](https://github.com/jeffposnick))
- Joe Haddad ([Timer](https://github.com/Timer))
- Jon Clark ([jonscottclark](https://github.com/jonscottclark))
- Kristofer Selbekk ([selbekk](https://github.com/selbekk))
- Ludovico Fischer ([ludovicofischer](https://github.com/ludovicofischer))
- Mikhail Vasin ([mvasin](https://github.com/mvasin))
- Oskar Persson ([OskarPersson](https://github.com/OskarPersson))
- Peter Bengtsson ([peterbe](https://github.com/peterbe))
- Rafael Lüder ([rlueder](https://github.com/rlueder))
- Ragnar Rebase ([rrebase](https://github.com/rrebase))
- Ryan Cogswell ([ryancogswell](https://github.com/ryancogswell))
- Vikram Rangaraj ([vikr01](https://github.com/vikr01))
- Wenchen Li ([neo](https://github.com/neo))
- [simonCordovaByte9](https://github.com/simonCordovaByte9)

### Migrating from 2.0.4 to 2.0.5

Inside any created project that has not been ejected, run:

```bash
npm install --save --save-exact react-scripts@2.0.5
```

or

```
yarn add --exact react-scripts@2.0.5
```

## 2.0.4 (October 3, 2018)

#### :bug: Bug Fix

- `react-scripts`
  - [#5281](https://github.com/facebook/create-react-app/pull/5281) Fix code minifying ([@Timer](https://github.com/Timer))
  - [#5246](https://github.com/facebook/create-react-app/pull/5246) Fix `GENERATE_SOURCEMAP` env not working for css sourcemap ([@crux153](https://github.com/crux153))
- `babel-preset-react-app`
  - [#5278](https://github.com/facebook/create-react-app/pull/5278) Disable Symbol typeof transform ([@gaearon](https://github.com/gaearon))

#### :nail_care: Enhancement

- `create-react-app`
  - [#5270](https://github.com/facebook/create-react-app/pull/5270) Caches the Yarn resolution for faster installs ([@arcanis](https://github.com/arcanis))
  - [#5269](https://github.com/facebook/create-react-app/pull/5269) Adds a version check when using --use-pnp ([@arcanis](https://github.com/arcanis))
- `react-scripts`
  - [#5258](https://github.com/facebook/create-react-app/pull/5258) Add `.mjs` support back to webpack ([@Timer](https://github.com/Timer))

#### :memo: Documentation

- Other
  - [#5228](https://github.com/facebook/create-react-app/pull/5228) removed create-react-app-parcel link ([@lockround](https://github.com/lockround))
  - [#5254](https://github.com/facebook/create-react-app/pull/5254) Update README links for CSS modules and SASS ([@yuyokk](https://github.com/yuyokk))
  - [#5249](https://github.com/facebook/create-react-app/pull/5249) Set the color palette to something a bit more React-y ([@selbekk](https://github.com/selbekk))
  - [#5244](https://github.com/facebook/create-react-app/pull/5244) Update favicon and OpenGraph images ([@selbekk](https://github.com/selbekk))
  - [#5242](https://github.com/facebook/create-react-app/pull/5242) 5238 Removing sample pages ([@selbekk](https://github.com/selbekk))
  - [#5243](https://github.com/facebook/create-react-app/pull/5243) Set the project name and owner correctly ([@selbekk](https://github.com/selbekk))
  - [#5239](https://github.com/facebook/create-react-app/pull/5239) 5238 removing blog from Docusaurus ([@selbekk](https://github.com/selbekk))
  - [#5227](https://github.com/facebook/create-react-app/pull/5227) Initial setup of Docusaurus ([@amyrlam](https://github.com/amyrlam))
- `react-scripts`
  - [#5252](https://github.com/facebook/create-react-app/pull/5252) Revert change to http-proxy-middleware docs ([@iansu](https://github.com/iansu))
  - [#5226](https://github.com/facebook/create-react-app/pull/5226) Fix usage of http-proxy-middleware ([@banyan](https://github.com/banyan))
  - [#5233](https://github.com/facebook/create-react-app/pull/5233) DOCS: Add Relay example ([@zachasme](https://github.com/zachasme))

#### :house: Internal

- [#5263](https://github.com/facebook/create-react-app/pull/5263) Add browser test for graphql ([@Timer](https://github.com/Timer))

#### Committers: 11

- Amy Lam ([@amyrlam](https://github.com/amyrlam))
- Crux ([@crux153](https://github.com/crux153))
- Dan Abramov ([@gaearon](https://github.com/gaearon))
- Ian Sutherland ([@iansu](https://github.com/iansu))
- Iurii Kucherov ([@yuyokk](https://github.com/yuyokk))
- Joe Haddad ([@Timer](https://github.com/Timer))
- Kohei Hasegawa ([@banyan](https://github.com/banyan))
- Kristofer Selbekk ([@selbekk](https://github.com/selbekk))
- Maël Nison ([@arcanis](https://github.com/arcanis))
- Shubham Tiwari ([@lockround](https://github.com/lockround))
- Zacharias Knudsen ([@zachasme](https://github.com/zachasme))

### Migrating from 2.0.3 to 2.0.4

Inside any created project that has not been ejected, run:

```bash
npm install --save --save-exact react-scripts@2.0.4
```

or

```
yarn add --exact react-scripts@2.0.4
```

## 2.0.3 (October 1, 2018)

Create React App 2.0 brings a year’s worth of improvements in a single dependency update.
We summarized all of the changes in a blog post!<br>

Check it out: **[Create React App 2.0: Babel 7, Sass, and More](https://reactjs.org/blog/2018/10/01/create-react-app-v2.html)**.

It provides a high-level overview of new features and improvements. Now let's see how to update your app to the latest version in detail.

# Migrating from 1.x to 2.0.3

Inside any created project that has not been ejected, run:

```bash
npm install --save --save-exact react-scripts@2.0.3
```

or

```
yarn add --exact react-scripts@2.0.3
```

If you previously ejected but now want to upgrade, one common solution is to find the commits where you ejected (and any subsequent commits changing the configuration), revert them, upgrade, and later optionally eject again. It’s also possible that the feature you ejected for (maybe Sass or CSS Modules?) is now supported out of the box. You can find a list of notable new features in the **[Create React App 2.0 blog post](https://reactjs.org/blog/2018/10/01/create-react-app-v2.html)**.

## Breaking Changes

Like any major release, `react-scripts@2.0` contains a few breaking changes. We expect that they won't affect every user, but we recommend to scan over these sections to see if something is relevant to you. If we missed something, please file a new issue.

### Node 6 is no longer supported

Please upgrade to Node 8 (LTS) or later.

### Polyfills for IE 9, IE 10, and IE 11 are no longer included by default (but you can opt in!)

We have dropped default support for Internet Explorer 9, 10, and 11. If you still need to support these browsers, follow the instructions below.

First, install `react-app-polyfill`:

```bash
npm install react-app-polyfill
```

or

```
yarn add react-app-polyfill
```

Next, place one of the following lines at the very top of `src/index.js`:

```js
import 'react-app-polyfill/ie9'; // For IE 9-11 support
import 'react-app-polyfill/ie11'; // For IE 11 support
```

You can read more about [these polyfills here](https://github.com/facebook/create-react-app/tree/master/packages/react-app-polyfill).

### Dynamic `import()` of a CommonJS module now has a `.default` property

[Webpack 4 changed the behavior of `import()`](https://medium.com/webpack/webpack-4-import-and-commonjs-d619d626b655) to be closer in line with the specification.

Previously, importing a CommonJS module did not require you specify the default export. In most cases, this is now required.
If you see errors in your application about `... is not a function`, you likely need to update your dynamic import, e.g.:

```js
const throttle = await import('lodash/throttle');
// replace with
const throttle = await import('lodash/throttle').then(m => m.default);
```

### `require.ensure()` is superseded by dynamic `import()`

We previously allowed code splitting with a webpack-specific directive, `require.ensure()`. It is now disabled in favor of `import()`. To switch to `import()`, follow the examples below:

**Single Module**

```js
require.ensure(['module-a'], function() {
  var a = require('module-a');
  // ...
});

// Replace with:
import('module-a').then(a => {
  // ...
});
```

**Multiple Module**

```js
require.ensure(['module-a', 'module-b'], function() {
  var a = require('module-a');
  var b = require('module-b');
  // ...
});

// Replace with:
Promise.all([import('module-a'), import('module-b')]).then(([a, b]) => {
  // ...
});
```

### The default Jest environment was changed to `jsdom`

Look at the `test` entry in the `scripts` section of your `package.json`.
Here's a table how to change it from "before" and "after", depending on what you have there:

| 1.x (if you have this...)        | 2.x (...change it to this!)     |
| -------------------------------- | ------------------------------- |
| `react-scripts test --env=jsdom` | `react-scripts test`            |
| `react-scripts test`             | `react-scripts test --env=node` |

### Object `proxy` configuration is superseded by `src/setupProxy.js`

To check if action is required, look for the `proxy` key in `package.json` and follow this table:

1. I couldn't find a `proxy` key in `package.json`
   - No action is required!
2. The value of `proxy` is a string (e.g. `http://localhost:5000`)
   - No action is required!
3. The value of `proxy` is an object
   - Follow the migration instructions below.

**It's worth highlighting: if your `proxy` field is a `string`, e.g. `http://localhost:5000`, or you don't have it, skip this section. This feature is still supported and has the same behavior.**

If your `proxy` is an object, that means you are using the advanced proxy configuration. It has become fully customizable so we removed the limited support for the object-style configuration. Here's how to recreate it.

First, install `http-proxy-middleware` using npm or Yarn:

```bash
npm install http-proxy-middleware
```

or

```
yarn add http-proxy-middleware
```

Next, create `src/setupProxy.js` and place the following contents in it:

```js
const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  // ...
};
```

Now, migrate each entry in your `proxy` object one by one, e.g.:

```json
"proxy": {
  "/api": {
    "target": "http://localhost:5000/"
    },
  "/*.svg": {
    "target": "http://localhost:5000/"
  }
}
```

Place entries into `src/setupProxy.js` like so:

```js
const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/api', { target: 'http://localhost:5000/' }));
  app.use(proxy('/*.svg', { target: 'http://localhost:5000/' }));
};
```

You can also use completely custom logic there now! This wasn't possible before.

### `.mjs` file extension support is removed

Change the extension of any files in your project using `.mjs` to just `.js`.

It was removed because of inconsistent support from underlying tools. We will add it back after it stops being experimental, and Jest gets built-in support for it.

### `PropTypes` definitions are now removed in production

Normally, this shouldn't affect your logic and should make the resulting bundle smaller. However, you may be relying on PropTypes definition for production logic. This is not recommended, and will break now. If a library does it, one possible solution is to file an issue in it with a proposal to use a different field (not `propTypes`) to signal that the declaration needs to be retained.

### Anything missing?

This was a large release, and we might have missed something.

Please [file an issue](https://github.com/facebook/create-react-app/issues/new) and we will try to help.

# Migrating from 2.0.0-next.xyz

If you used 2.x alphas, please [follow these instructions](https://gist.github.com/gaearon/8650d1c70e436e5eff01f396dffc4114).

# Detailed Changelog

**For a readable summary of the changes, [check out our blog post](https://reactjs.org/blog/2018/10/01/create-react-app-v2.html).**

#### :rocket: New Feature

- `react-scripts`
  - [#5218](https://github.com/facebook/create-react-app/pull/5218) Support globalSetup and globalTeardown Jest options ([@gaearon](https://github.com/gaearon))
  - [#5073](https://github.com/facebook/create-react-app/pull/5073) Add user defined proxy via middleware ([@Timer](https://github.com/Timer))
  - [#3945](https://github.com/facebook/create-react-app/pull/3945) Allow bundles to be analyzed with Webpack-specific tools ([@joshwcomeau](https://github.com/joshwcomeau))
  - [#4195](https://github.com/facebook/create-react-app/pull/4195) Sass loader ([@Fabianopb](https://github.com/Fabianopb))
  - [#3909](https://github.com/facebook/create-react-app/pull/3909) Add loader for .graphql files ([@petetnt](https://github.com/petetnt))
  - [#1288](https://github.com/facebook/create-react-app/pull/1288) Create git repository with initial commit ([@mauricedb](https://github.com/mauricedb))
  - [#3718](https://github.com/facebook/create-react-app/pull/3718) Import SVGs as React components (#1388) ([@iansu](https://github.com/iansu))
  - [#2285](https://github.com/facebook/create-react-app/pull/2285) Add support for CSS Modules with explicit filename - [name].module.css ([@ro-savage](https://github.com/ro-savage))
  - [#3804](https://github.com/facebook/create-react-app/pull/3804) Support Jest --watchAll flag ([@gaearon](https://github.com/gaearon))
  - [#3802](https://github.com/facebook/create-react-app/pull/3802) Add feature #3116 extended Jest config ([@garmeeh](https://github.com/garmeeh))
- `react-dev-utils`, `react-scripts`
  - [#5058](https://github.com/facebook/create-react-app/pull/5058) Inline the webpack runtime chunk ([@Timer](https://github.com/Timer))
- `babel-preset-react-app`
  - [#5047](https://github.com/facebook/create-react-app/pull/5047) Allow dynamic import proposal in node_modules ([@Timer](https://github.com/Timer))
  - [#3865](https://github.com/facebook/create-react-app/pull/3865) Add opt-out for preset-flow to work with @babel/preset-typescript ([@oieduardorabelo](https://github.com/oieduardorabelo))
  - [#3675](https://github.com/facebook/create-react-app/pull/3675) add experimental babel-plugin-macros support ([@kentcdodds](https://github.com/kentcdodds))
- `babel-preset-react-app`, `confusing-browser-globals`, `eslint-config-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#4077](https://github.com/facebook/create-react-app/pull/4077) Webpack 4 ([@andriijas](https://github.com/andriijas))
- `create-react-app`
  - [#4350](https://github.com/facebook/create-react-app/pull/4350) Support package distribution tags ([@miraage](https://github.com/miraage))
- `babel-preset-react-app`, `react-scripts`
  - [#3776](https://github.com/facebook/create-react-app/pull/3776) Compile dependencies with babel-preset-env ([@gaearon](https://github.com/gaearon))

#### :boom: Breaking Change

- `react-app-polyfill`, `react-scripts`
  - [#5090](https://github.com/facebook/create-react-app/pull/5090) Drop IE 11 support by default ([@Timer](https://github.com/Timer))
- `react-scripts`
  - [#5074](https://github.com/facebook/create-react-app/pull/5074) Change default test environment to jsdom ([@Timer](https://github.com/Timer))
  - [#5027](https://github.com/facebook/create-react-app/pull/5027) Remove `mjs` support ([@Timer](https://github.com/Timer))
  - [#4009](https://github.com/facebook/create-react-app/pull/4009) Update dotenv to 5.0.0 ([@iansu](https://github.com/iansu))
  - [#2544](https://github.com/facebook/create-react-app/pull/2544) Set the public path to the asset manifest entries ([@robinvdvleuten](https://github.com/robinvdvleuten))
  - [#3884](https://github.com/facebook/create-react-app/pull/3884) Don't use app node_modules folder as a resolve fallback ([@gaearon](https://github.com/gaearon))
  - [#3817](https://github.com/facebook/create-react-app/pull/3817) Disable service worker by default ([@iansu](https://github.com/iansu))
  - [#2285](https://github.com/facebook/create-react-app/pull/2285) Add support for CSS Modules with explicit filename - [name].module.css ([@ro-savage](https://github.com/ro-savage))
  - [#3771](https://github.com/facebook/create-react-app/pull/3771) Add preflight check to guard against wrong versions of webpack/eslint/jest higher up the tree ([@gaearon](https://github.com/gaearon))
  - [#3346](https://github.com/facebook/create-react-app/pull/3346) Change the default `start_url` to `.` ([@evilchuck](https://github.com/evilchuck))
  - [#3419](https://github.com/facebook/create-react-app/pull/3419) Remove the navigateFallback behavior from the generated service worker ([@jeffposnick](https://github.com/jeffposnick))
  - [#3644](https://github.com/facebook/create-react-app/pull/3644) Move browsers to cross-tool config ([@ai](https://github.com/ai))
- `react-dev-utils`
  - [#5072](https://github.com/facebook/create-react-app/pull/5072) Drop support for advanced proxy ([@Timer](https://github.com/Timer))
- `babel-preset-react-app`
  - [#3818](https://github.com/facebook/create-react-app/pull/3818) Remove PropTypes from production build (#209) ([@iansu](https://github.com/iansu))
- `eslint-config-react-app`
  - [#2319](https://github.com/facebook/create-react-app/pull/2319) Changes no-unused-expressions lint from warning to error ([@amupitan](https://github.com/amupitan))
- `eslint-config-react-app`, `react-error-overlay`, `react-scripts`
  - [#2690](https://github.com/facebook/create-react-app/pull/2690) Bump eslint-plugin-jsx-a11y version ([@gaearon](https://github.com/gaearon))
- `eslint-config-react-app`, `react-scripts`
  - [#3121](https://github.com/facebook/create-react-app/pull/3121) Redisable require.ensure() ([@everdimension](https://github.com/everdimension))

#### :bug: Bug Fix

- `react-scripts`
  - [#5217](https://github.com/facebook/create-react-app/pull/5217) Verify more package versions ([@Timer](https://github.com/Timer))
  - [#5214](https://github.com/facebook/create-react-app/pull/5214) Fix absolute paths on eject ([@gaearon](https://github.com/gaearon))
  - [#5212](https://github.com/facebook/create-react-app/pull/5212) Don't crash npm test when hg/git are missing ([@gaearon](https://github.com/gaearon))
  - [#5197](https://github.com/facebook/create-react-app/pull/5197) Treat .css and .sass/.scss as side effectful ([@gaearon](https://github.com/gaearon))
  - [#5196](https://github.com/facebook/create-react-app/pull/5196) Format SVG React snapshots as <svg> tag with props ([@gaearon](https://github.com/gaearon))
  - [#5163](https://github.com/facebook/create-react-app/pull/5163) Correctly lookup assets when using a relative build directory ([@Timer](https://github.com/Timer))
  - [#5151](https://github.com/facebook/create-react-app/pull/5151) Toggle `mjs` files to `javascript/auto` type ([@Timer](https://github.com/Timer))
  - [#5131](https://github.com/facebook/create-react-app/pull/5131) Output CSS sourcemaps in separate file ([@Timer](https://github.com/Timer))
  - [#5043](https://github.com/facebook/create-react-app/pull/5043) Always lint with latest React version ([@Timer](https://github.com/Timer))
  - [#5030](https://github.com/facebook/create-react-app/pull/5030) Disable webpack chunk coalescing ([@Timer](https://github.com/Timer))
  - [#5027](https://github.com/facebook/create-react-app/pull/5027) Remove `mjs` support ([@Timer](https://github.com/Timer))
  - [#4706](https://github.com/facebook/create-react-app/pull/4706) Only use safe options when packing CSS assets ([@bugzpodder](https://github.com/bugzpodder))
  - [#4562](https://github.com/facebook/create-react-app/pull/4562) Configured the thread-loader to keeping workers alive in development mode ([@sadkovoy](https://github.com/sadkovoy))
  - [#4318](https://github.com/facebook/create-react-app/pull/4318) `.mjs` should not resolve before .js files (#4085) (#4317) ([@hobochild](https://github.com/hobochild))
  - [#4419](https://github.com/facebook/create-react-app/pull/4419) Map (s?css|sass) modules to identity-obj-proxy in jest ([@kusold](https://github.com/kusold))
  - [#4424](https://github.com/facebook/create-react-app/pull/4424) ensureSlash: Fix accidental string-to-NaN coercion ([@wchargin](https://github.com/wchargin))
  - [#4376](https://github.com/facebook/create-react-app/pull/4376) Update sass-loader (#4363) ([@miraage](https://github.com/miraage))
  - [#4247](https://github.com/facebook/create-react-app/pull/4247) Work around Jest environment resolving bug ([@gaearon](https://github.com/gaearon))
  - [#4234](https://github.com/facebook/create-react-app/pull/4234) [next] Revert to use ecma 5 in uglifyOptions ([@danielberndt](https://github.com/danielberndt))
  - [#2544](https://github.com/facebook/create-react-app/pull/2544) Set the public path to the asset manifest entries ([@robinvdvleuten](https://github.com/robinvdvleuten))
  - [#3992](https://github.com/facebook/create-react-app/pull/3992) Upgrade dotenv-expand to 4.2.0 (#3961) ([@iansu](https://github.com/iansu))
  - [#3989](https://github.com/facebook/create-react-app/pull/3989) add default value for globPatterns ([@viankakrisna](https://github.com/viankakrisna))
- `react-error-overlay`
  - [#5203](https://github.com/facebook/create-react-app/pull/5203) Fix IE 11 compatibility ([@Timer](https://github.com/Timer))
  - [#5198](https://github.com/facebook/create-react-app/pull/5198) Polyfill error overlay for IE9 support ([@Timer](https://github.com/Timer))
  - [#4024](https://github.com/facebook/create-react-app/pull/4024) Fix floating caret position incorrect while scrolling overlay ([@jihchi](https://github.com/jihchi))
- `react-dev-utils`
  - [#5184](https://github.com/facebook/create-react-app/pull/5184) Still emit runtime chunk ([@Timer](https://github.com/Timer))
  - [#5137](https://github.com/facebook/create-react-app/pull/5137) Fix displaying third party webpack plugins errors ([@Fer0x](https://github.com/Fer0x))
  - [#5134](https://github.com/facebook/create-react-app/pull/5134) Lists loader-utils in the dependencies ([@arcanis](https://github.com/arcanis))
  - [#5025](https://github.com/facebook/create-react-app/pull/5025) Fix/file size reporter ([@fiddep](https://github.com/fiddep))
  - [#4420](https://github.com/facebook/create-react-app/pull/4420) Update the thread loader test in formatWebpackMessages ([@marcofugaro](https://github.com/marcofugaro))
- `babel-preset-react-app`
  - [#5182](https://github.com/facebook/create-react-app/pull/5182) Strip flow syntax before any other transform ([@Timer](https://github.com/Timer))
  - [#4630](https://github.com/facebook/create-react-app/pull/4630) Eliminate regenerator from preset-react-app plugins ([@conartist6](https://github.com/conartist6))
  - [#5110](https://github.com/facebook/create-react-app/pull/5110) Add dynamic import transformer for dependencies in test env ([@lixiaoyan](https://github.com/lixiaoyan))
  - [#5052](https://github.com/facebook/create-react-app/pull/5052) Add Babel config sourceType: 'unambiguous' for dependencies ([@lixiaoyan](https://github.com/lixiaoyan))
  - [#5046](https://github.com/facebook/create-react-app/pull/5046) Correct Babel dependency behavior ([@Timer](https://github.com/Timer))
  - [#4248](https://github.com/facebook/create-react-app/pull/4248) Enable loose mode for `class-properties` ([@rgrochowicz](https://github.com/rgrochowicz))
- `babel-preset-react-app`, `react-error-overlay`, `react-scripts`
  - [#5142](https://github.com/facebook/create-react-app/pull/5142) Remove runtime alias hack ([@Timer](https://github.com/Timer))
- `react-app-polyfill`
  - [#5132](https://github.com/facebook/create-react-app/pull/5132) Don't polyfill fetch for Node ([@Timer](https://github.com/Timer))
- `react-error-overlay`, `react-scripts`
  - [#5109](https://github.com/facebook/create-react-app/pull/5109) Prevent Babel config overridden ([@lixiaoyan](https://github.com/lixiaoyan))
- `babel-preset-react-app`, `react-scripts`
  - [#5078](https://github.com/facebook/create-react-app/pull/5078) Prevent the cache of files using Babel Macros ([@Timer](https://github.com/Timer))
- `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#5026](https://github.com/facebook/create-react-app/pull/5026) Switch from uglifyjs to terser ([@Timer](https://github.com/Timer))
- `create-react-app`
  - [#4677](https://github.com/facebook/create-react-app/pull/4677) Support scoped package names for scripts-version option in create-react-app cli ([@bugzpodder](https://github.com/bugzpodder))
  - [#2705](https://github.com/facebook/create-react-app/pull/2705) Don't delete error logs when install fails ([@mg](https://github.com/mg))
- `react-dev-utils`, `react-scripts`
  - [#4391](https://github.com/facebook/create-react-app/pull/4391) Update getCSSModuleLocalIdent to support Sass ([@arianon](https://github.com/arianon))
- `babel-plugin-named-asset-import`, `babel-preset-react-app`, `eslint-config-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#4159](https://github.com/facebook/create-react-app/pull/4159) Bump babel-related deps ([@existentialism](https://github.com/existentialism))
- `create-react-app`, `react-dev-utils`, `react-scripts`
  - [#3997](https://github.com/facebook/create-react-app/pull/3997) Use yarn when running inside yarn workspace. ([@bradfordlemley](https://github.com/bradfordlemley))

#### :nail_care: Enhancement

- `create-react-app`, `react-scripts`
  - [#5136](https://github.com/facebook/create-react-app/pull/5136) Plug'n'Play support ([@arcanis](https://github.com/arcanis))
- `react-dev-utils`, `react-scripts`
  - [#5174](https://github.com/facebook/create-react-app/pull/5174) 💅 Polish webpack message output ([@Timer](https://github.com/Timer))
  - [#5065](https://github.com/facebook/create-react-app/pull/5065) (Micro) Optimize webpack rebuild speed ([@Timer](https://github.com/Timer))
  - [#5058](https://github.com/facebook/create-react-app/pull/5058) Inline the webpack runtime chunk ([@Timer](https://github.com/Timer))
  - [#4192](https://github.com/facebook/create-react-app/pull/4192) Update CSS Modules localIndetName ([@ro-savage](https://github.com/ro-savage))
  - [#3782](https://github.com/facebook/create-react-app/pull/3782) Tell user what browser support their application was built with ([@Timer](https://github.com/Timer))
- `react-dev-utils`
  - [#5150](https://github.com/facebook/create-react-app/pull/5150) Run behavioral smoke tests with Jest, add output tests ([@Timer](https://github.com/Timer))
  - [#4623](https://github.com/facebook/create-react-app/pull/4623) Use yarn build command in predeploy script if using yarn ([@alexbrazier](https://github.com/alexbrazier))
  - [#4470](https://github.com/facebook/create-react-app/pull/4470) Adjust browser defaults ([@Timer](https://github.com/Timer))
  - [#4001](https://github.com/facebook/create-react-app/pull/4001) Add support for new yarn workspaces config format ([@detrohutt](https://github.com/detrohutt))
  - [#3980](https://github.com/facebook/create-react-app/pull/3980) Autodetect GoLand editor ([@ifedyukin](https://github.com/ifedyukin))
  - [#3808](https://github.com/facebook/create-react-app/pull/3808) Use wmic to get process list on Windows ([@levrik](https://github.com/levrik))
- `react-scripts`
  - [#4169](https://github.com/facebook/create-react-app/pull/4169) Workbox service worker ([@davejm](https://github.com/davejm))
  - [#5096](https://github.com/facebook/create-react-app/pull/5096) Disable source maps for node_modules ([@Timer](https://github.com/Timer))
  - [#4716](https://github.com/facebook/create-react-app/pull/4716) add postcss-preset-env, remove autoprefixer ([@heygrady](https://github.com/heygrady))
  - [#1457](https://github.com/facebook/create-react-app/pull/1457) Add eslintConfig to new projects automatically ([@lifeiscontent](https://github.com/lifeiscontent))
  - [#5030](https://github.com/facebook/create-react-app/pull/5030) Disable webpack chunk coalescing ([@Timer](https://github.com/Timer))
  - [#4582](https://github.com/facebook/create-react-app/pull/4582) Added thread-loader tweak for application code entry-point ([@sadkovoy](https://github.com/sadkovoy))
  - [#4562](https://github.com/facebook/create-react-app/pull/4562) Configured the thread-loader to keeping workers alive in development mode ([@sadkovoy](https://github.com/sadkovoy))
  - [#4504](https://github.com/facebook/create-react-app/pull/4504) webpack 4 scope hoisting ([@bugzpodder](https://github.com/bugzpodder))
  - [#4461](https://github.com/facebook/create-react-app/pull/4461) Update svgr ([@iansu](https://github.com/iansu))
  - [#3867](https://github.com/facebook/create-react-app/pull/3867) Provide callbacks in serviceWorker (next) ([@piotr-cz](https://github.com/piotr-cz))
  - [#3235](https://github.com/facebook/create-react-app/pull/3235) Applies new theme and adds docs link to template ([@lukejacksonn](https://github.com/lukejacksonn))
  - [#3512](https://github.com/facebook/create-react-app/pull/3512) Enhance Jest config error for `setupTestFrameworkScriptFile` ([@jackfranklin](https://github.com/jackfranklin))
  - [#3778](https://github.com/facebook/create-react-app/pull/3778) Compile code in parallel ([@Timer](https://github.com/Timer))
  - [#3771](https://github.com/facebook/create-react-app/pull/3771) Add preflight check to guard against wrong versions of webpack/eslint/jest higher up the tree ([@gaearon](https://github.com/gaearon))
  - [#3618](https://github.com/facebook/create-react-app/pull/3618) use uglifyjs-webpack-plugin v1 ([@viankakrisna](https://github.com/viankakrisna))
- `babel-preset-react-app`, `react-error-overlay`, `react-scripts`
  - [#5093](https://github.com/facebook/create-react-app/pull/5093) Turn on Babel `helpers` ([@Timer](https://github.com/Timer))
- `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#4930](https://github.com/facebook/create-react-app/pull/4930) Switch from cheap-module-source-map eval-source-map ([@jasonLaster](https://github.com/jasonLaster))
  - [#3124](https://github.com/facebook/create-react-app/pull/3124) update jest to 22 and support watchPathIgnorePatterns configuration ([@aisensiy](https://github.com/aisensiy))
- `confusing-browser-globals`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#4846](https://github.com/facebook/create-react-app/pull/4846) Update jest version ([@skoging](https://github.com/skoging))
  - [#4362](https://github.com/facebook/create-react-app/pull/4362) Bumped jest version to 22.4.1 ([@CGreenburg](https://github.com/CGreenburg))
- `babel-preset-react-app`, `confusing-browser-globals`, `eslint-config-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#4077](https://github.com/facebook/create-react-app/pull/4077) Webpack 4 ([@andriijas](https://github.com/andriijas))
- `babel-preset-react-app`
  - [#4432](https://github.com/facebook/create-react-app/pull/4432) Update babel-plugin-macros to fix a bug ([@stereobooster](https://github.com/stereobooster))
  - [#3818](https://github.com/facebook/create-react-app/pull/3818) Remove PropTypes from production build (#209) ([@iansu](https://github.com/iansu))
- `create-react-app`
  - [#4375](https://github.com/facebook/create-react-app/pull/4375) fix: update envinfo + implementation, update issue_template ([@tabrindle](https://github.com/tabrindle))
- `eslint-config-react-app`, `react-error-overlay`, `react-scripts`
  - [#4048](https://github.com/facebook/create-react-app/pull/4048) Add ESLint check for incorrect propTypes usage (#3840) ([@iansu](https://github.com/iansu))
  - [#2690](https://github.com/facebook/create-react-app/pull/2690) Bump eslint-plugin-jsx-a11y version ([@gaearon](https://github.com/gaearon))
- `eslint-config-react-app`
  - [#3844](https://github.com/facebook/create-react-app/pull/3844) remove radix eslint rule ([@sendilkumarn](https://github.com/sendilkumarn))
- `create-react-app`, `react-dev-utils`, `react-scripts`
  - [#3792](https://github.com/facebook/create-react-app/pull/3792) Offer to set default browsers ([@Timer](https://github.com/Timer))
- `babel-preset-react-app`, `create-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#3785](https://github.com/facebook/create-react-app/pull/3785) Bump dependencies ([@gaearon](https://github.com/gaearon))
- `babel-preset-react-app`, `react-scripts`
  - [#3770](https://github.com/facebook/create-react-app/pull/3770) Loosen Babel preset to use browserslist ([@Timer](https://github.com/Timer))
- `babel-preset-react-app`, `eslint-config-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#3522](https://github.com/facebook/create-react-app/pull/3522) Switch to Babel 7 ([@clemmy](https://github.com/clemmy))

#### :memo: Documentation

- `react-scripts`
  - [#5211](https://github.com/facebook/create-react-app/pull/5211) Adds instructions to README on how to customize Bootstrap with Sass ([@mslooten](https://github.com/mslooten))
  - [#5147](https://github.com/facebook/create-react-app/pull/5147) Document adding SVGs as React components ([@mareksuscak](https://github.com/mareksuscak))
  - [#5193](https://github.com/facebook/create-react-app/pull/5193) Fix typo in 'Configuring the Proxy Manually' ([@fabriziocucci](https://github.com/fabriziocucci))
  - [#5111](https://github.com/facebook/create-react-app/pull/5111) Updates to README to reflect Workbox usage. ([@jeffposnick](https://github.com/jeffposnick))
  - [#5169](https://github.com/facebook/create-react-app/pull/5169) Add additional troubleshooting for Github Pages ([@dwang](https://github.com/dwang))
  - [#5145](https://github.com/facebook/create-react-app/pull/5145) Mention .module.scss/sass convention ([@mareksuscak](https://github.com/mareksuscak))
  - [#5105](https://github.com/facebook/create-react-app/pull/5105) as per #5104 ([@sag1v](https://github.com/sag1v))
  - [#5071](https://github.com/facebook/create-react-app/pull/5071) Update usage advice of husky to 1.0 ([@martinlechner1](https://github.com/martinlechner1))
  - [#5077](https://github.com/facebook/create-react-app/pull/5077) small typo fix ([@tteltrab](https://github.com/tteltrab))
  - [#5070](https://github.com/facebook/create-react-app/pull/5070) Integrating with an API Backend: add API Platform ([@dunglas](https://github.com/dunglas))
  - [#5064](https://github.com/facebook/create-react-app/pull/5064) fix minor typo in troubleshooting github pages ([@kaznovac](https://github.com/kaznovac))
  - [#5035](https://github.com/facebook/create-react-app/pull/5035) Remove paywalled tutorial link for Storybook ([@imgntn](https://github.com/imgntn))
  - [#3924](https://github.com/facebook/create-react-app/pull/3924) Updates to reflect service worker registration being opt-in. ([@jeffposnick](https://github.com/jeffposnick))
  - [#4881](https://github.com/facebook/create-react-app/pull/4881) flowtype.org -> flow.org ([@web2033](https://github.com/web2033))
  - [#4825](https://github.com/facebook/create-react-app/pull/4825) Update support info for service workers ([@j-f1](https://github.com/j-f1))
  - [#4738](https://github.com/facebook/create-react-app/pull/4738) Fix typo ([@mjw56](https://github.com/mjw56))
  - [#4741](https://github.com/facebook/create-react-app/pull/4741) remove extra dot on devtool link comment ([@shelldandy](https://github.com/shelldandy))
  - [#4703](https://github.com/facebook/create-react-app/pull/4703) Suggest `reactstrap` instead of `react-bootstrap` ([@zx6658](https://github.com/zx6658))
  - [#4566](https://github.com/facebook/create-react-app/pull/4566) Move whitespace comment closer to where it applies ([@mgedmin](https://github.com/mgedmin))
  - [#4497](https://github.com/facebook/create-react-app/pull/4497) [Read Me template patch] Warn about #871 until it's actually fixed. ([@saimonmoore](https://github.com/saimonmoore))
  - [#4205](https://github.com/facebook/create-react-app/pull/4205) Chokidar Updates ([@originell](https://github.com/originell))
  - [#4286](https://github.com/facebook/create-react-app/pull/4286) Fix some typos in README.md ([@apaatsio](https://github.com/apaatsio))
  - [#4298](https://github.com/facebook/create-react-app/pull/4298) Added learnstorybook.com to Storybook links ([@tmeasday](https://github.com/tmeasday))
  - [#4117](https://github.com/facebook/create-react-app/pull/4117) Document multiple build environments via `env-cmd` #4071 ([@jMuzsik](https://github.com/jMuzsik))
  - [#4197](https://github.com/facebook/create-react-app/pull/4197) Add troubleshooting for Github Pages ([@xnt](https://github.com/xnt))
  - [#4236](https://github.com/facebook/create-react-app/pull/4236) use the lastest url of gitignore file ([@Plortinus](https://github.com/Plortinus))
  - [#4239](https://github.com/facebook/create-react-app/pull/4239) Fix typo in comment and be clearer about `ecma` settings in uglifyjs options ([@danielberndt](https://github.com/danielberndt))
  - [#4164](https://github.com/facebook/create-react-app/pull/4164) Fix typos in example monorepo documentation. ([@bradfordlemley](https://github.com/bradfordlemley))
  - [#4089](https://github.com/facebook/create-react-app/pull/4089) Fix a typo in packages/react-scripts/template/README.md ([@nott](https://github.com/nott))
  - [#4101](https://github.com/facebook/create-react-app/pull/4101) Docs: Update status of Object Rest/Spread proposal ([@jpaquim](https://github.com/jpaquim))
  - [#4107](https://github.com/facebook/create-react-app/pull/4107) docs: use node_js 8 in example travis.yml ([@nikolas2](https://github.com/nikolas2))
  - [#3821](https://github.com/facebook/create-react-app/pull/3821) Updated react-scripts Readme.md to better document GitHub Pages ([@EdwaRen](https://github.com/EdwaRen))
- Other
  - [#5102](https://github.com/facebook/create-react-app/pull/5102) Fix Troubleshooting link ([@gdi2290](https://github.com/gdi2290))
  - [#4551](https://github.com/facebook/create-react-app/pull/4551) Update targeted IE version in documentation ([@antzshrek](https://github.com/antzshrek))
  - [#4814](https://github.com/facebook/create-react-app/pull/4814) Update CODE_OF_CONDUCT.md ([@Ashleyotero](https://github.com/Ashleyotero))
  - [#4638](https://github.com/facebook/create-react-app/pull/4638) Add instructions on alternative methods of app creation ([@RusinovAnton](https://github.com/RusinovAnton))
  - [#4546](https://github.com/facebook/create-react-app/pull/4546) Update file tree view ([@antzshrek](https://github.com/antzshrek))
  - [#4449](https://github.com/facebook/create-react-app/pull/4449) add create-react-app-parcel to Alternatives section in README ([@sw-yx](https://github.com/sw-yx))
  - [#4294](https://github.com/facebook/create-react-app/pull/4294) documentation: added License to the README.md ([@thiagopaiva99](https://github.com/thiagopaiva99))
  - [#4323](https://github.com/facebook/create-react-app/pull/4323) Fix typo in e2e-simple.sh comment ([@bmuenzenmeyer](https://github.com/bmuenzenmeyer))
  - [#4134](https://github.com/facebook/create-react-app/pull/4134) fix: Minor typos ([@fejes713](https://github.com/fejes713))
  - [#4114](https://github.com/facebook/create-react-app/pull/4114) Update CONTRIBUTING.md ([@jkzing](https://github.com/jkzing))
  - [#3825](https://github.com/facebook/create-react-app/pull/3825) Add svg rendering for error example ([@marionebl](https://github.com/marionebl))
  - [#3810](https://github.com/facebook/create-react-app/pull/3810) Update screencast to use npx ([@marionebl](https://github.com/marionebl))
- `create-react-app`
  - [#4309](https://github.com/facebook/create-react-app/pull/4309) Fix typo to word bootstrapped in condition to check for old version o… ([@jamesvsshark](https://github.com/jamesvsshark))
  - [#4015](https://github.com/facebook/create-react-app/pull/4015) add `create-react-app --help` info for local file path `--scripts-version` support ([@albertstill](https://github.com/albertstill))
- `react-dev-utils`, `react-scripts`
  - [#3836](https://github.com/facebook/create-react-app/pull/3836) Use custom bit.ly links ([@bondz](https://github.com/bondz))

#### :house: Internal

- `eslint-config-react-app`
  - [#5205](https://github.com/facebook/create-react-app/pull/5205) Disable react/no-deprecated rule ([@Timer](https://github.com/Timer))
  - [#5051](https://github.com/facebook/create-react-app/pull/5051) Adjust ESLint configuration for v5 ([@Timer](https://github.com/Timer))
  - [#4187](https://github.com/facebook/create-react-app/pull/4187) Change no-unused-vars 'args' from none to all to show warning on dest… ([@goncy](https://github.com/goncy))
- `babel-plugin-named-asset-import`, `babel-preset-react-app`, `confusing-browser-globals`, `create-react-app`, `eslint-config-react-app`, `react-app-polyfill`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#5192](https://github.com/facebook/create-react-app/pull/5192) Add license file to all packages ([@Timer](https://github.com/Timer))
- Other
  - [#5183](https://github.com/facebook/create-react-app/pull/5183) Test class properties ([@Timer](https://github.com/Timer))
  - [#5146](https://github.com/facebook/create-react-app/pull/5146) Add behavior e2e tests ([@Timer](https://github.com/Timer))
  - [#4774](https://github.com/facebook/create-react-app/pull/4774) [internal] Use Yarn cache for travis ([@bugzpodder](https://github.com/bugzpodder))
  - [#4626](https://github.com/facebook/create-react-app/pull/4626) [internal] Fix node 10 test issue ([@bugzpodder](https://github.com/bugzpodder))
  - [#3816](https://github.com/facebook/create-react-app/pull/3816) Automate screencast recordings ([@marionebl](https://github.com/marionebl))
- `react-scripts`
  - [#5180](https://github.com/facebook/create-react-app/pull/5180) Fetch Workbox from CDN ([@Timer](https://github.com/Timer))
  - [#5170](https://github.com/facebook/create-react-app/pull/5170) Remove thread-loader ([@Timer](https://github.com/Timer))
  - [#5157](https://github.com/facebook/create-react-app/pull/5157) Forwards args through thread-loader ([@arcanis](https://github.com/arcanis))
  - [#5085](https://github.com/facebook/create-react-app/pull/5085) Remove highlightCode:true because it's now the default ([@marcofugaro](https://github.com/marcofugaro))
  - [#5098](https://github.com/facebook/create-react-app/pull/5098) [internal] remove babelrc dependency for kitchensink test ([@bugzpodder](https://github.com/bugzpodder))
  - [#5076](https://github.com/facebook/create-react-app/pull/5076) Revert "Add loader for .graphql files (#3909)" ([@Timer](https://github.com/Timer))
  - [#5062](https://github.com/facebook/create-react-app/pull/5062) Upgrade svgr to v2 and disable Prettier & SVGO ([@Timer](https://github.com/Timer))
  - [#5059](https://github.com/facebook/create-react-app/pull/5059) Switch back to cheap-module-source-map ([@jasonLaster](https://github.com/jasonLaster))
  - [#4891](https://github.com/facebook/create-react-app/pull/4891) Move favicon.ico <link> to accommodate Chrome ([@thejohnfreeman](https://github.com/thejohnfreeman))
  - [#5053](https://github.com/facebook/create-react-app/pull/5053) Normalize babel caching across the board ([@Timer](https://github.com/Timer))
  - [#4550](https://github.com/facebook/create-react-app/pull/4550) Jest 23 and tests ([@bugzpodder](https://github.com/bugzpodder))
  - [#5043](https://github.com/facebook/create-react-app/pull/5043) Always lint with latest React version ([@Timer](https://github.com/Timer))
  - [#4955](https://github.com/facebook/create-react-app/pull/4955) Update webpack-dev-server 3.1.5 → 3.1.7 ([@addaleax](https://github.com/addaleax))
  - [#4776](https://github.com/facebook/create-react-app/pull/4776) Bump babel-loader to fix npm warning ([@frenzzy](https://github.com/frenzzy))
  - [#4767](https://github.com/facebook/create-react-app/pull/4767) [internal] Separate out kitchensink test into two ([@bugzpodder](https://github.com/bugzpodder))
  - [#4014](https://github.com/facebook/create-react-app/pull/4014) enable manifest plugin on dev ([@viankakrisna](https://github.com/viankakrisna))
  - [#4435](https://github.com/facebook/create-react-app/pull/4435) Update paths.js, rename shadow path variable ([@graemecode](https://github.com/graemecode))
  - [#4331](https://github.com/facebook/create-react-app/pull/4331) Bump `fsevents`. ([@wtgtybhertgeghgtwtg](https://github.com/wtgtybhertgeghgtwtg))
  - [#4174](https://github.com/facebook/create-react-app/pull/4174) Yarn workspace transpilation verification. ([@bradfordlemley](https://github.com/bradfordlemley))
  - [#3842](https://github.com/facebook/create-react-app/pull/3842) fix small grammatical typo in webpack config documentation ([@andrewerrico](https://github.com/andrewerrico))
- `react-dev-utils`
  - [#5150](https://github.com/facebook/create-react-app/pull/5150) Run behavioral smoke tests with Jest, add output tests ([@Timer](https://github.com/Timer))
  - [#4514](https://github.com/facebook/create-react-app/pull/4514) Make Sass missing message friendlier ([@Timer](https://github.com/Timer))
  - [#4138](https://github.com/facebook/create-react-app/pull/4138) Allow ModuleScopePlugin accecpts an array as its appSrc ([@froyog](https://github.com/froyog))
  - [#4016](https://github.com/facebook/create-react-app/pull/4016) (chore): Alphabetize and clean files-array in react-dev-utils package.json ([@petetnt](https://github.com/petetnt))
- `babel-preset-react-app`, `react-error-overlay`, `react-scripts`
  - [#5143](https://github.com/facebook/create-react-app/pull/5143) Switch back to babel-loader ([@iansu](https://github.com/iansu))
- `babel-preset-react-app`
  - [#5119](https://github.com/facebook/create-react-app/pull/5119) Clean up @babel/plugin-transform-regenerator ([@lixiaoyan](https://github.com/lixiaoyan))
  - [#5033](https://github.com/facebook/create-react-app/pull/5033) Lock babel configuration back to IE 9 support (ES5) ([@Timer](https://github.com/Timer))
- `react-dev-utils`, `react-scripts`
  - [#5091](https://github.com/facebook/create-react-app/pull/5091) Allow stage 3 css transforms ([@Timer](https://github.com/Timer))
  - [#5054](https://github.com/facebook/create-react-app/pull/5054) Ensure Babel files get purged on upgrades ([@Timer](https://github.com/Timer))
  - [#5031](https://github.com/facebook/create-react-app/pull/5031) Upgrade `html-webpack-plugin` to fix tests ([@Timer](https://github.com/Timer))
- `babel-preset-react-app`, `create-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#5080](https://github.com/facebook/create-react-app/pull/5080) Update tons of packages ([@Timer](https://github.com/Timer))
- `react-error-overlay`, `react-scripts`
  - [#5050](https://github.com/facebook/create-react-app/pull/5050) Eslint 5.6 ([@bugzpodder](https://github.com/bugzpodder))
- `babel-plugin-named-asset-import`, `babel-preset-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#5042](https://github.com/facebook/create-react-app/pull/5042) Upgrade to Babel 7 stable ([@Timer](https://github.com/Timer))
  - [#4253](https://github.com/facebook/create-react-app/pull/4253) Upgrade Babel to `beta.44` ([@andriijas](https://github.com/andriijas))
- `confusing-browser-globals`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#5032](https://github.com/facebook/create-react-app/pull/5032) Upgrade `react-scripts` dependencies ([@Timer](https://github.com/Timer))
- `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#5026](https://github.com/facebook/create-react-app/pull/5026) Switch from uglifyjs to terser ([@Timer](https://github.com/Timer))
- `create-react-app`
  - [#4383](https://github.com/facebook/create-react-app/pull/4383) Add Node 10 to Travis config and remove Node 6 ([@iansu](https://github.com/iansu))
  - [#3853](https://github.com/facebook/create-react-app/pull/3853) pin envinfo version to 3.4.2 ([@bondz](https://github.com/bondz))
- `react-error-overlay`
  - [#4211](https://github.com/facebook/create-react-app/pull/4211) Revert lint-related changes made in #4193 ([@NMinhNguyen](https://github.com/NMinhNguyen))
  - [#4193](https://github.com/facebook/create-react-app/pull/4193) Minor fixes to CI ([@ro-savage](https://github.com/ro-savage))
- `confusing-browser-globals`, `eslint-config-react-app`
  - [#2286](https://github.com/facebook/create-react-app/pull/2286) Add restricted globals package ([@sidoshi](https://github.com/sidoshi))
- `eslint-config-react-app`, `react-scripts`
  - [#3723](https://github.com/facebook/create-react-app/pull/3723) Updating ESlint to ^4.15.0 and adding new rules to config ([@chrislaughlin](https://github.com/chrislaughlin))

#### Committers: 116

- A.J. Roberts ([@detrohutt](https://github.com/detrohutt))
- Aaron Reisman ([@lifeiscontent](https://github.com/lifeiscontent))
- Ade Viankakrisna Fadlil ([@viankakrisna](https://github.com/viankakrisna))
- Albert Still ([@albertstill](https://github.com/albertstill))
- Alex Brazier ([@alexbrazier](https://github.com/alexbrazier))
- Andreas Cederström ([@andriijas](https://github.com/andriijas))
- Andrew ([@andrewerrico](https://github.com/andrewerrico))
- Andrew Clark ([@acdlite](https://github.com/acdlite))
- Andrew Ho ([@andrwh](https://github.com/andrwh))
- Andrey Sitnik ([@ai](https://github.com/ai))
- Anna Henningsen ([@addaleax](https://github.com/addaleax))
- Anton Rusinov ([@RusinovAnton](https://github.com/RusinovAnton))
- Antti Ahti ([@apaatsio](https://github.com/apaatsio))
- Ashley Otero ([@Ashleyotero](https://github.com/Ashleyotero))
- Bond ([@bondz](https://github.com/bondz))
- Bradford Lemley ([@bradfordlemley](https://github.com/bradfordlemley))
- Brian Muenzenmeyer ([@bmuenzenmeyer](https://github.com/bmuenzenmeyer))
- Brian Ng ([@existentialism](https://github.com/existentialism))
- Chad Greenburg ([@CGreenburg](https://github.com/CGreenburg))
- Chris Laughlin ([@chrislaughlin](https://github.com/chrislaughlin))
- Clement Hoang ([@clemmy](https://github.com/clemmy))
- Conrad Buck ([@conartist6](https://github.com/conartist6))
- Craig Mulligan ([@hobochild](https://github.com/hobochild))
- Dan Abramov ([@gaearon](https://github.com/gaearon))
- Daniel ([@danielberndt](https://github.com/danielberndt))
- Daniel Wang ([@dwang](https://github.com/dwang))
- David Moodie ([@davejm](https://github.com/davejm))
- Dmitriy Sadkovoy ([@sadkovoy](https://github.com/sadkovoy))
- Eduardo Rabelo ([@oieduardorabelo](https://github.com/oieduardorabelo))
- Edward Ren (Eddie) ([@EdwaRen](https://github.com/EdwaRen))
- Ernesto García ([@gnapse](https://github.com/gnapse))
- Eugene Kopich ([@web2033](https://github.com/web2033))
- Fabiano Brito ([@Fabianopb](https://github.com/Fabianopb))
- Fabrizio Cucci ([@fabriziocucci](https://github.com/fabriziocucci))
- Fredrik Palmquist ([@fiddep](https://github.com/fiddep))
- Futa Ogawa ([@ogawa0071](https://github.com/ogawa0071))
- Gary Meehan ([@garmeeh](https://github.com/garmeeh))
- Gonzalo Pozzo ([@goncy](https://github.com/goncy))
- Grady Kuhnline ([@heygrady](https://github.com/heygrady))
- Graeme ([@graemecode](https://github.com/graemecode))
- Harry Moreno ([@morenoh149](https://github.com/morenoh149))
- Ian Sutherland ([@iansu](https://github.com/iansu))
- Ideveloper ([@zx6658](https://github.com/zx6658))
- Igor Fedyukin ([@ifedyukin](https://github.com/ifedyukin))
- Irvin Denzel Torcuato ([@identor](https://github.com/identor))
- JK ([@jkzing](https://github.com/jkzing))
- Jack Franklin ([@jackfranklin](https://github.com/jackfranklin))
- Jack Zhao ([@bugzpodder](https://github.com/bugzpodder))
- James B. Pollack ([@imgntn](https://github.com/imgntn))
- James Simoes ([@jamesvsshark](https://github.com/jamesvsshark))
- Jason Laster ([@jasonLaster](https://github.com/jasonLaster))
- Jed Fox ([@j-f1](https://github.com/j-f1))
- Jeffrey Posnick ([@jeffposnick](https://github.com/jeffposnick))
- Jerry ([@jMuzsik](https://github.com/jMuzsik))
- Jih-Chi Lee ([@jihchi](https://github.com/jihchi))
- Joe Haddad ([@Timer](https://github.com/Timer))
- Joel George V ([@joelgeorgev](https://github.com/joelgeorgev))
- John Freeman ([@thejohnfreeman](https://github.com/thejohnfreeman))
- Joshua Comeau ([@joshwcomeau](https://github.com/joshwcomeau))
- João Paquim ([@jpaquim](https://github.com/jpaquim))
- Kent C. Dodds ([@kentcdodds](https://github.com/kentcdodds))
- Kévin Dunglas ([@dunglas](https://github.com/dunglas))
- Levin Rickert ([@levrik](https://github.com/levrik))
- Luis Nell ([@originell](https://github.com/originell))
- Luke Jackson ([@lukejacksonn](https://github.com/lukejacksonn))
- Maciej Kasprzyk ([@maciej-ka](https://github.com/maciej-ka))
- Magnús Örn Gylfason ([@mg](https://github.com/mg))
- Marco Fugaro ([@marcofugaro](https://github.com/marcofugaro))
- Marco Slooten ([@mslooten](https://github.com/mslooten))
- Marek Suscak ([@mareksuscak](https://github.com/mareksuscak))
- Mario Nebl ([@marionebl](https://github.com/marionebl))
- Marius Gedminas ([@mgedmin](https://github.com/mgedmin))
- Marko Kaznovac ([@kaznovac](https://github.com/kaznovac))
- Martin Lechner ([@martinlechner1](https://github.com/martinlechner1))
- Maurice de Beijer ([@mauricedb](https://github.com/mauricedb))
- Maël Nison ([@arcanis](https://github.com/arcanis))
- Michaël De Boey ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
- Miguel Palau ([@shelldandy](https://github.com/shelldandy))
- Mike Kusold ([@kusold](https://github.com/kusold))
- Mike Wilcox ([@mjw56](https://github.com/mjw56))
- Mikhail Osher ([@miraage](https://github.com/miraage))
- Minh Nguyen ([@NMinhNguyen](https://github.com/NMinhNguyen))
- Nick Bartlett ([@tteltrab](https://github.com/tteltrab))
- PatrickJS ([@gdi2290](https://github.com/gdi2290))
- Pete Nykänen ([@petetnt](https://github.com/petetnt))
- Piotr ([@piotr-cz](https://github.com/piotr-cz))
- Rami ([@evilchuck](https://github.com/evilchuck))
- Reuben Antz ([@antzshrek](https://github.com/antzshrek))
- Ro Savage ([@ro-savage](https://github.com/ro-savage))
- Rob Grochowicz ([@rgrochowicz](https://github.com/rgrochowicz))
- Robin van der Vleuten ([@robinvdvleuten](https://github.com/robinvdvleuten))
- Sagiv ben giat ([@sag1v](https://github.com/sag1v))
- Saimon Moore ([@saimonmoore](https://github.com/saimonmoore))
- Sendil Kumar N ([@sendilkumarn](https://github.com/sendilkumarn))
- Siddharth Doshi ([@sidoshi](https://github.com/sidoshi))
- Stas Rudakou ([@nott](https://github.com/nott))
- Stefan Feješ ([@fejes713](https://github.com/fejes713))
- Thiago Galvani ([@thiagopaiva99](https://github.com/thiagopaiva99))
- Tom Coleman ([@tmeasday](https://github.com/tmeasday))
- Tore Hammervoll ([@skoging](https://github.com/skoging))
- Trevor Brindle ([@tabrindle](https://github.com/tabrindle))
- Vicente Plata ([@xnt](https://github.com/xnt))
- Victor Amupitan ([@amupitan](https://github.com/amupitan))
- Viktor Havrylin ([@Fer0x](https://github.com/Fer0x))
- Vladimir Kutepov ([@frenzzy](https://github.com/frenzzy))
- William Chargin ([@wchargin](https://github.com/wchargin))
- XiaoYan Li ([@lixiaoyan](https://github.com/lixiaoyan))
- [@Plortinus](https://github.com/Plortinus)
- [@arianon](https://github.com/arianon)
- [@everdimension](https://github.com/everdimension)
- [@nikolas2](https://github.com/nikolas2)
- [@stereobooster](https://github.com/stereobooster)
- [@wtgtybhertgeghgtwtg](https://github.com/wtgtybhertgeghgtwtg)
- aisensiy ([@aisensiy](https://github.com/aisensiy))
- froyog ([@froyog](https://github.com/froyog))
- shawn wang ([@sw-yx](https://github.com/sw-yx))

## Releases Before 2.x

Please refer to [CHANGELOG-1.x.md](./CHANGELOG-1.x.md) for earlier versions.
