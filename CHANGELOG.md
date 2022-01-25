## 5.0.0 (2021-12-14)

Create React App 5.0 is a major release with several new features and the latest version of all major dependencies.

Thanks to all the maintainers and contributors who worked so hard on this release! 🙌

# Highlights

- webpack 5 ([#11201](https://github.com/facebook/create-react-app/pull/11201))
- Jest 27 ([#11338](<(https://github.com/facebook/create-react-app/pull/11338)>))
- ESLint 8 ([#11375](<(https://github.com/facebook/create-react-app/pull/11375)>))
- PostCSS 8 ([#11121](<(https://github.com/facebook/create-react-app/pull/11121)>))
- Fast Refresh improvements and bug fixes ([#11105](https://github.com/facebook/create-react-app/pull/11105))
- Support for Tailwind ([#11717](https://github.com/facebook/create-react-app/pull/11717))
- Improved package manager detection ([#11322](https://github.com/facebook/create-react-app/pull/11322))
- Unpinned all dependencies for better compatibility with other tools ([#11474](https://github.com/facebook/create-react-app/pull/11474))
- Dropped support for Node 10 and 12

# Migrating from 4.0.x to 5.0.0

Inside any created project that has not been ejected, run:

```
npm install --save --save-exact react-scripts@5.0.0
```

or

```
yarn add --exact react-scripts@5.0.0
```

**NOTE: You may need to delete your node_modules folder and reinstall your dependencies by running npm install (or yarn) if you encounter errors after upgrading.**

If you previously ejected but now want to upgrade, one common solution is to find the commits where you ejected (and any subsequent commits changing the configuration), revert them, upgrade, and later optionally eject again. It’s also possible that the feature you ejected for is now supported out of the box.

# Breaking Changes

Like any major release, `react-scripts@5.0.0` contains a number of breaking changes. We expect that they won't affect every user, but we recommend you look over this section to see if something is relevant to you. If we missed something, please file a new issue.

Dropped support for Node 10 and 12
Node 10 reached End-of-Life in April 2021 and Node 12 will be End-of-Life in April 2022. Going forward we will only support the latest LTS release of Node.js.

# Full Changelog

#### :boom: Breaking Change

- `create-react-app`
  - [#11322](https://github.com/facebook/create-react-app/pull/11322) Use env var to detect yarn or npm as the package manager ([@lukekarrys](https://github.com/lukekarrys))
- `babel-preset-react-app`, `cra-template-typescript`, `cra-template`, `create-react-app`, `eslint-config-react-app`, `react-app-polyfill`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#11201](https://github.com/facebook/create-react-app/pull/11201) Webpack 5 ([@raix](https://github.com/raix))
- `eslint-config-react-app`, `react-error-overlay`, `react-scripts`
  - [#10761](https://github.com/facebook/create-react-app/pull/10761) chore: migrate to @babel/eslint-parser ([@JLHwung](https://github.com/JLHwung))
- `react-scripts`
  - [#11188](https://github.com/facebook/create-react-app/pull/11188) Deprecate root level template.json keys ([@mrmckeb](https://github.com/mrmckeb))

#### :bug: Bug Fix

- `react-scripts`
  - [#11413](https://github.com/facebook/create-react-app/pull/11413) fix(webpackDevServer): disable overlay for warnings ([@jawadsh123](https://github.com/jawadsh123))
  - [#10511](https://github.com/facebook/create-react-app/pull/10511) Fix ICSS syntax in stylesheets ([@thabemmz](https://github.com/thabemmz))

#### :nail_care: Enhancement

- `react-scripts`
  - [#11717](https://github.com/facebook/create-react-app/pull/11717) Add support for Tailwind ([@iansu](https://github.com/iansu))
  - [#8227](https://github.com/facebook/create-react-app/pull/8227) Add source-map-loader for debugging into original source of node_modules libraries that contain sourcemaps ([@justingrant](https://github.com/justingrant))
  - [#10499](https://github.com/facebook/create-react-app/pull/10499) Remove ESLint verification when opting-out ([@mrmckeb](https://github.com/mrmckeb))
- `eslint-config-react-app`, `react-error-overlay`, `react-scripts`
  - [#11375](https://github.com/facebook/create-react-app/pull/11375) feat(eslint-config-react-app): support ESLint 8.x ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
- `create-react-app`
  - [#11322](https://github.com/facebook/create-react-app/pull/11322) Use env var to detect yarn or npm as the package manager ([@lukekarrys](https://github.com/lukekarrys))
  - [#11057](https://github.com/facebook/create-react-app/pull/11057) Coerce Node versions with metadata ([@mrmckeb](https://github.com/mrmckeb))
- `react-dev-utils`
  - [#11105](https://github.com/facebook/create-react-app/pull/11105) fix: fast refresh stops on needed bail outs ([@pmmmwh](https://github.com/pmmmwh))
  - [#10205](https://github.com/facebook/create-react-app/pull/10205) Update ModuleNotFoundPlugin to support Webpack 5 ([@raix](https://github.com/raix))
- `create-react-app`, `react-scripts`
  - [#11176](https://github.com/facebook/create-react-app/pull/11176) Run npm with --no-audit ([@gaearon](https://github.com/gaearon))

#### :memo: Documentation

- Other
  - [#11619](https://github.com/facebook/create-react-app/pull/11619) The default port used by `serve` has changed ([@leo](https://github.com/leo))
  - [#10907](https://github.com/facebook/create-react-app/pull/10907) Fix link address ([@e-w-h](https://github.com/e-w-h))
  - [#10805](https://github.com/facebook/create-react-app/pull/10805) Update PWA docs to point at the cra-template-pwa package ([@slieschke](https://github.com/slieschke))
  - [#10631](https://github.com/facebook/create-react-app/pull/10631) Update IMAGE_INLINE_SIZE_LIMIT docs ([@ianschmitz](https://github.com/ianschmitz))
- `eslint-config-react-app`
  - [#10317](https://github.com/facebook/create-react-app/pull/10317) eslint-config-react-app typo fix ([@Spacerat](https://github.com/Spacerat))
- `react-dev-utils`
  - [#10779](https://github.com/facebook/create-react-app/pull/10779) Suggest sass instead of node-sass package ([@andrewywong](https://github.com/andrewywong))
- `babel-preset-react-app`, `eslint-config-react-app`
  - [#10288](https://github.com/facebook/create-react-app/pull/10288) Upgrade docs http links to https ([@xom9ikk](https://github.com/xom9ikk))
- `cra-template`
  - [#10763](https://github.com/facebook/create-react-app/pull/10763) Trivial English fixes ([@ujihisa](https://github.com/ujihisa))

#### :house: Internal

- Other
  - [#11723](https://github.com/facebook/create-react-app/pull/11723) chore(test): make all tests install with `npm ci` ([@lukekarrys](https://github.com/lukekarrys))
  - [#11686](https://github.com/facebook/create-react-app/pull/11686) [WIP] Fix integration test teardown / cleanup and missing yarn installation ([@raix](https://github.com/raix))
  - [#11252](https://github.com/facebook/create-react-app/pull/11252) Remove package-lock.json ([@Methuselah96](https://github.com/Methuselah96))
- `create-react-app`
  - [#11706](https://github.com/facebook/create-react-app/pull/11706) Remove cached lockfile ([@lukekarrys](https://github.com/lukekarrys))
- `babel-plugin-named-asset-import`, `babel-preset-react-app`, `confusing-browser-globals`, `create-react-app`, `react-app-polyfill`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#11624](https://github.com/facebook/create-react-app/pull/11624) Update all dependencies ([@jd1048576](https://github.com/jd1048576))
- `react-scripts`
  - [#11597](https://github.com/facebook/create-react-app/pull/11597) Update package.json ([@HADMARINE](https://github.com/HADMARINE))
  - [#11292](https://github.com/facebook/create-react-app/pull/11292) fix: dependency issue after workbox-webpack-plugin 6.2 release ([@fguitton](https://github.com/fguitton))
  - [#11188](https://github.com/facebook/create-react-app/pull/11188) Deprecate root level template.json keys ([@mrmckeb](https://github.com/mrmckeb))
  - [#10784](https://github.com/facebook/create-react-app/pull/10784) Remove outdated comments on react-refresh ([@luk3kang](https://github.com/luk3kang))
- `babel-plugin-named-asset-import`, `confusing-browser-globals`, `create-react-app`, `eslint-config-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#11474](https://github.com/facebook/create-react-app/pull/11474) Remove dependency pinning ([@mrmckeb](https://github.com/mrmckeb))
- `confusing-browser-globals`, `cra-template-typescript`, `cra-template`, `create-react-app`
  - [#11415](https://github.com/facebook/create-react-app/pull/11415) Bump template dependency version ([@shfshanyue](https://github.com/shfshanyue))
- `react-error-overlay`, `react-scripts`
  - [#11304](https://github.com/facebook/create-react-app/pull/11304) Use npm v7 with workspaces for local development and testing ([@lukekarrys](https://github.com/lukekarrys))
- `babel-preset-react-app`, `cra-template-typescript`, `cra-template`, `create-react-app`, `eslint-config-react-app`, `react-app-polyfill`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#11201](https://github.com/facebook/create-react-app/pull/11201) Webpack 5 ([@raix](https://github.com/raix))

#### :hammer: Underlying Tools

- `react-dev-utils`, `react-scripts`
  - [#11476](https://github.com/facebook/create-react-app/pull/11476) Bump browserslist from 4.14.2 to 4.16.5 ([@dependabot[bot]](https://github.com/apps/dependabot))
- `react-scripts`
  - [#11325](https://github.com/facebook/create-react-app/pull/11325) allow CORS on webpack-dev-server ([@hasanayan](https://github.com/hasanayan))
  - [#11121](https://github.com/facebook/create-react-app/pull/11121) Update PostCSS version ([@mrmckeb](https://github.com/mrmckeb))
  - [#10204](https://github.com/facebook/create-react-app/pull/10204) Update WebpackManifestPlugin ([@raix](https://github.com/raix))
  - [#10456](https://github.com/facebook/create-react-app/pull/10456) Update PostCSS packages ([@raix](https://github.com/raix))
- `babel-plugin-named-asset-import`, `confusing-browser-globals`, `create-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#11338](https://github.com/facebook/create-react-app/pull/11338) Upgrade jest and related packages from 26.6.0 to 27.1.0 ([@krreet](https://github.com/krreet))
- `eslint-config-react-app`, `react-error-overlay`, `react-scripts`
  - [#10761](https://github.com/facebook/create-react-app/pull/10761) chore: migrate to @babel/eslint-parser ([@JLHwung](https://github.com/JLHwung))
- `babel-preset-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#10797](https://github.com/facebook/create-react-app/pull/10797) Unpin babel dependencies ([@mohd-akram](https://github.com/mohd-akram))
- `react-dev-utils`
  - [#10791](https://github.com/facebook/create-react-app/pull/10791) Bump immer version for fixing security issue ([@shamprasadrh](https://github.com/shamprasadrh))

#### Committers: 34

- Andrew Wong ([@andrewywong](https://github.com/andrewywong))
- Brody McKee ([@mrmckeb](https://github.com/mrmckeb))
- Christiaan van Bemmel ([@thabemmz](https://github.com/thabemmz))
- Dan Abramov ([@gaearon](https://github.com/gaearon))
- Florian Guitton ([@fguitton](https://github.com/fguitton))
- Hasan Ayan ([@hasanayan](https://github.com/hasanayan))
- Huáng Jùnliàng ([@JLHwung](https://github.com/JLHwung))
- Ian Schmitz ([@ianschmitz](https://github.com/ianschmitz))
- Ian Sutherland ([@iansu](https://github.com/iansu))
- James George ([@jamesgeorge007](https://github.com/jamesgeorge007))
- Jason Williams ([@jasonwilliams](https://github.com/jasonwilliams))
- Jawad ([@jawadsh123](https://github.com/jawadsh123))
- Joseph Atkins-Turkish ([@Spacerat](https://github.com/Spacerat))
- Justin Grant ([@justingrant](https://github.com/justingrant))
- Konrad Stępniak ([@th7nder](https://github.com/th7nder))
- Kristoffer K. ([@merceyz](https://github.com/merceyz))
- Leo Lamprecht ([@leo](https://github.com/leo))
- Luke Karrys ([@lukekarrys](https://github.com/lukekarrys))
- Max Romanyuta ([@xom9ikk](https://github.com/xom9ikk))
- Michael Mok ([@pmmmwh](https://github.com/pmmmwh))
- Michaël De Boey ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
- Mohamed Akram ([@mohd-akram](https://github.com/mohd-akram))
- Morten N.O. Nørgaard Henriksen ([@raix](https://github.com/raix))
- Nathan Bierema ([@Methuselah96](https://github.com/Methuselah96))
- Reetesh Kumar ([@krreet](https://github.com/krreet))
- Shamprasad RH ([@shamprasadrh](https://github.com/shamprasadrh))
- Simon Lieschke ([@slieschke](https://github.com/slieschke))
- [@e-w-h](https://github.com/e-w-h)
- [@jd1048576](https://github.com/jd1048576)
- [@luk3kang](https://github.com/luk3kang)
- [@ujihisa](https://github.com/ujihisa)
- hadmarine ([@HADMARINE](https://github.com/HADMARINE))
- huntr.dev | the place to protect open source ([@huntr-helper](https://github.com/huntr-helper))
- shanyue ([@shfshanyue](https://github.com/shfshanyue))

## Releases Before 5.x

Please refer to [CHANGELOG-4.x.md](./CHANGELOG-4.x.md) for earlier versions.
