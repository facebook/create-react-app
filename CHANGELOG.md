## 1.0.1 (May 19, 2017)

#### :bug: Bug Fix

* `react-scripts`
  * [#2242](https://github.com/facebookincubator/create-react-app/pull/2242) Fix `NODE_PATH=src` for `npm start` and `npm run build`. ([@ApacheEx](https://github.com/ApacheEx))
  * [#2261](https://github.com/facebookincubator/create-react-app/pull/2261) Fix `NODE_PATH=src` for Jest. ([@gaearon](https://github.com/gaearon))
  * [#2255](https://github.com/facebookincubator/create-react-app/pull/2255) Fix Windows path issue for generated service worker. ([@gaearon](https://github.com/gaearon))
  * [#2262](https://github.com/facebookincubator/create-react-app/pull/2262) Additional fix to service worker config for `"homepage"` field. ([@gaearon](https://github.com/gaearon))
  * [#2250](https://github.com/facebookincubator/create-react-app/pull/2250) Ignore `.env.local` in `test` environment. ([@gaearon](https://github.com/gaearon))
  * [#2246](https://github.com/facebookincubator/create-react-app/pull/2246) Gracefully shut down the development server on signals. ([@gaearon](https://github.com/gaearon))

* `react-dev-utils`
  * [#2229](https://github.com/facebookincubator/create-react-app/pull/2229) Show customized build path for serve instruction. ([@chyipin](https://github.com/chyipin))

* `react-dev-utils`, `react-error-overlay`
  * [#2243](https://github.com/facebookincubator/create-react-app/pull/2243) Add missing package dependency. ([@Timer](https://github.com/Timer))

* `react-error-overlay`
  * [#2238](https://github.com/facebookincubator/create-react-app/pull/2238) Fix a crash when switching errors with arrow keys. ([@Gandem](https://github.com/Gandem))

#### :nail_care: Enhancement

* `eslint-config-react-app`
  * [#2256](https://github.com/facebookincubator/create-react-app/pull/2256) Turn off `operator-assignment` stylistic rule. ([@gaearon](https://github.com/gaearon))

* `react-scripts`
  * [#2224](https://github.com/facebookincubator/create-react-app/pull/2224) Add `<noscript>` to template's `index.html`. ([@viankakrisna](https://github.com/viankakrisna))

#### :memo: Documentation

* `react-scripts`

  * [#2259](https://github.com/facebookincubator/create-react-app/pull/2259) Fix broken links. ([@enguerran](https://github.com/enguerran))
  * [#2258](https://github.com/facebookincubator/create-react-app/pull/2258) Update readme with example of Sass include path. ([@kellyrmilligan](https://github.com/kellyrmilligan))
  * [#2252](https://github.com/facebookincubator/create-react-app/pull/2252) Hide React Storybook from the User Guide while it's incompatible. ([@gaearon](https://github.com/gaearon))
  * [#2247](https://github.com/facebookincubator/create-react-app/pull/2247) Correct docs on which `.env.*` files are supported. ([@AJamesPhillips](https://github.com/AJamesPhillips))

#### :house: Internal

* `react-scripts`

  * [#2264](https://github.com/facebookincubator/create-react-app/pull/2264) Fix a bug for empty `NODE_PATH`. ([@gaearon](https://github.com/gaearon))

#### Committers: 9

- Ade Viankakrisna Fadlil ([viankakrisna](https://github.com/viankakrisna))
- Alexander James Phillips ([AJamesPhillips](https://github.com/AJamesPhillips))
- Dan Abramov ([gaearon](https://github.com/gaearon))
- Enguerran ([enguerran](https://github.com/enguerran))
- Joe Haddad ([Timer](https://github.com/Timer))
- Kelly ([kellyrmilligan](https://github.com/kellyrmilligan))
- Nayef Ghattas ([Gandem](https://github.com/Gandem))
- Oleg Kuzava ([ApacheEx](https://github.com/ApacheEx))
- [chyipin](https://github.com/chyipin)

### Migrating from 1.0.0 to 1.0.1

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@1.0.1
```

or

```
yarn add --dev --exact react-scripts@1.0.1
```

## 1.0.0 (May 18, 2017)

We’ve been working on this release for the past few months, and there are many big impovements, from migrating to webpack 2 to a brand new runtime error overlay and built-in support for Progressive Web Apps.

So instead of just enumerating them here, we decided to write a blog post about all the new features.  
Check it out: **[What’s New in Create React App](https://facebook.github.io/react/blog/2017/05/18/whats-new-in-create-react-app.html)**.

Have you read it? Now let's see how to update your app to the latest version.

### Migrating from 0.9.5 to 1.0.0

First, ensure you are using the latest [Node 6 LTS or newer](https://nodejs.org/en/download/). In 1.0.0, we have dropped support for Node 4 and NPM 2.

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@1.0.0
```

You may also optionally update the global command-line utility for bug fixes:

```
npm install -g create-react-app
```

#### Ensure application and test files reside in `src/`

We've never supported importing files from outside `src/`, nor have we supported running tests outside of `src/`.<br>
We also never explicitly forbid doing so, which caused confusion when things didn't work like they should.

When running or building your application, you may see a message like so:
```
You attempted to import ... which falls outside of the project src/ directory.
```

To remedy this, simply move any files that you `import` within `src/` and update your relative imports accordingly. This enforces that files that `import` each other stay in `src/`, and other folders serve different purposes (e.g. the `public/` folder just gets served from the root).

If you used relative imports outside the project directory as a way to share code with another project, consider using a [monorepo](https://github.com/lerna/lerna) instead, so that other projects are symlinked to your project's `node_modules/`. Then you can import them as a Node modules.

While running `npm test`, you may notice some of your tests are missing. Please move any top-level test directory (i.e. `__test__`, `__spec__`) or files (i.e. `*.test.js`, `*.spec.js`) into `src/`. Conversely, if you have some similarly named files that you *don’t* want Jest to run, move them outside of `src/`.

#### Import required locales for Moment.js

Moment.js locales are now purposely excluded from the bundle unless explicitly depended on.

Please import the locales you need:
```js
import moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/es';
```

#### You can no longer import file content

You can no longer import a file and expect to receive its contents as an encoded string.<br>
This behavior was confusing and inconsistent depending on the file size.

Importing files with unknown extensions will now always include them into the build and return a valid URL.

If you'd like to import a file's contents as a string, consider [contributing to #1944](https://github.com/facebookincubator/create-react-app/issues/1944).
For the time being, you must embed assets within an export:

```js
// sample.txt
export default `i want
this data as a string
`;
```

You can then import this as so:
```js
import sampleText from './sample.txt';

// ...
```

#### Confusing window globals can no longer be used without `window` qualifier

Please prefix any global method with `window.`, you may experience this with methods such as `confirm`.

Simply update references from `confirm` to `window.confirm`.

Note that this new lint error will likely uncover legitimate accidental uses of global variables where you meant to define a local variable instead.

#### Why is my import erroring out?

You can no longer use AMD import syntax, nor define an import anywhere other than the top of the file.

This is to reduce confusion around import statements, which do not allow you to evaluate code between them.

#### I see many accessibility warnings

We have enabled a new set of rules to help make applications more accessible, please take time to learn about the errors and fix them.

You can search for every lint rule name in the right column and read its description on the web. The fixes are usually very simple.

#### I see many warnings about PropTypes and createClass

We have enabled the lint warnings about React APIs deprecated in React 15.5.
You can automatically convert your project to fix them by running the [corresponding codemods](https://github.com/reactjs/react-codemod).

#### How do I make my tests work with Jest 20?

Please refer to the [Jest 19](https://facebook.github.io/jest/blog/2017/02/21/jest-19-immersive-watch-mode-test-platform-improvements.html#breaking-changes) and [Jest 20](http://facebook.github.io/jest/blog/2017/05/06/jest-20-delightful-testing-multi-project-runner.html#breaking-changes) breaking changes for migration instructions.

If you use snapshots, you will likely need to update them once because of the change in format.

#### Flexbox 2009 spec is no longer polyfilled

The old, 2009 specification for Flexbox is [deprecated and is 2.3x slower than the latest specification](https://developers.google.com/web/tools/lighthouse/audits/old-flexbox).

We are no longer polyfilling it automatically.

#### I see "Definition for rule 'jsx-a11y/alt-text' was not found (jsx-a11y/alt-text)" in the editor

Follow these steps if you see errors about missing lint rules in the editor.

1. Ensure that in your editor ESLint settings you have "Use Global ESLint" turned off
2. Run `npm install` in your project (or `yarn`)
3. Quit your editor completely (ensure its process doesn't hang around)
4. Start the editor again

If you still have the problem please file an issue.

#### How to turn my app into a [Progressive Web App](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#making-a-progressive-web-app)?

After the regular update procedure above, add these line to `<head>` in `public/index.html`:

```html
    <meta name="theme-color" content="#000000">
    <!--
      manifest.json provides metadata used when your web app is added to the
      homescreen on Android. See https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/
    -->
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json">
```

Then create a file called `public/manifest.json` that looks like this:

```js
{
  "short_name": "React App",
  "name": "Create React App Sample",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "192x192",
      "type": "image/png"
    }
  ],
  "start_url": "./index.html",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

Finally, create `src/registerServiceWorker.js` with [this template](https://github.com/facebookincubator/create-react-app/blob/bf9eca25f519c73f69cff20ac49ce9500e578fe0/packages/react-scripts/template/src/registerServiceWorker.js), [import it](https://github.com/facebookincubator/create-react-app/blob/bf9eca25f519c73f69cff20ac49ce9500e578fe0/packages/react-scripts/template/src/index.js#L4) from `src/index.js` and [call the function it exports](https://github.com/facebookincubator/create-react-app/blob/bf9eca25f519c73f69cff20ac49ce9500e578fe0/packages/react-scripts/template/src/index.js#L8).

#### Anything missing?

This was a large release, and we might have missed something.

Please [file an issue](https://github.com/facebookincubator/create-react-app/issues/new) and we will try to help.

### Detailed Changelog

**For a readable summary of the changes, [check out our blog post](https://facebook.github.io/react/blog/2017/05/18/whats-new-in-create-react-app.html).**

#### :boom: Breaking Change
* `react-dev-utils`, `react-scripts`
  * [#2189](https://github.com/facebookincubator/create-react-app/pull/2189) Add `ModuleScopePlugin` to ensure files reside in `src/`. ([@Timer](https://github.com/Timer))
* `react-scripts`
  * [#2187](https://github.com/facebookincubator/create-react-app/pull/2187) Ignore Moment.js locales by default. ([@gaearon](https://github.com/gaearon))
  * [#1808](https://github.com/facebookincubator/create-react-app/pull/1808) Only run tests in `src/` (#544). ([@motevets](https://github.com/motevets))
  * [#1771](https://github.com/facebookincubator/create-react-app/pull/1771) Some flexbox bugs are autofixed, and support for 2009 spec is dropped. ([@cr101](https://github.com/cr101))
  * [#1614](https://github.com/facebookincubator/create-react-app/pull/1614) Upgrade to Jest ~~19~~ (now 20). ([@rogeliog](https://github.com/rogeliog))
  * [#1305](https://github.com/facebookincubator/create-react-app/pull/1305) Whitelist files that can be embedded through url-loader. ([@pugnascotia](https://github.com/pugnascotia))
* `eslint-config-react-app`, `react-dev-utils`
  * [#2186](https://github.com/facebookincubator/create-react-app/pull/2186) Tweak lint rules. ([@gaearon](https://github.com/gaearon))
* `eslint-config-react-app`, `react-error-overlay`, `react-scripts`
  * [#2163](https://github.com/facebookincubator/create-react-app/pull/2163) Upgrade `eslint-plugin-jsx-a11y` and activate more rules. ([@AlmeroSteyn](https://github.com/AlmeroSteyn))
* `eslint-config-react-app`, `react-scripts`
  * [#2130](https://github.com/facebookincubator/create-react-app/pull/2130) Confusing global variables are now blacklisted. ([@doshisid](https://github.com/doshisid))


#### :rocket: New Feature
* `react-scripts`
  * [#1728](https://github.com/facebookincubator/create-react-app/pull/1728) Scaffolded applications are now Progressive Web Apps by default. ([@jeffposnick](https://github.com/jeffposnick))
  * [#1344](https://github.com/facebookincubator/create-react-app/pull/1344) Support multiple env configuration files. ([@tuchk4](https://github.com/tuchk4))
  * [#2168](https://github.com/facebookincubator/create-react-app/pull/2168) Enable CSS sourcemaps in production. ([@gaearon](https://github.com/gaearon))
  * [#1830](https://github.com/facebookincubator/create-react-app/pull/1830) Make subset of Jest options overridable. ([@ryansully](https://github.com/ryansully))
* `react-dev-utils`, `react-scripts`
  * [#1101](https://github.com/facebookincubator/create-react-app/pull/1101) Add `react-error-overlay`, our new crash overlay. ([@Timer](https://github.com/Timer))
  * [#1590](https://github.com/facebookincubator/create-react-app/pull/1590) Support specifying a node script as BROWSER environment variable. ([@GAumala](https://github.com/GAumala))
  * [#1790](https://github.com/facebookincubator/create-react-app/pull/1790) Support multiple proxies in development. ([@jamesblight](https://github.com/jamesblight))
* `eslint-config-react-app`, `react-scripts`
  * [#2163](https://github.com/facebookincubator/create-react-app/pull/2163) Upgrade `eslint-plugin-jsx-a11y` and activate more rules. ([@AlmeroSteyn](https://github.com/AlmeroSteyn))


#### :bug: Bug Fix
* `react-scripts`
  * [#2219](https://github.com/facebookincubator/create-react-app/pull/2219) Improve interaction between compile and runtime overlays ([@gaearon](https://github.com/gaearon))
  * [#2200](https://github.com/facebookincubator/create-react-app/pull/2200) Disable Uglify reduce_vars. ([@gaearon](https://github.com/gaearon))
  * [#2166](https://github.com/facebookincubator/create-react-app/pull/2166) Support hoisting `react-scripts` and add `require.resolve()` to loaders. ([@gaearon](https://github.com/gaearon))
  * [#2115](https://github.com/facebookincubator/create-react-app/pull/2115) Do not respect `.eslintignore`. ([@Timer](https://github.com/Timer))
  * [#2063](https://github.com/facebookincubator/create-react-app/pull/2063) Ignore yarn cache directory when searching for tests. ([@jmorrell](https://github.com/jmorrell))
  * [#2050](https://github.com/facebookincubator/create-react-app/pull/2050) Name development chunk names. ([@herrstucki](https://github.com/herrstucki))
  * [#2013](https://github.com/facebookincubator/create-react-app/pull/2013) Minify CSS post-webpack 2. ([@viankakrisna](https://github.com/viankakrisna))
  * [#1839](https://github.com/facebookincubator/create-react-app/pull/1839) Resolve `localhost` when offline (Windows). ([@bunshar](https://github.com/bunshar))
  * [#1301](https://github.com/facebookincubator/create-react-app/pull/1301) Bind to host environment variable. ([@GAumala](https://github.com/GAumala))
  * [#1890](https://github.com/facebookincubator/create-react-app/pull/1890) Ensure proxy url starts with `http://` or `https://`. ([@bunshar](https://github.com/bunshar))
  * [#1861](https://github.com/facebookincubator/create-react-app/pull/1861) Upgrade `detect-port`. ([@Andreyco](https://github.com/Andreyco))
  * [#1821](https://github.com/facebookincubator/create-react-app/pull/1821) Fix default responsive behavior in iOS 9+. ([@GreenGremlin](https://github.com/GreenGremlin))
  * [#1819](https://github.com/facebookincubator/create-react-app/pull/1819) Makes end-to-end testing crash on unhandled rejections. ([@dbismut](https://github.com/dbismut))
  * [#1810](https://github.com/facebookincubator/create-react-app/pull/1810) Fixes a silent crash when ejecting. ([@gaearon](https://github.com/gaearon))
  * [#1727](https://github.com/facebookincubator/create-react-app/pull/1727) Fix ejecting from a scoped fork. ([@gaearon](https://github.com/gaearon))
* `react-dev-utils`
  * [#2076](https://github.com/facebookincubator/create-react-app/pull/2076) `openBrowser` now supports urls with more than one parameter. ([@alisonmonteiro](https://github.com/alisonmonteiro))
  * [#1690](https://github.com/facebookincubator/create-react-app/pull/1690) Fix `openBrowser()` when `BROWSER=open` on macOS. ([@bpierre](https://github.com/bpierre))
  * [#1696](https://github.com/facebookincubator/create-react-app/pull/1696) Fix an edge-case for people with the username `cwd`. ([@chrisdrackett](https://github.com/chrisdrackett))
* `create-react-app`
  * [#1863](https://github.com/facebookincubator/create-react-app/pull/1863) Check internet connectivity with lookup instead of resolve. ([@kdleijer](https://github.com/kdleijer))
  * [#1867](https://github.com/facebookincubator/create-react-app/pull/1867) Show package name in CLI. ([@mkazantsev](https://github.com/mkazantsev))
  * [#1706](https://github.com/facebookincubator/create-react-app/pull/1706) Properly extract package name for installing a tgz of scoped packages. ([@Timer](https://github.com/Timer))
  * [#1695](https://github.com/facebookincubator/create-react-app/pull/1695) Add diagnostic code. ([@tgig](https://github.com/tgig))
  * [#1675](https://github.com/facebookincubator/create-react-app/pull/1675) Fix project cleanup on Windows. ([@johann-sonntagbauer](https://github.com/johann-sonntagbauer))
  * [#1662](https://github.com/facebookincubator/create-react-app/pull/1662) Add project name validation. ([@johann-sonntagbauer](https://github.com/johann-sonntagbauer))
  * [#1669](https://github.com/facebookincubator/create-react-app/pull/1669) Fix react dependency versions during initial install. ([@johann-sonntagbauer](https://github.com/johann-sonntagbauer))

#### :nail_care: Enhancement
* `react-dev-utils`, `react-scripts`
  * [#2202](https://github.com/facebookincubator/create-react-app/pull/2202) Refactor and improve build output. ([@gaearon](https://github.com/gaearon))
  * [#2152](https://github.com/facebookincubator/create-react-app/pull/2152) Tweak error and warning output. ([@gaearon](https://github.com/gaearon))
  * [#1772](https://github.com/facebookincubator/create-react-app/pull/1772) Replace prompt function Inquirer.js. (#1767). ([@iansu](https://github.com/iansu))
  * [#1726](https://github.com/facebookincubator/create-react-app/pull/1726) Extract generic build functions to react-dev-utils. ([@viankakrisna](https://github.com/viankakrisna))
* `react-dev-utils`, `react-error-overlay`
  * [#2201](https://github.com/facebookincubator/create-react-app/pull/2201) Tweak error overlay styles. ([@bvaughn](https://github.com/bvaughn))
* `react-scripts`
  * [#2187](https://github.com/facebookincubator/create-react-app/pull/2187) Ignore Moment.js locales by default. ([@gaearon](https://github.com/gaearon))
  * [#1771](https://github.com/facebookincubator/create-react-app/pull/1771) Adding plugin postcss-flexbugs-fixes and flexbox: 'no-2009' to Autoprefixer. ([@cr101](https://github.com/cr101))
  * [#1614](https://github.com/facebookincubator/create-react-app/pull/1614) Upgrade to Jest ~~19~~ (now 20). ([@rogeliog](https://github.com/rogeliog))
  * [#1993](https://github.com/facebookincubator/create-react-app/pull/1993) Removed redundant UglifyJS options. ([@marcofugaro](https://github.com/marcofugaro))
  * [#1800](https://github.com/facebookincubator/create-react-app/pull/1800) Suggest `yarn build` instead of `yarn run build`. ([@geoffdavis92](https://github.com/geoffdavis92))
  * [#1760](https://github.com/facebookincubator/create-react-app/pull/1760) Suggest `serve` for running in production. ([@leo](https://github.com/leo))
  * [#1747](https://github.com/facebookincubator/create-react-app/pull/1747) Display `yarn` instead of `yarnpkg` when creating a new application. ([@lpalmes](https://github.com/lpalmes))
  * [#1433](https://github.com/facebookincubator/create-react-app/pull/1433) Modularise scripts. ([@djgrant](https://github.com/djgrant))
  * [#1677](https://github.com/facebookincubator/create-react-app/pull/1677) Add `X-FORWARDED` headers for proxy requests. ([@johann-sonntagbauer](https://github.com/johann-sonntagbauer))
* `eslint-config-react-app`, `react-dev-utils`
  * [#2186](https://github.com/facebookincubator/create-react-app/pull/2186) Tweak lint rules. ([@gaearon](https://github.com/gaearon))
* `react-error-overlay`, `react-scripts`
  * [#2171](https://github.com/facebookincubator/create-react-app/pull/2171) Use Jest 20. ([@gaearon](https://github.com/gaearon))
* `babel-preset-react-app`, `eslint-config-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  * [#2170](https://github.com/facebookincubator/create-react-app/pull/2170) Bump dependencies. ([@gaearon](https://github.com/gaearon))
* `eslint-config-react-app`
  * [#2064](https://github.com/facebookincubator/create-react-app/pull/2064) Removing a stylistic lint rule. ([@anilreddykatta](https://github.com/anilreddykatta))
  * [#1763](https://github.com/facebookincubator/create-react-app/pull/1763) disable ignoring unused vars prefixed with _. ([@doshisid](https://github.com/doshisid))
  * [#1989](https://github.com/facebookincubator/create-react-app/pull/1989) Relax label rules (Closes [#1835](https://github.com/facebookincubator/create-react-app/issues/1835)). ([@anilreddykatta](https://github.com/anilreddykatta))
  * [#1773](https://github.com/facebookincubator/create-react-app/pull/1773) Remove 'guard-for-in' lint rule. ([@spicyj](https://github.com/spicyj))
* `eslint-config-react-app`, `react-scripts`
  * [#2130](https://github.com/facebookincubator/create-react-app/pull/2130) Blacklist confusing global variables. ([@doshisid](https://github.com/doshisid))
  * [#1542](https://github.com/facebookincubator/create-react-app/pull/1542) Bump jsx-a11y version. ([@bondz](https://github.com/bondz))
  * [#1705](https://github.com/facebookincubator/create-react-app/pull/1705) Add support for `ignoreRestSiblings` in `no-unused-vars`. ([@chrisdrackett](https://github.com/chrisdrackett))
* `react-dev-utils`
  * [#2125](https://github.com/facebookincubator/create-react-app/pull/2125) Only show the first compilation error. ([@gaearon](https://github.com/gaearon))
  * [#2120](https://github.com/facebookincubator/create-react-app/pull/2120) Omit ESLint warnings when there are ESLint errors. ([@gaearon](https://github.com/gaearon))
  * [#2113](https://github.com/facebookincubator/create-react-app/pull/2113) Prettify errors and warnings for Webpack 2. ([@gaearon](https://github.com/gaearon))
  * [#1842](https://github.com/facebookincubator/create-react-app/pull/1842) Modularize and extract crash overlay to iframe. ([@Timer](https://github.com/Timer))
* `create-react-app`
  * [#1811](https://github.com/facebookincubator/create-react-app/pull/1811) Allow creation of apps in empty Mercurial repos. ([@GreenGremlin](https://github.com/GreenGremlin))
* Other
  * [#1402](https://github.com/facebookincubator/create-react-app/pull/1402) Create empty package.json in e2e test (#1401). ([@matoilic](https://github.com/matoilic))

#### :memo: Documentation
* `react-scripts`
  * [#2193](https://github.com/facebookincubator/create-react-app/pull/2193) Fix webpack config typo. ([@Justkant](https://github.com/Justkant))
  * [#2137](https://github.com/facebookincubator/create-react-app/pull/2137) Remove live-editing since isn't accurate. ([@cesarvarela](https://github.com/cesarvarela))
  * [#2114](https://github.com/facebookincubator/create-react-app/pull/2114) Update Sass README. ([@kellyrmilligan](https://github.com/kellyrmilligan))
  * [#2081](https://github.com/facebookincubator/create-react-app/pull/2081) Fixed link for storybook. ([@scottrangerio](https://github.com/scottrangerio))
  * [#2052](https://github.com/facebookincubator/create-react-app/pull/2052) Fix instructions for serving with now. ([@davidascher](https://github.com/davidascher))
  * [#2058](https://github.com/facebookincubator/create-react-app/pull/2058) Clarify `.eslintrc` effects. ([@luftywiranda13](https://github.com/luftywiranda13))
  * [#2054](https://github.com/facebookincubator/create-react-app/pull/2054) Suggest to create `.eslintrc` for IDE lint plugins. ([@gaearon](https://github.com/gaearon))
  * [#2033](https://github.com/facebookincubator/create-react-app/pull/2033) Fix Netlify heading level. ([@benpickles](https://github.com/benpickles))
  * [#1987](https://github.com/facebookincubator/create-react-app/pull/1987) Suggest `node-sass` alternative. ([@michaelwayman](https://github.com/michaelwayman))
  * [#1988](https://github.com/facebookincubator/create-react-app/pull/1988) Update doc server example to work from any directory. ([@isramos](https://github.com/isramos))
  * [#1982](https://github.com/facebookincubator/create-react-app/pull/1982) Update information in User Guide for Enzyme dependency. ([@josephrace](https://github.com/josephrace))
  * [#1911](https://github.com/facebookincubator/create-react-app/pull/1911) Suggest Yarn in HTML template. ([@tmos](https://github.com/tmos))
  * [#1869](https://github.com/facebookincubator/create-react-app/pull/1869) User Guide: Removed blockquote from code section, due to markdown conflict. ([@stochris](https://github.com/stochris))
  * [#1756](https://github.com/facebookincubator/create-react-app/pull/1756) Add Yarn steps for adding flow. ([@zertosh](https://github.com/zertosh))
  * [#1710](https://github.com/facebookincubator/create-react-app/pull/1710) Update now.sh deployment instructions. ([@replaid](https://github.com/replaid))
  * [#1717](https://github.com/facebookincubator/create-react-app/pull/1717) Add docs for apache's client side routing setting. ([@viankakrisna](https://github.com/viankakrisna))
  * [#1698](https://github.com/facebookincubator/create-react-app/pull/1698) Suggest to use `.env` for enabling polling mode. ([@gaearon](https://github.com/gaearon))
  * [#1687](https://github.com/facebookincubator/create-react-app/pull/1687) Fixed missing --recursive flag in first `npm run watch-css` command. ([@mklemme](https://github.com/mklemme))
  * [#1657](https://github.com/facebookincubator/create-react-app/pull/1657) Set Chrome userDataDir to be under .vscode folder. ([@ryansully](https://github.com/ryansully))
* Other
  * [#2135](https://github.com/facebookincubator/create-react-app/pull/2135) Add note about `yarn.lock`. ([@viankakrisna](https://github.com/viankakrisna))
  * [#2040](https://github.com/facebookincubator/create-react-app/pull/2040) Fix typo. ([@tijwelch](https://github.com/tijwelch))
  * [#1991](https://github.com/facebookincubator/create-react-app/pull/1991) Add folder structure docs for new contributors. ([@anilreddykatta](https://github.com/anilreddykatta))
  * [#1962](https://github.com/facebookincubator/create-react-app/pull/1962) Add sku to the list of alternatives. ([@markdalgleish](https://github.com/markdalgleish))
  * [#1799](https://github.com/facebookincubator/create-react-app/pull/1799) Improve phrasing. ([@moniuch](https://github.com/moniuch))
* `babel-preset-react-app`
  * [#1787](https://github.com/facebookincubator/create-react-app/pull/1787) Update side-effect documentation. ([@evenchange4](https://github.com/evenchange4))

#### :house: Internal
* `react-scripts`
  * [#2213](https://github.com/facebookincubator/create-react-app/pull/2213) Use some ES6 syntax. ([@shashkovdanil](https://github.com/shashkovdanil))
  * [#1913](https://github.com/facebookincubator/create-react-app/pull/1913) Add linked modules test. ([@Timer](https://github.com/Timer))
  * [#1736](https://github.com/facebookincubator/create-react-app/pull/1736) Fix eject for linked react-scripts. ([@tuchk4](https://github.com/tuchk4))
  * [#1741](https://github.com/facebookincubator/create-react-app/pull/1741) Fix internal linting setup. ([@gaearon](https://github.com/gaearon))
  * [#1730](https://github.com/facebookincubator/create-react-app/pull/1730) Fix Node 4 e2e tests. ([@Timer](https://github.com/Timer))
  * [#1715](https://github.com/facebookincubator/create-react-app/pull/1715) Remove unused `url` import in Webpack config. ([@pd4d10](https://github.com/pd4d10))
  * [#1700](https://github.com/facebookincubator/create-react-app/pull/1700) Update extract-text-webpack-plugin to stable. ([@SimenB](https://github.com/SimenB))
* `react-dev-utils`, `react-scripts`
  * [#2209](https://github.com/facebookincubator/create-react-app/pull/2209) Move more logic from react-scripts to react-dev-utils. ([@gaearon](https://github.com/gaearon))
  * [#2138](https://github.com/facebookincubator/create-react-app/pull/2138) Add custom eslint formatter. ([@doshisid](https://github.com/doshisid))
* `babel-preset-react-app`, `react-scripts`
  * [#2175](https://github.com/facebookincubator/create-react-app/pull/2175) Resolve regenerator runtime relative to react-scripts. ([@gaearon](https://github.com/gaearon))
  * [#1894](https://github.com/facebookincubator/create-react-app/pull/1894) Re-disable babel modules transform. ([@Timer](https://github.com/Timer))
  * [#1742](https://github.com/facebookincubator/create-react-app/pull/1742) Switch to preset-env. ([@Timer](https://github.com/Timer))
* `create-react-app`, `react-dev-utils`, `react-scripts`
  * [#1897](https://github.com/facebookincubator/create-react-app/pull/1897) Bump minimal Node version to 6. ([@ianschmitz](https://github.com/ianschmitz))
* Other
  * [#1868](https://github.com/facebookincubator/create-react-app/pull/1868) Fix AppVeyor CI. ([@darrenscerri](https://github.com/darrenscerri))
  * [#1825](https://github.com/facebookincubator/create-react-app/pull/1825) Added test to check for accidental extraneous dependencies. ([@lpalmes](https://github.com/lpalmes))
  * [#1876](https://github.com/facebookincubator/create-react-app/pull/1876) Fix AppVeyor CI. ([@darrenscerri](https://github.com/darrenscerri))
  * [#1723](https://github.com/facebookincubator/create-react-app/pull/1723) Skip AppVeyor CI builds for Markdown changes. ([@gaearon](https://github.com/gaearon))
  * [#1707](https://github.com/facebookincubator/create-react-app/pull/1707) Add double quotes to escape spaces in paths in e2e. ([@viankakrisna](https://github.com/viankakrisna))
  * [#1688](https://github.com/facebookincubator/create-react-app/pull/1688) Pin and upgrade lerna version. ([@viankakrisna](https://github.com/viankakrisna))
  * [#1648](https://github.com/facebookincubator/create-react-app/pull/1648) Add `appveyor.yml`. ([@Timer](https://github.com/Timer))
* `babel-preset-react-app`, `create-react-app`, `eslint-config-react-app`, `react-dev-utils`, `react-scripts`
  * [#1738](https://github.com/facebookincubator/create-react-app/pull/1738) Update to modern code style (ES6). ([@tuchk4](https://github.com/tuchk4))
* `eslint-config-react-app`
  * [#1740](https://github.com/facebookincubator/create-react-app/pull/1740) Relax ESLint config peerDependency. ([@gaearon](https://github.com/gaearon))
* `eslint-config-react-app`, `react-dev-utils`, `react-scripts`
  * [#1729](https://github.com/facebookincubator/create-react-app/pull/1729) Lint internal scripts with eslint:recommended. ([@gaearon](https://github.com/gaearon))
* `react-dev-utils`
  * [#1724](https://github.com/facebookincubator/create-react-app/pull/1724) Don't use ES6 in a file that should run on Node 4. ([@gaearon](https://github.com/gaearon))

#### Committers: 66
- Ade Viankakrisna Fadlil ([viankakrisna](https://github.com/viankakrisna))
- Alison Monteiro ([alisonmonteiro](https://github.com/alisonmonteiro))
- Almero Steyn ([AlmeroSteyn](https://github.com/AlmeroSteyn))
- Andrej Badin ([Andreyco](https://github.com/Andreyco))
- Andres Suarez ([zertosh](https://github.com/zertosh))
- Asa Ayers ([AsaAyers](https://github.com/AsaAyers))
- Ben Alpert ([spicyj](https://github.com/spicyj))
- Ben Pickles ([benpickles](https://github.com/benpickles))
- Bond ([bondz](https://github.com/bondz))
- Brian Vaughn ([bvaughn](https://github.com/bvaughn))
- Buns Shar  ([bunshar](https://github.com/bunshar))
- Cesar Varela ([cesarvarela](https://github.com/cesarvarela))
- Chris Drackett ([chrisdrackett](https://github.com/chrisdrackett))
- Cristian Rosescu ([cr101](https://github.com/cr101))
- Dan Abramov ([gaearon](https://github.com/gaearon))
- Daniel Grant ([djgrant](https://github.com/djgrant))
- Danil Shashkov ([shashkovdanil](https://github.com/shashkovdanil))
- Darren Scerri ([darrenscerri](https://github.com/darrenscerri))
- David ([dbismut](https://github.com/dbismut))
- David Ascher ([davidascher](https://github.com/davidascher))
- Gabriel Aumala ([GAumala](https://github.com/GAumala))
- Geoff Davis ([geoffdavis92](https://github.com/geoffdavis92))
- Ian Schmitz ([ianschmitz](https://github.com/ianschmitz))
- Ian Sutherland ([iansu](https://github.com/iansu))
- Igor Ramos ([isramos](https://github.com/isramos))
- James Blight ([jamesblight](https://github.com/jamesblight))
- Jeffrey Posnick ([jeffposnick](https://github.com/jeffposnick))
- Jeremy Morrell ([jmorrell](https://github.com/jmorrell))
- Jeremy Stucki ([herrstucki](https://github.com/herrstucki))
- Joe Haddad ([Timer](https://github.com/Timer))
- Johann Hubert Sonntagbauer ([johann-sonntagbauer](https://github.com/johann-sonntagbauer))
- Jonathan ([GreenGremlin](https://github.com/GreenGremlin))
- Joseph Race ([josephrace](https://github.com/josephrace))
- Kant ([Justkant](https://github.com/Justkant))
- Kelly ([kellyrmilligan](https://github.com/kellyrmilligan))
- Kent C. Dodds ([kentcdodds](https://github.com/kentcdodds))
- Koen de Leijer ([kdleijer](https://github.com/kdleijer))
- Leo Lamprecht ([leo](https://github.com/leo))
- Lorenzo Palmes ([lpalmes](https://github.com/lpalmes))
- Lufty Wiranda ([luftywiranda13](https://github.com/luftywiranda13))
- Marco Fugaro ([marcofugaro](https://github.com/marcofugaro))
- Mark Dalgleish ([markdalgleish](https://github.com/markdalgleish))
- Mato Ilic ([matoilic](https://github.com/matoilic))
- Maxim Kazantsev ([mkazantsev](https://github.com/mkazantsev))
- Michael Hsu ([evenchange4](https://github.com/evenchange4))
- Michael Wayman ([michaelwayman](https://github.com/michaelwayman))
- Myk Klemme ([mklemme](https://github.com/mklemme))
- Pierre Bertet ([bpierre](https://github.com/bpierre))
- Rogelio Guzman ([rogeliog](https://github.com/rogeliog))
- Rory Hunter ([pugnascotia](https://github.com/pugnascotia))
- Ryan Platte ([replaid](https://github.com/replaid))
- Ryan Sullivan ([ryansully](https://github.com/ryansully))
- Scott Ranger ([scottrangerio](https://github.com/scottrangerio))
- Siddharth Doshi ([doshisid](https://github.com/doshisid))
- Simen Bekkhus ([SimenB](https://github.com/SimenB))
- Simon Vocella ([voxsim](https://github.com/voxsim))
- Stoicescu Cristi ([stochris](https://github.com/stochris))
- Tim Welch ([tijwelch](https://github.com/tijwelch))
- Tom Canac ([tmos](https://github.com/tmos))
- Tom Dunlap ([motevets](https://github.com/motevets))
- Travis Giggy ([tgig](https://github.com/tgig))
- Valerii Sorokobatko ([tuchk4](https://github.com/tuchk4))
- alberto ([alberto](https://github.com/alberto))
- anraka ([anilreddykatta](https://github.com/anilreddykatta))
- moniuch ([moniuch](https://github.com/moniuch))
- pd4d10 ([pd4d10](https://github.com/pd4d10))

## Releases Before 0.x

Please refer to [CHANGELOG-0.x.md](./CHANGELOG-0.x.md) for earlier versions.
