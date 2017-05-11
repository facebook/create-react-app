# stylelint-config-react-app

This package includes the shareable stylelint configuration used by [Create React App](https://github.com/facebookincubator/create-react-app).<br>
Please refer to its documentation:

* [Getting Started](https://github.com/facebookincubator/create-react-app/blob/master/README.md#getting-started) – How to create a new app.
* [User Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md) – How to develop apps bootstrapped with Create React App.

## Usage in Create React App Projects

The easiest way to use this configuration is with [Create React App](https://github.com/facebookincubator/create-react-app), which includes it by default. **You don’t need to install it separately in Create React App projects.**

## Usage Outside of Create React App

If you want to use this stylelint configuration in a project not built with Create React App, you can install it with following steps.

First, install this package, stylelint and the necessary plugins.

  ```sh
  npm install --save-dev stylelint-config-react-app stylelint@7.10.1 stylelint-csstree-validator@1.1.1
  ```

Then create a file named `.stylelintrc` with following contents in the root folder of your project:

  ```js
  {
    "extends": "stylelint-config-react-app"
  }
  ```

  That's it! You can override the settings from `stylelint-config-react-app` by editing the `.stylelintrc` file. Learn more about [configuring stylelint](https://stylelint.io/user-guide/configuration/) on the stylelint website.
