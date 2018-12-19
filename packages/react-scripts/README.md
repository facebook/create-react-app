# Credijusto's custom react-scripts

This is a fork of Facebook's [Create React App](https://github.com/facebook/create-react-app) but with Creijusto's own preferences, this package is meant to be used on every React project to ensure consistency, ease of setup and improved developer-experience.

## Usage

```sh
yarn add -D -E @credijusto/react-scripts
```

This installs the devDependency, it supports all things Create React App offers AND:
- Linting  with [AirBnb rules](https://github.com/airbnb/javascript)
- Formatting with [Prettier](https://github.com/prettier/prettier) for `.html, .js, .jsx, .json, .css, .scss` extensions
- Precommit hook

If you are using [VSCode](https://code.visualstudio.com/) editor, you can install it's [EsLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and add an `.eslintrc` file on the root of the project you're working on to enable editor linting marks, the file must contain the following:

```json
{
  "extends": "./node_modules/@credijusto/react-scripts/config/.eslintrc"
}
```

Issues and Pull-Requests welcome.

<hr>

Original react-scripts README:
# react-scripts

This package includes scripts and configuration used by [Create React App](https://github.com/facebook/create-react-app).<br>
Please refer to its documentation:

- [Getting Started](https://github.com/facebook/create-react-app/blob/master/README.md#getting-started) – How to create a new app.
- [User Guide](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md) – How to develop apps bootstrapped with Create React App.
