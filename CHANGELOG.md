## 0.4.0 (September 2, 2016)

### Build Dependency (`react-scripts`)

* **Breaking Change:** Disabled implicit serving of source files in development. ([@gaearon](https://github.com/gaearon) in [#551](https://github.com/facebookincubator/create-react-app/pull/551))
* You can use `NODE_PATH` environment variable for absolute `import` paths. ([@jimmyhmiller](https://github.com/jimmyhmiller) in [#476](https://github.com/facebookincubator/create-react-app/pull/476))
* If `src/setupTests.js` exists, it will be used to setup the test environment. ([@gaelduplessix](https://github.com/gaelduplessix) in [#548](https://github.com/facebookincubator/create-react-app/pull/548))
* If `HTTPS` environment variable is set to `true`, development server will run in HTTPS mode. ([@dceddia](https://github.com/dceddia) in [#552](https://github.com/facebookincubator/create-react-app/pull/552))

### Migrating from 0.3.1 to 0.4.0

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.4.0
```

### Breaking Change in 0.4.0

Paths like `/src/somefile.png` used to be served in development, but only by accident. They never worked in production builds. Since 0.4.0, we [don’t serve static files by default in development anymore either](https://github.com/facebookincubator/create-react-app/pull/551). This removes a dangerous inconsistency that we never intentionally supported.

If you need a static file to be part for the build, [import it from JavaScript and you will get its filename](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md#adding-images-and-fonts). This ensures it gets included into the production build as well, and its filename contains the content hash.

If you used static files with `<link href>`, [read this new guide](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md#referring-to-static-assets-from-link-href) on how to make sure these files get included into the builds. For example, you can replace `<link href="/src/favicons/favicon-32.png">` with `<link href="./src/favicons/favicon-32.png">`, and then Webpack will recognize it and include it into the build.

If you referenced some other files from `index.html`, please file an issue to discuss your use case. In the meantime, you can serve them from a separate static server until your use case is supported.

## 0.3.1 (September 2, 2016)

### Build Dependency (`react-scripts`)

* Bumps Jest dependency to fix a few issues discovered yesterday. ([@cpojer](https://github.com/cpojer) in [facebook/jest#1580](https://github.com/facebook/jest/pull/1580), [@insin](https://github.com/insin) in [facebook/jest#1574](https://github.com/facebook/jest/pull/1574))

### Migrating from 0.3.0 to 0.3.1

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.3.1
```

## 0.3.0 (September 1, 2016)

### Build Dependency (`react-scripts`)

* Testing is [now supported](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md#running-tests)! ([Jest project contributors](https://github.com/facebook/jest/pulls?q=is%3Apr+is%3Aclosed), [@cpojer](https://github.com/cpojer) in [#250](https://github.com/facebookincubator/create-react-app/pull/250), [@gaearon](https://github.com/gaearon) in [#378](https://github.com/facebookincubator/create-react-app/pull/378), [#530](https://github.com/facebookincubator/create-react-app/pull/530), [#533](https://github.com/facebookincubator/create-react-app/pull/533))
* Static files such as CSS, images, and fonts, can now exist outside `src` directory. ([@fson](https://github.com/fson) in [#504](https://github.com/facebookincubator/create-react-app/pull/504))
* Local paths in `<link href>` in `index.html` will now be correctly resolved, so deleting `favicon.ico` is not an error anymore. ([@andreypopp](https://github.com/andreypopp) in [#428](https://github.com/facebookincubator/create-react-app/pull/428))
* Removed an annoying lint rule that warned for `<div ref={node => this.node = node}>`. ([@mrscobbler](https://github.com/mrscobbler) in [#529](https://github.com/facebookincubator/create-react-app/pull/529))
* Temporarily disabled `react-constant-elements` Babel transform because of its bugs. ([@gaearon](https://github.com/gaearon) in [#534](https://github.com/facebookincubator/create-react-app/pull/534))
* Fixed a permission issue with Docker. ([@gaearon](https://github.com/gaearon) in [73c940](https://github.com/facebookincubator/create-react-app/commit/73c940a73205d761230f8d6bf81ecfd460ba28a9))
* Fixed an issue with generator syntax in Jest that occurred in an alpha release. ([@gaearon](https://github.com/gaearon) in [#535](https://github.com/facebookincubator/create-react-app/pull/535))

### Global CLI (`create-react-app`)

* You can now create a project in a folder that already contains an `.idea` folder, which is necessary for future WebStorm integration. ([@denofevil](https://github.com/denofevil) in [#522](https://github.com/facebookincubator/create-react-app/pull/522))

### Migrating from 0.2.3 to 0.3.0

You may optionally update the global command (it’s not required):

```
npm install -g create-react-app@0.3.0
```

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.3.0
```

Since 0.3.0 added a test runner, we recommend that you add it to the `scripts` section of your `package.json` like this:

```js
  // ...
  "scripts": {
    // ...
    "test": "react-scripts test --env=jsdom"
  }
```

[Then read the testing guide to learn more about using it!](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md#running-tests)

## 0.2.3 (August 25, 2016)

### Build Dependency (`react-scripts`)

* You can now [proxy requests to an API server](https://github.com/facebookincubator/create-react-app/blob/ef94b0561d5afb9b50b905fa5cd3f94e965c69c0/template/README.md#proxying-api-requests-in-development) without worrying about CORS. ([@gaearon](https://github.com/gaearon) in [#282](https://github.com/facebookincubator/create-react-app/pull/282))
* You can now [pass custom environment variables](https://github.com/facebookincubator/create-react-app/blob/ef94b0561d5afb9b50b905fa5cd3f94e965c69c0/template/README.md#adding-custom-environment-variables) to your application. ([@eliperelman](https://github.com/eliperelman) in [#342](https://github.com/facebookincubator/create-react-app/pull/342))
* You can now [use `async` and `await`](https://ponyfoo.com/articles/understanding-javascript-async-await) syntax. ([@gaearon](https://github.com/gaearon) in [#327](https://github.com/facebookincubator/create-react-app/pull/327), [@fson](https://github.com/fson) in [#332](https://github.com/facebookincubator/create-react-app/pull/332))
* Paths with period in them now load successfully on the development server. ([@mxstbr](https://github.com/mxstbr) in [#422](https://github.com/facebookincubator/create-react-app/pull/422))
* Images with `.webp` extension are now supported. ([@gafemoyano](https://github.com/gafemoyano) in [#458](https://github.com/facebookincubator/create-react-app/pull/458))
* The most recent version of React is now added to `package.json`. ([@wdhorton](https://github.com/wdhorton) in [#477](https://github.com/facebookincubator/create-react-app/pull/477))
* Babel configuration is simplified. ([@kripod](https://github.com/kripod) in [#490](https://github.com/facebookincubator/create-react-app/pull/490))

### Migrating from 0.2.2 to 0.2.3

Update `react-scripts` to point to `0.2.3` in your `package.json` and run `npm install`. You shouldn’t need to do anything else.

Newly created projects will use `0.2.3` automatically. You **don’t** need to update the global `create-react-app` CLI itself. It stays at `0.2.0` for now because it doesn’t have any changes.

## 0.2.2 (August 22, 2016)

### Build Dependency (`react-scripts`)

* When the bundle size changes, we now display the difference after build. ([@elijahmanor](https://github.com/elijahmanor) in [#340](https://github.com/facebookincubator/create-react-app/pull/340))
* `npm install`ing a missing dependency now forces a rebuild. ([@gaearon](https://github.com/gaearon) in [#349](https://github.com/facebookincubator/create-react-app/pull/349))
* Autoprefixer config now includes more commonly supported browsers. ([@kripod](https://github.com/kripod) in [#345](https://github.com/facebookincubator/create-react-app/pull/345))
* All the configuration is now documented inline so ejecting doesn’t leave you in the dark. ([@gaearon](https://github.com/gaearon) in [#362](https://github.com/facebookincubator/create-react-app/pull/362))
* `Object.assign()` polyfill is now bundled by default. ([@gaearon](https://github.com/gaearon) in [#399](https://github.com/facebookincubator/create-react-app/pull/399))
* [React Native Web](https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/) now works out of the box. ([@grigio](https://github.com/grigio) in [#407](https://github.com/facebookincubator/create-react-app/pull/407))
* Same asset filenames in different folders don’t confuse the server now. ([@arunoda](https://github.com/arunoda) in [#446](https://github.com/facebookincubator/create-react-app/pull/446))
* The `otf` font format is now supported. ([@A-gambit](https://github.com/A-gambit) in [#434](https://github.com/facebookincubator/create-react-app/pull/434))
* The `new-cap` linting rule has been disabled thanks to feedback from Immutable.js users. ([@rricard](https://github.com/rricard) in [#470](https://github.com/facebookincubator/create-react-app/pull/470))

### Migrating from 0.2.1 to 0.2.2

Update `react-scripts` to point to `0.2.2` in your `package.json` and run `npm install`. You shouldn’t need to do anything else.

Newly created projects will use `0.2.2` automatically. You **don’t** need to update the global `create-react-app` CLI itself. It stays at `0.2.0` for now because it doesn’t have any changes.

## 0.2.1 (August 1, 2016)

### Build Dependency (`react-scripts`)

* Fixes an issue with `npm start` taking a very long time on OS X with Firewall enabled ([@gaearon](https://github.com/gaearon) in [#319](https://github.com/facebookincubator/create-react-app/pull/319))
* Fixes an issue with Webpack eating a lot of CPU in some cases ([@dceddia](https://github.com/dceddia) in [#294](https://github.com/facebookincubator/create-react-app/pull/294))
* We now warn if you import a file with mismatched casing because this breaks the watcher ([@alexzherdev](https://github.com/alexzherdev) in [#266](https://github.com/facebookincubator/create-react-app/pull/266))
* CSS files specifying `?v=` after asset filenames, such as Font Awesome, now works correctly ([@alexzherdev](https://github.com/alexzherdev) in [#298](https://github.com/facebookincubator/create-react-app/pull/298))
* Issues with `npm link`ing `react-scripts` have been fixed ([@dallonf](https://github.com/dallonf) in [#277](https://github.com/facebookincubator/create-react-app/pull/277))
* We now use `/static` prefix for assets both in development and production ([@gaearon](https://github.com/gaearon) in [#278](https://github.com/facebookincubator/create-react-app/pull/278))

### Migrating from 0.2.0 to 0.2.1

Update `react-scripts` to point to `0.2.1` in your `package.json` and run `npm install`. You shouldn’t need to do anything else. If you see a warning about wrong file casing next time you `npm start`, fix your imports to use the correct filename casing.

Newly created projects will use `0.2.1` automatically. You **don’t** need to update the global `create-react-app` CLI itself. It stays at `0.2.0` for now because it doesn’t have any changes.

## 0.2.0 (July 28, 2016)

### Build Dependency (`react-scripts`)

* You can now enable deployment to GitHub Pages by adding `homepage` field to `package.json` ([@dhruska](https://github.com/dhruska) in [#94](https://github.com/facebookincubator/create-react-app/pull/94))
* Development server now runs on `0.0.0.0` and works with VirtualBox ([@JWo1F](https://github.com/JWo1F) in [#128](https://github.com/facebookincubator/create-react-app/pull/128))
* Cloud9 and Nitrous online IDEs are now supported ([@gaearon](http://github.com/gaearon) in [2fe84e](https://github.com/facebookincubator/create-react-app/commit/2fe84ecded55f1d5258d91f9c2c07698ae0d2fb4))
* When `3000` port is taken, we offer to use another port ([@chocnut](https://github.com/chocnut) in [#101](https://github.com/facebookincubator/create-react-app/pull/101), [2edf21](https://github.com/facebookincubator/create-react-app/commit/2edf2180f2aa6bf647807d0b1fcd95f4cfe4a558))
* You can now `import` CSS files from npm modules ([@glennreyes](https://github.com/glennreyes) in [#105](https://github.com/facebookincubator/create-react-app/pull/105), [@breaddevil](https://github.com/breaddevil) in [#178](https://github.com/facebookincubator/create-react-app/pull/178))
* `fetch` and `Promise` polyfills are now always included ([@gaearon](https://github.com/gaearon) in [#235](https://github.com/facebookincubator/create-react-app/pull/235))
* Regenerator runtime is now included if you use ES6 generators ([@gaearon](https://github.com/gaearon) in [#238](https://github.com/facebookincubator/create-react-app/pull/238))
* Generated project now contains `.gitignore` ([@npverni](https://github.com/npverni) in [#79](https://github.com/facebookincubator/create-react-app/pull/79), [@chibicode](https://github.com/chibicode) in [#112](https://github.com/facebookincubator/create-react-app/pull/112))
* ESLint config is now more compatible with Flow ([@gaearon](https://github.com/gaearon) in [#261](https://github.com/facebookincubator/create-react-app/pull/261))
* A stylistic lint rule about method naming has been removed ([@mxstbr](https://github.com/mxstbr) in [#152](https://github.com/facebookincubator/create-react-app/pull/157))
* A few unobtrusive accessibility lint rules have been added ([@evcohen](https://github.com/evcohen) in [#175](https://github.com/facebookincubator/create-react-app/pull/175))
* A `.babelrc` in parent directory no longer causes an error ([@alexzherdev](https://github.com/alexzherdev) in [#236](https://github.com/facebookincubator/create-react-app/pull/236))
* Files with `.json` extension are now discovered ([@gaearon](https://github.com/gaearon) in [a11d6a](https://github.com/facebookincubator/create-react-app/commit/a11d6a398f487f9163880dd34667b1d3e14b147a))
* Bug fixes from transitive dependencies are included ([#126](https://github.com/facebookincubator/create-react-app/issues/126))
* Linting now works with IDEs if you follow [these](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md#display-lint-output-in-the-editor) instructions ([@keyanzhang](https://github.com/keyanzhang) in [#149](https://github.com/facebookincubator/create-react-app/pull/149))
* After building, we now print gzipped bundle size ([@lvwrence](https://github.com/lvwrence) in [#229](https://github.com/facebookincubator/create-react-app/pull/229))

### Global CLI (`create-react-app`)

* It enforces that you have Node >= 4 ([@conorhastings](https://github.com/conorhastings) in [#88](https://github.com/facebookincubator/create-react-app/pull/88))
* It handles `--version` flag correctly ([@mxstbr](https://github.com/mxstbr) in [#152](https://github.com/facebookincubator/create-react-app/pull/152))

### Migrating from 0.1.0 to 0.2.0

You may optionally update the global command (it’s not required):

```
npm install -g create-react-app@0.2.0
```

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.2.0
```

You may need to fix a few lint warnings about missing `<img alt>` tag, but everything else should work out of the box. If you intend to deploy your site to GitHub Pages, you may now [add `homepage` field to `package.json`](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md#deploy-to-github-pages). If you had [issues with integrating editor linter plugins](https://github.com/facebookincubator/create-react-app/issues/124), follow [these new instructions](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md#display-lint-output-in-the-editor).

## 0.1.0 (July 22, 2016)

* Initial public release
