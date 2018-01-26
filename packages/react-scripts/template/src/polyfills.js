/**
 *  Polyfills enable javascript features in web browsers that do not support
 *  the feature. Learn more: https://en.wikipedia.org/wiki/Polyfill_(programming)
 *
 * Depending on which browsers you are targeting with your app you may want
 * to adjust which polyfills you are using.
 *
 * If you need other polyfills such as babel-polyfill or babel-runtime
 * you can add it to this file.
 *
 */

// Enables Promise, support in legacy browsers such as IE11 and below
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
if (typeof Promise === 'undefined') {
  // Rejection tracking prevents a common issue where React gets into an
  // inconsistent state due to an error, but it gets swallowed by a Promise,
  // and the user has no idea what causes React's erratic future behavior.
  require('promise/lib/rejection-tracking').enable();
  window.Promise = require('promise/lib/es6-extensions.js');
}

// Enables fetch() polyfill for making API calls support in
// legacy browsers such as IE11 and below
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
require('whatwg-fetch');

// Object.assign() is commonly used with React.
// It will use the native implementation if it's present and isn't buggy.
// It's not supported in legacy browsers such as IE11 and below.
// In some cases you can remove it even if you are targeting IE by using
// Spread opertor syntax instead.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator
Object.assign = require('object-assign');
