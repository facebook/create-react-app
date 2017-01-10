# Create React App Fork

This is a fork of the awesome [Create React App](https://github.com/facebookincubator/create-react-app) tool with some changes in the `react-scripts` package.

## Changes to create-react-app

In `packages/react-scripts`:

 - Support for [CSS modules](https://github.com/css-modules/css-modules) using the `modules` option in [css-loader](https://github.com/webpack/css-loader#css-modules)
 - [PostCSS](http://postcss.org/) setup
   - [cssnext](http://cssnext.io/)
   - Shared variables in `src/styles/variables.js` in the application
   - [postcss-import](https://github.com/postcss/postcss-import) for inlining `@import` rules in CSS files
- Build as an UMD module to import the bundle for server side rendering
