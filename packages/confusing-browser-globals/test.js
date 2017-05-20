'use strict';

let assert = require('assert');
let globals = require('./');

it('should return an Array of globals', function() {
  assert.strictEqual(globals.constructor, Array);
});
it('should contain "event" variable', () => {
  assert.strictEqual(globals.indexOf('event') >= 0, true);
});
