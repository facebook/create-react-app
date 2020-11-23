## 4.0.1 (2020-11-23)

v4.0.1 is a maintenance release that includes minor bug fixes and documentation updates.

#### :bug: Bug Fix
* `react-scripts`
  * [#9921](https://github.com/facebook/create-react-app/pull/9921) Fix noFallthroughCasesInSwitch/jsx object is not extensible ([@ryota-murakami](https://github.com/ryota-murakami))
  * [#9869](https://github.com/facebook/create-react-app/pull/9869) Fix react-jsx error ([@benneq](https://github.com/benneq))
  * [#9885](https://github.com/facebook/create-react-app/pull/9885) fix: `React is not defined` compilation error after ejected ([@n3tr](https://github.com/n3tr))
  * [#9911](https://github.com/facebook/create-react-app/pull/9911) fix: slow recompile time ([@FezVrasta](https://github.com/FezVrasta))
* `react-dev-utils`
  * [#9884](https://github.com/facebook/create-react-app/pull/9884) fix: page doesn't get refreshed when FAST_REFRESH=false ([@n3tr](https://github.com/n3tr))

#### :nail_care: Enhancement
* `react-scripts`
  * [#10048](https://github.com/facebook/create-react-app/pull/10048) Increase Workbox's maximumFileSizeToCacheInBytes ([@jeffposnick](https://github.com/jeffposnick))

#### :memo: Documentation
* [#10052](https://github.com/facebook/create-react-app/pull/10052) docs: add React Testing Library as a library requiring jsdom ([@anyulled](https://github.com/anyulled))

#### :house: Internal
* `create-react-app`, `react-dev-utils`, `react-scripts`
  * [#10083](https://github.com/facebook/create-react-app/pull/10083) replace inquirer with prompts ([@EvanBacon](https://github.com/EvanBacon))
* `cra-template-typescript`, `cra-template`, `react-scripts`
  * [#9516](https://github.com/facebook/create-react-app/pull/9516) [ImgBot] Optimize images ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
* Other
  * [#9860](https://github.com/facebook/create-react-app/pull/9860) chore: Update .prettierrc ([@MichaelDeBoey](https://github.com/MichaelDeBoey))

#### Committers: 9
- Anyul Rivas ([@anyulled](https://github.com/anyulled))
- Ben M ([@benneq](https://github.com/benneq))
- Evan Bacon ([@EvanBacon](https://github.com/EvanBacon))
- Federico Zivolo ([@FezVrasta](https://github.com/FezVrasta))
- Jeffrey Posnick ([@jeffposnick](https://github.com/jeffposnick))
- Jirat Ki. ([@n3tr](https://github.com/n3tr))
- Michaël De Boey ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
- Ryota Murakami ([@ryota-murakami](https://github.com/ryota-murakami))
- sho90 ([@sho-t](https://github.com/sho-t))

# Migrating from 4.0.0 to 4.0.1

Inside any created project that has not been ejected, run:

```bash
npm install --save --save-exact react-scripts@4.0.1
```

or

```
yarn add --exact react-scripts@4.0.1
```

## 4.0.0 (2020-10-23)

Create React App 4.0 is a major release with several new features, including support for Fast Refresh!

Thanks to all the maintainers and contributors who worked so hard on this release! :raised_hands:

# Highlights

- Fast Refresh [#8582](https://github.com/facebook/create-react-app/pull/8582)
- React 17 support
  - New JSX transform [#9645](https://github.com/facebook/create-react-app/pull/9645)
- TypeScript 4 support [#9734](https://github.com/facebook/create-react-app/pull/9734)
- ESLint 7 [#8978](https://github.com/facebook/create-react-app/pull/8978)
  - New Jest and React Testing Library rules [#8963](https://github.com/facebook/create-react-app/pull/8963)
- Jest 26 [#8955](https://github.com/facebook/create-react-app/pull/8955)
- PWA/workbox improvements
  - Switch to the Workbox InjectManifest plugin [#9205](https://github.com/facebook/create-react-app/pull/9205)
  - Now its own template so it can be released independently
- Web Vitals support [#9116](https://github.com/facebook/create-react-app/pull/9116)

# Migrating from 3.4.x to 4.0.0

Inside any created project that has not been ejected, run:

```bash
npm install --save --save-exact react-scripts@4.0.0
```

or

```
yarn add --exact react-scripts@4.0.0
```

**NOTE: You may need to delete your `node_modules` folder and reinstall your dependencies by running `yarn` (or `npm install`) if you encounter errors after upgrading.**

If you previously ejected but now want to upgrade, one common solution is to find the commits where you ejected (and any subsequent commits changing the configuration), revert them, upgrade, and later optionally eject again. It’s also possible that the feature you ejected for is now supported out of the box.

## Breaking Changes

Like any major release, `react-scripts@4.0.0` contains a number of breaking changes. We expect that they won't affect every user, but we recommend you look over this section to see if something is relevant to you. If we missed something, please file a new issue.

### ESLint

We've upgraded to ESLint 7 and added many new rules including some for Jest and React Testing Library as well as the `import/no-anonymous-default-export` rule. We've also upgraded `eslint-plugin-hooks` to version 4.0.0 and removed the `EXTEND_ESLINT` flag as it is no longer required to customize the ESLint config.

### Jest

We've upgraded to Jest 26 and now set `resetMocks` to `true` by default in the Jest config.

### Service workers

We've switched to the Workbox InjectManifest plugin and moved the PWA templates into their own [repository](https://github.com/cra-template/pwa).

### Removed `typescript` flag and `NODE_PATH` support

We've removed the deprecated `typescript` flag when creating a new app. Use `--template typescript` instead. We've also dropped deprecated `NODE_PATH` flag as this has been replaced by setting the base path in `jsconfig.json`.

### Fix dotenv file loading order

We've changed the loading order of env files to match the `dotenv` specification. See #9037 for more details.

### Dropped Node 8 support

Node 8 reached End-of-Life at the end of 2019 and is no longer supported.

# Detailed Changelog

#### :rocket: New Feature

- `eslint-config-react-app`, `react-error-overlay`, `react-scripts`
  - [#8963](https://github.com/facebook/create-react-app/pull/8963) feat(eslint-config-react-app): Add jest & testing-library rules ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
- `react-scripts`
  - [#9611](https://github.com/facebook/create-react-app/pull/9611) Add AVIF image support ([@Hongbo-Miao](https://github.com/Hongbo-Miao))
  - [#9114](https://github.com/facebook/create-react-app/pull/9114) Allow testMatch for jest config ([@Favna](https://github.com/Favna))
  - [#8790](https://github.com/facebook/create-react-app/pull/8790) Add back in --stats output from webpack. ([@samccone](https://github.com/samccone))
  - [#8838](https://github.com/facebook/create-react-app/pull/8838) Support devDependencies in templates ([@mrmckeb](https://github.com/mrmckeb))
- `create-react-app`
  - [#9359](https://github.com/facebook/create-react-app/pull/9359) feat: exit on outdated create-react-app version ([@mrmckeb](https://github.com/mrmckeb))
- `cra-template-typescript`, `cra-template`, `react-scripts`
  - [#9205](https://github.com/facebook/create-react-app/pull/9205) Switch to the Workbox InjectManifest plugin ([@jeffposnick](https://github.com/jeffposnick))
- `react-dev-utils`, `react-scripts`
  - [#8582](https://github.com/facebook/create-react-app/pull/8582) Add experimental react-refresh support ([@charrondev](https://github.com/charrondev))

#### :boom: Breaking Change

- `eslint-config-react-app`, `react-error-overlay`, `react-scripts`
  - [#8963](https://github.com/facebook/create-react-app/pull/8963) feat(eslint-config-react-app): Add jest & testing-library rules ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
  - [#8978](https://github.com/facebook/create-react-app/pull/8978) Support ESLint 7.x ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
- `cra-template-typescript`, `cra-template`, `eslint-config-react-app`, `react-error-overlay`, `react-scripts`
  - [#9587](https://github.com/facebook/create-react-app/pull/9587) Remove EXTEND_ESLINT and add Jest rules ([@mrmckeb](https://github.com/mrmckeb))
- `eslint-config-react-app`
  - [#9401](https://github.com/facebook/create-react-app/pull/9401) fix: remove deprecated rule ([@ljosberinn](https://github.com/ljosberinn))
- `create-react-app`
  - [#9359](https://github.com/facebook/create-react-app/pull/9359) feat: exit on outdated create-react-app version ([@mrmckeb](https://github.com/mrmckeb))
- `cra-template-typescript`, `cra-template`, `react-scripts`
  - [#9205](https://github.com/facebook/create-react-app/pull/9205) Switch to the Workbox InjectManifest plugin ([@jeffposnick](https://github.com/jeffposnick))
- `babel-plugin-named-asset-import`, `confusing-browser-globals`, `create-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#8955](https://github.com/facebook/create-react-app/pull/8955) Upgrade to Jest 26 ([@ianschmitz](https://github.com/ianschmitz))
- `create-react-app`, `react-scripts`
  - [#8934](https://github.com/facebook/create-react-app/pull/8934) feat: remove typescript flag and NODE_PATH support ([@mrmckeb](https://github.com/mrmckeb))
- `react-scripts`
  - [#9037](https://github.com/facebook/create-react-app/pull/9037) Fix dotenv file loading order ([@Timer](https://github.com/Timer))
  - [#7899](https://github.com/facebook/create-react-app/pull/7899) Set resetMocks to true by default in jest config ([@alexkrolick](https://github.com/alexkrolick))
- `babel-plugin-named-asset-import`, `babel-preset-react-app`, `create-react-app`, `react-app-polyfill`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#8950](https://github.com/facebook/create-react-app/pull/8950) Dependency major version upgrades ([@ianschmitz](https://github.com/ianschmitz))
- `eslint-config-react-app`, `react-scripts`
  - [#8926](https://github.com/facebook/create-react-app/pull/8926) Add import/no-anonymous-default-export lint rule ([@shakib609](https://github.com/shakib609))
  - [#8939](https://github.com/facebook/create-react-app/pull/8939) Bump React Hooks ESLint plugin to 4.0.0 ([@gaearon](https://github.com/gaearon))
- `cra-template-typescript`, `cra-template`, `create-react-app`, `react-app-polyfill`, `react-dev-utils`, `react-scripts`
  - [#8948](https://github.com/facebook/create-react-app/pull/8948) Drop Node 8 support ([@ianschmitz](https://github.com/ianschmitz))
- `babel-plugin-named-asset-import`, `babel-preset-react-app`, `confusing-browser-globals`, `cra-template-typescript`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#8362](https://github.com/facebook/create-react-app/pull/8362) Upgrade to Jest 25 ([@skovhus](https://github.com/skovhus))

#### :bug: Bug Fix

- `react-scripts`
  - [#9805](https://github.com/facebook/create-react-app/pull/9805) Fix refreshOverlayInterop module scope error ([@ianschmitz](https://github.com/ianschmitz))
  - [#9037](https://github.com/facebook/create-react-app/pull/9037) Fix dotenv file loading order ([@Timer](https://github.com/Timer))
  - [#8700](https://github.com/facebook/create-react-app/pull/8700) Skip stdin resuming to support lerna parallel ([@hieuxlu](https://github.com/hieuxlu))
  - [#8845](https://github.com/facebook/create-react-app/pull/8845) Do not check for interactive session to shut down dev server ([@jeremywadsack](https://github.com/jeremywadsack))
  - [#8768](https://github.com/facebook/create-react-app/pull/8768) Add .cjs and .mjs files support to test runner ([@ai](https://github.com/ai))
- `babel-preset-react-app`, `eslint-config-react-app`, `react-scripts`
  - [#9788](https://github.com/facebook/create-react-app/pull/9788) fix: resolve new JSX transform issues ([@mrmckeb](https://github.com/mrmckeb))
- `eslint-config-react-app`, `react-scripts`
  - [#9683](https://github.com/facebook/create-react-app/pull/9683) fix: resolve ESLint config from appPath ([@mrmckeb](https://github.com/mrmckeb))
- `create-react-app`
  - [#9412](https://github.com/facebook/create-react-app/pull/9412) Fix template name handling ([@iansu](https://github.com/iansu))
- `babel-preset-react-app`
  - [#9374](https://github.com/facebook/create-react-app/pull/9374) fix: use default modules option from `preset-env` ([@JLHwung](https://github.com/JLHwung))
- `react-dev-utils`
  - [#9390](https://github.com/facebook/create-react-app/pull/9390) Publish refreshOverlayInterop with react-dev-utils ([@klinem](https://github.com/klinem))
  - [#8492](https://github.com/facebook/create-react-app/pull/8492) Replace period in CSS Module classnames ([@evankennedy](https://github.com/evankennedy))
- `react-dev-utils`, `react-scripts`
  - [#8694](https://github.com/facebook/create-react-app/pull/8694) Use process.execPath to spawn node subprocess ([@anuraaga](https://github.com/anuraaga))
- `cra-template-typescript`, `cra-template`, `react-scripts`
  - [#8734](https://github.com/facebook/create-react-app/pull/8734) fix: handle templates without main package field ([@mrmckeb](https://github.com/mrmckeb))

#### :nail_care: Enhancement

- `react-scripts`
  - [#9734](https://github.com/facebook/create-react-app/pull/9734) Use new JSX setting with TypeScript 4.1.0 ([@iansu](https://github.com/iansu))
  - [#8638](https://github.com/facebook/create-react-app/pull/8638) Support source maps for scss in dev environments ([@MKorostoff](https://github.com/MKorostoff))
  - [#8834](https://github.com/facebook/create-react-app/pull/8834) Don't use webpack multi entry unnecessarily ([@sebmarkbage](https://github.com/sebmarkbage))
- `babel-preset-react-app`, `eslint-config-react-app`, `react-scripts`
  - [#9861](https://github.com/facebook/create-react-app/pull/9861) New JSX Transform opt out ([@iansu](https://github.com/iansu))
- `cra-template`
  - [#9853](https://github.com/facebook/create-react-app/pull/9853) feat: remove unused React imports ([@mrmckeb](https://github.com/mrmckeb))
- `babel-preset-react-app`, `react-scripts`
  - [#9645](https://github.com/facebook/create-react-app/pull/9645) Use new JSX transform with React 17 ([@iansu](https://github.com/iansu))
- `react-dev-utils`, `react-scripts`
  - [#9350](https://github.com/facebook/create-react-app/pull/9350) Add Fast Refresh warning when using React < 16.10 ([@iansu](https://github.com/iansu))
- `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#9375](https://github.com/facebook/create-react-app/pull/9375) feat: better refresh plugin integration ([@pmmmwh](https://github.com/pmmmwh))
- `cra-template-typescript`, `cra-template`
  - [#9116](https://github.com/facebook/create-react-app/pull/9116) Add performance relayer + documentation (web-vitals) ([@housseindjirdeh](https://github.com/housseindjirdeh))
  - [#8705](https://github.com/facebook/create-react-app/pull/8705) Update template tests ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
- `create-react-app`
  - [#8460](https://github.com/facebook/create-react-app/pull/8460) Fix --use-pnp for Yarn 2 ([@nickmccurdy](https://github.com/nickmccurdy))

#### :memo: Documentation

- Other
  - [#9728](https://github.com/facebook/create-react-app/pull/9728) Upgrade Docusaurus to latest version ([@lex111](https://github.com/lex111))
  - [#9630](https://github.com/facebook/create-react-app/pull/9630) Emphasise that Next.js is capable of SSG ([@liamness](https://github.com/liamness))
  - [#9073](https://github.com/facebook/create-react-app/pull/9073) Update running-tests.md ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
  - [#9560](https://github.com/facebook/create-react-app/pull/9560) Update Vercel deployment documentation ([@timothyis](https://github.com/timothyis))
  - [#9380](https://github.com/facebook/create-react-app/pull/9380) Update running-tests.md ([@andycanderson](https://github.com/andycanderson))
  - [#9245](https://github.com/facebook/create-react-app/pull/9245) [Doc] fix React Testing Library example ([@sakito21](https://github.com/sakito21))
  - [#9231](https://github.com/facebook/create-react-app/pull/9231) Clarify wording in adding TypeScript to existing project ([@merelinguist](https://github.com/merelinguist))
  - [#8895](https://github.com/facebook/create-react-app/pull/8895) Fix chai URL ([@BMorearty](https://github.com/BMorearty))
  - [#9042](https://github.com/facebook/create-react-app/pull/9042) Update deployment docs for Azure Static Web Apps ([@burkeholland](https://github.com/burkeholland))
  - [#8246](https://github.com/facebook/create-react-app/pull/8246) Add a VSCode tip in the CSS reset section ([@maazadeeb](https://github.com/maazadeeb))
  - [#8610](https://github.com/facebook/create-react-app/pull/8610) Update url to see prettier in action ([@M165437](https://github.com/M165437))
  - [#8684](https://github.com/facebook/create-react-app/pull/8684) Simplify wording in setting-up-your-editor.md ([@coryhouse](https://github.com/coryhouse))
  - [#8791](https://github.com/facebook/create-react-app/pull/8791) Add setupTests.js to the list of generated files ([@MostafaNawara](https://github.com/MostafaNawara))
  - [#8763](https://github.com/facebook/create-react-app/pull/8763) Use simplified import of @testing-library/jest-dom ([@Dremora](https://github.com/Dremora))
- `react-dev-utils`
  - [#9471](https://github.com/facebook/create-react-app/pull/9471) Fixes in the /packages/react-devs-utils/README.md file ([@caspero-62](https://github.com/caspero-62))
  - [#8651](https://github.com/facebook/create-react-app/pull/8651) Update build script deployment URL ([@StenAL](https://github.com/StenAL))
- `cra-template-typescript`, `cra-template`
  - [#9241](https://github.com/facebook/create-react-app/pull/9241) Updated README.md Templates to Follow ESLint Markdown Rules ([@firehawk09](https://github.com/firehawk09))
  - [#8406](https://github.com/facebook/create-react-app/pull/8406) Upgrade testing-library packages ([@gnapse](https://github.com/gnapse))
- `react-scripts`
  - [#9244](https://github.com/facebook/create-react-app/pull/9244) Explain how to uninstall create-react-app globally ([@nickmccurdy](https://github.com/nickmccurdy))
  - [#8838](https://github.com/facebook/create-react-app/pull/8838) Support devDependencies in templates ([@mrmckeb](https://github.com/mrmckeb))
- `cra-template-typescript`, `cra-template`, `react-dev-utils`, `react-scripts`
  - [#8957](https://github.com/facebook/create-react-app/pull/8957) Move shortlinks to cra.link ([@iansu](https://github.com/iansu))
- `babel-preset-react-app`
  - [#5847](https://github.com/facebook/create-react-app/pull/5847) Include absoluteRuntime in babel preset docs ([@iddan](https://github.com/iddan))

#### :house: Internal

- `eslint-config-react-app`
  - [#9670](https://github.com/facebook/create-react-app/pull/9670) fix(eslint-config-react-app): Make eslint-plugin-jest an optional peerDependency ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
- Other
  - [#9258](https://github.com/facebook/create-react-app/pull/9258) fix: Fix azure-pipelines' endOfLine ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
  - [#9102](https://github.com/facebook/create-react-app/pull/9102) Replace Spectrum links with GitHub Discussions ([@iansu](https://github.com/iansu))
  - [#8656](https://github.com/facebook/create-react-app/pull/8656) Bump acorn from 6.4.0 to 6.4.1 in /docusaurus/website ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8749](https://github.com/facebook/create-react-app/pull/8749) Specify what files are served form a bare local copy ([@challet](https://github.com/challet))
- `cra-template-typescript`, `cra-template`
  - [#9252](https://github.com/facebook/create-react-app/pull/9252) feat: Update testing-library dependencies to latest ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
- `react-dev-utils`
  - [#9059](https://github.com/facebook/create-react-app/pull/9059) clean formatMessage usage ([@chenxsan](https://github.com/chenxsan))
- `cra-template`
  - [#7787](https://github.com/facebook/create-react-app/pull/7787) Bump version of Verdaccio ([@ianschmitz](https://github.com/ianschmitz))
- `babel-preset-react-app`
  - [#8858](https://github.com/facebook/create-react-app/pull/8858) Remove outdated comment ([@availchet](https://github.com/availchet))
- `react-scripts`
  - [#8952](https://github.com/facebook/create-react-app/pull/8952) fix react-refresh babel plugin not applied ([@tanhauhau](https://github.com/tanhauhau))

#### :hammer: Underlying Tools

- `react-scripts`
  - [#9865](https://github.com/facebook/create-react-app/pull/9865) Pass JSX runtime setting to Babel preset in Jest config ([@iansu](https://github.com/iansu))
  - [#9841](https://github.com/facebook/create-react-app/pull/9841) Bump resolve-url-loader version ([@johannespfeiffer](https://github.com/johannespfeiffer))
  - [#9348](https://github.com/facebook/create-react-app/pull/9348) Upgrade refresh plugin ([@ianschmitz](https://github.com/ianschmitz))
  - [#8891](https://github.com/facebook/create-react-app/pull/8891) Bump style-loader to 1.2.1 ([@chybisov](https://github.com/chybisov))
- `react-error-overlay`, `react-scripts`
  - [#9863](https://github.com/facebook/create-react-app/pull/9863) Upgrade to React 17 ([@iansu](https://github.com/iansu))
  - [#9856](https://github.com/facebook/create-react-app/pull/9856) feat: Update ESLint dependencies ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
- `babel-plugin-named-asset-import`, `babel-preset-react-app`, `confusing-browser-globals`, `cra-template-typescript`, `cra-template`, `create-react-app`, `eslint-config-react-app`, `react-app-polyfill`, `react-error-overlay`, `react-scripts`
  - [#9857](https://github.com/facebook/create-react-app/pull/9857) feat: Update all dependencies ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
- `eslint-config-react-app`, `react-dev-utils`, `react-scripts`
  - [#9751](https://github.com/facebook/create-react-app/pull/9751) Replace deprecated eslint-loader by eslint-webpack-plugin ([@tooppaaa](https://github.com/tooppaaa))
- `babel-plugin-named-asset-import`, `babel-preset-react-app`, `confusing-browser-globals`, `cra-template-typescript`, `cra-template`, `create-react-app`, `eslint-config-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#9639](https://github.com/facebook/create-react-app/pull/9639) Upgrade dependencies ([@ianschmitz](https://github.com/ianschmitz))
- `eslint-config-react-app`, `react-error-overlay`, `react-scripts`
  - [#9434](https://github.com/facebook/create-react-app/pull/9434) feat: Update ESLint dependencies ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
  - [#9251](https://github.com/facebook/create-react-app/pull/9251) feat: Update ESLint dependencies ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
  - [#8978](https://github.com/facebook/create-react-app/pull/8978) Support ESLint 7.x ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
- `cra-template-typescript`, `cra-template`
  - [#9526](https://github.com/facebook/create-react-app/pull/9526) Update template dependencies to latest version ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
  - [#8406](https://github.com/facebook/create-react-app/pull/8406) Upgrade testing-library packages ([@gnapse](https://github.com/gnapse))
- `react-app-polyfill`
  - [#9392](https://github.com/facebook/create-react-app/pull/9392) Upgrade whatwg-fetch ([@Lapz](https://github.com/Lapz))
- `react-dev-utils`
  - [#8933](https://github.com/facebook/create-react-app/pull/8933) Bump immer version ([@staff0rd](https://github.com/staff0rd))
- `babel-plugin-named-asset-import`, `babel-preset-react-app`, `confusing-browser-globals`, `create-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#9317](https://github.com/facebook/create-react-app/pull/9317) Upgrade dependencies ([@ianschmitz](https://github.com/ianschmitz))
- `babel-preset-react-app`, `cra-template-typescript`, `cra-template`, `create-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#9196](https://github.com/facebook/create-react-app/pull/9196) Upgrade dependencies ([@ianschmitz](https://github.com/ianschmitz))
  - [#9132](https://github.com/facebook/create-react-app/pull/9132) Upgrade dependencies ([@ianschmitz](https://github.com/ianschmitz))
- `babel-plugin-named-asset-import`, `confusing-browser-globals`, `create-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#8955](https://github.com/facebook/create-react-app/pull/8955) Upgrade to Jest 26 ([@ianschmitz](https://github.com/ianschmitz))
- `babel-preset-react-app`, `create-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#9081](https://github.com/facebook/create-react-app/pull/9081) Update packages ([@ianschmitz](https://github.com/ianschmitz))
  - [#8947](https://github.com/facebook/create-react-app/pull/8947) Minor/patch dependency upgrades ([@ianschmitz](https://github.com/ianschmitz))
- `babel-plugin-named-asset-import`, `babel-preset-react-app`, `create-react-app`, `react-app-polyfill`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#8950](https://github.com/facebook/create-react-app/pull/8950) Dependency major version upgrades ([@ianschmitz](https://github.com/ianschmitz))
- `eslint-config-react-app`, `react-scripts`
  - [#8939](https://github.com/facebook/create-react-app/pull/8939) Bump React Hooks ESLint plugin to 4.0.0 ([@gaearon](https://github.com/gaearon))
- `babel-plugin-named-asset-import`, `babel-preset-react-app`, `confusing-browser-globals`, `cra-template-typescript`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#8362](https://github.com/facebook/create-react-app/pull/8362) Upgrade to Jest 25 ([@skovhus](https://github.com/skovhus))

#### Committers: 63

- Adam Charron ([@charrondev](https://github.com/charrondev))
- Alex Krolick ([@alexkrolick](https://github.com/alexkrolick))
- Alexey Pyltsyn ([@lex111](https://github.com/lex111))
- Andrey Sitnik ([@ai](https://github.com/ai))
- Andy C ([@andycanderson](https://github.com/andycanderson))
- Anuraag Agrawal ([@anuraaga](https://github.com/anuraaga))
- Braedon Gough ([@braedongough](https://github.com/braedongough))
- Brian Morearty ([@BMorearty](https://github.com/BMorearty))
- Brody McKee ([@mrmckeb](https://github.com/mrmckeb))
- Burke Holland ([@burkeholland](https://github.com/burkeholland))
- Chetanya Kandhari ([@availchet](https://github.com/availchet))
- Clément DUNGLER ([@tooppaaa](https://github.com/tooppaaa))
- Clément Hallet ([@challet](https://github.com/challet))
- Cory House ([@coryhouse](https://github.com/coryhouse))
- Dan Abramov ([@gaearon](https://github.com/gaearon))
- Dylan Brookes ([@merelinguist](https://github.com/merelinguist))
- Ernesto García ([@gnapse](https://github.com/gnapse))
- Eugene Chybisov ([@chybisov](https://github.com/chybisov))
- Evan Kennedy ([@evankennedy](https://github.com/evankennedy))
- Gerrit Alex ([@ljosberinn](https://github.com/ljosberinn))
- Hieu Do ([@hieuxlu](https://github.com/hieuxlu))
- Hongbo Miao ([@Hongbo-Miao](https://github.com/Hongbo-Miao))
- Houssein Djirdeh ([@housseindjirdeh](https://github.com/housseindjirdeh))
- Huáng Jùnliàng ([@JLHwung](https://github.com/JLHwung))
- Ian Schmitz ([@ianschmitz](https://github.com/ianschmitz))
- Ian Sutherland ([@iansu](https://github.com/iansu))
- Iddan Aaronsohn ([@iddan](https://github.com/iddan))
- Jakob Krigovsky ([@sonicdoe](https://github.com/sonicdoe))
- Jeffrey Posnick ([@jeffposnick](https://github.com/jeffposnick))
- Jeremy Wadsack ([@jeremywadsack](https://github.com/jeremywadsack))
- Jeroen Claassens ([@Favna](https://github.com/Favna))
- Joe Haddad ([@Timer](https://github.com/Timer))
- Johannes Pfeiffer ([@johannespfeiffer](https://github.com/johannespfeiffer))
- Josemaria Nriagu ([@josenriagu](https://github.com/josenriagu))
- Kenneth Skovhus ([@skovhus](https://github.com/skovhus))
- Kirill Korolyov ([@Dremora](https://github.com/Dremora))
- Kline Moralee ([@klinem](https://github.com/klinem))
- Lenard Pratt ([@Lapz](https://github.com/Lapz))
- Liam Duffy ([@liamness](https://github.com/liamness))
- Maaz Syed Adeeb ([@maazadeeb](https://github.com/maazadeeb))
- Marc Hassan ([@mhassan1](https://github.com/mhassan1))
- Matt Korostoff ([@MKorostoff](https://github.com/MKorostoff))
- Michael Mok ([@pmmmwh](https://github.com/pmmmwh))
- Michael Schmidt-Voigt ([@M165437](https://github.com/M165437))
- Michaël De Boey ([@MichaelDeBoey](https://github.com/MichaelDeBoey))
- Minh Nguyen ([@NMinhNguyen](https://github.com/NMinhNguyen))
- Mostafa Nawara ([@MostafaNawara](https://github.com/MostafaNawara))
- Nick McCurdy ([@nickmccurdy](https://github.com/nickmccurdy))
- Rafael Quijada ([@firehawk09](https://github.com/firehawk09))
- Raihan Nismara ([@raihan71](https://github.com/raihan71))
- Sakito Mukai ([@sakito21](https://github.com/sakito21))
- Sam Chen ([@chenxsan](https://github.com/chenxsan))
- Sam Saccone ([@samccone](https://github.com/samccone))
- Sebastian Markbåge ([@sebmarkbage](https://github.com/sebmarkbage))
- Shakib Hossain ([@shakib609](https://github.com/shakib609))
- Simen Bekkhus ([@SimenB](https://github.com/SimenB))
- Stafford Williams ([@staff0rd](https://github.com/staff0rd))
- Sten Arthur Laane ([@StenAL](https://github.com/StenAL))
- Tan Li Hau ([@tanhauhau](https://github.com/tanhauhau))
- Timothy ([@timothyis](https://github.com/timothyis))
- Tobias Büschel ([@tobiasbueschel](https://github.com/tobiasbueschel))
- Webdot_30 ([@caspero-62](https://github.com/caspero-62))
- [@atlanteh](https://github.com/atlanteh)

## Releases Before 4.x

Please refer to [CHANGELOG-3.x.md](./CHANGELOG-3.x.md) for earlier versions.
