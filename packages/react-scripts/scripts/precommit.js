const spawn = require('react-dev-utils/crossSpawn');
const { ownPath } = require('../config/paths');

const config = ownPath + '/config/lintstagedrc.js';

const proc = spawn.sync(require.resolve('lint-staged'), ['--config', config], {
  stdio: 'inherit',
});

if (proc.status !== 0) {
  process.exit(proc.status);
}
