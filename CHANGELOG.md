## 1.0.15 (October 30, 2017)

#### :bug: Bug Fix

* `react-scripts`

  * [#3287](https://github.com/facebookincubator/create-react-app/pull/3287) Fix favicon sizes value in the project manifest. ([@ryansully](https://github.com/ryansully))

* `react-dev-utils`, `react-scripts`

  * [#3230](https://github.com/facebookincubator/create-react-app/pull/3230) Fix watching for changes in `src/node_modules`. ([@xjlim](https://github.com/xjlim))

#### :nail_care: Enhancement

* `react-scripts`

  * [#3239](https://github.com/facebookincubator/create-react-app/pull/3239) Allow importing `.mjs` files. ([@Timer](https://github.com/Timer))
  * [#3340](https://github.com/facebookincubator/create-react-app/pull/3340) Polyfill `requestAnimationFrame` in test environment. ([@gaearon](https://github.com/gaearon))

* `babel-preset-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`

  * [#3342](https://github.com/facebookincubator/create-react-app/pull/3342) Bump dependencies. ([@gaearon](https://github.com/gaearon))

* `react-dev-utils`, `react-error-overlay`

  * [#3100](https://github.com/facebookincubator/create-react-app/pull/3100) Add click-to-open support for build errors. ([@tharakawj](https://github.com/tharakawj))

* `create-react-app`

  * [#3355](https://github.com/facebookincubator/create-react-app/pull/3355) Add preflight CWD check for npm to detect bad Windows setups. ([@gaearon](https://github.com/gaearon))

#### :memo: Documentation

* User Guide

  * [#2957](https://github.com/facebookincubator/create-react-app/pull/2957) Use `npm-run-all` to build Sass and JS. ([@shime](https://github.com/shime))
  * [#3108](https://github.com/facebookincubator/create-react-app/pull/3108) Update the Service Worker opt-out documentation. ([@captDaylight](https://github.com/captDaylight))
  * [#3286](https://github.com/facebookincubator/create-react-app/pull/3286) Add documentation for Enzyme 3 integration. ([@ryansully](https://github.com/ryansully))
  * [#3328](https://github.com/facebookincubator/create-react-app/pull/3328) Recommend react-snap as an alternative to react-snapshot. ([@aaronshaf](https://github.com/aaronshaf))
  * [#3279](https://github.com/facebookincubator/create-react-app/pull/3279) Add jest coverage configuration docs. ([@mattphillips](https://github.com/mattphillips))
  * [#3303](https://github.com/facebookincubator/create-react-app/pull/3303) Update link to Jest Expect docs. ([@jbranchaud](https://github.com/jbranchaud))
  * [#3289](https://github.com/facebookincubator/create-react-app/pull/3289) Fix dead link to Jest "expect" docs. ([@alexkrolick](https://github.com/alexkrolick))
  * [#3265](https://github.com/facebookincubator/create-react-app/pull/3265) Add external links to deployment services. ([@aericson](https://github.com/aericson))
  * [#3075](https://github.com/facebookincubator/create-react-app/pull/3075) Minor docs change to highlight dev proxy behaviour. ([@davidjb](https://github.com/davidjb))
  * [#3185](https://github.com/facebookincubator/create-react-app/pull/3185) Correct manual proxy documentation. ([@robertpanzer](https://github.com/robertpanzer))

* README

  * [#3227](https://github.com/facebookincubator/create-react-app/pull/3227) Fix package management link in README for issue #3218. ([@nishina555](https://github.com/nishina555))
  * [#3211](https://github.com/facebookincubator/create-react-app/pull/3211) Improve grammar in README. ([@Mohamed3on](https://github.com/Mohamed3on))

#### :house: Internal

* Other

  * [#3345](https://github.com/facebookincubator/create-react-app/pull/3345) Stop using `npm link` in tests. ([@Timer](https://github.com/Timer))

* `react-error-overlay`

  * [#3122](https://github.com/facebookincubator/create-react-app/pull/3122) Fix for add .gitattributes file #3080. ([@ijajmulani](https://github.com/ijajmulani))
  * [#3267](https://github.com/facebookincubator/create-react-app/pull/3267) Use production React version for bundled overlay. ([@Timer](https://github.com/Timer))
  * [#3264](https://github.com/facebookincubator/create-react-app/pull/3264) Add warning when using `react-error-overlay` in production. ([@Timer](https://github.com/Timer))
  * [#3263](https://github.com/facebookincubator/create-react-app/pull/3263) `react-error-overlay` has no dependencies now (it's bundled). ([@Timer](https://github.com/Timer))
  * [#3142](https://github.com/facebookincubator/create-react-app/pull/3142) Make error overlay run in the context of the iframe. ([@tharakawj](https://github.com/tharakawj))

* `react-scripts`

  * [#3150](https://github.com/facebookincubator/create-react-app/pull/3150) Remove an useless negation in `registerServiceWorker.js`. ([@dunglas](https://github.com/dunglas))
  * [#3158](https://github.com/facebookincubator/create-react-app/pull/3158) Remove `output.path` from dev webpack config. ([@nikolas](https://github.com/nikolas))
  * [#3281](https://github.com/facebookincubator/create-react-app/pull/3281) Add a workaround for Uglify incompatiblity with Safari 10.0 in the future. ([@satyavh](https://github.com/satyavh))
  * [#3146](https://github.com/facebookincubator/create-react-app/pull/3146) Fix `reason-react` support. ([@lpalmes](https://github.com/lpalmes))
  * [#3236](https://github.com/facebookincubator/create-react-app/pull/3236) Update `style-loader` and disable inclusion of its HMR code in builds. ([@insin](https://github.com/insin))
  * [#3246](https://github.com/facebookincubator/create-react-app/pull/3246) Update `url-loader` to 0.6.2 for mime ReDoS vulnerability. ([@d3viant0ne](https://github.com/d3viant0ne))
  * [#2914](https://github.com/facebookincubator/create-react-app/pull/2914) `<!doctype html>` -> `<!DOCTYPE html>`. ([@Hurtak](https://github.com/Hurtak))

#### Committers: 24

- Aaron Shafovaloff ([aaronshaf](https://github.com/aaronshaf))
- Alex ([alexkrolick](https://github.com/alexkrolick))
- André Ericson ([aericson](https://github.com/aericson))
- Dan Abramov ([gaearon](https://github.com/gaearon))
- David Beitey ([davidjb](https://github.com/davidjb))
- Hrvoje Šimić ([shime](https://github.com/shime))
- IJAJ MULANI ([ijajmulani](https://github.com/ijajmulani))
- Joe Haddad ([Timer](https://github.com/Timer))
- Joe Lim ([xjlim](https://github.com/xjlim))
- Jonny Buchanan ([insin](https://github.com/insin))
- Josh Branchaud ([jbranchaud](https://github.com/jbranchaud))
- Joshua Wiens ([d3viant0ne](https://github.com/d3viant0ne))
- Kévin Dunglas ([dunglas](https://github.com/dunglas))
- Lorenzo Palmes ([lpalmes](https://github.com/lpalmes))
- Matt Phillips ([mattphillips](https://github.com/mattphillips))
- Mohamed Oun ([Mohamed3on](https://github.com/Mohamed3on))
- Nik Nyby ([nikolas](https://github.com/nikolas))
- Petr Huřťák ([Hurtak](https://github.com/Hurtak))
- Robert Panzer ([robertpanzer](https://github.com/robertpanzer))
- Ryan Sullivan ([ryansully](https://github.com/ryansully))
- Satya van Heummen ([satyavh](https://github.com/satyavh))
- Tharaka Wijebandara ([tharakawj](https://github.com/tharakawj))
- Toshiharu Nishina ([nishina555](https://github.com/nishina555))
- [captDaylight](https://github.com/captDaylight)

### Migrating from 1.0.14 to 1.0.15

Inside any created project that has not been ejected, run:

```
npm install --save --save-exact react-scripts@1.0.15
```

or

```
yarn add --exact react-scripts@1.0.15
```

## 1.0.14 (September 26, 2017)

#### :bug: Bug Fix

* `react-dev-utils`

  * [#3098](https://github.com/facebookincubator/create-react-app/pull/3098) Always reload the page on next compile after a runtime error. ([@Timer](https://github.com/Timer))

* `react-error-overlay`

  * [#3079](https://github.com/facebookincubator/create-react-app/pull/3079) Fix code context on Windows. ([@Timer](https://github.com/Timer))

#### :nail_care: Enhancement

* `react-dev-utils`

  * [#3077](https://github.com/facebookincubator/create-react-app/pull/3077) Auto-detect running editor on Linux for error overlay. ([@gulderov](https://github.com/gulderov))

  * [#3131](https://github.com/facebookincubator/create-react-app/pull/3131) Display process pid in already running message. ([@Pajn](https://github.com/Pajn))

#### :memo: Documentation

* Other

  * [#3163](https://github.com/facebookincubator/create-react-app/pull/3163) Add link to active CSS modules discussion. ([@NeekSandhu](https://github.com/NeekSandhu))

* `react-scripts`

  * [#2908](https://github.com/facebookincubator/create-react-app/pull/2908) Note that class fields have progressed to stage 3. ([@rickbeerendonk](https://github.com/rickbeerendonk))

  * [#3160](https://github.com/facebookincubator/create-react-app/pull/3160) Update unclear wording in webpack configuration (file loader section). ([@kristiehoward](https://github.com/kristiehoward))

* `eslint-config-react-app`

  * [#3072](https://github.com/facebookincubator/create-react-app/pull/3072) Update eslint versions for install instructions. ([@jdcrensh](https://github.com/jdcrensh))

#### :house: Internal

* `react-scripts`

  * [#3157](https://github.com/facebookincubator/create-react-app/pull/3157) Update `webpack-dev-server` to `2.8.2`. ([@nikolas](https://github.com/nikolas))

  * [#2989](https://github.com/facebookincubator/create-react-app/pull/2989) Update install template to match accessibility guidelines. ([@davidleger95](https://github.com/davidleger95))

* `react-error-overlay`

  * [#3065](https://github.com/facebookincubator/create-react-app/pull/3065) Updated `react-error-overlay` to latest Flow (`0.54.0`). ([@duvet86](https://github.com/duvet86))

  * [#3102](https://github.com/facebookincubator/create-react-app/pull/3102) Clean target directory before compiling overlay. ([@Timer](https://github.com/Timer))

* `create-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`

  * [#3058](https://github.com/facebookincubator/create-react-app/pull/3058) Re-run prettier for all files and pin the version. ([@viankakrisna](https://github.com/viankakrisna))

  * [#3107](https://github.com/facebookincubator/create-react-app/pull/3107) Run CI on `npm@^4`. ([@viankakrisna](https://github.com/viankakrisna))

#### Committers: 12

- Ade Viankakrisna Fadlil ([viankakrisna](https://github.com/viankakrisna))
- David Leger ([davidleger95](https://github.com/davidleger95))
- Joe Haddad ([Timer](https://github.com/Timer))
- Jon Crenshaw ([jdcrensh](https://github.com/jdcrensh))
- Kristie Howard ([kristiehoward](https://github.com/kristiehoward))
- Luca ([duvet86](https://github.com/duvet86))
- Neek Sandhu ([NeekSandhu](https://github.com/NeekSandhu))
- Nik Nyby ([nikolas](https://github.com/nikolas))
- Rasmus Eneman ([Pajn](https://github.com/Pajn))
- Rick Beerendonk ([rickbeerendonk](https://github.com/rickbeerendonk))
- Sophie Alpert ([sophiebits](https://github.com/sophiebits))
- [gulderov](https://github.com/gulderov)

### Migrating from 1.0.13 to 1.0.14

Inside any created project that has not been ejected, run:

```
npm install --save --save-exact react-scripts@1.0.14
```

or

```
yarn add --exact react-scripts@1.0.14
```

## 1.0.13 (September 2, 2017)

#### :bug: Bug Fix

* `react-error-overlay`

  * [#3051](https://github.com/facebookincubator/create-react-app/pull/3051) Fix case-sensitivity issue with upgrading the package version. ([@tharakawj](https://github.com/tharakawj))

* `react-dev-utils`

  * [#3049](https://github.com/facebookincubator/create-react-app/pull/3049) Print filesize difference for chunks. ([@esturcke](https://github.com/esturcke))

* `react-scripts`

  * [#3046](https://github.com/facebookincubator/create-react-app/pull/3046) Fix crash in development mode on IE11. ([@tharakawj](https://github.com/tharakawj))

#### :nail_care: Enhancement

* `react-scripts`

  * [#3033](https://github.com/facebookincubator/create-react-app/pull/3033) Add an empty mock for `child_process` to let some libraries compile. ([@McFlurriez](https://github.com/McFlurriez))

#### :house: Internal

* `react-dev-utils`, `react-error-overlay`

  * [#3028](https://github.com/facebookincubator/create-react-app/pull/3028) Make error overlay filename configurable. ([@jaredpalmer](https://github.com/jaredpalmer))

#### Committers: 4

- Anthony ([McFlurriez](https://github.com/McFlurriez))
- Erik J. Sturcke ([esturcke](https://github.com/esturcke))
- Jared Palmer ([jaredpalmer](https://github.com/jaredpalmer))
- Tharaka Wijebandara ([tharakawj](https://github.com/tharakawj))

### Migrating from 1.0.12 to 1.0.13

Inside any created project that has not been ejected, run:

```
npm install --save --save-exact react-scripts@1.0.13
```

or

```
yarn add --exact react-scripts@1.0.13
```

## 1.0.12 (August 28, 2017)

#### :bug: Bug Fix

* `react-error-overlay`
  * [#3012](https://github.com/facebookincubator/create-react-app/pull/3012) Fix module function name in error overlay. ([@gaearon](https://github.com/gaearon))

* `react-dev-utils`
  * [#2938](https://github.com/facebookincubator/create-react-app/pull/2938) Remove superfluous lodash usage. ([@Timer](https://github.com/Timer))

#### :nail_care: Enhancement

* `react-scripts`

  * [#2917](https://github.com/facebookincubator/create-react-app/pull/2917) Optimize the size of default favicon. ([@sylvainbaronnet](https://github.com/sylvainbaronnet))

#### :memo: Documentation

* `react-scripts`

  * [#2986](https://github.com/facebookincubator/create-react-app/pull/2986) Docs: debugging in WebStorm. ([@prigara](https://github.com/prigara))
  * [#2948](https://github.com/facebookincubator/create-react-app/pull/2948) Remove Modulus from user guide. ([@Zertz](https://github.com/Zertz))
  * [#2927](https://github.com/facebookincubator/create-react-app/pull/2927) Update README.md. ([@tbassetto](https://github.com/tbassetto))

* `react-dev-utils`

  * [#2942](https://github.com/facebookincubator/create-react-app/pull/2942) Fix docs for `printFileSizesAfterBuild`. ([@Kerumen](https://github.com/Kerumen))

#### :house: Internal

* `react-error-overlay`, `react-scripts`

  * [#2991](https://github.com/facebookincubator/create-react-app/pull/2991) Update `babel-runtime` dependency ([@christophehurpeau](https://github.com/christophehurpeau))

* `react-dev-utils`, `react-error-overlay`, `react-scripts`

  * [#2515](https://github.com/facebookincubator/create-react-app/pull/2515) Convert `react-error-overlay` to React ([@tharakawj](https://github.com/tharakawj))

#### Committers: 9

- Christophe Hurpeau ([christophehurpeau](https://github.com/christophehurpeau))
- Dan Abramov ([gaearon](https://github.com/gaearon))
- Ekaterina Prigara ([prigara](https://github.com/prigara))
- Joe Haddad ([Timer](https://github.com/Timer))
- Pier-Luc Gendreau ([Zertz](https://github.com/Zertz))
- Sylvain Baronnet ([sylvainbaronnet](https://github.com/sylvainbaronnet))
- Tharaka Wijebandara ([tharakawj](https://github.com/tharakawj))
- Thomas Bassetto ([tbassetto](https://github.com/tbassetto))
- Yann Pringault ([Kerumen](https://github.com/Kerumen))

### Migrating from 1.0.11 to 1.0.12

Inside any created project that has not been ejected, run:

```
npm install --save --save-exact react-scripts@1.0.12
```

or

```
yarn add --exact react-scripts@1.0.12
```

**Note:** there’s a [known issue](https://github.com/facebookincubator/create-react-app/issues/3041) that might cause the project to not compile after upgrading. In this case, migrate straight to `1.0.13` which doesn’t have this issue.

## 1.0.11 (August 9, 2017)

#### :bug: Bug Fix
* `create-react-app`
  * [#2884](https://github.com/facebookincubator/create-react-app/pull/2884) Improve offline heuristic for proxied environments. ([@bsyk](https://github.com/bsyk))

    When a Yarn proxy is set, we will check its connectivity if we cannot reach Yarn's registry. This is often the case when DNS lookups must be made through the proxy.

  * [#2853](https://github.com/facebookincubator/create-react-app/pull/2853) Allow use of scoped packages with a pinned version. ([@wileybenet](https://github.com/wileybenet))
* `react-dev-utils`
  * [#2796](https://github.com/facebookincubator/create-react-app/pull/2796) Properly escape HTML tags in error overlay. ([@ccloli](https://github.com/ccloli))

    Elements printed in their entirety would sometimes render as HTML. This should no longer happen and should properly render as text.

* `react-dev-utils`, `react-scripts`
  * [#2834](https://github.com/facebookincubator/create-react-app/pull/2834) Make `formatWebpackMessages` return all messages ([@onigoetz](https://github.com/onigoetz))
* `react-scripts`
  * [#2806](https://github.com/facebookincubator/create-react-app/pull/2806) Fix SockJS version compatibility. ([@christianbundy](https://github.com/christianbundy))
  * [#2738](https://github.com/facebookincubator/create-react-app/pull/2738) Fix Jest `node` file resolution. ([@mostafah](https://github.com/mostafah))

#### :nail_care: Enhancement
* `react-scripts`
  * [#2818](https://github.com/facebookincubator/create-react-app/pull/2818) Allow sourcemaps to be disabled. ([@viankakrisna](https://github.com/viankakrisna))

    As applications grow more complex, it is possible webpack may run out of memory while generating source maps. They may now be disabled by setting `GENERATE_SOURCEMAP=false`.

  * [#2913](https://github.com/facebookincubator/create-react-app/pull/2913) Allow flags to be passed to node when running `react-scripts`. ([@koistya](https://github.com/koistya))
  * [#2574](https://github.com/facebookincubator/create-react-app/pull/2574) Upgrade to `webpack@3`. ([@themre](https://github.com/themre))
  * [#2747](https://github.com/facebookincubator/create-react-app/pull/2747) Simplify webpack configuration using `Rule.oneOf`. ([@Furizaa](https://github.com/Furizaa))
* `react-dev-utils`, `react-scripts`
  * [#2468](https://github.com/facebookincubator/create-react-app/pull/2468) Allow importing `package.json`. ([@iamdoron](https://github.com/iamdoron))
  * [#2650](https://github.com/facebookincubator/create-react-app/pull/2650) Make UglifyJS error friendlier. ([@viankakrisna](https://github.com/viankakrisna))
* `create-react-app`
  * [#2785](https://github.com/facebookincubator/create-react-app/pull/2785) Change error wording and list conflicting files when initializing app. ([@OwenFlood](https://github.com/OwenFlood))
* `react-dev-utils`
  * [#2761](https://github.com/facebookincubator/create-react-app/pull/2761) Don't prompt to install serve if already installed. ([@OwenFlood](https://github.com/OwenFlood))
  * [#2754](https://github.com/facebookincubator/create-react-app/pull/2754) Auto-detect JetBrains IDEs. ([@danrr](https://github.com/danrr))
  * [#2740](https://github.com/facebookincubator/create-react-app/pull/2740) Support PyCharm in `launchEditor`. ([@danrr](https://github.com/danrr))
  * [#2723](https://github.com/facebookincubator/create-react-app/pull/2723) Reorder vim arguments in `launchEditor` so `--remote` works. ([@trygveaa](https://github.com/trygveaa))
* `eslint-config-react-app`, `react-scripts`
  * [#2735](https://github.com/facebookincubator/create-react-app/pull/2735) Upgrade to `eslint@4`. ([@trungdq88](https://github.com/trungdq88))
* `eslint-config-react-app`
  * [#2701](https://github.com/facebookincubator/create-react-app/pull/2701) Set `allowTaggedTemplates` to true (eslint). ([@denkristoffer](https://github.com/denkristoffer))

#### :memo: Documentation
* Other
  * [#2728](https://github.com/facebookincubator/create-react-app/pull/2728) Add Electrode to alternatives. ([@animesh10](https://github.com/animesh10))
  * [#2788](https://github.com/facebookincubator/create-react-app/pull/2788) Update link for motion. ([@viankakrisna](https://github.com/viankakrisna))
  * [#2697](https://github.com/facebookincubator/create-react-app/pull/2697) Fix env list ordering. ([@alexeyraspopov](https://github.com/alexeyraspopov))
* `react-dev-utils`
  * [#2798](https://github.com/facebookincubator/create-react-app/pull/2798) Update note about `webpackHotDevClient` support. ([@ForbesLindesay](https://github.com/ForbesLindesay))
* `react-scripts`
  * [#2822](https://github.com/facebookincubator/create-react-app/pull/2822) Add explicit "Opting Out of Caching" header. ([@gaearon](https://github.com/gaearon))
  * [#2725](https://github.com/facebookincubator/create-react-app/pull/2725) Fixed typo. ([@zeel](https://github.com/zeel))
  * [#2668](https://github.com/facebookincubator/create-react-app/pull/2668) Document `basename` feature in `react-router`. ([@viankakrisna](https://github.com/viankakrisna))
  * [#2719](https://github.com/facebookincubator/create-react-app/pull/2719) Remove Windows note for `source-map-explorer`. ([@hodanny](https://github.com/hodanny))
* `babel-preset-react-app`
  * [#2732](https://github.com/facebookincubator/create-react-app/pull/2732) Update link to issue blocking JSX hoisting. ([@ForbesLindesay](https://github.com/ForbesLindesay))

#### :house: Internal
* `create-react-app`, `eslint-config-react-app`, `react-dev-utils`, `react-error-overlay`, `react-scripts`
  * [#2923](https://github.com/facebookincubator/create-react-app/pull/2923) Update deps. ([@Timer](https://github.com/Timer))
* `eslint-config-react-app`
  * [#2718](https://github.com/facebookincubator/create-react-app/pull/2718) Re-enable flowtype warning. ([@oskarkook](https://github.com/oskarkook))
* Other
  * [#2700](https://github.com/facebookincubator/create-react-app/pull/2700) Unstage `yarn.lock` pre-commit. ([@jdcrensh](https://github.com/jdcrensh))
* `react-scripts`
  * [#2873](https://github.com/facebookincubator/create-react-app/pull/2873) Use template strings. ([@monkindey](https://github.com/monkindey))

#### Committers: 26
- 864907600cc ([ccloli](https://github.com/ccloli))
- Ade Viankakrisna Fadlil ([viankakrisna](https://github.com/viankakrisna))
- Alexey Raspopov ([alexeyraspopov](https://github.com/alexeyraspopov))
- Andreas Hoffmann ([Furizaa](https://github.com/Furizaa))
- Animesh Dutta ([animesh10](https://github.com/animesh10))
- Ben Sykes ([bsyk](https://github.com/bsyk))
- Christian Bundy ([christianbundy](https://github.com/christianbundy))
- Dan Abramov ([gaearon](https://github.com/gaearon))
- Dan Ristea ([danrr](https://github.com/danrr))
- Danny Ho ([hodanny](https://github.com/hodanny))
- Forbes Lindesay ([ForbesLindesay](https://github.com/ForbesLindesay))
- Joe Haddad ([Timer](https://github.com/Timer))
- Jon Crenshaw ([jdcrensh](https://github.com/jdcrensh))
- Kiho · Cham ([monkindey](https://github.com/monkindey))
- Konstantin Tarkus ([koistya](https://github.com/koistya))
- Kristoffer ([denkristoffer](https://github.com/denkristoffer))
- Mostafa Hajizadeh ([mostafah](https://github.com/mostafah))
- Oskar Köök ([oskarkook](https://github.com/oskarkook))
- Owen Flood ([OwenFlood](https://github.com/OwenFlood))
- Stéphane Goetz ([onigoetz](https://github.com/onigoetz))
- Trygve Aaberge ([trygveaa](https://github.com/trygveaa))
- Wiley Bennett ([wileybenet](https://github.com/wileybenet))
- [iamdoron](https://github.com/iamdoron)
- [themre](https://github.com/themre)
- zeel ([zeel](https://github.com/zeel))
- Đinh Quang Trung ([trungdq88](https://github.com/trungdq88))

### Migrating from 1.0.10 to 1.0.11

Inside any created project that has not been ejected, run:

```
npm install --save --save-exact react-scripts@1.0.11
```

or

```
yarn add --exact react-scripts@1.0.11
```

## 1.0.10 (June 29, 2017)

#### :bug: Bug Fix

* `react-dev-utils`

  * [#2692](https://github.com/facebookincubator/create-react-app/pull/2692) Fix IE11 crash in development. ([@pdhoopr](https://github.com/pdhoopr))

* `create-react-app`
  * [#2683](https://github.com/facebookincubator/create-react-app/pull/2683) Fix a typo. ([@BenBrostoff](https://github.com/BenBrostoff))

#### :memo: Documentation

* README

  * [#2402](https://github.com/facebookincubator/create-react-app/pull/2402) Added `gluestick` to the alternatives section. ([@JoeCortopassi](https://github.com/JoeCortopassi))

#### Committers: 5
- Ben Brostoff ([BenBrostoff](https://github.com/BenBrostoff))
- Forbes Lindesay ([ForbesLindesay](https://github.com/ForbesLindesay))
- Joe Haddad ([Timer](https://github.com/Timer))
- Patrick Hooper ([pdhoopr](https://github.com/pdhoopr))
- [JoeCortopassi](https://github.com/JoeCortopassi)

### Migrating from 1.0.9 to 1.0.10

Inside any created project that has not been ejected, run:

```
npm install --save --save-exact react-scripts@1.0.10
```

or

```
yarn add --exact react-scripts@1.0.10
```

## 1.0.9 (June 29, 2017)

#### :bug: Bug Fix

* `react-scripts`

  * [#2680](https://github.com/facebookincubator/create-react-app/pull/2680) Fix external CSS imports. ([@gaearon](https://github.com/gaearon))

#### :memo: Documentation

* `react-scripts`

  * [#2679](https://github.com/facebookincubator/create-react-app/pull/2679) Fix minor typo. ([@dbanck](https://github.com/dbanck))
  * [#2666](https://github.com/facebookincubator/create-react-app/pull/2666) Add more info about Apache client side routing. ([@viankakrisna](https://github.com/viankakrisna))
  * [#2671](https://github.com/facebookincubator/create-react-app/pull/2671) Add JSON and CSS to Prettier instructions. ([@jbovenschen](https://github.com/jbovenschen))

#### :house: Internal

* Other

  * [#2673](https://github.com/facebookincubator/create-react-app/pull/2673) Bootstrap with Yarn. ([@Timer](https://github.com/Timer))
  * [#2659](https://github.com/facebookincubator/create-react-app/pull/2659) Test Node 8 on Travis. ([@gaearon](https://github.com/gaearon))

#### Committers: 5

- Ade Viankakrisna Fadlil ([viankakrisna](https://github.com/viankakrisna))
- Dan Abramov ([gaearon](https://github.com/gaearon))
- Daniel Banck ([dbanck](https://github.com/dbanck))
- Jaco Bovenschen ([jbovenschen](https://github.com/jbovenschen))
- Joe Haddad ([Timer](https://github.com/Timer))

### Migrating from 1.0.8 to 1.0.9

Inside any created project that has not been ejected, run:

```
npm install --save --save-exact react-scripts@1.0.9
```

or

```
yarn add --exact react-scripts@1.0.9
```

## 1.0.8 (June 28, 2017)

#### :bug: Bug Fix
* `react-scripts`

  * [#2550](https://github.com/facebookincubator/create-react-app/pull/2550) Fix Node 8 compatibility. ([@josephfrazier](https://github.com/josephfrazier))
  * [#2610](https://github.com/facebookincubator/create-react-app/pull/2610) Fix sourcemap directory organization on Windows. ([@plusCubed](https://github.com/plusCubed))
  * [#2596](https://github.com/facebookincubator/create-react-app/pull/2596) Fix an issue with minifying emojis. ([@viankakrisna](https://github.com/viankakrisna))
  * [#2501](https://github.com/facebookincubator/create-react-app/pull/2501) Fix incorrect check if `CI` variable is set to true. ([@varnav](https://github.com/varnav))
  * [#2432](https://github.com/facebookincubator/create-react-app/pull/2432) In new projects, don't register service worker for projects using `PUBLIC_URL` for CDN. ([@jeffposnick](https://github.com/jeffposnick))
  * [#2470](https://github.com/facebookincubator/create-react-app/pull/2470) In new projects, prioritize `index.css` over `App.css`. ([@bryankang](https://github.com/bryankang))

* `react-dev-utils`

  * [#2405](https://github.com/facebookincubator/create-react-app/pull/2405) Fix detection of parent directory in `ModuleScopePlugin`. ([@diligiant](https://github.com/diligiant))
  * [#2562](https://github.com/facebookincubator/create-react-app/pull/2562) Fix eject command output. ([@paweljedrzejczyk](https://github.com/paweljedrzejczyk))

#### :nail_care: Enhancement

* `react-scripts`

  * [#2648](https://github.com/facebookincubator/create-react-app/pull/2648) Warn about large bundle sizes. ([@gaearon](https://github.com/gaearon))
  * [#2511](https://github.com/facebookincubator/create-react-app/pull/2511) Support `.web.js` extension for React Native Web. ([@mini-eggs](https://github.com/mini-eggs))
  * [#2645](https://github.com/facebookincubator/create-react-app/pull/2645) Hide confusing "Skipping static resource" message. ([@gaearon](https://github.com/gaearon))
  * [#2389](https://github.com/facebookincubator/create-react-app/pull/2389) Silence unnecessary warning from Babel. ([@gaearon](https://github.com/gaearon))
  * [#2429](https://github.com/facebookincubator/create-react-app/pull/2429) Update `sw-precache-webpack-plugin` to lastest version. ([@goldhand](https://github.com/goldhand))
  * [#2600](https://github.com/facebookincubator/create-react-app/pull/2600) Add empty mock for `dgram` Node module. ([@micopiira](https://github.com/micopiira))
  * [#2458](https://github.com/facebookincubator/create-react-app/pull/2458) Add names to module factories in development. ([@Zaccc123](https://github.com/Zaccc123))
  * [#2551](https://github.com/facebookincubator/create-react-app/pull/2551) In new projects, unregister service worker and force reload if `service-worker.js` is not found. ([@ro-savage](https://github.com/ro-savage))

* `babel-preset-react-app`, `react-dev-utils`, `react-scripts`

  * [#2658](https://github.com/facebookincubator/create-react-app/pull/2658) Bump dependencies. ([@gaearon](https://github.com/gaearon))

* `create-react-app`, `react-scripts`

  * [#2657](https://github.com/facebookincubator/create-react-app/pull/2657) Put `react-scripts` in `dependencies`, not `devDependencies`. ([@gaearon](https://github.com/gaearon))
  * [#2635](https://github.com/facebookincubator/create-react-app/pull/2635) Silence unhelpful npm warnings. ([@gaearon](https://github.com/gaearon))

* `react-dev-utils`

  * [#2637](https://github.com/facebookincubator/create-react-app/pull/2637) Auto-detect Brackets editor from error overlay. ([@petetnt](https://github.com/petetnt))
  * [#2552](https://github.com/facebookincubator/create-react-app/pull/2552) Auto-detect running editor on Windows for error overlay. ([@levrik](https://github.com/levrik))
  * [#2622](https://github.com/facebookincubator/create-react-app/pull/2622) Support opening PhpStorm for error overlay. ([@miraage](https://github.com/miraage))
  * [#2414](https://github.com/facebookincubator/create-react-app/pull/2414) Support opening WebStorm 2017+ from error overlay. ([@wirmar](https://github.com/wirmar))
  * [#2518](https://github.com/facebookincubator/create-react-app/pull/2518) Warn when trying to run on port below 1024 without admin permissions under Linux/macOS. ([@levrik](https://github.com/levrik))
  * [#2385](https://github.com/facebookincubator/create-react-app/pull/2385) Suggest just `yarn build` in output. ([@gaearon](https://github.com/gaearon))

* `create-react-app`

  * [#1945](https://github.com/facebookincubator/create-react-app/pull/1945) Fix grammar in CLI output. ([@ColinEberhardt](https://github.com/ColinEberhardt))

#### :memo: Documentation

* User Guide

  * [#2662](https://github.com/facebookincubator/create-react-app/pull/2662) Local testing docker links. ([@EnoahNetzach](https://github.com/EnoahNetzach))
  * [#2660](https://github.com/facebookincubator/create-react-app/pull/2660) Minor code style edits to user guide. ([@gaearon](https://github.com/gaearon))
  * [#2656](https://github.com/facebookincubator/create-react-app/pull/2656) Don't ask to install webpack for using Styleguidist. ([@gaearon](https://github.com/gaearon))
  * [#1641](https://github.com/facebookincubator/create-react-app/pull/1641) Add instructions to use `source-map-explorer`. ([@gr33nfury](https://github.com/gr33nfury))
  * [#2044](https://github.com/facebookincubator/create-react-app/pull/2044) Add React Styleguidist. ([@sapegin](https://github.com/sapegin))
  * [#2006](https://github.com/facebookincubator/create-react-app/pull/2006) Added instruction on how to install Prettier. ([@MrHus](https://github.com/MrHus))
  * [#1813](https://github.com/facebookincubator/create-react-app/pull/1813) Fix grammar. ([@iheng](https://github.com/iheng))
  * [#2060](https://github.com/facebookincubator/create-react-app/pull/2060) Add more info about OOM build failiure [docs]. ([@GAumala](https://github.com/GAumala))
  * [#2305](https://github.com/facebookincubator/create-react-app/pull/2305) Update docs with WebSocket proxy information. ([@jamesblight](https://github.com/jamesblight))
  * [#2445](https://github.com/facebookincubator/create-react-app/pull/2445) Document `REACT_EDITOR` environment variable. ([@wirmar](https://github.com/wirmar))
  * [#2362](https://github.com/facebookincubator/create-react-app/pull/2362) Add yarn example under "Installing a Dependency". ([@BrianDGLS](https://github.com/BrianDGLS))
  * [#2423](https://github.com/facebookincubator/create-react-app/pull/2423) Add docs for setting up CircleCI for CRA. ([@knowbody](https://github.com/knowbody))
  * [#2427](https://github.com/facebookincubator/create-react-app/pull/2427) Added link to tutorial on code splitting. ([@jayair](https://github.com/jayair))
  * [#2447](https://github.com/facebookincubator/create-react-app/pull/2447) Fix wrong comment on Proxy guide. ([@hellowin](https://github.com/hellowin))
  * [#2538](https://github.com/facebookincubator/create-react-app/pull/2538) Fix broken link to a tutorial. ([@romanyanke](https://github.com/romanyanke))
  * [#2522](https://github.com/facebookincubator/create-react-app/pull/2522) Flow init to run as command not flag. ([@khanglu](https://github.com/khanglu))
  * [#2521](https://github.com/facebookincubator/create-react-app/pull/2521) Fix broken link to Storybook docs. ([@shilman](https://github.com/shilman))
  * [#2500](https://github.com/facebookincubator/create-react-app/pull/2500) Fix minor typo. ([@AlexxNica](https://github.com/AlexxNica))
  * [#2331](https://github.com/facebookincubator/create-react-app/pull/2331) Re-add storybook && update the documentation and links. ([@ndelangen](https://github.com/ndelangen))
  * [#2454](https://github.com/facebookincubator/create-react-app/pull/2454) Update Travis CI Node versions in User Guide. ([@ryansully](https://github.com/ryansully))
  * [#2420](https://github.com/facebookincubator/create-react-app/pull/2420) Fix typo. ([@ruskakimov](https://github.com/ruskakimov))
  * [#2392](https://github.com/facebookincubator/create-react-app/pull/2392) Update `jest-enzyme` section. ([@luftywiranda13](https://github.com/luftywiranda13))

* README

  * [#2517](https://github.com/facebookincubator/create-react-app/pull/2517) Add Razzle to the alternatives. ([@kireerik](https://github.com/kireerik))
  * [#1931](https://github.com/facebookincubator/create-react-app/pull/1931) Updated README. ([@shaunwallace](https://github.com/shaunwallace))
  * [#2492](https://github.com/facebookincubator/create-react-app/pull/2492) Update webpack links to point to webpack 2. ([@laruiss](https://github.com/laruiss))

#### :house: Internal

* Other

  * [#2465](https://github.com/facebookincubator/create-react-app/pull/2465) Update Prettier to v1. ([@ianschmitz](https://github.com/ianschmitz))
  * [#2489](https://github.com/facebookincubator/create-react-app/pull/2489) chore(templates): Move GitHub templates to hidden .github folder. ([@glennreyes](https://github.com/glennreyes))
  * [#2400](https://github.com/facebookincubator/create-react-app/pull/2400) Added cache clear to e2e scripts. ([@ro-savage](https://github.com/ro-savage))
  * [#2397](https://github.com/facebookincubator/create-react-app/pull/2397) Fix command in e2e-kitchensink.sh cleanup. ([@ro-savage](https://github.com/ro-savage))
  * [#2388](https://github.com/facebookincubator/create-react-app/pull/2388) Fix wrong path expansion in end-to-end test. ([@gaearon](https://github.com/gaearon))
  * [#2387](https://github.com/facebookincubator/create-react-app/pull/2387) Catch "No tests found" during CI. ([@EnoahNetzach](https://github.com/EnoahNetzach))

* `react-scripts`

  * [#2408](https://github.com/facebookincubator/create-react-app/pull/2408) E2E testing enhancements. ([@EnoahNetzach](https://github.com/EnoahNetzach))
  * [#2430](https://github.com/facebookincubator/create-react-app/pull/2430) Remove an unnecessary webpack option. ([@andykenward](https://github.com/andykenward))

* `react-dev-utils`

  * [#2483](https://github.com/facebookincubator/create-react-app/pull/2483) Remove a scoped package dependency. ([@Timer](https://github.com/Timer))

#### Committers: 46
- Ade Viankakrisna Fadlil ([viankakrisna](https://github.com/viankakrisna))
- Alexandre Nicastro ([AlexxNica](https://github.com/AlexxNica))
- Andi N. Dirgantara ([hellowin](https://github.com/hellowin))
- Andy Kenward ([andykenward](https://github.com/andykenward))
- Artem Sapegin ([sapegin](https://github.com/sapegin))
- Ashton ([ashtonsix](https://github.com/ashtonsix))
- Brian Douglas ([BrianDGLS](https://github.com/BrianDGLS))
- Colin Eberhardt ([ColinEberhardt](https://github.com/ColinEberhardt))
- Colin Galindo ([gr33nfury](https://github.com/gr33nfury))
- Dan Abramov ([gaearon](https://github.com/gaearon))
- Daniel Ciao ([plusCubed](https://github.com/plusCubed))
- Erik Engi ([kireerik](https://github.com/kireerik))
- Evan Jones ([mini-eggs](https://github.com/mini-eggs))
- Fabrizio Castellarin ([EnoahNetzach](https://github.com/EnoahNetzach))
- Frédéric Miserey ([diligiant](https://github.com/diligiant))
- Gabriel Aumala ([GAumala](https://github.com/GAumala))
- Glenn Reyes ([glennreyes](https://github.com/glennreyes))
- Heng Li  ([iheng](https://github.com/iheng))
- Ian Schmitz ([ianschmitz](https://github.com/ianschmitz))
- James Blight ([jamesblight](https://github.com/jamesblight))
- Jay V ([jayair](https://github.com/jayair))
- Jeffrey Posnick ([jeffposnick](https://github.com/jeffposnick))
- Joe Haddad ([Timer](https://github.com/Timer))
- Joseph Frazier ([josephfrazier](https://github.com/josephfrazier))
- Khang Lu ([khanglu](https://github.com/khanglu))
- Levin Rickert ([levrik](https://github.com/levrik))
- Lufty Wiranda ([luftywiranda13](https://github.com/luftywiranda13))
- Maarten Hus ([MrHus](https://github.com/MrHus))
- Marius Wirtherle ([wirmar](https://github.com/wirmar))
- Mateusz Zatorski ([knowbody](https://github.com/knowbody))
- Michael Shilman ([shilman](https://github.com/shilman))
- Mico Piira ([micopiira](https://github.com/micopiira))
- Mikhail Osher ([miraage](https://github.com/miraage))
- Norbert de Langen ([ndelangen](https://github.com/ndelangen))
- Paweł Jędrzejczyk ([paweljedrzejczyk](https://github.com/paweljedrzejczyk))
- Pete Nykänen ([petetnt](https://github.com/petetnt))
- Ro Savage ([ro-savage](https://github.com/ro-savage))
- Roman ([romanyanke](https://github.com/romanyanke))
- Rustem Kakimov ([ruskakimov](https://github.com/ruskakimov))
- Ryan Sullivan ([ryansully](https://github.com/ryansully))
- Stanislas Ormières ([laruiss](https://github.com/laruiss))
- Will Farley ([goldhand](https://github.com/goldhand))
- Zac Kwan ([Zaccc123](https://github.com/Zaccc123))
- [bryankang](https://github.com/bryankang)
- [varnav](https://github.com/varnav)
- shaun wallace ([shaunwallace](https://github.com/shaunwallace))

### Migrating from 1.0.7 to 1.0.8

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@1.0.8
```

or

```
yarn add --dev --exact react-scripts@1.0.8
```

**If you previously used `HTTPS=true` environment variable in development**, make sure you aren't affected by a now-fixed vulnerability in Webpack by [visiting this page](http://badcert.mike.works/). You can read more about the vulnerability [here](https://medium.com/@mikenorth/webpack-preact-cli-vulnerability-961572624c54).

You may optionally then move `react-scripts` from `devDependencies` to `dependencies` since that’s how we’ll structure newly created projects. It is not necessary though.

If you left the service worker integration enabled and didn’t change how it works, you can replace `src/registerServiceWorker.js` with [this updated version](https://raw.githubusercontent.com/facebookincubator/create-react-app/895c475d3fc218c65dcac9a3ef3f2c0ea746a1ed/packages/react-scripts/template/src/registerServiceWorker.js).

If you haven't changed the default CSS organization, you may want to apply [this fix](https://github.com/facebookincubator/create-react-app/pull/2470/files) that makes `index.css` take precedence over `App.css` in your project.

## 1.0.7 (May 27, 2017)

#### :bug: Bug Fix

* `react-scripts`

  * [#2382](https://github.com/facebookincubator/create-react-app/pull/2382) Consistently set environment variables. ([@gaearon](https://github.com/gaearon))
  * [#2379](https://github.com/facebookincubator/create-react-app/pull/2379) Temporarily disable `comparisons` feature in uglify compression. ([@davidascher](https://github.com/davidascher))

#### :nail_care: Enhancement

* `react-scripts`

  * [#2383](https://github.com/facebookincubator/create-react-app/pull/2383) Update webpack to 2.6.1. ([@gaearon](https://github.com/gaearon))
  * [#2349](https://github.com/facebookincubator/create-react-app/pull/2349) Update webpack to v2.6.0. ([@ingro](https://github.com/ingro))
  * [#2351](https://github.com/facebookincubator/create-react-app/pull/2351) Removed the overriding of `reduce_vars` since webpack v2.6.0 included fix of Uglify. ([@Zaccc123](https://github.com/Zaccc123))

* `react-dev-utils`, `react-scripts`

  * [#2361](https://github.com/facebookincubator/create-react-app/pull/2361) Print file sizes with correct build folder path. ([@fezhengjin](https://github.com/fezhengjin))

#### :memo: Documentation

* `react-scripts`

  * [#2372](https://github.com/facebookincubator/create-react-app/pull/2372) Update README.md for `now` deployments. ([@purplecones](https://github.com/purplecones))
  * [#2350](https://github.com/facebookincubator/create-react-app/pull/2350) Fix broken links. ([@gaearon](https://github.com/gaearon))

#### Committers: 6
- Dan Abramov ([gaearon](https://github.com/gaearon))
- David Ascher ([davidascher](https://github.com/davidascher))
- Emanuele Ingrosso ([ingro](https://github.com/ingro))
- Jin Zheng ([fezhengjin](https://github.com/fezhengjin))
- Mirza Joldic ([purplecones](https://github.com/purplecones))
- Zac Kwan ([Zaccc123](https://github.com/Zaccc123))

### Migrating from 1.0.6 to 1.0.7

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@1.0.7
```

or

```
yarn add --dev --exact react-scripts@1.0.7
```

## 1.0.6 (May 24, 2017)

#### :bug: Bug Fix

* `eslint-config-react-app`, `react-error-overlay`, `react-scripts`

  * [#2346](https://github.com/facebookincubator/create-react-app/pull/2346) Resolve Flow errors in an ESLint plugin. ([@iainbeeston](https://github.com/iainbeeston))

* `react-dev-utils`

  * [#2332](https://github.com/facebookincubator/create-react-app/pull/2332) Fix proxying issues with backends that don't support IPv6. ([@Timer](https://github.com/Timer))

#### :nail_care: Enhancement
* `react-scripts`

  * [#2347](https://github.com/facebookincubator/create-react-app/pull/2347) Don't precache `/__*` URLs to fix Firebase hosting. ([@ryansully](https://github.com/ryansully))

#### :memo: Documentation

* README

  * [#2334](https://github.com/facebookincubator/create-react-app/pull/2334) Add missing files to the list. ([@jesselpalmer](https://github.com/jesselpalmer))

#### Committers: 4
- Iain Beeston ([iainbeeston](https://github.com/iainbeeston))
- Jesse Palmer ([jesselpalmer](https://github.com/jesselpalmer))
- Joe Haddad ([Timer](https://github.com/Timer))
- Ryan Sullivan ([ryansully](https://github.com/ryansully))

### Migrating from 1.0.5 to 1.0.6

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@1.0.6
```

or

```
yarn add --dev --exact react-scripts@1.0.6
```

## 1.0.5 (May 22, 2017)

#### :bug: Bug Fix
* `react-dev-utils`, `react-scripts`

  * [#2326](https://github.com/facebookincubator/create-react-app/pull/2326) Files in `public/` folder should not be requested through proxy. ([@gaearon](https://github.com/gaearon))

#### :nail_care: Enhancement
* `react-dev-utils`

  * [#2327](https://github.com/facebookincubator/create-react-app/pull/2327) Limit console warnings to 5 files at most. ([@gaearon](https://github.com/gaearon))

* `eslint-config-react-app`

  * [#2325](https://github.com/facebookincubator/create-react-app/pull/2325) Allow declaring variables before use in a scope above. ([@gaearon](https://github.com/gaearon))

#### :house: Internal
* `react-dev-utils`, `react-scripts`

  * [#2320](https://github.com/facebookincubator/create-react-app/pull/2320) Remove unnecessary dependencies. ([@pmadar](https://github.com/pmadar))

#### Committers: 2
- Dan Abramov ([gaearon](https://github.com/gaearon))
- Pavol Madar ([pmadar](https://github.com/pmadar))

### Migrating from 1.0.4 to 1.0.5

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@1.0.5
```

or

```
yarn add --dev --exact react-scripts@1.0.5
```

## 1.0.4 (May 22, 2017)

#### :bug: Bug Fix

* `react-error-overlay`
  * Fix a regression in published package.

### Migrating from 1.0.3 to 1.0.4

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@1.0.4
```

or

```
yarn add --dev --exact react-scripts@1.0.4
```

## 1.0.3 (May 21, 2017)

#### :bug: Bug Fix

* `react-dev-utils`
  * [#2297](https://github.com/facebookincubator/create-react-app/pull/2297) Don’t serve the development version from public IPs by default. ([@Timer](https://github.com/Timer))

* `eslint-config-react-app`
  * [#2311](https://github.com/facebookincubator/create-react-app/pull/2311) Disable `flowtype/require-valid-file-annotation` lint rule due to false positives. ([@Robdel12](https://github.com/Robdel12))

* `react-dev-utils`, `react-error-overlay`
  * [#2301](https://github.com/facebookincubator/create-react-app/pull/2301) Wrap more `console` calls into a check. ([@BrodaNoel](https://github.com/BrodaNoel))

* `react-scripts`
  * [#2314](https://github.com/facebookincubator/create-react-app/pull/2314) Fix a "File not found" false positive. ([@gaearon](https://github.com/gaearon))

#### Committers: 4
- Broda Noel ([BrodaNoel](https://github.com/BrodaNoel))
- Dan Abramov ([gaearon](https://github.com/gaearon))
- Joe Haddad ([Timer](https://github.com/Timer))
- Robert DeLuca ([Robdel12](https://github.com/Robdel12))

### Migrating from 1.0.2 to 1.0.3

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@1.0.3
```

or

```
yarn add --dev --exact react-scripts@1.0.3
```

## 1.0.2 (May 20, 2017)

#### :bug: Bug Fix

* `react-dev-utils`, `react-scripts`

  * [#2276](https://github.com/facebookincubator/create-react-app/pull/2276) Serve a no-op service worker in development to ensure it doesn't cache the production build even if it was served on the same port. ([@jeffposnick](https://github.com/jeffposnick))

* `react-dev-utils`, `react-error-overlay`

  * [#2290](https://github.com/facebookincubator/create-react-app/pull/2290) Wrap console calls into a check for IE9. ([@gaearon](https://github.com/gaearon))

* `react-dev-utils`

  * [#2282](https://github.com/facebookincubator/create-react-app/pull/2282) Add Windows Subsystem for Linux support to the error overlay. ([@noinkling](https://github.com/noinkling))
  * [#2269](https://github.com/facebookincubator/create-react-app/pull/2269) Fix a missing package dependency. ([@GreenGremlin](https://github.com/GreenGremlin))

#### :nail_care: Enhancement

* `react-scripts`

  * [#2221](https://github.com/facebookincubator/create-react-app/pull/2221) Ejecting should ensure you have clean `git status`. ([@milocosmopolitan](https://github.com/milocosmopolitan))
  * [#2288](https://github.com/facebookincubator/create-react-app/pull/2288) Only enable host check if you use proxy, and add a way to opt out of it. ([@gaearon](https://github.com/gaearon))

#### :house: Internal

* `react-dev-utils`, `react-scripts`

  * [#2283](https://github.com/facebookincubator/create-react-app/pull/2283) Remove unnecessary dependencies(#751). ([@pmadar](https://github.com/pmadar))

#### Committers: 6
- Dan Abramov ([gaearon](https://github.com/gaearon))
- Jeffrey Posnick ([jeffposnick](https://github.com/jeffposnick))
- Jonathan ([GreenGremlin](https://github.com/GreenGremlin))
- Malcolm ([noinkling](https://github.com/noinkling))
- Milo Kang ([milocosmopolitan](https://github.com/milocosmopolitan))
- [pmadar](https://github.com/pmadar)

### Migrating from 1.0.1 to 1.0.2

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@1.0.2
```

or

```
yarn add --dev --exact react-scripts@1.0.2
```

If you previously had issues with an `Invalid Host Header` error, [follow these new instructions](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#invalid-host-header-errors-after-configuring-proxy) to fix it.

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

So instead of just enumerating them here, we decided to write a blog post about all the new features.<br>
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

#### Some of my tests started crashing because of unhandled rejections

Unhandled Promise rejections will now crash tests. You can fix them by explicitly catching the errors you don’t care about.

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
