# `react-scripts-ts` [![npm version](https://badge.fury.io/js/react-scripts-ts.svg)](https://badge.fury.io/js/react-scripts-ts) [![Build Status](https://travis-ci.org/wmonk/create-react-app-typescript.svg?branch=master)](https://travis-ci.org/wmonk/create-react-app-typescript)

Create React apps (with Typescript) with no build configuration.

_Do you know react and want to try out typescript? Or do you know typescript and want to try out react?_ Get all the benefits from `create-react-app` but you use typescript! 🚀

## tl;dr

```sh
npm install -g create-react-app

create-react-app my-app --scripts-version=react-scripts-ts
cd my-app/
npm start
```

## Features

### Code highlighting on error
When you run `npm run build` the terminal will output the error, including the highlighted sourcecode (like babel)!

![CodeHighlight](https://cloud.githubusercontent.com/assets/175278/22310149/1ee66ccc-e346-11e6-83ff-e3a053701fb4.gif)

## Changelog

### 2.6.0
* Merge react-scripts@1.0.10 - @wmonk
* Update component template - @pelotom

### 2.5.0
* Support dynamic imports - thanks @nicolaserny, @DorianGrey
* Fix up tsconfig - thanks @js-n
* Fix readme typo - thanks @adambowles
* Move to ts-jest - thanks @DorianGrey

### 2.4.0
* Upgrade typescript to 2.4 and ts-loader to 2.2.1 - thanks @frederickfogerty
* Fix readme typo - thanks @wrongway4you

### 2.3.2
* Fix `typescript` version to 2.3.x until 2.4 @types are fixed

### 2.3.1

* All tsc to parse config (for `extend`) - Thanks to @DorianGrey
* Fix various jest issues - thanks to @zinserjan
* Fix code coverage - thanks to @zinserjan

### 2.2.0
* Upgrade to [`react-scripts@1.0.6`](https://github.com/facebookincubator/create-react-app/)

### 2.1.0
* Update to `tslint@5.2.0` - thanks to @mindjuice
* Fix test setup issue - thanks to @jonmpqts
* Add `source-map-loader` - thanks to @Place1
* Update to `typescript@2.3.3` - thanks to @sjdweb

### 2.0.1
* Fix issue with jest finding test files

### 2.0.0
* Upgrade to [`react-scripts@1.x.x`](https://github.com/facebookincubator/create-react-app/blob/0d1521aabf5a0201ea1bcccc33e286afe048f820/CHANGELOG.md)

### 1.4.0
* Upgrade to typescript@2.3.2 - thanks to @patrick91
* Add tests around react-scripts-ts - thanks to @migerh

### 1.3.0
* Upgrade to typescript@2.2.2 - thanks to @jeremistadler

### 1.1.8
* Fix regression where no `@types` were being installed on init

### 1.1.7
* Merge facebookincubator/create-react-app@0.9.5 into react-scripts-ts
* Merge facebookincubator/create-react-app@0.9.4 into react-scripts-ts
* Merge facebookincubator/create-react-app@0.9.3 into react-scripts-ts
* Merge facebookincubator/create-react-app@0.9.2 into react-scripts-ts
* Merge facebookincubator/create-react-app@0.9.1 into react-scripts-ts

### 1.1.6
* Merge facebookincubator/create-react-app@0.9.0 into react-scripts-ts

### 1.0.6
* Add missing `cli-highlight` dependency

### 1.0.5
* Print file names when running `npm run build`
* Add support for `setupTest.ts`
* Highlight source code when erroring in `npm run build`

### 1.0.4
* Change mentions of `eslint` to `tslint`

### 1.0.3
* Remove hidden character from `tsconfig.json`

### 1.0.2
* Copy `typescriptTransform.js` when running `npm run eject`
