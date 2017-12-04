# @stinkstudios/stylelint-config-react-app [![NPM version](http://img.shields.io/npm/v/@stinkstudios/stylelint-config-react-app.svg)](https://www.npmjs.org/package/@stinkstudios/stylelint-config-react-app) [![Build Status](https://travis-ci.org/stinkstudios/create-react-app.svg?branch=master)](https://travis-ci.org/stinkstudios/create-react-app) [![Build status](https://ci.appveyor.com/api/projects/status/8712ea9jermcnwjl/branch/master?svg=true)](https://ci.appveyor.com/project/Stinkstudios/create-react-app/branch/master)

## Installation

```bash
yarn add @stinkstudios/stylelint-config-react-app --dev
```

## Usage

If you've installed `@stinkstudios/stylelint-config-react-app` locally within your project, just set your `stylelint` config to:

```json
{
  "extends": "@stinkstudios/stylelint-config-react-app"
}
```

### Extending the config

Simply add a `"rules"` key to your config, then add your overrides and additions there.

For example, to change the `at-rule-no-unknown` rule to use its `ignoreAtRules` option, change the `indentation` to tabs, turn off the `number-leading-zero` rule,and add the `unit-whitelist` rule:

```json
{
  "extends": "@stinkstudios/stylelint-config-react-app",
  "rules": {
    "at-rule-no-unknown": [ true, {
      "ignoreAtRules": [
        "extends",
        "ignores"
      ]
    }],
    "indentation": "tab",
    "number-leading-zero": null,
    "unit-whitelist": ["em", "rem", "s"]
  }
}
```

## Stylelint Plugins

- [`stylelint-declaration-block-no-ignored-properties`](https://github.com/kristerkari/stylelint-declaration-block-no-ignored-properties/tree/1.0.1)
- [`stylelint-no-unsupported-browser-features`](https://github.com/ismay/stylelint-no-unsupported-browser-features/tree/v1.0.1)
- [`stylelint-order`](https://github.com/hudochenkov/stylelint-order/tree/0.7.0)
- [`stylelint-scss`](https://github.com/kristerkari/stylelint-scss/tree/2.1.0)

## [Changelog](https://github.com/Stinkstudios/create-react-app/blob/master/CHANGELOG.md)

## [License](LICENSE)