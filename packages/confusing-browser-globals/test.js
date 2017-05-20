'use strict';

let assert = require('assert');
let globals = require('./');

it('should return an Array of globals', function() {
  assert.strictEqual(Array.isArray(globals), true);
});
it('should contain "event" variable', () => {
  assert.strictEqual(globals.indexOf('event') >= 0, true);
});
