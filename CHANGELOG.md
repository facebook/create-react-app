## 0.9.2 (February 26, 2017)

#### :nail_care: Enhancement

* `create-react-app`
  * [#1253](https://github.com/facebookincubator/create-react-app/pull/1253) **Install time optimization.** ([@n3tr](https://github.com/n3tr))

    React, ReactDOM, and `react-scripts` are now installed in the same install instead of two different installs. This reduces app creation time by a noticeable amount.

  * [#1512](https://github.com/facebookincubator/create-react-app/pull/1512) **Graceful error handling.** ([@chitchu](https://github.com/chitchu))

    If an error occurs while `create-react-app` is running, it will now clean up and not leave a broken project to reduce confusion.

  * [#1193](https://github.com/facebookincubator/create-react-app/pull/1193) Suggest upgrading to NPM >= 3 for faster install times. ([@mobinni](https://github.com/mobinni))

  * [#1603](https://github.com/facebookincubator/create-react-app/pull/1603) Allow app creation in a WebStorm project. ([@driquelme](https://github.com/driquelme))

  * [#1570](https://github.com/facebookincubator/create-react-app/pull/1570) Allow git urls in `--scripts-version`. ([@tomconroy](https://github.com/tomconroy))

* `react-scripts`
  * [#1578](https://github.com/facebookincubator/create-react-app/pull/1578) Enable lint caching in development. ([@viankakrisna](https://github.com/viankakrisna))

  * [#1478](https://github.com/facebookincubator/create-react-app/pull/1478) Update the build script message to show the correct port. ([@chyipin](https://github.com/chyipin))

  * [#1567](https://github.com/facebookincubator/create-react-app/pull/1567) Remove .bin files after eject. ([@tuchk4](https://github.com/tuchk4))

  * [#1560](https://github.com/facebookincubator/create-react-app/pull/1560) Bump `recursive-readdir`. ([@wtgtybhertgeghgtwtg](https://github.com/wtgtybhertgeghgtwtg))

#### :bug: Bug Fix
* `react-scripts`

  * [#1635](https://github.com/facebookincubator/create-react-app/pull/1635) **Fix Jest configuration.** ([@Timer](https://github.com/Timer))

    Fixes ejecting on Windows for macOS and Linux machines.

  * [#1356](https://github.com/facebookincubator/create-react-app/pull/1356) Fix workflow if react-scripts package is linked via npm-link. ([@tuchk4](https://github.com/tuchk4))

    Advanced users may opt to fork `react-scripts` instead of ejecting so they still receive upstream updates.<br>
    `react-scripts` will now function as expected when linking to a development version.<br>
    Previously, you could not test changes with an existing application via linking.

  * [#1585](https://github.com/facebookincubator/create-react-app/pull/1585) Ensure PORT environment variable is an integer. ([@matoilic](https://github.com/matoilic))

  * [#1628](https://github.com/facebookincubator/create-react-app/pull/1628) Show correct port for pushstate-server URL text. ([@mattccrampton](https://github.com/mattccrampton))

  * [#1647](https://github.com/facebookincubator/create-react-app/pull/1647) Fix `npm test` on Windows ([@gaearon](https://github.com/gaearon))


#### :memo: Documentation
* User Guides
  * [#1391](https://github.com/facebookincubator/create-react-app/pull/1391) Add note how to resolve missing required files for Heroku. ([@sbritoig](https://github.com/sbritoig))
  * [#1577](https://github.com/facebookincubator/create-react-app/pull/1577) Add a how-to on `react-snapshot`. ([@superhighfives](https://github.com/superhighfives))
  * [#1121](https://github.com/facebookincubator/create-react-app/pull/1121) Add documentation for customizing Bootstrap theme. ([@myappincome](https://github.com/myappincome))
  * [#1540](https://github.com/facebookincubator/create-react-app/pull/1540) Document debugging in Visual Studio Code. ([@bondz](https://github.com/bondz))
  * [#1618](https://github.com/facebookincubator/create-react-app/pull/1618) Add note about when to import Bootstrap CSS. ([@joewoodhouse](https://github.com/joewoodhouse))
  * [#1518](https://github.com/facebookincubator/create-react-app/pull/1518) Update flow configuration documentation. ([@SBrown52](https://github.com/SBrown52))
  * [#1625](https://github.com/facebookincubator/create-react-app/pull/1625) Specify that NODE_ENV is set to 'production' during the build step. ([@mderazon](https://github.com/mderazon))
  * [#1573](https://github.com/facebookincubator/create-react-app/pull/1573) Update Jest documentation links. ([@mkermani144](https://github.com/mkermani144))
  * [#1564](https://github.com/facebookincubator/create-react-app/pull/1564) Add --recursive to Sass watch script. ([@aleburato](https://github.com/aleburato))
  * [#1561](https://github.com/facebookincubator/create-react-app/pull/1561) Use https in link in documentation. ([@dariocravero](https://github.com/dariocravero))
  * [#1562](https://github.com/facebookincubator/create-react-app/pull/1562) Update `jest-enzyme` documentation. ([@kiranps](https://github.com/kiranps))
  * [#1543](https://github.com/facebookincubator/create-react-app/pull/1543) Update CSS preprocessor instructions. ([@aleburato](https://github.com/aleburato))
  * [#1338](https://github.com/facebookincubator/create-react-app/pull/1338) Add link to Azure deployment tutorial. ([@tpetrina](https://github.com/tpetrina))
  * [#1320](https://github.com/facebookincubator/create-react-app/pull/1320) Document how to disable autoprefix feature. ([@rrubas](https://github.com/rrubas))
  * [#1313](https://github.com/facebookincubator/create-react-app/pull/1313) List features beyond ES6 supported by create-react-app. ([@jonathanconway](https://github.com/jonathanconway))
  * [#1008](https://github.com/facebookincubator/create-react-app/pull/1008) Add Saas support documentation. ([@tsironis](https://github.com/tsironis))
  * [#994](https://github.com/facebookincubator/create-react-app/pull/994) Suggest `jest-enzyme` for simplifying test matchers. ([@blainekasten](https://github.com/blainekasten))
  * [#1608](https://github.com/facebookincubator/create-react-app/pull/1608) Add note for using CHOKIDAR_USEPOLLING in virtual machines to enable HMR. ([@AJamesPhillips](https://github.com/AJamesPhillips))
  * [#1495](https://github.com/facebookincubator/create-react-app/pull/1495) Add useful link to react-scripts. ([@pd4d10](https://github.com/pd4d10))
* READMEs
  * [#1576](https://github.com/facebookincubator/create-react-app/pull/1576) Switch from Neo to Neutrino. ([@eliperelman](https://github.com/eliperelman))
  * [#1275](https://github.com/facebookincubator/create-react-app/pull/1275) Suggest yarn commands in addition to npm. ([@lifez](https://github.com/lifez))

#### :house: Internal
* `babel-preset-react-app`
  * [#1598](https://github.com/facebookincubator/create-react-app/pull/1598) Remove redundant babel-plugin-transform-es2015-parameters. ([@christophehurpeau](https://github.com/christophehurpeau))
* Other
  * [#1534](https://github.com/facebookincubator/create-react-app/pull/1534) Use yarn@latest in e2e. ([@gaearon](https://github.com/gaearon))
  * [#1295](https://github.com/facebookincubator/create-react-app/pull/1295) Make node version check more robust in e2e. ([@pugnascotia](https://github.com/pugnascotia))
  * [#1503](https://github.com/facebookincubator/create-react-app/pull/1503) Fix `test -e` in e2e. ([@igetgames](https://github.com/igetgames))

#### Committers: 36
- Ade Viankakrisna Fadlil ([viankakrisna](https://github.com/viankakrisna))
- Alessandro Burato ([aleburato](https://github.com/aleburato))
- Alexander James Phillips ([AJamesPhillips](https://github.com/AJamesPhillips))
- Blaine Kasten ([blainekasten](https://github.com/blainekasten))
- Bond ([bondz](https://github.com/bondz))
- Charlie Gleason ([superhighfives](https://github.com/superhighfives))
- Christophe Hurpeau ([christophehurpeau](https://github.com/christophehurpeau))
- Dan Abramov ([gaearon](https://github.com/gaearon))
- Daniel Riquelme ([driquelme](https://github.com/driquelme))
- Darío Javier Cravero ([dariocravero](https://github.com/dariocravero))
- Dimitris Tsironis ([tsironis](https://github.com/tsironis))
- Eli Perelman ([eliperelman](https://github.com/eliperelman))
- Jirat Ki. ([n3tr](https://github.com/n3tr))
- Joe Haddad ([Timer](https://github.com/Timer))
- Joe Woodhouse ([joewoodhouse](https://github.com/joewoodhouse))
- Jonathan Conway ([jonathanconway](https://github.com/jonathanconway))
- Marcus R. Brown ([igetgames](https://github.com/igetgames))
- Mato Ilic ([matoilic](https://github.com/matoilic))
- Matt Crampton ([mattccrampton](https://github.com/mattccrampton))
- Michael DeRazon ([mderazon](https://github.com/mderazon))
- Mo Binni ([mobinni](https://github.com/mobinni))
- Mohammad Kermani ([mkermani144](https://github.com/mkermani144))
- Phawin Khongkhasawan ([lifez](https://github.com/lifez))
- Roman Rubas ([rrubas](https://github.com/rrubas))
- Rory Hunter ([pugnascotia](https://github.com/pugnascotia))
- Tom Conroy ([tomconroy](https://github.com/tomconroy))
- Toni Petrina ([tpetrina](https://github.com/tpetrina))
- Valerii Sorokobatko ([tuchk4](https://github.com/tuchk4))
- Vicente Jr Yuchitcho ([chitchu](https://github.com/chitchu))
- [SBrown52](https://github.com/SBrown52)
- [chyipin](https://github.com/chyipin)
- [myappincome](https://github.com/myappincome)
- [sbritoig](https://github.com/sbritoig)
- [wtgtybhertgeghgtwtg](https://github.com/wtgtybhertgeghgtwtg)
- kiran ps ([kiranps](https://github.com/kiranps))
- pd4d10 ([pd4d10](https://github.com/pd4d10))

### Migrating from 0.9.0 to 0.9.2

**Note:** 0.9.1 had known issues so you should skip it.

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.9.2
```

You may also optionally update the global command-line utility for more efficient installs (thanks [@n3tr](https://github.com/n3tr)):

```
npm install -g create-react-app@1.1.0
```

## <s>0.9.1 (February 25, 2017)</s>

This release has known issues and you should skip it. Update directly to 0.9.2 instead.

## 0.9.0 (February 11, 2017)

Thanks to [@Timer](https://github.com/timer) for cutting this release.

#### :rocket: New Feature

* `react-scripts`

  * [#1489](https://github.com/facebookincubator/create-react-app/pull/1489) Support setting `"homepage"` to `"."` to generate relative asset paths. ([@tibdex](https://github.com/tibdex))

    Applications that don’t use the HTML5 `pushState` API can now be built to be served from any relative URL. To enable this, specify `"."` as your `homepage` setting in `package.json`. It used to be possible before with a few known bugs, but they should be fixed now. See [Serving the Same Build from Different Paths](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#serving-the-same-build-from-different-paths).

  * [#937](https://github.com/facebookincubator/create-react-app/pull/1504) Add `PUBLIC_URL` environment variable for advanced use. ([@EnoahNetzach](https://github.com/EnoahNetzach))

    If you use a CDN to serve the app, you can now specify `PUBLIC_URL` environment variable to override the base URL (including the hostname) for resources referenced from the built code. This new variable is mentioned in the new [Advanced Configuration](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#advanced-configuration) section.

  * [#1440](https://github.com/facebookincubator/create-react-app/pull/1440) Make all `REACT_APP_*` environment variables accessible in `index.html`. ([@jihchi](https://github.com/jihchi))

    This makes all environment variables previously available in JS, also available in the HTML file, for example `%REACT_APP_MY_VARIABLE%`. See [Referencing Environment Variables in HTML](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#referencing-environment-variables-in-the-html).

* `react-dev-utils`

  * [#1148](https://github.com/facebookincubator/create-react-app/pull/1148) Configure which browser to open with `npm start`. ([@GAumala](https://github.com/GAumala))

    You can now disable the automatic browser launching by setting the `BROWSER` environment variable to `none`. You can also specify a different browser (or an arbitrary script) to open by default, [as supported by `opn` command](https://github.com/sindresorhus/opn#app) that we use under the hood. See [Advanced Configuration](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#advanced-configuration).

#### :boom: Breaking Change

* `react-scripts`

  * [#1522](https://github.com/facebookincubator/create-react-app/pull/1522) Upgrade dependencies. ([@Timer](https://github.com/Timer))
  * [#1432](https://github.com/facebookincubator/create-react-app/pull/1432) Bump Jest version. ([@gaearon](https://github.com/gaearon))
  * [#1311](https://github.com/facebookincubator/create-react-app/pull/1311) Updated `babel-jest` and `jest` packages to 18.0.0. ([@lopezator](https://github.com/lopezator))

    Jest has been updated to 18 and has introduced some [breaking changes and new features](https://facebook.github.io/jest/blog/2016/12/15/2016-in-jest.html).

* `react-scripts`, `react-dev-utils`

  * [#1264](https://github.com/facebookincubator/create-react-app/pull/1264) Remove interactive shell check when opening browser on start. ([@CaryLandholt](https://github.com/CaryLandholt))

    Non-interactive terminals no longer automatically disable launching of the browser. Instead, you need to [specify `none` as `BROWSER` environment variable](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#advanced-configuration) if you wish to disable it.

#### :bug: Bug Fix

* `react-scripts`

  * [#1441](https://github.com/facebookincubator/create-react-app/pull/1441) Added `babel-runtime` dependency to deduplicate dependencies when using Yarn. ([@jkimbo](https://github.com/jkimbo))

    This works around a bug in Yarn that caused newly created projects to be over 400MB. Now they are down to 126MB, just like with npm 3.

  * [#1522](https://github.com/facebookincubator/create-react-app/pull/1522) Upgrade dependencies. ([@Timer](https://github.com/Timer))
  * [#1458](https://github.com/facebookincubator/create-react-app/pull/1458) Additionally remove `react-scripts` from dependencies on eject. ([@creynders](https://github.com/creynders))
  * [#1309](https://github.com/facebookincubator/create-react-app/pull/1309) Bump `babel-loader` version (#1009). ([@frontsideair](https://github.com/frontsideair))
  * [#1267](https://github.com/facebookincubator/create-react-app/pull/1267) Only gitignore directories in root, not deep. ([@jayphelps](https://github.com/jayphelps))

* `react-dev-utils`

  * [#1377](https://github.com/facebookincubator/create-react-app/pull/1377) webpack-dev-server patch for 'still-ok' success status. ([@TheBlackBolt](https://github.com/TheBlackBolt))
  * [#1274](https://github.com/facebookincubator/create-react-app/pull/1274) Downgrading to compatible version of SockJS-Client. ([@holloway](https://github.com/holloway))
  * [#1247](https://github.com/facebookincubator/create-react-app/pull/1247) Only open Chrome tab if BROWSER is missing or is Chrome. ([@gaearon](https://github.com/gaearon))

#### :nail_care: Enhancement

* `react-scripts`

  * [#1496](https://github.com/facebookincubator/create-react-app/pull/1496) Make build exit with error code when interrupted. ([@brandones](https://github.com/brandones))
  * [#1352](https://github.com/facebookincubator/create-react-app/pull/1352) More descriptive error message for `env.CI = true` warnings causing failures. ([@jayphelps](https://github.com/jayphelps))
  * [#1264](https://github.com/facebookincubator/create-react-app/pull/1264) Remove interactive shell check when opening browser on start. ([@CaryLandholt](https://github.com/CaryLandholt))
  * [#1311](https://github.com/facebookincubator/create-react-app/pull/1311) Updated `babel-jest` and `jest` packages to 18.0.0. ([@lopezator](https://github.com/lopezator))
  * [#1432](https://github.com/facebookincubator/create-react-app/pull/1432) Bump Jest version. ([@gaearon](https://github.com/gaearon))
  * [#1507](https://github.com/facebookincubator/create-react-app/pull/1507) fix: add yarn gitignores. ([@adjohnson916](https://github.com/adjohnson916))
  * [#1510](https://github.com/facebookincubator/create-react-app/pull/1510) Add missing `'\n'` to the end of `package.json` file. ([@pd4d10](https://github.com/pd4d10))
  * [#1324](https://github.com/facebookincubator/create-react-app/pull/1324) Use npm script hooks to avoid `&&` in deploy script. ([@zpao](https://github.com/zpao))

* `create-react-app`

  * [#1270](https://github.com/facebookincubator/create-react-app/pull/1270) gh-1269: Enabling nested folder paths for project name. ([@dinukadesilva](https://github.com/dinukadesilva))


#### :memo: Documentation

* User Guide

  * [#1515](https://github.com/facebookincubator/create-react-app/pull/1515) readme: Advanced Configuration. ([@Timer](https://github.com/Timer))
  * [#1513](https://github.com/facebookincubator/create-react-app/pull/1513) clarifying the use of custom environment variables. ([@calweb](https://github.com/calweb))
  * [#1511](https://github.com/facebookincubator/create-react-app/pull/1511) Change "OS X" references to "macOS". ([@RodrigoHahn](https://github.com/RodrigoHahn))
  * [#1482](https://github.com/facebookincubator/create-react-app/pull/1482) Edit User Guide: Add ESLint config for VS Code users. ([@vulong23](https://github.com/vulong23))
  * [#1483](https://github.com/facebookincubator/create-react-app/pull/1483) Reflect websocket proxy support on README (#1013). ([@frontsideair](https://github.com/frontsideair))
  * [#1453](https://github.com/facebookincubator/create-react-app/pull/1453) Readme: Removes experimental from Jest snapshot. ([@frehner](https://github.com/frehner))
  * [#1437](https://github.com/facebookincubator/create-react-app/pull/1437) Added links to tutorials for integrating cra with an api backend. ([@alexdriaguine](https://github.com/alexdriaguine))
  * [#1422](https://github.com/facebookincubator/create-react-app/pull/1422) Add causes of dev server not detecting changes. ([@jetpackpony](https://github.com/jetpackpony))
  * [#1260](https://github.com/facebookincubator/create-react-app/pull/1260) Heroku Deployment: Adds a note on how to resolve "File/Module Not Found Errors" . ([@MsUzoAgu](https://github.com/MsUzoAgu))
  * [#1256](https://github.com/facebookincubator/create-react-app/pull/1256) Add "Changing the Page Title" to User Guide. ([@gaearon](https://github.com/gaearon))
  * [#1245](https://github.com/facebookincubator/create-react-app/pull/1245) Replace the Flow documentation section. ([@gaearon](https://github.com/gaearon))
  * [#1514](https://github.com/facebookincubator/create-react-app/pull/1514) corrected minor typo. ([@crowchirp](https://github.com/crowchirp))
  * [#1393](https://github.com/facebookincubator/create-react-app/pull/1393) replace two space syntax with br tag. ([@carlsagan21](https://github.com/carlsagan21))
  * [#1384](https://github.com/facebookincubator/create-react-app/pull/1384) Document Flow support. ([@dschep](https://github.com/dschep))

* READMEs

  * [#1375](https://github.com/facebookincubator/create-react-app/pull/1375) Change console.log for errors and warnings. ([@jimmyhmiller](https://github.com/jimmyhmiller))
  * [#1369](https://github.com/facebookincubator/create-react-app/pull/1369) Add missing import in react-dev-utils README.md. ([@pedronauck](https://github.com/pedronauck))

#### :house: Internal

* Internal Test Suite

  * [#1519](https://github.com/facebookincubator/create-react-app/pull/1519) Add test cases for PUBLIC_URL and relative path. ([@Timer](https://github.com/Timer))
  * [#1484](https://github.com/facebookincubator/create-react-app/pull/1484) Improve e2e-kitchensink and Jest coverage. ([@Timer](https://github.com/Timer))
  * [#1463](https://github.com/facebookincubator/create-react-app/pull/1463) Minor code style and wrong expect. ([@tuchk4](https://github.com/tuchk4))
  * [#1470](https://github.com/facebookincubator/create-react-app/pull/1470) E2e jsdom fix. ([@EnoahNetzach](https://github.com/EnoahNetzach))
  * [#1187](https://github.com/facebookincubator/create-react-app/pull/1187) Use a more sophisticated template for end-to-end testing.. ([@EnoahNetzach](https://github.com/EnoahNetzach))

* Other

  * [#1289](https://github.com/facebookincubator/create-react-app/pull/1289) Remove path-exists from dependencies and replace it with fs.existsSync. ([@halfzebra](https://github.com/halfzebra))

#### Committers: 35
- Alex Driaguine ([alexdriaguine](https://github.com/alexdriaguine))
- Anders D. Johnson ([adjohnson916](https://github.com/adjohnson916))
- Anthony F. ([frehner](https://github.com/frehner))
- Brandon Istenes ([brandones](https://github.com/brandones))
- Calvin Webster ([calweb](https://github.com/calweb))
- Cary Landholt ([CaryLandholt](https://github.com/CaryLandholt))
- Chandan Rai ([crowchirp](https://github.com/crowchirp))
- Christian Raidl ([Chris-R3](https://github.com/Chris-R3))
- Dan Abramov ([gaearon](https://github.com/gaearon))
- Daniel Schep ([dschep](https://github.com/dschep))
- David ([lopezator](https://github.com/lopezator))
- Dinuka De Silva ([dinukadesilva](https://github.com/dinukadesilva))
- Eduard Kyvenko ([halfzebra](https://github.com/halfzebra))
- Fabrizio Castellarin ([EnoahNetzach](https://github.com/EnoahNetzach))
- Fatih ([frontsideair](https://github.com/frontsideair))
- Gabriel Aumala ([GAumala](https://github.com/GAumala))
- Jay Phelps ([jayphelps](https://github.com/jayphelps))
- Jih-Chi Lee ([jihchi](https://github.com/jihchi))
- Jimmy Miller ([jimmyhmiller](https://github.com/jimmyhmiller))
- Joe Haddad ([Timer](https://github.com/Timer))
- Johnny Magrippis ([jmagrippis](https://github.com/jmagrippis))
- Jonathan Kim ([jkimbo](https://github.com/jkimbo))
- MUA ([MsUzoAgu](https://github.com/MsUzoAgu))
- Matthew Holloway ([holloway](https://github.com/holloway))
- Nguyen Le Vu Long ([vulong23](https://github.com/vulong23))
- Paul O’Shannessy ([zpao](https://github.com/zpao))
- Pedro Nauck ([pedronauck](https://github.com/pedronauck))
- Robbie H ([TheBlackBolt](https://github.com/TheBlackBolt))
- Thibault Derousseaux ([tibdex](https://github.com/tibdex))
- Valerii ([tuchk4](https://github.com/tuchk4))
- Vasiliy Taranov ([jetpackpony](https://github.com/jetpackpony))
- [RodrigoHahn](https://github.com/RodrigoHahn)
- creynders ([creynders](https://github.com/creynders))
- pd4d10 ([pd4d10](https://github.com/pd4d10))
- soo ([carlsagan21](https://github.com/carlsagan21))

### Migrating from 0.8.5 to 0.9.0

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.9.0
```

Then, run your tests. If you are affected by breaking changes from Jest 18, consult [blog post](https://facebook.github.io/jest/blog/2016/12/15/2016-in-jest.html), [changelog](https://github.com/facebook/jest/blob/master/CHANGELOG.md#jest-1800), and [documentation](http://facebook.github.io/jest/docs/getting-started.html). You might need to update any snapshots since their format might have changed.

If you relied on the browser not starting in non-interactive terminals, you now need to explicitly specify `BROWSER=none` as an environment variable to disable it.

## 0.8.5 (January 9, 2017)

Thanks to [@fson](https://github.com/fson) for cutting this release.

#### :bug: Bug Fix
* `create-react-app`, `react-scripts`
  * [#1365](https://github.com/facebookincubator/create-react-app/pull/1365) Use yarnpkg alias to run Yarn. ([@fson](https://github.com/fson))

    Fixes an issue where running `create-react-app` failed on systems with Apache Hadoop installed because it falsely detected Hadoop YARN executable as Yarn package manager.

#### Committers: 1
- Ville Immonen ([fson](https://github.com/fson))

### Migrating from 0.8.4 to 0.8.5

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.8.5
```

You may also optionally update the global command-line utility:

```
npm install -g create-react-app@1.0.3
```

## 0.8.4 (December 11, 2016)

#### :bug: Bug Fix
* `react-scripts`

  * [#1233](https://github.com/facebookincubator/create-react-app/pull/1233) Disable subresource integrity temporarily. ([@Timer](https://github.com/Timer))

    We added [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) checks to the build output in 0.8.2 but it turns out that they may fail in browsers using special compression proxies, such as Chrome on Android, when served over HTTP. We disabled the checks until we can find a safe way to add them.

* `react-dev-utils`

  * [#1226](https://github.com/facebookincubator/create-react-app/pull/1226) Fix weird lint output. ([@n3tr](https://github.com/n3tr))

    Fixes strange lint message formatting in some edge cases.

  * [#1215](https://github.com/facebookincubator/create-react-app/pull/1215) Fix - openChrome won't open default browser (using Canary). ([@n3tr](https://github.com/n3tr))

    Fixes a regression that caused stable Google Chrome to be opened even if you are using Canary as the default browser.

* `create-react-app`

  * [#1223](https://github.com/facebookincubator/create-react-app/pull/1223) Clean up Yarn detection and install code. ([@fson](https://github.com/fson))

  Fixes noisy output on Windows when Yarn is not installed.

  * [#1224](https://github.com/facebookincubator/create-react-app/pull/1224) Exit with an error code when npm/yarn install fails. ([@fson](https://github.com/fson))

#### :nail_care: Enhancement
* `react-scripts`

  * [#1237](https://github.com/facebookincubator/create-react-app/pull/1237) Clear scrollback in test mode. ([@gaearon](https://github.com/gaearon))

    Ensures test watcher clears the console before running.

  * [#1229](https://github.com/facebookincubator/create-react-app/pull/1229) Disable jest watch mode when --coverage flag is present [#1207]. ([@BenoitAverty](https://github.com/BenoitAverty))

    Since coverage doesn't work well with watch mode, we don’t run the watcher on `npm test -- --coverage` anymore.

  * [#1212](https://github.com/facebookincubator/create-react-app/pull/1212) Proxy rewrites Origin header to match the target server URL. ([@koles](https://github.com/koles))

    Makes sure more API endpoints can work with the `proxy` setting.

  * [#1222](https://github.com/facebookincubator/create-react-app/pull/1222) Disable gh-page setup instruction if scripts.deploy has been added. ([@n3tr](https://github.com/n3tr))

    Suppresses the instructions printed at the end of `npm run build` if `npm run deploy` already exists.

* `create-react-app`

  * [#1236](https://github.com/facebookincubator/create-react-app/pull/1236) Tweak console messages. ([@gaearon](https://github.com/gaearon))

    Makes error messages more friendly.

  * [#1195](https://github.com/facebookincubator/create-react-app/pull/1195) Use "commander" for  cli argv handling. ([@EnoahNetzach](https://github.com/EnoahNetzach))

    Adds `create-react-app --help` with a list of options.

* `react-dev-utils`

  * [#1211](https://github.com/facebookincubator/create-react-app/pull/1211) Use a better clear console sequence. ([@gaearon](https://github.com/gaearon))

    Ensures the development server clears the terminal when files are changed.

#### :memo: Documentation
* `react-dev-utils`

  * [#1232](https://github.com/facebookincubator/create-react-app/pull/1232) [documentation] fix html-dev-plugin link in react-dev-utils doc. ([@shogunsea](https://github.com/shogunsea))

* `react-scripts`

  * [#1220](https://github.com/facebookincubator/create-react-app/pull/1220) Adding troubleshooting information about Subresource Integrity digests.. ([@dfbaskin](https://github.com/dfbaskin))

#### :house: Internal
* `react-scripts`

  * [#1214](https://github.com/facebookincubator/create-react-app/pull/1214) Bump babel-eslint version. ([@existentialism](https://github.com/existentialism))

#### Committers: 10
- Benoit Averty ([BenoitAverty](https://github.com/BenoitAverty))
- Brian Ng ([existentialism](https://github.com/existentialism))
- Dan Abramov ([gaearon](https://github.com/gaearon))
- Dave Baskin ([dfbaskin](https://github.com/dfbaskin))
- Fabrizio Castellarin ([EnoahNetzach](https://github.com/EnoahNetzach))
- Jirat Ki. ([n3tr](https://github.com/n3tr))
- Joe Haddad ([Timer](https://github.com/Timer))
- Pavel Kolesnikov ([koles](https://github.com/koles))
- Shogun Sea ([shogunsea](https://github.com/shogunsea))
- Ville Immonen ([fson](https://github.com/fson))

### Migrating from 0.8.3 to 0.8.4

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.8.4
```

You may also optionally update the global command-line utility:

```
npm install -g create-react-app@1.0.2
```

## 0.8.3 (December 8, 2016)

#### :bug: Bug Fix
* `create-react-app`
  * [#1204](https://github.com/facebookincubator/create-react-app/pull/1204) Catch synchronous errors from spawning yarn. ([@gaearon](https://github.com/gaearon))

    Fixes a crash when running `create-react-app` in some cases.

* `react-scripts`
  * [#1203](https://github.com/facebookincubator/create-react-app/pull/1203) Update webpack-subresource-integrity to fix Windows builds. ([@gaearon](https://github.com/gaearon))

    Fixes a crash when running `npm run build` on Windows.

  * [#1201](https://github.com/facebookincubator/create-react-app/pull/1201) Instruct Jest to load native components from RNW instead of RN. ([@remon-georgy](https://github.com/remon-georgy))

    Fixes tests for users of React Native Web.

#### :memo: Documentation
* `react-scripts`

  * [#806](https://github.com/facebookincubator/create-react-app/pull/806) Add syntax highlighting configuration guide. ([@mareksuscak](https://github.com/mareksuscak))

#### Committers: 3
- Dan Abramov ([gaearon](https://github.com/gaearon))
- Marek Suscak ([mareksuscak](https://github.com/mareksuscak))
- Remon Georgy ([remon-georgy](https://github.com/remon-georgy))

### Migrating from 0.8.2 to 0.8.3

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.8.3
```

You can optionally update the global CLI too:

```
npm install -g create-react-app@1.0.1
```

## 0.8.2 (December 7, 2016)

#### :rocket: New Feature
* `react-scripts`
  * [#1176](https://github.com/facebookincubator/create-react-app/pull/1176) Add Subresource Integrity support. ([@XVincentX](https://github.com/XVincentX))

    The generated HTML now includes [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) attributes ensuring that your users aren't served malicious code if your CDN gets compromised.

#### :bug: Bug Fix
* `react-scripts`
  * [#1197](https://github.com/facebookincubator/create-react-app/pull/1197) Let Jest handle all file types. ([@gaearon](https://github.com/gaearon))

    Since 0.8.0, we started treating imports of any unknown file extensions as URLs. However, we had to revert this change for the test configuration in 0.8.1 because of a bug causing false positives. In 0.8.2, we are fixing this and making test configuration treat imports with unknown extensions the same way as we do in the browser environment.

  * [#1194](https://github.com/facebookincubator/create-react-app/pull/1194) Only honor relative `NODE_PATH`. ([@gaearon](https://github.com/gaearon))

    Historically we have allowed specifying `NODE_PATH` environment variable as a way to allow “absolute imports”. For example, running `NODE_PATH=src npm start` in Bash or `set NODE_PATH=src&&npm start` in Windows Cmd would let you import anything inside `src` without specifying a relative path. However, we found a few nasty edge cases when Node.js core modules end up being in `NODE_PATH` and erroneously become bundled. As a result the build would crash on some systems when some libraries are imported. To fix this, we now only honor relative paths from `NODE_PATH` in Create React App. This means the existing use case for absolute imports is still supported (`src` in the example above is relative), but absolute paths in `NODE_PATH` (such as paths to Node.js core modules) will be ignored.

  * [#1188](https://github.com/facebookincubator/create-react-app/pull/1188) Update Webpack to fix source map issues. ([@gaearon](https://github.com/gaearon))

    Since 0.8.0, we show source maps in development instead of the compiled code. However, it has come to our attention that Webpack's source map implementation had issues interpreting Babel output, and caused source maps to be wrong and breakpoints to be unusable in some cases. Webpack has released a fix for this, and we have updated the minimal version of Webpack that we are using.

  * [#1180](https://github.com/facebookincubator/create-react-app/pull/1180) Use `file-loader` for svgs. ([@bogdansoare](https://github.com/bogdansoare))

    Since 0.8.0, we are treating all imports with non-JS/CSS extensions the same way. Importing them gives you a string with their URL, and if their content is small enough (less than 10K), the URL is in fact an inlined [data URI](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs). However, this doesn't work well with SVGs in case you use them for a sprite system since fragments don't work in data URIs, and it's wasteful to inline the same sprite SVG many times. To fix this, we have added an exception so that SVG files never get inlined.

* `react-dev-utils`
  * [#1165](https://github.com/facebookincubator/create-react-app/pull/1165) Chrome 'open tab' reuse an empty tab when possible. ([@n3tr](https://github.com/n3tr))

    Fixes an issue that caused two tabs to get opened instead of just one. It also fixes some cases where the window with the existing tab would not get activated.

* `babel-preset-react-app`
  * [#1179](https://github.com/facebookincubator/create-react-app/pull/1179) Fix Babel issues in tests by applying the right transforms. ([@gaearon](https://github.com/gaearon))

    Fixes regressions in test environment that caused syntax errors with generators and `async` / `await`.

#### :nail_care: Enhancement
* `eslint-config-react-app`
  * [#1191](https://github.com/facebookincubator/create-react-app/pull/1191) Relax peerDependencies for ESLint preset. ([@gaearon](https://github.com/gaearon))

    This allows the preset to be used in more apps without peer dependency conflicts. We still pin the exact versions in apps that haven't ejected for extra safety.

  * [#1159](https://github.com/facebookincubator/create-react-app/pull/1159) Make jsx-no-undef rule an error. ([@existentialism](https://github.com/existentialism))

    Using an undefined type in JSX is now treated as a hard lint error because it is guaranteed to crash application at runtime.

* `react-scripts`
  * [#1175](https://github.com/facebookincubator/create-react-app/pull/1175) Remove path module from webpack config on eject. ([@harunhasdal](https://github.com/harunhasdal))

    This makes the output after ejecting a bit cleaner.

  * [#1120](https://github.com/facebookincubator/create-react-app/pull/1120) Add `testURL` to Jest config. ([@spudly](https://github.com/spudly))

    This fixes an error when running tests that interact with History API in jsdom.

#### :memo: Documentation
* `react-scripts`
  * [#1143](https://github.com/facebookincubator/create-react-app/pull/1143) Add deploy to Firebase CDN on template's README (Closes [#374](https://github.com/facebookincubator/create-react-app/issues/374)). ([@guilhermebruzzi](https://github.com/guilhermebruzzi))
  * [#1099](https://github.com/facebookincubator/create-react-app/pull/1099) Fix minor typo/grammar. ([@alex-wilmer](https://github.com/alex-wilmer))
  * [#1168](https://github.com/facebookincubator/create-react-app/pull/1168) Add "npm run build silently fails" to Troubleshooting. ([@gaearon](https://github.com/gaearon))

#### Committers: 12
- Alex Wilmer ([alex-wilmer](https://github.com/alex-wilmer))
- Bogdan Soare ([bogdansoare](https://github.com/bogdansoare))
- Brian Ng ([existentialism](https://github.com/existentialism))
- Dan Abramov ([gaearon](https://github.com/gaearon))
- Fabrizio Castellarin ([EnoahNetzach](https://github.com/EnoahNetzach))
- Guilherme Heynemann Bruzzi ([guilhermebruzzi](https://github.com/guilhermebruzzi))
- Harun ([harunhasdal](https://github.com/harunhasdal))
- James Newell ([jameslnewell](https://github.com/jameslnewell))
- Jirat Ki. ([n3tr](https://github.com/n3tr))
- Li Xuanji ([zodiac](https://github.com/zodiac))
- Stephen John Sorensen ([spudly](https://github.com/spudly))
- Vincenzo Chianese ([XVincentX](https://github.com/XVincentX))

### Migrating from 0.8.1 to 0.8.2

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.8.2
```

## 0.8.1 (December 4, 2016)

Thanks to [@fson](https://github.com/fson) for cutting this release.

#### :bug: Bug Fix
* `react-scripts`
  * [#1149](https://github.com/facebookincubator/create-react-app/pull/1149) Fix incorrectly stubbing JavaScript files with a dot in the import path in tests. ([@fson](https://github.com/fson))

### Migrating from 0.8.0 to 0.8.1

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.8.1
```

## 0.8.0 (December 3, 2016)

Thanks to [@fson](https://github.com/fson) for cutting this release.

#### :rocket: New Feature
* `react-scripts`
  * [#944](https://github.com/facebookincubator/create-react-app/pull/944) Crash the build during CI whenever linter warnings are encountered. ([@excitement-engineer](https://github.com/excitement-engineer))

    Linter warnings and errors are now checked during a continuous integration build (set by the `CI` environment variable) and the build will fail if any issues are found. See [Continuous Integration](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#continuous-integration) for more information.

  * [#1090](https://github.com/facebookincubator/create-react-app/pull/1090) Enable proxying of WebSockets. ([@dceddia](https://github.com/dceddia))

* `create-react-app`, `react-scripts`
  * [#898](https://github.com/facebookincubator/create-react-app/pull/898) Support Yarn. ([@fson](https://github.com/fson))

    Yarn is a new fast, reliable and secure alternative to the `npm` client. If you have Yarn installed, `create-react-app` will use it to install packages when you create an app. It also creates a `yarn.lock` file that should be checked into source control (e.g. git). This ensures the same versions of packages will be installed each time `yarn install` is run, on any machine.

    `react-scripts` now also displays instructions using `yarn` commands for projects using Yarn (projects having a `yarn.lock` file).

    To create a project using Yarn, simply install `yarn` and use `create-react-app` like before:
    ```
    npm install -g yarn create-react-app@latest

    create-react-app my-app  # Packages are now installed with Yarn.
    ```

#### :boom: Breaking Change
* `babel-preset-react-app`
  * [#902](https://github.com/facebookincubator/create-react-app/pull/902) Enable useBuiltIns option on object-rest-spread. ([@existentialism](https://github.com/existentialism))

    Object rest spread and JSX now use the native `Object.assign()` method instead of Babel's helper function. If you are using `babel-preset-react-app` directly in your project *and* targeting browsers that don't have `Object.assign()` available, from now on you need a polyfill for it (e.g. [`object-assign`](https://www.npmjs.com/package/object-assign)).

    **Note:** `react-scripts` already adds this polyfill, so no changes are necessary in Create React App projects.

#### :bug: Bug Fix
* `react-scripts`
  * [#978](https://github.com/facebookincubator/create-react-app/pull/978) Move the remove-on-eject-end tag at the end of the file. ([@EnoahNetzach](https://github.com/EnoahNetzach))

    Fixes a bug in ejected configuration.

  * [#1017](https://github.com/facebookincubator/create-react-app/pull/1017) Don't look for `.babelrc` file during test. ([@nhajidin](https://github.com/nhajidin))

    Fixes a `.babelrc` file in a parent directory interfering with the `npm test` command.

  * [#951](https://github.com/facebookincubator/create-react-app/pull/951) Check for presence of folders before continuing eject. ([@heldinz](https://github.com/heldinz))

    Fixes a bug where `eject` failed when a `scripts` or `config` folder already existed in the project.

* `react-dev-utils`
  * [#1035](https://github.com/facebookincubator/create-react-app/pull/1035) Fix Chrome tab reuse. ([@einarlove](https://github.com/einarlove))

    Fixes a bug with the app not opening in the existing tab in Chrome.

  * [#964](https://github.com/facebookincubator/create-react-app/pull/964) Catch and noop call to open web browser. ([@spadin](https://github.com/spadin))

    Not being able to open a browser doesn't crash the development server now.

* `eslint-config-react-app`, `react-scripts`
  * [#953](https://github.com/facebookincubator/create-react-app/pull/953) Fix `.ico` file extension being handled by test configuration. ([@vadzim](https://github.com/vadzim))

#### :nail_care: Enhancement
* `react-scripts`
  * [#1032](https://github.com/facebookincubator/create-react-app/pull/1032) Add support for non-interactive terminal. ([@sheerun](https://github.com/sheerun))
  * [#1078](https://github.com/facebookincubator/create-react-app/pull/1078) Upgrade Jest to 17.0. ([@fson](https://github.com/fson))
  * [#1059](https://github.com/facebookincubator/create-react-app/pull/1059) Use `url-loader` with limit 10k as a default loader. ([@bebbi](https://github.com/bebbi))

    `react-scripts` now treats imports with any unknown file extension as a resource. Files with a size below 10 KB are inlined using a data URI and larger files copied to the build folder. This removes the need for an internal [whitelist of supported file extensions](https://github.com/facebookincubator/create-react-app/issues/667). Any file that's not JS or CSS is now handled the same way.

  * [#924](https://github.com/facebookincubator/create-react-app/pull/924) Enable JavaScript source maps in development. ([@ekaradon](https://github.com/ekaradon))
  * [#1058](https://github.com/facebookincubator/create-react-app/pull/1058) Add missing dev argument in build script message. ([@nhajidin](https://github.com/nhajidin))
  * [#961](https://github.com/facebookincubator/create-react-app/pull/961) Add `collectCoverageFrom` option to collect coverage on files without any tests. ([@pmackcode](https://github.com/pmackcode))

    The test script now considers all files in the project when calculating test coverage.

  * [#968](https://github.com/facebookincubator/create-react-app/pull/968) Enable gzip compression in the development server (#966). ([@frontsideair](https://github.com/frontsideair))
* `react-dev-utils`, `react-scripts`
  * [#816](https://github.com/facebookincubator/create-react-app/pull/816) add logging of existing default port process on start. ([@ianmcnally](https://github.com/ianmcnally))

    `react-scripts` can guess which process is running on the port 3000 when it's not available:
    ```
    Something is already running on port 3000. Probably:
      my-app
      in /Users/ian/dev/my-app

    Would you like to run the app on another port instead?
    ```
* `react-dev-utils`
  * [#963](https://github.com/facebookincubator/create-react-app/pull/963) Allow webpack 2 as a peerDependency in react-dev-utils. ([@einarlove](https://github.com/einarlove))

#### :memo: Documentation
* `react-scripts`
  * [#1126](https://github.com/facebookincubator/create-react-app/pull/1126) Add a note about vscode-jest. ([@orta](https://github.com/orta))
  * [#1080](https://github.com/facebookincubator/create-react-app/pull/1080) Add a note for OSX users about watchman and jest. ([@dmr](https://github.com/dmr))
  * [#1071](https://github.com/facebookincubator/create-react-app/pull/1071) Adds to docs - deployment with S3/CloudFront. ([@marcgarreau](https://github.com/marcgarreau))
  * [#976](https://github.com/facebookincubator/create-react-app/pull/976) Added info on using global variables. ([@jhorneman](https://github.com/jhorneman))
  * [#996](https://github.com/facebookincubator/create-react-app/pull/996) Remove redundant `function` from export statement. ([@gnowoel](https://github.com/gnowoel))
  * [#959](https://github.com/facebookincubator/create-react-app/pull/959) Always build before deploying to gh-pages. ([@dsernst](https://github.com/dsernst))
  * [#974](https://github.com/facebookincubator/create-react-app/pull/974) Gently nudge users towards https by default. ([@Swizec](https://github.com/Swizec))
* Other
  * [#1031](https://github.com/facebookincubator/create-react-app/pull/1031) No Configuration -> Convention over Configuration. ([@sheerun](https://github.com/sheerun))
  * [#995](https://github.com/facebookincubator/create-react-app/pull/995) Add Gatsby to alternatives. ([@KyleAMathews](https://github.com/KyleAMathews))

#### :house: Internal
* `react-scripts`
  * [#1072](https://github.com/facebookincubator/create-react-app/pull/1072) Replace rimraf with fs-extra functions. ([@existentialism](https://github.com/existentialism))
  * [#1068](https://github.com/facebookincubator/create-react-app/pull/1068) Remove bundledDependencies. ([@fson](https://github.com/fson))
  * [#1057](https://github.com/facebookincubator/create-react-app/pull/1057) Update `css-loader`. ([@nhajidin](https://github.com/nhajidin))
  * [#983](https://github.com/facebookincubator/create-react-app/pull/983) Remove custom babel-loader cache dir config. ([@fson](https://github.com/fson))
* `babel-preset-react-app`
  * [#1052](https://github.com/facebookincubator/create-react-app/pull/1052) Remove unnecessary transform plugins for object spread to work. ([@valscion](https://github.com/valscion))
  * [#992](https://github.com/facebookincubator/create-react-app/pull/992) Explain the usage of react-jsx-source & react-jsx-self. ([@bboysathish](https://github.com/bboysathish))
  * [#1051](https://github.com/facebookincubator/create-react-app/pull/1051) Update babel-present-env and use node: 'current' as target. ([@valscion](https://github.com/valscion))

#### Committers: 27
- Adam Stankiewicz ([sheerun](https://github.com/sheerun))
- Alice Rose ([heldinz](https://github.com/heldinz))
- Arunoda Susiripala ([arunoda](https://github.com/arunoda))
- Brian Ng ([existentialism](https://github.com/existentialism))
- Daniel Rech ([dmr](https://github.com/dmr))
- Dave Ceddia ([dceddia](https://github.com/dceddia))
- David Ernst ([dsernst](https://github.com/dsernst))
- Dirk-Jan Rutten ([excitement-engineer](https://github.com/excitement-engineer))
- Einar Löve ([einarlove](https://github.com/einarlove))
- Fabrizio Castellarin ([EnoahNetzach](https://github.com/EnoahNetzach))
- Fatih ([frontsideair](https://github.com/frontsideair))
- Ian McNally ([ianmcnally](https://github.com/ianmcnally))
- Jurie Horneman ([jhorneman](https://github.com/jhorneman))
- Kyle Mathews ([KyleAMathews](https://github.com/KyleAMathews))
- Leo Wong ([gnowoel](https://github.com/gnowoel))
- Marc Garreau ([marcgarreau](https://github.com/marcgarreau))
- Nazim Hajidin ([nhajidin](https://github.com/nhajidin))
- Orta ([orta](https://github.com/orta))
- Patrick Mackinder ([pmackcode](https://github.com/pmackcode))
- Sandro Padin ([spadin](https://github.com/spadin))
- Sathish ([bboysathish](https://github.com/bboysathish))
- Stefan ([bebbi](https://github.com/bebbi))
- Swizec Teller ([Swizec](https://github.com/Swizec))
- Vadzim ([vadzim](https://github.com/vadzim))
- Vesa Laakso ([valscion](https://github.com/valscion))
- Ville Immonen ([fson](https://github.com/fson))
- [ekaradon](https://github.com/ekaradon)

### Migrating from 0.7.0 to 0.8.0

You may optionally update the global command (it’s not required, but it adds Yarn support for new projects):

```
npm install -g create-react-app@1.0.0
```

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.8.0
```

## 0.7.0 (October 22, 2016)

Thanks to [@fson](https://github.com/fson) for cutting this release.

### Build Dependency (`react-scripts`)

* Updates Jest to [version 16.0](http://facebook.github.io/jest/blog/2016/10/03/jest-16.html), with an upgraded CLI, improved snapshot testing, new matchers and more. ([@chase](https://github.com/chase) in [#858](https://github.com/facebookincubator/create-react-app/pull/858))
* Test setup file `src/setupTests.js` is now called after test framework initialization  to support loading custom matchers. ([@just-boris](https://github.com/just-boris) in [#846](https://github.com/facebookincubator/create-react-app/pull/846))
* Build command shows better instructions for deploying the app to GitHub Pages ([@Janpot](https://github.com/Janpot) in [#841](https://github.com/facebookincubator/create-react-app/pull/841))
* Build command now generates an asset manifest with mappings from each filename to its final output filename. ([@lukyth](https://github.com/lukyth) in [#891](https://github.com/facebookincubator/create-react-app/pull/891))
* Build command exits, if there are errors from UglifyJS ([@pdillon](https://github.com/pdillon) in [#859](https://github.com/facebookincubator/create-react-app/pull/859))
* Eject output is more beautiful now. ([@azakordonets](https://github.com/azakordonets) in [#769](https://github.com/facebookincubator/create-react-app/pull/769))
* Fixes opening the app in a new tab in Chrome. ([@unixdev](https://github.com/unixdev) in [#831](https://github.com/facebookincubator/create-react-app/pull/831))
* Fixes environment variables not being defined as normal properties of the `process.env` object. ([@dvkndn](https://github.com/dvkndn) in [#807](https://github.com/facebookincubator/create-react-app/pull/807))
* Fixes PostCSS autoprefixer not processing CSS files imported with CSS `@import` statements. ([@nhunzaker](https://github.com/nhunzaker) in [#929](https://github.com/facebookincubator/create-react-app/pull/929))

### ESLint Config (`eslint-config-react-app`)

* Adds `import/no-webpack-loader-syntax` rule that forbids using custom Webpack specific syntax to specify Webpack loaders in import statements. ([@fson](https://github.com/fson) in [#803](https://github.com/facebookincubator/create-react-app/pull/803))
* `react/react-in-jsx-scope` rule ("React must be in scope") is now an error. ([@gaearon](https://github.com/gaearon) in [#822](https://github.com/facebookincubator/create-react-app/pull/822))
* `no-unused-expressions` rule now allows the use of short circuit and ternary expressions. ([@cannona](https://github.com/cannona) in [#724](https://github.com/facebookincubator/create-react-app/pull/724))

### Babel Preset (`babel-preset-react-app`)

* The preset now detects the Node.js version in test environment and disables unnecessary ES2015 transforms using `babel-preset-env`. ([@shubheksha](https://github.com/shubheksha) in [#878](https://github.com/facebookincubator/create-react-app/pull/878), [@JeffreyATW](https://github.com/JeffreyATW) in [#927
](https://github.com/facebookincubator/create-react-app/pull/927))
* Fixes a duplicate dependency on `babel-plugin-transform-regenerator`. ([@akofman](https://github.com/akofman) in [#864](https://github.com/facebookincubator/create-react-app/pull/864))

### Utilities (`react-dev-utils`)

* The error overlay is now disposed after fixing linting errors. ([@jarlef](https://github.com/jarlef) in [#856](https://github.com/facebookincubator/create-react-app/pull/856))
* Adds support for Webpack 2 to `webpackHotDevClient`. ([@michalkvasnicak](https://github.com/michalkvasnicak) in [#840](https://github.com/facebookincubator/create-react-app/pull/840))

### Global CLI (`create-react-app`)

* Adds support for passing a scoped package name to the `--scripts-version` argument. ([@pdillon](https://github.com/pdillon) in [#826](https://github.com/facebookincubator/create-react-app/pull/826))
* Fixes installing pre-release versions using a tarball URL with the `--scripts-version` argument. ([@jihchi](https://github.com/jihchi) in [#876](https://github.com/facebookincubator/create-react-app/pull/876))

### Migrating from 0.6.1 to 0.7.0

You may optionally update the global command (it’s not required):

```
npm install -g create-react-app@0.6.0
```

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.7.0
```

### Breaking Change in 0.7.0

#### Updating Snapshots

Jest 16 includes [improvements to snapshot testing and changes to the snapshot format](https://facebook.github.io/jest/blog/2016/10/03/jest-16.html#snapshot-updates). If your project uses snapshot testing, you'll need to update the snapshot files. To update the snapshots, run:
```
npm test -- -u
```

## 0.6.1 (September 27, 2016)

### Build Dependency (`react-scripts`)

* Babel and ESLint configuration is now placed into `package.json` after ejecting. ([@montogeek](https://github.com/montogeek) in [#773](https://github.com/facebookincubator/create-react-app/pull/773))

### Utilities (`react-dev-utils`)

* Fixes the syntax error overlay padding. ([@fson](https://github.com/fson) in [#758](https://github.com/facebookincubator/create-react-app/pull/758))

### Migrating from 0.6.0 to 0.6.1

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.6.1
```

## 0.6.0 (September 25, 2016)

### Build Dependency (`react-scripts`)

* Adds an overlay for syntax errors in development. ([@gaearon](https://github.com/gaearon) in [#744](https://github.com/facebookincubator/create-react-app/pull/744))

### Utilities (`react-dev-utils`)

* Adds an alternative WebpackDevServer client that displays the error overlay. ([@gaearon](https://github.com/gaearon) in [#744](https://github.com/facebookincubator/create-react-app/pull/744))

### Migrating from 0.5.1 to 0.6.0

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.6.0
```

**Note: If the project fails to start, remove `node_modules`, ensure `react-scripts` is `0.6.0` in your `package.json`, and run `npm install` again. There seems to be an [npm bug](https://github.com/npm/npm/issues/14073) affecting this update.**

## 0.5.1 (September 23, 2016)

### Build Dependency (`react-scripts`)

* Updates `react-dev-utils` dependency

### Utilities (`react-dev-utils`)

* Fixes `%PUBLIC_URL%` replacement to work when specified multiple times. ([@fson](https://github.com/fson) in [#731](https://github.com/facebookincubator/create-react-app/pull/731))

### Migrating from 0.5.0 to 0.5.1

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.5.1
```

## 0.5.0 (September 23, 2016)

### Build Dependency (`react-scripts`)

* Adds [support for `public` folder](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#using-the-public-folder) with arbitrary assets. ([@gaearon](https://github.com/gaearon) in [#703](https://github.com/facebookincubator/create-react-app/pull/703))
* You can now [specify defaults](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-development-environment-variables-in-env) for environment variables with `.env` file. ([@ayrton](https://github.com/ayrton) in [#695](https://github.com/facebookincubator/create-react-app/pull/695))  
* Ejecting now generates proper `.babelrc` and `.eslintrc`. ([@fson](https://github.com/fson) in [#689](https://github.com/facebookincubator/create-react-app/pull/689), [@gaearon](https://github.com/gaearon) in [#705](https://github.com/facebookincubator/create-react-app/pull/705))
* Some React warnings now [include the component stacktrace](https://twitter.com/dan_abramov/status/779308833399332864). ([@gaearon](https://github.com/gaearon) in [#716](https://github.com/facebookincubator/create-react-app/pull/716))
* `npm start` doesn’t fail in a composed Docker container. ([@arekkas](https://github.com/arekkas) in [#711](https://github.com/facebookincubator/create-react-app/issues/711))
* The projects generated with `eject` are now cleaner. ([@gaearon](https://github.com/gaearon) in [#723](https://github.com/facebookincubator/create-react-app/pull/723))
* The project is now managed as a monorepo. ([@ryanyogan](https://github.com/ryanyogan) in [#419](https://github.com/facebookincubator/create-react-app/pull/419), [@fson](https://github.com/fson) in [#678](https://github.com/facebookincubator/create-react-app/pull/678))

### ESLint Config (`eslint-config-react-app`)

* Published for the first time! ([@fson](https://github.com/fson) in [#689](https://github.com/facebookincubator/create-react-app/pull/689))
* Added [`react/no-danger-with-children`](https://github.com/yannickcr/eslint-plugin-react/blob/v6.3.0/docs/rules/no-danger-with-children.md) and [`react/style-prop-object`](https://github.com/yannickcr/eslint-plugin-react/blob/v6.3.0/docs/rules/style-prop-object.md) rules. ([@fson](https://github.com/fson) in [#696](https://github.com/facebookincubator/create-react-app/pull/696))

### Babel Preset (`babel-preset-react-app`)

* Published for the first time! ([@fson](https://github.com/fson) in [#701](https://github.com/facebookincubator/create-react-app/pull/701))

### Utilities (`react-dev-utils`)

* Published for the first time! ([@gaearon](https://github.com/gaearon) in [#723](https://github.com/facebookincubator/create-react-app/pull/723))

### Global CLI (`create-react-app`)

* Added `README` to npm. There were no other changes.

### Migrating from 0.4.3 to 0.5.0

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.5.0
```

### Breaking Changes in 0.5.0

#### Global ESLint Plugin Versions

If you used a global ESLint installation for the editor integration, you’ll need to install [these versions of global ESLint packages](https://github.com/facebookincubator/create-react-app/blob/c092086b1b256fd081f10744f90d216dd5217e29/packages/eslint-config-react-app/package.json#L14-L19).

#### Moving `index.html` into `public` Folder

You’ll also need to create a new folder called `public` in the root of your project. Then, move `index.html` and files it references (such as a favicon) into that folder.

You can no longer reference any files from `./src` in `index.html`. Instead, `public/index.html` can now only reference files other inside of the `public` folder using a special variable called `%PUBLIC_URL%`.

For example, instead of:

```js
<link rel="shortcut icon" href="./src/favicon.ico">
```

You would need to move both `index.html` and `src/favicon.ico` into the `public` folder, and change `<link>` to look like this:

```html
<link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
```

This ensures it become a part of the build output, and resolves correctly both with client-side routing and non-root `homepage` in `package.json`. Read more about [using the `public` folder](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#using-the-public-folder) and [why these changes were made](https://github.com/facebookincubator/create-react-app/pull/703).

## 0.4.3 (September 18, 2016)

This is a hotfix release for a broken package.<br>
It contained no changes to the code.

### Build Dependency (`react-scripts`)

* Fixes a packaging issue that affected npm 2. ([#676](https://github.com/facebookincubator/create-react-app/issues/676))

### Migrating from 0.4.2 to 0.4.3

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.4.3
```

## 0.4.2 (September 18, 2016)

### Build Dependency (`react-scripts`)

* Lint output in editor is now opt-in because, due to [this ESLint issue](https://github.com/eslint/eslint/issues/3458), it is broken by default in Atom. ([@fson](https://github.com/fson) in [#649](https://github.com/facebookincubator/create-react-app/pull/649))
* Fixes an issue causing compile errors when project folder is inside a symlink. ([@motiz88](https://github.com/motiz88) in [#648](https://github.com/facebookincubator/create-react-app/pull/648))
* You can now import `jpeg`, `wav`, `mp3`, `m4a`, `aac`, and `oga`. ([@mareksuscak](https://github.com/mareksuscak) in [#624](https://github.com/facebookincubator/create-react-app/pull/624), [@danharper](https://github.com/danharper) in [#665](https://github.com/facebookincubator/create-react-app/pull/665))
* Fixes false positives caused by the case sensitive import warning on Windows. ([@Urthen](https://github.com/Urthen) in [#593](https://github.com/facebookincubator/create-react-app/pull/593))
* With Docker, `*.json.gzip` files are no longer created in the project folder. ([@thangngoc89](https://github.com/thangngoc89) in [#620](https://github.com/facebookincubator/create-react-app/pull/620))
* Proxy network errors now abort requests instead of hanging. ([@cloudmu](https://github.com/cloudmu) in [#588](https://github.com/facebookincubator/create-react-app/pull/588))
* Connection to the development server does not get interrupted in HTTPS mode. ([@dceddia](https://github.com/dceddia) in [#652](https://github.com/facebookincubator/create-react-app/pull/652))
* Unsupported Node versions now print a warning. ([@fson](https://github.com/fson) in [#575](https://github.com/facebookincubator/create-react-app/pull/575))
* Importing assets with special characters like `@` now works with tests. ([@fson](https://github.com/fson) in [#584](https://github.com/facebookincubator/create-react-app/pull/584))
* Undefined variable lint rule is promoted from a warning to an error. ([@gaearon](https://github.com/gaearon) in [#669](https://github.com/facebookincubator/create-react-app/pull/669))
* Variables starting with underscore no longer trigger the “unused variable” rule. ([@valscion](https://github.com/valscion) in [#640](https://github.com/facebookincubator/create-react-app/pull/640))
* We now print a friendly error when required files are missing. ([@vnctaing](https://github.com/vnctaing) in [#653](https://github.com/facebookincubator/create-react-app/pull/653))
* The output after creating a project is better formatted. ([@btnwtn](https://github.com/btnwtn) in [#629](https://github.com/facebookincubator/create-react-app/pull/629))
* Development server logs are less noisy. ([@gaearon](https://github.com/gaearon) in [122068](https://github.com/facebookincubator/create-react-app/commit/1220683276dd9eb2f2719aece7f40bf2ffb397b4))

### Global CLI (`create-react-app`)

* It now runs on early Node versions to print a friendly warning instead of crashing. ([@sotojuan](https://github.com/sotojuan) in [fc3ab4](https://github.com/facebookincubator/create-react-app/commit/fc3ab46d2a54f142f9287ce7de9ab2fc2514487d))
* We now print a friendly message when you create a project with invalid name. ([@mareksuscak](https://github.com/mareksuscak) in [#628](https://github.com/facebookincubator/create-react-app/pull/628))
* Passing a custom fork of `react-scripts` to `create-react-app` with `--scripts-version` works again. ([@yesmeck](https://github.com/yesmeck) in [#632](https://github.com/facebookincubator/create-react-app/pull/632))

### Migrating from 0.4.1 to 0.4.2

You may optionally update the global command (it’s not required):

```
npm install -g create-react-app@0.4.2
```

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.4.2
```

## 0.4.1 (September 3, 2016)

### Build Dependency (`react-scripts`)

* We now support (but [don’t recommend](https://github.com/facebookincubator/create-react-app/issues/87#issuecomment-234627904)) `.jsx` file extension. ([@tizmagik](https://github.com/tizmagik) in [#563](https://github.com/facebookincubator/create-react-app/pull/563))
* Proxy request errors are now printed to the console. ([@cloudmu](https://github.com/cloudmu) in [#502](https://github.com/facebookincubator/create-react-app/pull/502))

### Migrating from 0.4.0 to 0.4.1

Inside any created project that has not been ejected, run:

```
npm install --save-dev --save-exact react-scripts@0.4.1
```

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
* **Breaking Change:** Local paths in `<link href>` in `index.html` will now be correctly resolved, so deleting `favicon.ico` is not an error anymore. ([@andreypopp](https://github.com/andreypopp) in [#428](https://github.com/facebookincubator/create-react-app/pull/428))
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

#### Breaking Change

Now `favicon.ico` is not treated specially anymore.<br>
If you use it, move it to `src` and add the following line to `<head>` in your HTML:

```html
<link rel="shortcut icon" href="./src/favicon.ico">
```

#### New Feature

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
