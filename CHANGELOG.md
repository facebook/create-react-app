## 3.3.0 (2019-12-04)

v3.3.0 is a minor release that adds new features, including custom templates and support for the new optional chaining and nullish coalescing operators.

### Custom Templates

You can now create a new app using custom templates.

We've published our existing templates as [`cra-template`](https://github.com/facebook/create-react-app/tree/master/packages/cra-template) and [`cra-template-typescript`](https://github.com/facebook/create-react-app/tree/master/packages/cra-template-typescript), but we expect to see many great templates from the community over the coming weeks.

The below command shows how you can create a new app with `cra-template-typescript`.

```sh
npx create-react-app my-app --template typescript
```

Note that you can omit the prefix `cra-template-` when specifying which template you would like. For TypeScript users, we're deprecating `--typescript` in favour of `--template typescript`.

If you don't set a template, we'll create your new app with `cra-template` - which is just a new name for our base template.

### Optional Chaining and Nullish Coalescing Operators

We now support the [optional chaining](https://github.com/TC39/proposal-optional-chaining) and [nullish coalescing](https://github.com/tc39/proposal-nullish-coalescing) operators!

```js
// Optional chaining
a?.(); // undefined if `a` is null/undefined
b?.c; // undefined if `b` is null/undefined

// Nullish coalescing
undefined ?? 'some other default'; // result: 'some other default'
null ?? 'some other default'; // result: 'some other default'
'' ?? 'some other default'; // result: ''
0 ?? 300; // result: 0
false ?? true; // result: false
```

**If you're using TypeScript, you will need to upgrade your `typescript` dependency to `3.7.0` or later if you wish to use the new operators.**

**If you're using Visual Studio Code 1.40 (the latest as of this release) or earlier, you will need to configure your editor if you want it to understand the new operators.**

If you're using TypeScript in your project and have already upgrade its version as described above, then you can [configure VS Code to `Use Workspace Version` of TypeScript](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-newer-typescript-versions). If your project isn't using TypeScript, you can use the [JavaScript and TypeScript Nightly extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next) until VS Code releases a newer version including TypeScript `3.7.0` or newer.

### Numeric Separators

We've added support for [numeric separators](https://github.com/tc39/proposal-numeric-separator) to improve readability of numeric literals.

```js
1000000000; // Is this a billion? a hundred millions? Ten millions?
101475938.38; // what scale is this? what power of 10?

1_000_000_000; // Ah, so a billion
101_475_938.38; // And this is hundreds of millions
```

### no-unexpected-multiline

We've removed this rule as it is not compatible with Prettier. If you rely on this rule you can re-enable it by [extending our ESLint config](https://create-react-app.dev/docs/setting-up-your-editor/#experimental-extending-the-eslint-config) and adding the following:

```json
{
  "extends": "react-app",
  "rules": {
    "no-unexpected-multiline": "warn"
  }
}
```

#### :rocket: New Feature

- `babel-preset-react-app`
  - [#7438](https://github.com/facebook/create-react-app/pull/7438) Add optional chaining and nullish coalescing operators support ([@renatoagds](https://github.com/renatoagds))
- `babel-preset-react-app`, `react-dev-utils`
  - [#7817](https://github.com/facebook/create-react-app/pull/7817) Add numeric separator support ([@tharun208](https://github.com/tharun208))
- `cra-template-typescript`, `cra-template`, `create-react-app`, `react-scripts`
  - [#7716](https://github.com/facebook/create-react-app/pull/7716) Add template support ([@mrmckeb](https://github.com/mrmckeb))

#### :boom: Breaking Change

- `create-react-app`, `react-dev-utils`, `react-scripts`

  - [#7988](https://github.com/facebook/create-react-app/pull/7988) Bump webpack-dev-server ([@ianschmitz](https://github.com/ianschmitz))

    **NOTE: This is only a breaking change if you're using `react-dev-utils` outside of Create React App.**

#### :bug: Bug Fix

- `eslint-config-react-app`
  - [#8039](https://github.com/facebook/create-react-app/pull/8039) Remove no-unexpected-multiline rule ([@iansu](https://github.com/iansu))
- `create-react-app`
  - [#7991](https://github.com/facebook/create-react-app/pull/7991) Support templates in scoped packages ([@klasbj](https://github.com/klasbj))
  - [#7839](https://github.com/facebook/create-react-app/pull/7839) added check for typescript template and unsupported node version ([@awaseem](https://github.com/awaseem))
- `react-scripts`
  - [#7860](https://github.com/facebook/create-react-app/pull/7860) Mark TypeScript as an optional peer dependency for react-scripts ([@dstaley](https://github.com/dstaley))
  - [#7822](https://github.com/facebook/create-react-app/pull/7822) Fix absolute paths issue in Jest ([@rovansteen](https://github.com/rovansteen))
  - [#7796](https://github.com/facebook/create-react-app/pull/7796) Fixed process type in TypeScript template. ([@fuszenecker](https://github.com/fuszenecker))
- `react-dev-utils`
  - [#6449](https://github.com/facebook/create-react-app/pull/6449) Edit InterpolateHtmlPlugin hook (#6448) ([@GuiHash](https://github.com/GuiHash))

#### :nail_care: Enhancement

- `cra-template-typescript`, `cra-template`
  - [#8005](https://github.com/facebook/create-react-app/pull/8005) Prefix apple-touch-icon links with PUBLIC_URL ([@benblank](https://github.com/benblank))
  - [#7881](https://github.com/facebook/create-react-app/pull/7881) Add @testing-library to the default templates ([@kentcdodds](https://github.com/kentcdodds))
- `react-scripts`
  - [#7989](https://github.com/facebook/create-react-app/pull/7989) Add scripts support to templates ([@mrmckeb](https://github.com/mrmckeb))
  - [#7921](https://github.com/facebook/create-react-app/pull/7921) Add restoreMocks to supported jest config keys ([@ianschmitz](https://github.com/ianschmitz))
  - [#6352](https://github.com/facebook/create-react-app/pull/6352) Add additional information for postcss errors (#6282) ([@buildbreakdo](https://github.com/buildbreakdo))
  - [#6753](https://github.com/facebook/create-react-app/pull/6753) Add Service-Worker header to checkValidServiceWorker ([@darthmaim](https://github.com/darthmaim))
  - [#7832](https://github.com/facebook/create-react-app/pull/7832) feat: add additional Jest keys to whitelist ([@mrmckeb](https://github.com/mrmckeb))
  - [#7022](https://github.com/facebook/create-react-app/pull/7022) Fix node_modules sourcemap config (which will fix VSCode debugging of CRA apps) ([@justingrant](https://github.com/justingrant))
- `cra-template`
  - [#7931](https://github.com/facebook/create-react-app/pull/7931) No spinning React logo if `prefers-reduced-motion` ([@donavon](https://github.com/donavon))
- `create-react-app`, `react-error-overlay`
  - [#7052](https://github.com/facebook/create-react-app/pull/7052) Dark scheme overlay ([@Fabianopb](https://github.com/Fabianopb))
- `babel-preset-react-app`
  - [#7726](https://github.com/facebook/create-react-app/pull/7726) Add babel runtime version to transform-runtime plugin to reduce bundle size ([@topaxi](https://github.com/topaxi))

#### :memo: Documentation

- Other
  - [#8050](https://github.com/facebook/create-react-app/pull/8050) Update template docs ([@mrmckeb](https://github.com/mrmckeb))
  - [#7995](https://github.com/facebook/create-react-app/pull/7995) Add contributors section to readme ([@ianschmitz](https://github.com/ianschmitz))
  - [#7896](https://github.com/facebook/create-react-app/pull/7896) chore: Fix broken link for e2e README ([@haruelrovix](https://github.com/haruelrovix))
  - [#7874](https://github.com/facebook/create-react-app/pull/7874) Bump docusaurus 🦖 ([@andriijas](https://github.com/andriijas))
  - [#7819](https://github.com/facebook/create-react-app/pull/7819) 📖 DOC: Improvement ([@waahab](https://github.com/waahab))
  - [#7853](https://github.com/facebook/create-react-app/pull/7853) Update adding-bootstrap.md ([@Xuhao](https://github.com/Xuhao))
  - [#7849](https://github.com/facebook/create-react-app/pull/7849) chore: update README.md gif links ([@cchanxzy](https://github.com/cchanxzy))
  - [#7840](https://github.com/facebook/create-react-app/pull/7840) Link to ASP.NET Core docs ([@Daniel15](https://github.com/Daniel15))
  - [#7841](https://github.com/facebook/create-react-app/pull/7841) Update getting-started.md ([@reactjser](https://github.com/reactjser))
  - [#7809](https://github.com/facebook/create-react-app/pull/7809) Add a note about .eslintignore files being respected ([@seanlaff](https://github.com/seanlaff))
  - [#7686](https://github.com/facebook/create-react-app/pull/7686) Link to React documentation for code splitting ([@Hugodby](https://github.com/Hugodby))
  - [#7785](https://github.com/facebook/create-react-app/pull/7785) Upgrade to docusaurus 2 ([@endiliey](https://github.com/endiliey))
  - [#7824](https://github.com/facebook/create-react-app/pull/7824) Fix grammar error in troubleshooting.md ([@jakeboone02](https://github.com/jakeboone02))
  - [#7823](https://github.com/facebook/create-react-app/pull/7823) Document correct default behavior for HOST var ([@jsejcksn](https://github.com/jsejcksn))
  - [#7815](https://github.com/facebook/create-react-app/pull/7815) Tightens up the TypeScript docs ([@orta](https://github.com/orta))
  - [#7813](https://github.com/facebook/create-react-app/pull/7813) Clarify dynamic import stage in docs ([@aprilandjan](https://github.com/aprilandjan))
- `react-dev-utils`, `react-scripts`
  - [#7972](https://github.com/facebook/create-react-app/pull/7972) Add placeholders where old template READMEs used to be ([@iansu](https://github.com/iansu))
- `babel-preset-react-app`
  - [#7932](https://github.com/facebook/create-react-app/pull/7932) fix seperators typo ([@donavon](https://github.com/donavon))
- `react-dev-utils`
  - [#7897](https://github.com/facebook/create-react-app/pull/7897) chore: Fix broken link for CRA deployment ([@haruelrovix](https://github.com/haruelrovix))
- `react-scripts`
  - [#7852](https://github.com/facebook/create-react-app/pull/7852) Add Alex to lint documentation ([@iansu](https://github.com/iansu))
  - [#7474](https://github.com/facebook/create-react-app/pull/7474) Fix notations of loopback addresses ([@wataash](https://github.com/wataash))

#### :house: Internal

- `react-scripts`
  - [#8038](https://github.com/facebook/create-react-app/pull/8038) Add TypeScript peer dependency to react-scripts ([@iansu](https://github.com/iansu))
  - [#7952](https://github.com/facebook/create-react-app/pull/7952) Add tests for optional chaining and null coalescing ([@ianschmitz](https://github.com/ianschmitz))
  - [#7830](https://github.com/facebook/create-react-app/pull/7830) Revert logo in templates ([@iansu](https://github.com/iansu))
- Other
  - [#8029](https://github.com/facebook/create-react-app/pull/8029) Re-enable GitHub Actions ([@iansu](https://github.com/iansu))
  - [#7978](https://github.com/facebook/create-react-app/pull/7978) Temporarily disable GitHub Actions ([@iansu](https://github.com/iansu))
  - [#7789](https://github.com/facebook/create-react-app/pull/7789) Add yarn.lock to .gitignore ([@lukyth](https://github.com/lukyth))
  - [#7878](https://github.com/facebook/create-react-app/pull/7878) Remove alex precommit check ([@iansu](https://github.com/iansu))
  - [#7861](https://github.com/facebook/create-react-app/pull/7861) Add a GitHub Action that runs the build script ([@iansu](https://github.com/iansu))
- `eslint-config-react-app`
  - [#8003](https://github.com/facebook/create-react-app/pull/8003) Use @typescript-eslint/no-unused-expressions to support optional chaining ([@maxdavidson](https://github.com/maxdavidson))
- `create-react-app`
  - [#7844](https://github.com/facebook/create-react-app/pull/7844) added e2e test for checking typescript template with unsupported node ([@awaseem](https://github.com/awaseem))
  - [#7882](https://github.com/facebook/create-react-app/pull/7882) refactor: remove double coerce ([@mrmckeb](https://github.com/mrmckeb))
  - [#7880](https://github.com/facebook/create-react-app/pull/7880) Pass through fully specified template name ([@iansu](https://github.com/iansu))
- `cra-template-typescript`
  - [#7944](https://github.com/facebook/create-react-app/pull/7944) Make base and TypeScript templates consistent ([@suprj](https://github.com/suprj))
- `create-react-app`, `react-dev-utils`, `react-scripts`
  - [#7773](https://github.com/facebook/create-react-app/pull/7773) Temporarily disable Windows in CI ([@ianschmitz](https://github.com/ianschmitz))

#### :hammer: Underlying Tools

- `babel-preset-react-app`, `cra-template-typescript`, `cra-template`, `create-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#8024](https://github.com/facebook/create-react-app/pull/8024) Bump dependencies ([@ianschmitz](https://github.com/ianschmitz))
- `create-react-app`, `react-dev-utils`, `react-scripts`
  - [#7988](https://github.com/facebook/create-react-app/pull/7988) Bump webpack-dev-server ([@ianschmitz](https://github.com/ianschmitz))
  - [#7876](https://github.com/facebook/create-react-app/pull/7876) Bump styling related loaders ([@andriijas](https://github.com/andriijas))
- `react-app-polyfill`
  - [#7999](https://github.com/facebook/create-react-app/pull/7999) Unpin dependencies in react-app-polyfill ([@ianschmitz](https://github.com/ianschmitz))
- `babel-preset-react-app`, `react-app-polyfill`, `react-dev-utils`, `react-scripts`
  - [#7986](https://github.com/facebook/create-react-app/pull/7986) Bump dependencies ([@ianschmitz](https://github.com/ianschmitz))
- `react-scripts`
  - [#7956](https://github.com/facebook/create-react-app/pull/7956) Upgrade jest-watch-typeahead ([@Andarist](https://github.com/Andarist))
  - [#7870](https://github.com/facebook/create-react-app/pull/7870) Fix eslint complaints in build.js ([@andriijas](https://github.com/andriijas))
  - [#7857](https://github.com/facebook/create-react-app/pull/7857) feat: upgrade terser & enable parallel minification in wsl ([@endiliey](https://github.com/endiliey))
  - [#7856](https://github.com/facebook/create-react-app/pull/7856) Move unused eslint webpack import into @remove-on-eject block ([@mrseanbaines](https://github.com/mrseanbaines))
- `babel-preset-react-app`, `cra-template-typescript`, `create-react-app`, `react-app-polyfill`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#7951](https://github.com/facebook/create-react-app/pull/7951) Fix CI ([@ianschmitz](https://github.com/ianschmitz))
- `react-dev-utils`
  - [#7910](https://github.com/facebook/create-react-app/pull/7910) Update open ([@andriijas](https://github.com/andriijas))
- `babel-plugin-named-asset-import`, `babel-preset-react-app`, `react-error-overlay`, `react-scripts`
  - [#7814](https://github.com/facebook/create-react-app/pull/7814) Upgrade outdated packages ([@andriijas](https://github.com/andriijas))
- `react-error-overlay`, `react-scripts`
  - [#7875](https://github.com/facebook/create-react-app/pull/7875) Bump react ([@andriijas](https://github.com/andriijas))

#### Committers: 42

- Abdul Wahab ⚡️ ([@waahab](https://github.com/waahab))
- Alex Guerra ([@heyimalex](https://github.com/heyimalex))
- Ali Waseem ([@awaseem](https://github.com/awaseem))
- Andreas Cederström ([@andriijas](https://github.com/andriijas))
- Ben Blank ([@benblank](https://github.com/benblank))
- Brody McKee ([@mrmckeb](https://github.com/mrmckeb))
- Chun ([@cchanxzy](https://github.com/cchanxzy))
- Damian Senn ([@topaxi](https://github.com/topaxi))
- Daniel Lo Nigro ([@Daniel15](https://github.com/Daniel15))
- Donavon West ([@donavon](https://github.com/donavon))
- Dylan Staley ([@dstaley](https://github.com/dstaley))
- Endi ([@endiliey](https://github.com/endiliey))
- Fabiano Brito ([@Fabianopb](https://github.com/Fabianopb))
- Guillaume Hertault ([@GuiHash](https://github.com/GuiHash))
- Havit Rovik ([@haruelrovix](https://github.com/haruelrovix))
- Hugo David-Boyet ([@Hugodby](https://github.com/Hugodby))
- Ian Schmitz ([@ianschmitz](https://github.com/ianschmitz))
- Ian Sutherland ([@iansu](https://github.com/iansu))
- Jake Boone ([@jakeboone02](https://github.com/jakeboone02))
- Jesse Jackson ([@jsejcksn](https://github.com/jsejcksn))
- Jonathan Felchlin ([@GreenGremlin](https://github.com/GreenGremlin))
- Joshua Robinson ([@buildbreakdo](https://github.com/buildbreakdo))
- Justin Grant ([@justingrant](https://github.com/justingrant))
- Kanitkorn Sujautra ([@lukyth](https://github.com/lukyth))
- Kent C. Dodds ([@kentcdodds](https://github.com/kentcdodds))
- Klas Björkqvist ([@klasbj](https://github.com/klasbj))
- Mateusz Burzyński ([@Andarist](https://github.com/Andarist))
- Max Davidson ([@maxdavidson](https://github.com/maxdavidson))
- May ([@aprilandjan](https://github.com/aprilandjan))
- Orta ([@orta](https://github.com/orta))
- RJ ([@suprj](https://github.com/suprj))
- Renato Augusto Gama dos Santos ([@renatoagds](https://github.com/renatoagds))
- Robert FUSZENECKER ([@fuszenecker](https://github.com/fuszenecker))
- Robert van Steen ([@rovansteen](https://github.com/rovansteen))
- Sean Baines ([@mrseanbaines](https://github.com/mrseanbaines))
- Sean Lafferty ([@seanlaff](https://github.com/seanlaff))
- Tharun Rajendran ([@tharun208](https://github.com/tharun208))
- Tomáš Hübelbauer ([@TomasHubelbauer](https://github.com/TomasHubelbauer))
- Wataru Ashihara ([@wataash](https://github.com/wataash))
- Xuhao ([@Xuhao](https://github.com/Xuhao))
- [@reactjser](https://github.com/reactjser)
- darthmaim ([@darthmaim](https://github.com/darthmaim))

### Migrating from 3.2.0 to 3.3.0

Inside any created project that has not been ejected, run:

```sh
npm install --save --save-exact react-scripts@3.3.0
```

or

```sh
yarn add --exact react-scripts@3.3.0
```

## 3.2.0 (2019-10-03)

v3.2.0 is a minor release that adds support for production profiling and ignoring TypeScript type errors to make migrating JavaScript projects to TypeScript easier. It also includes other minor bug fixes and documentation updates.

#### :rocket: New Feature

- `react-scripts`
  - [#7737](https://github.com/facebook/create-react-app/pull/7737) Support production profiling with React Developer Tools ([@JacobMGEvans](https://github.com/JacobMGEvans))
- `react-dev-utils`, `react-scripts`
  - [#6931](https://github.com/facebook/create-react-app/pull/6931) Adds TSC_COMPILE_ON_ERROR env var... ([@kylebebak](https://github.com/kylebebak))

#### :bug: Bug Fix

- `react-scripts`
  - [#7754](https://github.com/facebook/create-react-app/pull/7754) Fix linting error when using rest props ([@alexandrtovmach](https://github.com/alexandrtovmach))
- `react-app-polyfill`
  - [#7205](https://github.com/facebook/create-react-app/pull/7205) Guard polyfills against window possibly being undefined ([@jxom](https://github.com/jxom))

#### :nail_care: Enhancement

- `react-scripts`
  - [#7687](https://github.com/facebook/create-react-app/pull/7687) Use installing package manager in README ([@ashr81](https://github.com/ashr81))
  - [#7755](https://github.com/facebook/create-react-app/pull/7755) Support setting baseUrl to root directory ([@rovansteen](https://github.com/rovansteen))
  - [#7530](https://github.com/facebook/create-react-app/pull/7530) only load eslint config when EXTEND_ESLINT environment variable is specified/ do not swallow eslint config errors ([@n1ru4l](https://github.com/n1ru4l))
  - [#7742](https://github.com/facebook/create-react-app/pull/7742) set output.globalObject to 'this' ([@kentcdodds](https://github.com/kentcdodds))
  - [#7721](https://github.com/facebook/create-react-app/pull/7721) Add "entrypoints" key to asset manifest ([@samuelmeuli](https://github.com/samuelmeuli))
  - [#7562](https://github.com/facebook/create-react-app/pull/7562) enable .eslintignore again ([@igtm](https://github.com/igtm))
- `react-dev-utils`
  - [#6980](https://github.com/facebook/create-react-app/pull/6980) Stop hiding the column number of ESLint errors ([@justingrant](https://github.com/justingrant))

#### :memo: Documentation

- [#7302](https://github.com/facebook/create-react-app/pull/7302) docs: note that 2 to 3 migration may require deletion of node_modules ([@kimpers](https://github.com/kimpers))
- [#7757](https://github.com/facebook/create-react-app/pull/7757) Documentation typo fix: accessbile→accessible ([@tomer](https://github.com/tomer))
- [#7601](https://github.com/facebook/create-react-app/pull/7601) [Documentation] Updated list of supported Jest config overrides ([@neilbryson](https://github.com/neilbryson))
- [#7705](https://github.com/facebook/create-react-app/pull/7705) Update runtime chunk name separator in docs ([@samuelmeuli](https://github.com/samuelmeuli))

#### :house: Internal

- `react-scripts`
  - [#7752](https://github.com/facebook/create-react-app/pull/7752) Fix wrong letter casing ([@lewislbr](https://github.com/lewislbr))
- `react-dev-utils`, `react-scripts`
  - [#7707](https://github.com/facebook/create-react-app/pull/7707) Remove 'shortcut' link type before 'icon' ([@lewislbr](https://github.com/lewislbr))

#### :hammer: Underlying Tools

- `react-scripts`
  - [#7729](https://github.com/facebook/create-react-app/pull/7729) Remove switch case ([@andrelmlins](https://github.com/andrelmlins))

#### Committers: 19

- Alexandr Tovmach ([@alexandrtovmach](https://github.com/alexandrtovmach))
- André Lins ([@andrelmlins](https://github.com/andrelmlins))
- Ashrith Reddy ([@ashr81](https://github.com/ashr81))
- Federico Zivolo ([@FezVrasta](https://github.com/FezVrasta))
- Iguchi Tomokatsu ([@igtm](https://github.com/igtm))
- Jacob M-G Evans ([@JacobMGEvans](https://github.com/JacobMGEvans))
- Jake Moxey ([@jxom](https://github.com/jxom))
- Justin Grant ([@justingrant](https://github.com/justingrant))
- Kent C. Dodds ([@kentcdodds](https://github.com/kentcdodds))
- Kim Persson ([@kimpers](https://github.com/kimpers))
- Kyle Bebak ([@kylebebak](https://github.com/kylebebak))
- Laurin Quast ([@n1ru4l](https://github.com/n1ru4l))
- Lewis Llobera ([@lewislbr](https://github.com/lewislbr))
- Rakan Nimer ([@rakannimer](https://github.com/rakannimer))
- Reece Dunham ([@RDIL](https://github.com/RDIL))
- Robert van Steen ([@rovansteen](https://github.com/rovansteen))
- Samuel Meuli ([@samuelmeuli](https://github.com/samuelmeuli))
- Tomer Cohen ([@tomer](https://github.com/tomer))
- neilbryson ([@neilbryson](https://github.com/neilbryson))

### Migrating from 3.1.2 to 3.2.0

Inside any created project that has not been ejected, run:

```sh
npm install --save --save-exact react-scripts@3.2.0
```

or

```sh
yarn add --exact react-scripts@3.2.0
```

## 3.1.2 (2019-09-19)

v3.1.2 is a maintenance release that includes minor bug fixes and documentation updates.

#### :bug: Bug Fix

- `react-scripts`
  - [#7679](https://github.com/facebook/create-react-app/pull/7679) Change runtime chunk name separator from tilde to dash ([@javadoug](https://github.com/javadoug))
  - [#7538](https://github.com/facebook/create-react-app/pull/7538) Explicitly checking that EXTEND_ESLINT is true ([@BrockWills](https://github.com/BrockWills))
- `babel-preset-react-app`, `react-error-overlay`, `react-scripts`
  - [#7662](https://github.com/facebook/create-react-app/pull/7662) Fix build ([@ianschmitz](https://github.com/ianschmitz))

#### :nail_care: Enhancement

- `react-scripts`
  - [#7704](https://github.com/facebook/create-react-app/pull/7704) Add new logo ([@iansu](https://github.com/iansu))
  - [#7587](https://github.com/facebook/create-react-app/pull/7587) Minor performance improvements ([@deftomat](https://github.com/deftomat))
  - [#7633](https://github.com/facebook/create-react-app/pull/7633) Disable babel-loader's cacheCompression ([@jleclanche](https://github.com/jleclanche))

#### :memo: Documentation

- [#7616](https://github.com/facebook/create-react-app/pull/7616) Update deployment.md with another AWS example ([@AndrewBestbier](https://github.com/AndrewBestbier))
- [#7663](https://github.com/facebook/create-react-app/pull/7663) Remove --single-quote from prettier examples ([@brlewis](https://github.com/brlewis))
- [#7659](https://github.com/facebook/create-react-app/pull/7659) Update running-tests.md ([@weyert](https://github.com/weyert))
- [#7459](https://github.com/facebook/create-react-app/pull/7459) Update troubleshooting.md ([@prevostc](https://github.com/prevostc))
- [#7650](https://github.com/facebook/create-react-app/pull/7650) Adopt Contributor Covenant ([@iansu](https://github.com/iansu))
- [#7620](https://github.com/facebook/create-react-app/pull/7620) cleanup-after-each is no longer necessary! ([@iHmD](https://github.com/iHmD))
- [#7613](https://github.com/facebook/create-react-app/pull/7613) Fix seams between changelog majors ([@emilpalsson](https://github.com/emilpalsson))
- [#7368](https://github.com/facebook/create-react-app/pull/7368) Correcting proxy sample ([@szabolcs-szilagyi](https://github.com/szabolcs-szilagyi))
- [#7536](https://github.com/facebook/create-react-app/pull/7536) add a migration step to remove static from robots.txt ([@lookfirst](https://github.com/lookfirst))
- [#7521](https://github.com/facebook/create-react-app/pull/7521) Show logo for mobile views in create-react-app.dev ([@GrooChu](https://github.com/GrooChu))

#### :house: Internal

- `react-scripts`
  - [#7526](https://github.com/facebook/create-react-app/pull/7526) The variable dotenvFiles is never reassigned - use const instead ([@Primajin](https://github.com/Primajin))
  - [#7585](https://github.com/facebook/create-react-app/pull/7585) remove trailing spaces ([@xiaoxiangmoe](https://github.com/xiaoxiangmoe))

#### :hammer: Underlying Tools

- `babel-plugin-named-asset-import`, `confusing-browser-globals`, `react-app-polyfill`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#7681](https://github.com/facebook/create-react-app/pull/7681) Bump dependencies ([@ianschmitz](https://github.com/ianschmitz))
- `react-scripts`
  - [#7531](https://github.com/facebook/create-react-app/pull/7531) Upgrade dotenv-expand to fix issues ([@DominicTobias](https://github.com/DominicTobias))
- `eslint-config-react-app`, `react-scripts`
  - [#7540](https://github.com/facebook/create-react-app/pull/7540) Bump version of @typescript-eslint/\* ([@pierreneter](https://github.com/pierreneter))

#### Committers: 20

- Andrew ([@AndrewBestbier](https://github.com/AndrewBestbier))
- Brock Wills ([@BrockWills](https://github.com/BrockWills))
- Clément Prévost ([@prevostc](https://github.com/prevostc))
- Dominic Tobias ([@DominicTobias](https://github.com/DominicTobias))
- Doug Ross ([@javadoug](https://github.com/javadoug))
- Emil Pålsson ([@emilpalsson](https://github.com/emilpalsson))
- Federico Zivolo ([@FezVrasta](https://github.com/FezVrasta))
- Ian Schmitz ([@ianschmitz](https://github.com/ianschmitz))
- Ian Sutherland ([@iansu](https://github.com/iansu))
- Jannis Hell ([@Primajin](https://github.com/Primajin))
- Jerome Leclanche ([@jleclanche](https://github.com/jleclanche))
- Jon Stevens ([@lookfirst](https://github.com/lookfirst))
- Sabesh Rajendran ([@GrooChu](https://github.com/GrooChu))
- Tomáš Szabo ([@deftomat](https://github.com/deftomat))
- Weyert de Boer ([@weyert](https://github.com/weyert))
- ZHAO Jinxiang ([@xiaoxiangmoe](https://github.com/xiaoxiangmoe))
- [@brlewis](https://github.com/brlewis)
- [@iHmD](https://github.com/iHmD)
- [@pierreneter](https://github.com/pierreneter)
- szabi ([@szabolcs-szilagyi](https://github.com/szabolcs-szilagyi))

### Migrating from 3.1.1 to 3.1.2

Inside any created project that has not been ejected, run:

```sh
npm install --save --save-exact react-scripts@3.1.2
```

or

```sh
yarn add --exact react-scripts@3.1.2
```

## 3.1.1 (2019-08-13)

v3.1.1 is a maintenance release that includes minor bug fixes and documentation updates.

#### :bug: Bug Fix

- `react-scripts`
  - [#7513](https://github.com/facebook/create-react-app/pull/7513) Fix ESLint 6 support ([@ianschmitz](https://github.com/ianschmitz))
  - [#7508](https://github.com/facebook/create-react-app/pull/7508) Don't block static files in robots.txt ([@iansu](https://github.com/iansu))

#### :nail_care: Enhancement

- `eslint-config-react-app`
  - [#7393](https://github.com/facebook/create-react-app/pull/7393) Ignore "jsx-a11y/aria-role" for React components ([@deftomat](https://github.com/deftomat))

#### :memo: Documentation

- [#7527](https://github.com/facebook/create-react-app/pull/7527) Update Netlify config ([@iansu](https://github.com/iansu))
- [#7500](https://github.com/facebook/create-react-app/pull/7500) Add links to Spectrum in README and docs ([@iansu](https://github.com/iansu))

#### Committers: 3

- Ian Schmitz ([@ianschmitz](https://github.com/ianschmitz))
- Ian Sutherland ([@iansu](https://github.com/iansu))
- Tomáš Szabo ([@deftomat](https://github.com/deftomat))

### Migrating from 3.1.0 to 3.1.1

Optionally remove `Disallow: /static/` from `public/robots.txt` if you want to allow your images and other static files to be indexed by search engines [#7508](https://github.com/facebook/create-react-app/pull/7508)

Inside any created project that has not been ejected, run:

```sh
npm install --save --save-exact react-scripts@3.1.1
```

or

```sh
yarn add --exact react-scripts@3.1.1
```

## 3.1.0 (2019-08-09)

v3.1.0 is a minor release that adds ESLint 6 support as well as experimental support for extended and customizing the ESLint config along with other minor bug fixes and documentation updates. The upgrade to ESLint 6 is a breaking change _only_ if you're using `eslint-config-react-app` or `react-error-overlay` outside of Create React App.

# Highlights

- ESLint 6: #7415
- Experimental ESLint config customization: #7036
- More Jest config options: #6055
- Option to configure or disable image inlining: #6060

#### :rocket: New Feature

- `eslint-config-react-app`, `react-error-overlay`, `react-scripts`
  - [#7415](https://github.com/facebook/create-react-app/pull/7415) Add ESLint 6 support ([@mrmckeb](https://github.com/mrmckeb))
- `eslint-config-react-app`, `react-scripts`
  - [#7036](https://github.com/facebook/create-react-app/pull/7036) Add ESLint extend support to eslint-loader ([@mrmckeb](https://github.com/mrmckeb))
- `react-dev-utils`
  - [#7277](https://github.com/facebook/create-react-app/pull/7277) Handle browser arguments ([@arvigeus](https://github.com/arvigeus))
- `react-scripts`
  - [#6060](https://github.com/facebook/create-react-app/pull/6060) Add environment variable to control image inlining threshold ([@peterbe](https://github.com/peterbe))
  - [#6055](https://github.com/facebook/create-react-app/pull/6055) Support for graceful extension of Jest config ([@jamesmfriedman](https://github.com/jamesmfriedman))

#### :boom: Breaking Change

- `eslint-config-react-app`, `react-error-overlay`, `react-scripts`
  - [#7415](https://github.com/facebook/create-react-app/pull/7415) Add ESLint 6 support ([@mrmckeb](https://github.com/mrmckeb))

#### :bug: Bug Fix

- `react-dev-utils`
  - [#7444](https://github.com/facebook/create-react-app/pull/7444) Fix for #6720: HMR not working in Firefox if proxy option present ([@dmile](https://github.com/dmile))
- `react-scripts`
  - [#5829](https://github.com/facebook/create-react-app/pull/5829) Resolve relative paths for preprocessor styles ([@iamandrewluca](https://github.com/iamandrewluca))
  - [#7433](https://github.com/facebook/create-react-app/pull/7433) Add explicit check for --watchAll=false ([@mrmckeb](https://github.com/mrmckeb))
  - [#7378](https://github.com/facebook/create-react-app/pull/7378) Update url-loader to 2.0.1 ([@heyimalex](https://github.com/heyimalex))
- `eslint-config-react-app`
  - [#7230](https://github.com/facebook/create-react-app/pull/7230) jsx-no-duplicate-props ignore case fix ([@rommguy](https://github.com/rommguy))
  - [#7219](https://github.com/facebook/create-react-app/pull/7219) fix: eslintrc overrides key should be an array, not object ([@ivan-aksamentov](https://github.com/ivan-aksamentov))
  - [#7079](https://github.com/facebook/create-react-app/pull/7079) Adjust typescript-eslint to not warn about typedefs when used before defined ([@vincentjames501](https://github.com/vincentjames501))
- `react-error-overlay`, `react-scripts`
  - [#7257](https://github.com/facebook/create-react-app/pull/7257) Upgrade webpack to 4.35.0 to fix dynamic import issue ([@iansu](https://github.com/iansu))

#### :nail_care: Enhancement

- `react-scripts`
  - [#7497](https://github.com/facebook/create-react-app/pull/7497) add readonly modifier for css module ([@xiaoxiangmoe](https://github.com/xiaoxiangmoe))
  - [#7496](https://github.com/facebook/create-react-app/pull/7496) bump sass-loader ([@xiaoxiangmoe](https://github.com/xiaoxiangmoe))
  - [#7176](https://github.com/facebook/create-react-app/pull/7176) Fix RegExp from navigateFallbackBlacklist (workbox) ([@nuragic](https://github.com/nuragic))
  - [#7080](https://github.com/facebook/create-react-app/pull/7080) Support configuring coveragePathIgnorePatterns ([@kentcdodds](https://github.com/kentcdodds))
  - [#7482](https://github.com/facebook/create-react-app/pull/7482) 100% lighthouse score for progressive web app ([@dscanlan](https://github.com/dscanlan))
  - [#5951](https://github.com/facebook/create-react-app/pull/5951) Set jsonpFunction by default ([@sibiraj-s](https://github.com/sibiraj-s))
  - [#7472](https://github.com/facebook/create-react-app/pull/7472) Typescript init: suggest `jsx: "react"` in tsconfig ([@kingdaro](https://github.com/kingdaro))
  - [#7118](https://github.com/facebook/create-react-app/pull/7118) Append title element to SVG component via title prop ([@sudkumar](https://github.com/sudkumar))
- `react-dev-utils`
  - [#7028](https://github.com/facebook/create-react-app/pull/7028) Add vscodium to the editor list ([@leonardodino](https://github.com/leonardodino))
  - [#7277](https://github.com/facebook/create-react-app/pull/7277) Handle browser arguments ([@arvigeus](https://github.com/arvigeus))
- `eslint-config-react-app`, `react-error-overlay`, `react-scripts`
  - [#7415](https://github.com/facebook/create-react-app/pull/7415) Add ESLint 6 support ([@mrmckeb](https://github.com/mrmckeb))
- `eslint-config-react-app`
  - [#7179](https://github.com/facebook/create-react-app/pull/7179) Disabled Typescript no-undef rule per typescript-eslint #477 ([@andyhopp](https://github.com/andyhopp))
- `create-react-app`
  - [#6941](https://github.com/facebook/create-react-app/pull/6941) Fix compatibility of create-react-app to Node.js v0.10+ ([@tobiasbueschel](https://github.com/tobiasbueschel))

#### :memo: Documentation

- Other
  - [#7488](https://github.com/facebook/create-react-app/pull/7488) Adjusted deployment documentation for ZEIT Now ([@leo](https://github.com/leo))
  - [#7462](https://github.com/facebook/create-react-app/pull/7462) Added dependencies to bootstrap article when using custom SCSS. ([@eclectic-coding](https://github.com/eclectic-coding))
  - [#7340](https://github.com/facebook/create-react-app/pull/7340) Update testing-library related npm package names in README ([@balazsorban44](https://github.com/balazsorban44))
  - [#7423](https://github.com/facebook/create-react-app/pull/7423) Add question issue template ([@iansu](https://github.com/iansu))
  - [#7260](https://github.com/facebook/create-react-app/pull/7260) Docs: remove an outdated TypeScript-related note ([@MidnightDesign](https://github.com/MidnightDesign))
  - [#7372](https://github.com/facebook/create-react-app/pull/7372) proposal dynamic import are stage 4 ([@gespispace](https://github.com/gespispace))
  - [#7374](https://github.com/facebook/create-react-app/pull/7374) docs(svg): add tip for title props accessibility ([@sudkumar](https://github.com/sudkumar))
  - [#7182](https://github.com/facebook/create-react-app/pull/7182) Update minimum Node versions in docs ([@JESii](https://github.com/JESii))
  - [#7317](https://github.com/facebook/create-react-app/pull/7317) Fix typo ([@mvasin](https://github.com/mvasin))
  - [#7262](https://github.com/facebook/create-react-app/pull/7262) Docs: replace the command line to install relay/macro ([@soufDev](https://github.com/soufDev))
  - [#7170](https://github.com/facebook/create-react-app/pull/7170) Update deprecated package reference ([@bnewcomb](https://github.com/bnewcomb))
  - [#7133](https://github.com/facebook/create-react-app/pull/7133) Make the OOM abreviation more clear ([@tlehtimaki](https://github.com/tlehtimaki))
  - [#7086](https://github.com/facebook/create-react-app/pull/7086) Improve breaking changes info for CRA 3.0.0 ([@falldowngoboone](https://github.com/falldowngoboone))
  - [#7059](https://github.com/facebook/create-react-app/pull/7059) Correct spelling of browserslist ([@amyrlam](https://github.com/amyrlam))
  - [#7039](https://github.com/facebook/create-react-app/pull/7039) docs: fix env-cmd example in deployment section ([@VMois](https://github.com/VMois))
  - [#7041](https://github.com/facebook/create-react-app/pull/7041) Updates the relay docs ([@orta](https://github.com/orta))
- `eslint-config-react-app`
  - [#7451](https://github.com/facebook/create-react-app/pull/7451) Update README for ESLint config ([@mrmckeb](https://github.com/mrmckeb))
  - [#7274](https://github.com/facebook/create-react-app/pull/7274) Update peer dependencies ([@ThewBear](https://github.com/ThewBear))
- `react-error-overlay`, `react-scripts`
  - [#7355](https://github.com/facebook/create-react-app/pull/7355) Fix typos ([@minho42](https://github.com/minho42))

#### :house: Internal

- `babel-preset-react-app`
  - [#5818](https://github.com/facebook/create-react-app/pull/5818) Remove unused dependencies in babel-preset-react-app ([@iansu](https://github.com/iansu))
  - [#7208](https://github.com/facebook/create-react-app/pull/7208) Use correct babel transform for dynamic import in dependencies ([@jamesknelson](https://github.com/jamesknelson))
- `react-scripts`
  - [#7433](https://github.com/facebook/create-react-app/pull/7433) Add explicit check for --watchAll=false ([@mrmckeb](https://github.com/mrmckeb))
  - [#6877](https://github.com/facebook/create-react-app/pull/6877) Upgrade svgr to 4.2.0 ([@iansu](https://github.com/iansu))
- Other
  - [#7385](https://github.com/facebook/create-react-app/pull/7385) Attempt at fixing CI issue on windows ([@heyimalex](https://github.com/heyimalex))
  - [#7269](https://github.com/facebook/create-react-app/pull/7269) Update issue templates ([@mrmckeb](https://github.com/mrmckeb))
  - [#7220](https://github.com/facebook/create-react-app/pull/7220) Disable Travis build ([@ianschmitz](https://github.com/ianschmitz))
  - [#7096](https://github.com/facebook/create-react-app/pull/7096) Add Azure DevOps build pipeline ([@ianschmitz](https://github.com/ianschmitz))
  - [#6858](https://github.com/facebook/create-react-app/pull/6858) Add test to make sure .d.ts files are ignored when checking for TypeScript ([@iansu](https://github.com/iansu))
- `react-error-overlay`, `react-scripts`
  - [#7355](https://github.com/facebook/create-react-app/pull/7355) Fix typos ([@minho42](https://github.com/minho42))

#### :hammer: Underlying Tools

- `babel-plugin-named-asset-import`, `babel-preset-react-app`, `confusing-browser-globals`, `create-react-app`, `react-app-polyfill`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  - [#7473](https://github.com/facebook/create-react-app/pull/7473) Bump dependencies ([@ianschmitz](https://github.com/ianschmitz))
- `eslint-config-react-app`, `react-error-overlay`, `react-scripts`
  - [#7415](https://github.com/facebook/create-react-app/pull/7415) Add ESLint 6 support ([@mrmckeb](https://github.com/mrmckeb))
- `eslint-config-react-app`, `react-scripts`
  - [#7036](https://github.com/facebook/create-react-app/pull/7036) Add ESLint extend support to eslint-loader ([@mrmckeb](https://github.com/mrmckeb))
- `react-scripts`
  - [#7118](https://github.com/facebook/create-react-app/pull/7118) Append title element to SVG component via title prop ([@sudkumar](https://github.com/sudkumar))
  - [#7222](https://github.com/facebook/create-react-app/pull/7222) Update @typescript-eslint package versions ([@ianschmitz](https://github.com/ianschmitz))
  - [#7131](https://github.com/facebook/create-react-app/pull/7131) Update fsevents dependency version ([@eps1lon](https://github.com/eps1lon))
- `react-dev-utils`
  - [#7058](https://github.com/facebook/create-react-app/pull/7058) fix: Replaced opn (deprecated) with open ([@jamesgeorge007](https://github.com/jamesgeorge007))

#### Committers: 46

- Adeel Imran ([@adeelibr](https://github.com/adeelibr))
- Alex Guerra ([@heyimalex](https://github.com/heyimalex))
- Amy Lam ([@amyrlam](https://github.com/amyrlam))
- Andrea Puddu ([@nuragic](https://github.com/nuragic))
- Andrew Luca ([@iamandrewluca](https://github.com/iamandrewluca))
- Andy Hopper ([@andyhopp](https://github.com/andyhopp))
- Balázs Orbán ([@balazsorban44](https://github.com/balazsorban44))
- Ben Newcomb ([@bnewcomb](https://github.com/bnewcomb))
- Brian Muenzenmeyer ([@bmuenzenmeyer](https://github.com/bmuenzenmeyer))
- Brody McKee ([@mrmckeb](https://github.com/mrmckeb))
- Chuck ([@eclectic-coding](https://github.com/eclectic-coding))
- Darius Tall ([@kingdaro](https://github.com/kingdaro))
- Dmitry Lepskiy ([@dmile](https://github.com/dmile))
- Guy Romm ([@rommguy](https://github.com/rommguy))
- Ian Schmitz ([@ianschmitz](https://github.com/ianschmitz))
- Ian Sutherland ([@iansu](https://github.com/iansu))
- Igor Muchychka ([@mucsi96](https://github.com/mucsi96))
- Ivan Aksamentov ([@ivan-aksamentov](https://github.com/ivan-aksamentov))
- Ivan Pegashev ([@gespispace](https://github.com/gespispace))
- Jack Cross ([@crosscompile](https://github.com/crosscompile))
- James Friedman ([@jamesmfriedman](https://github.com/jamesmfriedman))
- James George ([@jamesgeorge007](https://github.com/jamesgeorge007))
- James K Nelson ([@jamesknelson](https://github.com/jamesknelson))
- Jon Seidel ([@JESii](https://github.com/JESii))
- Kent C. Dodds ([@kentcdodds](https://github.com/kentcdodds))
- Leo Lamprecht ([@leo](https://github.com/leo))
- Leonardo Dino ([@leonardodino](https://github.com/leonardodino))
- Mikhail Vasin ([@mvasin](https://github.com/mvasin))
- Min ho Kim ([@minho42](https://github.com/minho42))
- Nikolay Stoynov ([@arvigeus](https://github.com/arvigeus))
- Orta ([@orta](https://github.com/orta))
- Peter Bengtsson ([@peterbe](https://github.com/peterbe))
- Rudolph Gottesheim ([@MidnightDesign](https://github.com/MidnightDesign))
- Ryan Boone ([@falldowngoboone](https://github.com/falldowngoboone))
- Ryan Marsh ([@ryanwmarsh](https://github.com/ryanwmarsh))
- Sebastian Silbermann ([@eps1lon](https://github.com/eps1lon))
- Sibiraj ([@sibiraj-s](https://github.com/sibiraj-s))
- Soufiane AIT AKKACHE ([@soufDev](https://github.com/soufDev))
- Sudhir Mitharwal ([@sudkumar](https://github.com/sudkumar))
- Thew Dhanat ([@ThewBear](https://github.com/ThewBear))
- Tobias Büschel ([@tobiasbueschel](https://github.com/tobiasbueschel))
- Toni ([@tlehtimaki](https://github.com/tlehtimaki))
- Vincent Pizzo ([@vincentjames501](https://github.com/vincentjames501))
- Vladyslav Moisieienkov ([@VMois](https://github.com/VMois))
- ZHAO Jinxiang ([@xiaoxiangmoe](https://github.com/xiaoxiangmoe))
- dominic scanlan ([@dscanlan](https://github.com/dscanlan))

### Migrating from 3.0.1 to 3.1.0

Inside any created project that has not been ejected, run:

```sh
npm install --save --save-exact react-scripts@3.1.0
```

or

```sh
yarn add --exact react-scripts@3.1.0
```

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

**NOTE: You may need to delete your `node_modules` folder and reinstall your dependencies by running `yarn` (or `npm install`) if you encounter errors after upgrading.**

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

### New structure in `asset-manifest.json`

All asset paths have been moved under the `files` key in `asset-manifest.json`.

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
  - [#6821](https://github.com/facebook/create-react-app/pull/6821) Add custom function to generate asset manifest ([@iansu](https://github.com/iansu))
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
