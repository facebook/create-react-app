'use strict';

let globals = require('./');

it('should return an Array of globals', function() {
  expect(Array.isArray(globals)).toBe(true)
});
it('should contain "event" variable', () => {
  expect(globals).toContain('event')
});
