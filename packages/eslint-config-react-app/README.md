# @stinkstudios/eslint-config-react-app

This package includes the shareable ESLint configuration used by [@stinkstudios/create-react-app](https://github.com/stinkstudios/create-react-app).<br>
Please refer to its documentation:

* [Getting Started](https://github.com/stinkstudios/create-react-app/blob/master/README.md#getting-started) – How to create a new app.
* [User Guide](https://github.com/stinkstudios/create-react-app/blob/master/packages/react-scripts/template/README.md) – How to develop apps bootstrapped with Create React App.

## Usage in Create React App Projects

The easiest way to use this configuration is with [@stinkstudios/create-react-app](https://github.com/stinkstudios/create-react-app), which includes it by default.

**You don’t need to install it separately in @stinkstudios Create React App projects.**

## Usage Outside of @stinkstudios Create React App

If you want to use this ESLint configuration in a project not built with @stinkstudios Create React App, you can install it with following steps.

First, install this package, ESLint and the necessary plugins.

  ```sh
  npm install --save-dev @stinkstudios/eslint-config-react-app babel-eslint@^8.0.2 eslint@^4.11.0 eslint-plugin-flowtype@^2.39.1 eslint-plugin-import@^2.8.0 eslint-plugin-jsx-a11y@^6.0.2 eslint-plugin-react@^7.5.1 eslint-plugin-compat@^2.1.0 eslint-plugin-unicorn@^3.0.1
  ```

Then create a file named `.eslintrc` with following contents in the root folder of your project:

  ```js
  {
    "extends": "@stinkstudios/eslint-config-react-app"
  }
  ```

  That's it! You can override the settings from `@stinkstudios/eslint-config-react-app` by editing the `.eslintrc` file. Learn more about [configuring ESLint](http://eslint.org/docs/user-guide/configuring) on the ESLint website.

## ESLint Plugins

- [`eslint-plugin-compat`](https://github.com/amilajack/eslint-plugin-compat/tree/v2.1.0)
- [`eslint-plugin-flowtype`](https://github.com/gajus/eslint-plugin-flowtype/tree/v2.39.1)
- [`eslint-plugin-import`](https://github.com/benmosher/eslint-plugin-import/)
- [`eslint-plugin-jsx-a11y`](https://github.com/evcohen/eslint-plugin-jsx-a11y/tree/v6.0.2)
- [`eslint-plugin-react`](https://github.com/yannickcr/eslint-plugin-react/tree/v7.5.1)
- [`eslint-plugin-unicorn`](https://github.com/sindresorhus/eslint-plugin-unicorn)

## ESLint Configs

- [`eslint-config-airbnb`](https://github.com/airbnb/javascript/tree/eslint-config-airbnb-v16.1.0)
- [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier/tree/v2.8.0)

[IDE integrations](https://github.com/stinkstudios/create-react-app/blob/master/packages/react-scripts/template/README.md#displaying-lint-output-in-the-editor), but not in the browser or the terminal.
