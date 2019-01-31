Below of documented modifications we made to the original react-scripts.

## Disabled eslint in webpack.config.js

We want to run our own lint rules, for things like amp-sort-imports, and don't want to have multiple lint reporters. If react-scripts ever starts supporting custom lint rules, then we can remove this modification.

## Hack to workaround an issue with code splitting and CSS modules

Added a webpack plugin, `CustomFilterPlugin`, that ignores an error from mini-css-extract-plugin regarding ambiguous ordering of CSS. This warning doesn't matter for us because we use CSS modules.

Note: we don't see this warning as of Jan 17, 2019 if we disable the way we code split the main entry point to support having the login app and main app exist in the same app source.

An alternative approach would be to set CI=false when we run react-scripts build, but that might have other negative implications. Also, it's ideal that we have CI=true set for the entirety of the build process.

Related GitHub issues:
- https://github.com/facebook/create-react-app/issues/5372
- https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250

## Add support for babel-transforming any arbitrary path

We added support for the BABEL_PATH env var. If this var is defined, it will enable babel transformations on any files loaded in that path. This is to enable easier code-sharing across packages (like Cerulean and Lightning) without needed a transformation step.
