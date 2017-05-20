let assert = require('assert');
let globals = require('./');

it('should return an Array of globals', function() {
  assert.strictEqual(globals.constructor, Array);
});
