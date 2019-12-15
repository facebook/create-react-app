# Welcome to Jimmy's Custom Template!

Just like regular create-react-app but so much more. This template includes:

- axios
- normalize.css
- react-redux
- react-router
- react-router-dom
- redux
- redux-logger
- redux-thunk
- serve
- styled-components

There is also a `serve` script that let's your run `serve -s build` and a `build-and-serve` script that runs `npm run build && npm run serve`.

Redux boilerplate is set up with combine reducers and has a simple counter reducer used in one of the routes that use's react-redux's beautiful hooks to access actions and state from reducer's.

Reducer and action folders are inside a store folder so they are in the same spot.

```
--|src
--|--|components
--|--|*store*
--|--|--|actions*
--|--|--|reducers*
--|--|App.js
--|--|index.js
```
