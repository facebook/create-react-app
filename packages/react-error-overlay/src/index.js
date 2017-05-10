/* @flow */
import { inject, uninject } from './overlay';

inject();
if (module.hot && typeof module.hot.dispose === 'function') {
  module.hot.dispose(function() {
    uninject();
  });
}
