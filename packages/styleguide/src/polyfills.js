/* eslint-disable global-require */
import ObjectEntries from 'object.entries';
import ArrayIncludes from 'array-includes';
import Svg4Everybody from 'svg4everybody';

if (!Object.entries) {
  Object.entries = ObjectEntries.shim();
}

ArrayIncludes.shim();

Svg4Everybody();

if (typeof Promise === 'undefined') {
  // Rejection tracking prevents a common issue where React gets into an
  // inconsistent state due to an error, but it gets swallowed by a Promise,
  // and the user has no idea what causes React's erratic future behavior.
  require('promise/lib/rejection-tracking').enable();
  window.Promise = require('promise/lib/es6-extensions.js');
}
