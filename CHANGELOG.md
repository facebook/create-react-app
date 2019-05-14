## 3.0.1 (2019-05-08)

v3.0.1 is a maintenance release that adjusts some ESLint rules for TypeScript along with other minor bug fixes and documentation updates.

#### :boom: Breaking Change

- `babel-preset-react-app`
  - [#6887](https://github.com/facebook/create-react-app/pull/6887) Update dependencies of Babel preset with recent changes ([@skoging](https://github.com/skoging))

#### :bug: Bug Fix

- `react-error-overlay`, `react-scripts`
  - [#7007](https://github.com/facebook/create-react-app/pull/7007) Unpin `babel-jest` ([@ianschmitz](https://github.com/ianschmitz))
  - [#7002](https://github.com/facebook/create-react-app/pull/7002) Temporary fix for `babel-jest` preflight error ([@ianschmitz](https://github.com/ianschmitz))
- `eslint-config-react-app`
  - [#6987](https://github.com/facebook/create-react-app/pull/6987) Disable `no-dupe-class-members` rule for TypeScript ([@ianschmitz](https://github.com/ianschmitz))
  - [#6862](https://github.com/facebook/create-react-app/pull/6862) Fix `no-useless-constructor` rule in TypeScript ([@ianschmitz](https://github.com/ianschmitz))
- `eslint-config-react-app`, `react-scripts`
  - [#6937](https://github.com/facebook/create-react-app/pull/6937) Disable `default-case` lint rule for TypeScript ([@ianschmitz](https://github.com/ianschmitz))
- `react-dev-utils`
  - [#6876](https://github.com/facebook/create-react-app/pull/6876) Change cssmodule classname hash to use relative paths ([@vg-stan](https://github.com/vg-stan))

#### :nail_care: Enhancement

- `react-dev-utils`, `react-scripts`
  - [#6856](https://github.com/facebook/create-react-app/pull/6856) Adds the configuration for PnP/Typescript ([@arcanis](https://github.com/arcanis))
- `babel-preset-react-app`
  - [#6887](https://github.com/facebook/create-react-app/pull/6887) Update dependencies of Babel preset with recent changes ([@skoging](https://github.com/skoging))
- `react-scripts`
  - [#6706](https://github.com/facebook/create-react-app/pull/6706) Generate SVG component name in Jest fileTransform ([@dallonf](https://github.com/dallonf))
  - [#6300](https://github.com/facebook/create-react-app/pull/6300) Remove body padding reset from templates ([@Hurtak](https://github.com/Hurtak))

#### :memo: Documentation

- Other
  - [#6979](https://github.com/facebook/create-react-app/pull/6979) Add note to restart the dev server after changing .env file ([@MostafaNawara](https://github.com/MostafaNawara))
  - [#6945](https://github.com/facebook/create-react-app/pull/6945) Add clarifying note to TypeScript docs warning about global install of CRA ([@methodbox](https://github.com/methodbox))
  - [#6898](https://github.com/facebook/create-react-app/pull/6898) Update GraphQL docs ([@nagman](https://github.com/nagman))
  - [#6810](https://github.com/facebook/create-react-app/pull/6810) Call to action button now reacts to being hovered ([@joerez](https://github.com/joerez))
  - [#6881](https://github.com/facebook/create-react-app/pull/6881) Fix typo in deployment docs ([@david-cho-lerat-HL2](https://github.com/david-cho-lerat-HL2))
- `react-app-polyfill`
  - [#6879](https://github.com/facebook/create-react-app/pull/6879) Update README.md ([@david-cho-lerat-HL2](https://github.com/david-cho-lerat-HL2))

#### :house: Internal

- `react-scripts`
  - [#6854](https://github.com/facebook/create-react-app/pull/6854) Remove `Object.assign` from `MiniCssExtractPlugin` options ([@swashcap](https://github.com/swashcap))

#### Committers: 12

- Chris Shaffer ([@methodbox](https://github.com/methodbox))
- Cory Reed ([@swashcap](https://github.com/swashcap))
- Dallon Feldner ([@dallonf](https://github.com/dallonf))
- David Cho-Lerat ([@david-cho-lerat-HL2](https://github.com/david-cho-lerat-HL2))
- Ian Schmitz ([@ianschmitz](https://github.com/ianschmitz))
- Joe Rezendes ([@joerez](https://github.com/joerez))
- Maël Nison ([@arcanis](https://github.com/arcanis))
- Mostafa Nawara ([@MostafaNawara](https://github.com/MostafaNawara))
- Petr Huřťák ([@Hurtak](https://github.com/Hurtak))
- Tore Hammervoll ([@skoging](https://github.com/skoging))
- [@nagman](https://github.com/nagman)
- [@vg-stan](https://github.com/vg-stan)

### Migrating from 3.0.0 to 3.0.1

Inside any created project that has not been ejected, run:

```sh
npm install --save --save-exact react-scripts@3.0.1
```

or

```sh
yarn add --exact react-scripts@3.0.1
```

## 3.0.0 (April 22, 2019)

Create React App 3.0 brings some exciting new features including support for [Hooks](https://reactjs.org/docs/hooks-intro.html)!

Thanks to all the maintainers and contributors who worked so hard on this release! :tada:

# Highlights

- Jest 24: #6278
- Hooks support: #5997
- TypeScript linting: #6513
- `browserslist` support in @babel/preset-env: #6608
- Absolute imports using `jsconfig.json`/`tsconfig.json`: #6656

# Migrating from 2.1.x to 3.0.0

Inside any created project that has not been ejected, run:

```bash
npm install --save --save-exact react-scripts@3.0.0
```

or

```
yarn add --exact react-scripts@3.0.0
```

If you previously ejected but now want to upgrade, one common solution is to find the commits where you ejected (and any subsequent commits changing the configuration), revert them, upgrade, and later optionally eject again. It’s also possible that the feature you ejected for is now supported out of the box.

## Breaking Changes

Like any major release, `react-scripts@3.0.0` contains a few breaking changes. We expect that they won't affect every user, but we recommend you look over this section to see if something is relevant to you. If we missed something, please file a new issue.

### Jest 24

We've updated from Jest 23 to get the latest improvements in Jest 24. We've noticed some differences in snapshot serialization in Jest 24, so you may need to adjust your tests slightly once you update. You can read more about what's changed in the [Jest 24 blog post](https://jestjs.io/blog/2019/01/25/jest-24-refreshing-polished-typescript-friendly).

### Hooks support

We now enforce [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html) with `eslint-plugin-react-hooks`. If you are breaking any of the rules of Hooks this will cause your build to fail.

### TypeScript linting

We now lint TypeScript files. You can see the list of [rules we enforce](https://github.com/facebook/create-react-app/blob/eee8491d57d67dd76f0806a7512eaba2ce9c36f0/packages/eslint-config-react-app/index.js#L89:L98) to check if your project is compatible. If you're using Visual Studio Code you can follow our guide to [setup up your editor to display lint warnings](https://facebook.github.io/create-react-app/docs/setting-up-your-editor#displaying-lint-output-in-the-editor).

### `browserslist` support in @babel/preset-env

The `browserslist` config in your `package.json` is now used to control the output of your JavaScript files. You can use separate configuration for `development` and `production`. See [here](https://github.com/facebook/create-react-app/blob/b0cbf2caa18ee8267855b14578ebc3dee826f552/packages/react-scripts/package.json#L83-L94) for a good starting point which gives a good development experience, especially when using language features such as async/await, but still provides high compatibility with many browsers in production

### Remove --no-watch flag

We've removed the `--no-watch` flag from the `start` script in favor of Jest's own `--watchAll=false`.

## New Features

### using `jsconfig.json`/`tsconfig.json`

We now support setting `baseUrl` in `jsconfig.json` and `tsconfig.json`. To configure `baseUrl` to point to the `src` directory in your JavaScript project, create a `jsconfig.json` file in your project root:

```json
{
  "compilerOptions": {
    "baseUrl": "src"
  },
  "include": ["src"]
}
```

If you have a TypeScript project you can configure `baseUrl` the same way in your `tsconfig.json`.

Currently the only supported options for `baseUrl` are `node_modules` (the default) and `src`.

### PostCSS Normalize

You can now include a version of Normalize.css in your project that will use your `browserslist` setting to generate the appropriate styles for your target browsers. To include it simply add `@import-normalize` at the top of one of your CSS files.

# Detailed Changelog

#### :rocket: New Feature

- `react-scripts`
  - [#6656](https://github.com/facebook/create-react-app/pull/6656) Set baseUrl from jsconfig.json/tsconfig.json ([@rovansteen](https://github.com/rovansteen))
  - [#5810](https://github.com/facebook/create-react-app/pull/5810) Adds PostCSS Normalize ([@mrchief](https://github.com/mrchief))
- `babel-plugin-named-asset-import`, `confusing-browser-globals`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#6278](https://github.com/facebook/create-react-app/pull/6278) Update to Jest 24 ([@loryman](https://github.com/loryman))
- `eslint-config-react-app`, `react-scripts`
  - [#6513](https://github.com/facebook/create-react-app/pull/6513) Add TypeScript linting support ([@ianschmitz](https://github.com/ianschmitz))
- `babel-preset-react-app`, `eslint-config-react-app`, `react-scripts`
  - [#5997](https://github.com/facebook/create-react-app/pull/5997) Support React Hooks (#5602) ([@eivind88](https://github.com/eivind88))
- `babel-preset-react-app`, `react-dev-utils`, `react-scripts`
  - [#6608](https://github.com/facebook/create-react-app/pull/6608) Support browserslist in @babel/preset-env ([@ianschmitz](https://github.com/ianschmitz))

#### :boom: Breaking Change

- `react-scripts`
  - [#6848](https://github.com/facebook/create-react-app/pull/6848) Remove no-watch flag in favor of watchAll=false ([@bugzpodder](https://github.com/bugzpodder))
  - [#6821](https://github.com/facebook/create-react-app/pull/6821) Add custom function to generate asset manifest ([@iansu](https://github.com/iansu))
  - [#6750](https://github.com/facebook/create-react-app/pull/6750) change NODE_ENV and PUBLIC_URL into readonly ([@xiaoxiangmoe](https://github.com/xiaoxiangmoe))
  - [#4176](https://github.com/facebook/create-react-app/pull/4176) Remove --coverage + --watch workaround for the test command ([@stipsan](https://github.com/stipsan))
  - [#6615](https://github.com/facebook/create-react-app/pull/6615) Allow .json type checking ([@ianschmitz](https://github.com/ianschmitz))
- `babel-preset-react-app`, `react-app-polyfill`
  - [#6769](https://github.com/facebook/create-react-app/pull/6769) Update to core-js@3 ([@ianschmitz](https://github.com/ianschmitz))
- `babel-plugin-named-asset-import`, `confusing-browser-globals`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#6278](https://github.com/facebook/create-react-app/pull/6278) Update to Jest 24 ([@loryman](https://github.com/loryman))
- `eslint-config-react-app`, `react-scripts`
  - [#6513](https://github.com/facebook/create-react-app/pull/6513) Add TypeScript linting support ([@ianschmitz](https://github.com/ianschmitz))
- `babel-preset-react-app`, `eslint-config-react-app`, `react-scripts`
  - [#5997](https://github.com/facebook/create-react-app/pull/5997) Support React Hooks (#5602) ([@eivind88](https://github.com/eivind88))
- `babel-preset-react-app`, `react-dev-utils`, `react-scripts`
  - [#6608](https://github.com/facebook/create-react-app/pull/6608) Support browserslist in @babel/preset-env ([@ianschmitz](https://github.com/ianschmitz))

#### :bug: Bug Fix

- `react-dev-utils`
  - [#6735](https://github.com/facebook/create-react-app/pull/6735) InlineChunkHtmlPlugin works with empty publicPath ([@ItalyPaleAle](https://github.com/ItalyPaleAle))
- `react-scripts`
  - [#6732](https://github.com/facebook/create-react-app/pull/6732) fix: terser-webpack-plugin hanging on WSL ([@endiliey](https://github.com/endiliey))
  - [#6610](https://github.com/facebook/create-react-app/pull/6610) Convert JSON.stringify \n to os.EOL ([@MikeBeaton](https://github.com/MikeBeaton))
- `create-react-app`
  - [#6759](https://github.com/facebook/create-react-app/pull/6759) Fix unlogged yarn pnp message ([@heyimalex](https://github.com/heyimalex))

#### :nail_care: Enhancement

- `react-scripts`
  - [#6845](https://github.com/facebook/create-react-app/pull/6845) Change CRA version in `react-scripts` eject warning. ([@lffg](https://github.com/lffg))
  - [#6821](https://github.com/facebook/create-react-app/pull/6821) Add custom function to generate asset manifest ([@iansu](https://github.com/iansu))
  - [#6580](https://github.com/facebook/create-react-app/pull/6580) Fix react-scripts peer-deps link local issue ([@transitive-bullshit](https://github.com/transitive-bullshit))
  - [#6746](https://github.com/facebook/create-react-app/pull/6746) Replace deprecated SFC with FunctionComponent in react-app.d.ts ([@iamandrewluca](https://github.com/iamandrewluca))
  - [#6160](https://github.com/facebook/create-react-app/pull/6160) Suggests that tsconfig.json is incorrect only when SyntaxError is caught ([@Andarist](https://github.com/Andarist))
  - [#6696](https://github.com/facebook/create-react-app/pull/6696) Enable futureEmitAssets in webpack config ([@iansu](https://github.com/iansu))
  - [#6669](https://github.com/facebook/create-react-app/pull/6669) Remove unnecessary shrink-to-fit=no meta data ([@abdelrahmanrifai](https://github.com/abdelrahmanrifai))
  - [#5686](https://github.com/facebook/create-react-app/pull/5686) Add empty mock for http2 ([@kjin](https://github.com/kjin))
  - [#5960](https://github.com/facebook/create-react-app/pull/5960) add command to add files to staging after eject ([@clickclickonsal](https://github.com/clickclickonsal))
  - [#6615](https://github.com/facebook/create-react-app/pull/6615) Allow .json type checking ([@ianschmitz](https://github.com/ianschmitz))
  - [#6451](https://github.com/facebook/create-react-app/pull/6451) change class component to function component ([@xiaoxiangmoe](https://github.com/xiaoxiangmoe))
- `babel-plugin-named-asset-import`, `babel-preset-react-app`, `confusing-browser-globals`, `create-react-app`, `eslint-config-react-app`, `react-app-polyfill`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#6826](https://github.com/facebook/create-react-app/pull/6826) Add directory details to packages/\* package.json ([@feelepxyz](https://github.com/feelepxyz))
- `babel-preset-react-app`, `react-app-polyfill`
  - [#6769](https://github.com/facebook/create-react-app/pull/6769) Update to core-js@3 ([@ianschmitz](https://github.com/ianschmitz))
- `create-react-app`
  - [#6770](https://github.com/facebook/create-react-app/pull/6770) Warn when using react-scripts-ts ([@ianschmitz](https://github.com/ianschmitz))
- `react-dev-utils`
  - [#5821](https://github.com/facebook/create-react-app/pull/5821) Add wait: false to options object for opn ([@evalexpr](https://github.com/evalexpr))
  - [#6502](https://github.com/facebook/create-react-app/pull/6502) Enable click to go to error in console part 2! ([@johnnyreilly](https://github.com/johnnyreilly))

#### :memo: Documentation

- Other
  - [#6847](https://github.com/facebook/create-react-app/pull/6847) Add baseUrl documentation ([@ianschmitz](https://github.com/ianschmitz))
  - [#6801](https://github.com/facebook/create-react-app/pull/6801) Copy fixes in adding Bootstrap docs ([@panckreous](https://github.com/panckreous))
  - [#6820](https://github.com/facebook/create-react-app/pull/6820) Fix docs about minimum React version for SVG component support ([@iansu](https://github.com/iansu))
  - [#6817](https://github.com/facebook/create-react-app/pull/6817) Add link to TypeScript page in Getting Started ([@ianschmitz](https://github.com/ianschmitz))
  - [#6786](https://github.com/facebook/create-react-app/pull/6786) Clarify production build output files documentation ([@bakuzan](https://github.com/bakuzan))
  - [#6783](https://github.com/facebook/create-react-app/pull/6783) Add SVG support dependency note ([@pnarielwala](https://github.com/pnarielwala))
  - [#6772](https://github.com/facebook/create-react-app/pull/6772) Update link to React Testing Library docs ([@fjoshuajr](https://github.com/fjoshuajr))
  - [#6695](https://github.com/facebook/create-react-app/pull/6695) Add Render deployment section ([@anurag](https://github.com/anurag))
  - [#6082](https://github.com/facebook/create-react-app/pull/6082) Add explanation for adding everything as dependencies to docs ([@mikeattara](https://github.com/mikeattara))
  - [#5481](https://github.com/facebook/create-react-app/pull/5481) Document .graphql and .gql file loading with graphql.macro ([@petetnt](https://github.com/petetnt))
  - [#6491](https://github.com/facebook/create-react-app/pull/6491) Update advanced-configuration.md ([@stephengodderidge](https://github.com/stephengodderidge))
  - [#6208](https://github.com/facebook/create-react-app/pull/6208) Add deployment instructions with AWS Amplify ([@swaminator](https://github.com/swaminator))
  - [#6374](https://github.com/facebook/create-react-app/pull/6374) Add note about npx caching and link to #6119 ([@TaylorBriggs](https://github.com/TaylorBriggs))
  - [#6386](https://github.com/facebook/create-react-app/pull/6386) Revert removal of newlines from html in docs ([@JBallin](https://github.com/JBallin))
- `react-scripts`
  - [#6848](https://github.com/facebook/create-react-app/pull/6848) Remove no-watch flag in favor of watchAll=false ([@bugzpodder](https://github.com/bugzpodder))
  - [#6775](https://github.com/facebook/create-react-app/pull/6775) Fix code comment typo ([@bestseob93](https://github.com/bestseob93))

#### :house: Internal

- Other
  - [#6829](https://github.com/facebook/create-react-app/pull/6829) Upgrade to Lerna v3 ([@iansu](https://github.com/iansu))
  - [#6762](https://github.com/facebook/create-react-app/pull/6762) Add temporary workaround for Babel dependency issues in kitchensink-eject test suite ([@iansu](https://github.com/iansu))
  - [#6757](https://github.com/facebook/create-react-app/pull/6757) Add temporary workaround for Babel dependency issues in installs test suite ([@iansu](https://github.com/iansu))
  - [#6700](https://github.com/facebook/create-react-app/pull/6700) Kill verdaccio in CI tasks cleanup ([@santoshyadav198613](https://github.com/santoshyadav198613))
  - [#6690](https://github.com/facebook/create-react-app/pull/6690) Remove duplicate url key in siteConfig ([@charpeni](https://github.com/charpeni))
- `react-scripts`
  - [#6313](https://github.com/facebook/create-react-app/pull/6313) Update testMatch to also be compatible with Jest 24 ([@ngbrown](https://github.com/ngbrown))
  - [#4176](https://github.com/facebook/create-react-app/pull/4176) Remove --coverage + --watch workaround for the test command ([@stipsan](https://github.com/stipsan))
  - [#6655](https://github.com/facebook/create-react-app/pull/6655) Change app component declaration from arrow function to regular function ([@iansu](https://github.com/iansu))
  - [#6625](https://github.com/facebook/create-react-app/pull/6625) change named import into default import ([@xiaoxiangmoe](https://github.com/xiaoxiangmoe))
  - [#6621](https://github.com/facebook/create-react-app/pull/6621) make compiler a const not a let ([@Primajin](https://github.com/Primajin))
- `babel-plugin-named-asset-import`, `confusing-browser-globals`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#6654](https://github.com/facebook/create-react-app/pull/6654) Cleanup Jest config ([@ianschmitz](https://github.com/ianschmitz))
- `react-dev-utils`
  - [#6674](https://github.com/facebook/create-react-app/pull/6674) Remove unused eslint comment ([@mohitsinghs](https://github.com/mohitsinghs))
- `eslint-config-react-app`
  - [#6662](https://github.com/facebook/create-react-app/pull/6662) Sync version of babel-eslint in eslint-config-react-app for react-scripts V3 ([@dalcib](https://github.com/dalcib))

#### :hammer: Underlying Tools

- `react-scripts`
  - [#6843](https://github.com/facebook/create-react-app/pull/6843) Update fsevents dependency version ([@FrancoisRmn](https://github.com/FrancoisRmn))
  - [#6725](https://github.com/facebook/create-react-app/pull/6725) Update to workbox-webpack-plugin v4 ([@r0ughnex](https://github.com/r0ughnex))
  - [#6361](https://github.com/facebook/create-react-app/pull/6361) Updating html-webpack-plugin dep ([@Aftabnack](https://github.com/Aftabnack))
  - [#6483](https://github.com/facebook/create-react-app/pull/6483) Update webpack-dev-server to 3.2.1 ([@ThePrez](https://github.com/ThePrez))
- `babel-plugin-named-asset-import`, `babel-preset-react-app`, `confusing-browser-globals`, `create-react-app`, `eslint-config-react-app`, `react-app-polyfill`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#6840](https://github.com/facebook/create-react-app/pull/6840) Relax ESLint version range ([@ianschmitz](https://github.com/ianschmitz))
- `babel-preset-react-app`
  - [#6780](https://github.com/facebook/create-react-app/pull/6780) Remove unused babel-loader from babel-preset-react-app ([@tlrobinson](https://github.com/tlrobinson))
- `babel-preset-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#6767](https://github.com/facebook/create-react-app/pull/6767) Update dependency versions ([@ianschmitz](https://github.com/ianschmitz))
- `react-dev-utils`
  - [#6739](https://github.com/facebook/create-react-app/pull/6739) Update fork-ts-checker-webpack-plugin out of alpha ([@pelotom](https://github.com/pelotom))
- `eslint-config-react-app`
  - [#6701](https://github.com/facebook/create-react-app/pull/6701) Remove project property from @typescript-eslint/parser options ([@jackwilsdon](https://github.com/jackwilsdon))
- `eslint-config-react-app`, `react-scripts`
  - [#6653](https://github.com/facebook/create-react-app/pull/6653) Unpin eslint-config-react-hooks dependency ([@iansu](https://github.com/iansu))
- `babel-preset-react-app`, `eslint-config-react-app`, `react-scripts`
  - [#5997](https://github.com/facebook/create-react-app/pull/5997) Support React Hooks (#5602) ([@eivind88](https://github.com/eivind88))
- `babel-preset-react-app`, `create-react-app`, `react-app-polyfill`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#6614](https://github.com/facebook/create-react-app/pull/6614) Upgrade dependencies ([@ianschmitz](https://github.com/ianschmitz))

#### Committers: 49

- Abdelrahman Rifai ([@abdelrahmanrifai](https://github.com/abdelrahmanrifai))
- Aftab Khan ([@Aftabnack](https://github.com/Aftabnack))
- Alessandro (Ale) Segala ([@ItalyPaleAle](https://github.com/ItalyPaleAle))
- Alex Guerra ([@heyimalex](https://github.com/heyimalex))
- Andrew Luca ([@iamandrewluca](https://github.com/iamandrewluca))
- Anurag Goel ([@anurag](https://github.com/anurag))
- Cody Olsen ([@stipsan](https://github.com/stipsan))
- Dalci de Jesus Bagolin ([@dalcib](https://github.com/dalcib))
- Dan ([@panckreous](https://github.com/panckreous))
- Eivind Arvesen ([@eivind88](https://github.com/eivind88))
- Endilie Yacop Sucipto ([@endiliey](https://github.com/endiliey))
- Francisco Joshua ([@fjoshuajr](https://github.com/fjoshuajr))
- Hrusikesh Panda ([@mrchief](https://github.com/mrchief))
- Ian Schmitz ([@ianschmitz](https://github.com/ianschmitz))
- Ian Sutherland ([@iansu](https://github.com/iansu))
- JBallin ([@JBallin](https://github.com/JBallin))
- Jack Wilsdon ([@jackwilsdon](https://github.com/jackwilsdon))
- Jack Zhao ([@bugzpodder](https://github.com/bugzpodder))
- Jannis Hell ([@Primajin](https://github.com/Primajin))
- John Reilly ([@johnnyreilly](https://github.com/johnnyreilly))
- Kelvin Jin ([@kjin](https://github.com/kjin))
- Lorenzo Rapetti ([@loryman](https://github.com/loryman))
- Luiz Felipe Gonçalves ([@lffg](https://github.com/lffg))
- Mateusz Burzyński ([@Andarist](https://github.com/Andarist))
- Mike Beaton ([@MikeBeaton](https://github.com/MikeBeaton))
- Mike Perry Y Attara ([@mikeattara](https://github.com/mikeattara))
- Mohit Singh ([@mohitsinghs](https://github.com/mohitsinghs))
- Nathan Brown ([@ngbrown](https://github.com/ngbrown))
- Nicolas Charpentier ([@charpeni](https://github.com/charpeni))
- Nikhil Swaminathan ([@swaminator](https://github.com/swaminator))
- Parth Narielwala ([@pnarielwala](https://github.com/pnarielwala))
- Pete Nykänen ([@petetnt](https://github.com/petetnt))
- Philip Harrison ([@feelepxyz](https://github.com/feelepxyz))
- Pradeep Sekar ([@r0ughnex](https://github.com/r0ughnex))
- Raphael.dev ([@bestseob93](https://github.com/bestseob93))
- Robert van Steen ([@rovansteen](https://github.com/rovansteen))
- Romain François ([@FrancoisRmn](https://github.com/FrancoisRmn))
- Salvador Hernandez ([@clickclickonsal](https://github.com/clickclickonsal))
- Santosh Yadav ([@santoshyadav198613](https://github.com/santoshyadav198613))
- Stephen Godderidge ([@stephengodderidge](https://github.com/stephengodderidge))
- Taylor Briggs ([@TaylorBriggs](https://github.com/TaylorBriggs))
- Tom Crockett ([@pelotom](https://github.com/pelotom))
- Tom Robinson ([@tlrobinson](https://github.com/tlrobinson))
- Travis Fischer ([@transitive-bullshit](https://github.com/transitive-bullshit))
- Wilkins ([@evalexpr](https://github.com/evalexpr))
- ZHAO Jinxiang ([@xiaoxiangmoe](https://github.com/xiaoxiangmoe))
- [@ThePrez](https://github.com/ThePrez)
- [@bakuzan](https://github.com/bakuzan)
- [@frederikhors](https://github.com/frederikhors)

## Releases Before 3.x

Please refer to [CHANGELOG-2.x.md](./CHANGELOG-2.x.md) for earlier versions.
