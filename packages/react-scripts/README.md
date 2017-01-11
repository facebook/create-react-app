# react-scripts

This package includes scripts and configuration used by [Create React App](https://github.com/facebookincubator/create-react-app).  
Please refer to its documentation:

* [Getting Started](https://github.com/facebookincubator/create-react-app/blob/master/README.md#getting-started) – How to create a new app.
* [User Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md) – How to develop apps bootstrapped with Create React App.

## Changes to create-react-app

In this fork, we have the following changes:

 - Support for [CSS modules](https://github.com/css-modules/css-modules) using the `modules` option in [css-loader](https://github.com/webpack/css-loader#css-modules)
 - [PostCSS](http://postcss.org/) setup
   - [cssnext](http://cssnext.io/)
   - Shared variables in `src/styles/variables.js` in the application
   - [postcss-import](https://github.com/postcss/postcss-import) for inlining `@import` rules in CSS files
- Build as an UMD module to import the bundle for server side rendering
- Rename package as `st-scripts` to be able to publish it to NPM
