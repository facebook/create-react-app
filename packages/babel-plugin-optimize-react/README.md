# babel-plugin-optimize-react

This Babel 7 plugin optimizes React hooks by transforming common patterns into more effecient output when using with tools such as [Create React App](https://github.com/facebook/create-react-app). For example, with this plugin the following output is optimized as shown:

```js
// Original
var _useState = Object(react__WEBPACK_IMPORTED_MODULE_1_["useState"])(Math.random()),
    _State2 = Object(_Users_gaearon_p_create_rreact_app_node_modules_babel_runtime_helpers_esm_sliceToArray_WEBPACK_IMPORTED_MODULE_0__["default"])(_useState, 1),
    value = _useState2[0];
    
// With this plugin
var useState = react__WEBPACK_IMPORTED_MODULE_1_.useState;
var __ref__0 = useState(Math.random());
var value = __ref__0[0];
```

## Named imports to hooks get transformed

```js
// Original
import React, {useState} from 'react';

// With this plugin
import React from 'react';
const {useState} = React;
```

## Array destructuring transform for React's built-in hooks

```js
// Original
const [counter, setCounter] = useState(0);

// With this plugin
const __ref__0 = useState(0);
const counter = __ref__0[0];
const setCounter = __ref__0[1];
```

## React.createElement becomes a hoisted constant

```js
// Original
import React from 'react';

function MyComponent() {
  return React.createElement('div', null, 'Hello world');
}

// With this plugin
import React from 'react';
const __reactCreateElement__ = React.createElement;

function MyComponent() {
  return __reactCreateElement__('div', null, 'Hello world');
}
```

