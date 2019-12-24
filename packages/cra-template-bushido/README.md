# Welcome to Jimmy's Custom Template!

Just like regular create-react-app but so much more. This template includes:

- axios
- bushido-strap
- node-sass
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
| src |
| --- | components
| --- | *store* 
| --- | --- | actions*
| --- | --- | reducers*
| App.js
| index.js
```

Routes are set in App.js and all components for routes are built in components folder.

## BUSHIDO_STRAP

WTF is bushido-strap? Well, friend, it is a personal style library of mine. It has a bunch of handy styled components I've slowly crafted over time. It's already set up in this project. [Check out the documentation here to see everything this modest style library has to offer!](https://www.npmjs.com/package/bushido-strap)