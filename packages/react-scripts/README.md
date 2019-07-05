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

## Development

We follow a simple process:

1. Create your branch with a descriptive name.
2. Make your changes, try them in your local projects, and push your commits.
3. Do a Pull Request to @credijusto/react-scripts (not the original Facebook's repo)
4. Once approved, use `npm version x.x.x` to update the scripts version. We follow the [semver rules](https://semver.org/).
5. Commit the version update, publish using `npm publish` and push these changes to Github.
6. Merge your branch into master.
7. Create a git tag in the master "Merge pull request..." commit with the version and a `-cj` ending. E.g.: `v1.1.5-cj`

Issues and Pull-Requests welcome.

<hr>

Original react-scripts README:
# react-scripts

This package includes scripts and configuration used by [Create React App](https://github.com/facebook/create-react-app).<br>
Please refer to its documentation:

- [Getting Started](https://facebook.github.io/create-react-app/docs/getting-started) – How to create a new app.
- [User Guide](https://facebook.github.io/create-react-app/) – How to develop apps bootstrapped with Create React App.
