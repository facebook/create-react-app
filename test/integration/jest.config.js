'use strict';

module.exports = {
  // Increase the timeout for GitHub macOS runner
  testTimeout: 1000 * 60 * (process.env.RUNNER_OS === 'macOS' ? 10 : 5),
};
