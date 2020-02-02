# react-scripts-inversify

This is a fork of `react-scripts`. This fork changes the `tsconfig.json` and `webpack.config.js` to retain metadata that can be used at runtime (for dependency injection for example).

To use these scripts, add `--scripts-version react-scripts-inversify` when creating a new app.

For example:

```sh
npx create-react-app my-app --scripts-version react-scripts-inversify
```

alternatively

```sh
npx create-react-app-inversify my-app
```

## Changes:

### tsconfig.json
 * `experimentalDecorators`: true
 * `emitDecoratorMetadata`: true

### webpack.config.js
 * uses `ts-loader` rather than `babel` to compile typescript. Decorator metadata no longer removed.

This package includes scripts and configuration used by [Create React App](https://github.com/facebook/create-react-app).<br>
Please refer to its documentation:

- [Getting Started](https://facebook.github.io/create-react-app/docs/getting-started) – How to create a new app.
- [User Guide](https://facebook.github.io/create-react-app/) – How to develop apps bootstrapped with Create React App.
