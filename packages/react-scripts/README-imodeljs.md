# Information About iModel.js Specific Fork

This README is intended to cover the differences between the iModel.js specific fork and how it relates to the upstream of [Create-React-App](https://github.com/facebook/create-react-app).

Current upstream with `react-scripts@3.4.1`.

## Differences

- Support for iModel.js Extensions

  - In order to support iModel.js Extensions, the "IModeljsLibraryExportsPlugin" webpack plugin from the "@bentley/webpack-tools-core" package is added to the webpack configuration.
  - Added "@bentley/webpack-tools-core" to [package.json](./packages/react-scripts/package.json)
  - Added the "IModeljsLibraryExportsPlugin" into the "plugins" section of the rawConfig.

- Additional configuration options

  > Note: These configuration variables are an extension of the [Advanced Configurations](create-react-app.dev/docs/advanced-configuration) supported by create-react-app.

  | Variable                | Development | Production | Usage                                                                                                                                                                    |
  | ----------------------- | ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | USE_FAST_SASS           | ✅ Used     | ✅ Used    | When set to `true`, use the fast-sass-loader instead of sass-loader. This helps with long build times on smaller machines attempting to build an app with a large amount of scss/sass files. |
  | DEBUG_BUILD_PERFORMANCE | ✅ Used     | 🚫 Ignored | When set to `true`, reports webpack build performance and bottlenecks. Uses the [speed measure webpack plugin](https://www.npmjs.com/package/speed-measure-webpack-plugin).                  |
  | USE_FULL_SOURCEMAP | ✅ Used     | 🚫 Ignored | When set to `true`, the sourcemaps generated use 'source-map' instead of 'cheap-module-source-map'. This is known to cause out-of-memory errors but gives full fidelity source maps in debug builds.|
- Typing changes

  - By default, typescript tests are not type checked causing issue when trying to compile them later.
  - Update the Jest configuration to support type checking
    - In 'packages/react-scripts/scripts/utils/createJestConfig.js',
      - add a global to the config for 'ts-jest'
      - add a new transform for ts and tsx files for ts-jest

- Support `imjs_` prefixed environment variables
  - iModel.js places special significance on environment variables starting with `imjs_`. The `REACT_APP_` functionality has been extended to include the `imjs_` as well.
