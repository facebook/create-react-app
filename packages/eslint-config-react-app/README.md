# eslint-config-react-app

This package includes the shareable ESLint configuration used by [Create React App](https://github.com/facebookincubator/create-react-app).  
Please refer to its documentation:

* [Getting Started](https://github.com/facebookincubator/create-react-app/blob/master/README.md#getting-started) – How to create a new app.
* [User Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md) – How to develop apps bootstrapped with Create React App.

## Usage in Create React App Projects

The easiest way to use this configuration is with [Create React App](https://github.com/facebookincubator/create-react-app), which includes it by default. **You don’t need to install it separately in Create React App projects.**

## Usage Outside of Create React App

If you want to use this ESLint configuration in a project not built with Create React App, you can install it with following steps.

First, install this package, ESLint and the necessary plugins.

  ```sh
  npm install --save-dev eslint-config-react-app babel-eslint@6.1.2 eslint@3.5.0 eslint-plugin-flowtype@2.18.1 eslint-plugin-import@1.12.0 eslint-plugin-jsx-a11y@2.2.2 eslint-plugin-react@5.2.2
  ```

Then create a file named `.eslintrc` with following contents in the root folder of your project:

  ```js
  {
    "extends": "react-app"
  }
  ```

  That's it! You can override the settings from `eslint-config-react-app` by editing the `.eslintrc` file. Learn more about [configuring ESLint](http://eslint.org/docs/user-guide/configuring) on the ESLint website.
