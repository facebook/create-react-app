## 0.2.2 (August 22, 2016)

### Build Dependency (`react-scripts`)

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
