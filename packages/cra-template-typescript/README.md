# cra-template-inversify

This is a fork of `cra-template-typescript`. The template app uses `inversify` and `inversify-constructor-injection` to allow dependency injection into class constructors and into function based components.

To use this template, add `--template inversify` and `--scripts-version react-scripts-inversify` when creating a new app.

For example:

```sh
npx create-react-app my-app --scripts-version react-scripts-inversify --template inversify
```

alternatively

```sh
npx create-react-app-inversify my-app
```

For more information, please refer to:

- [Getting Started](https://create-react-app.dev/docs/getting-started) – How to create a new app.
- [User Guide](https://create-react-app.dev) – How to develop apps bootstrapped with Create React App.
