'use strict';

const spawn = require('react-dev-utils/crossSpawn');

module.exports = {
  runExternalCommandSync,
};

function runExternalCommandSync(command, args) {
  const proc = spawn.sync(command, args, { stdio: 'inherit' });
  if (proc.status !== 0) {
    console.error(`\`${command} ${args.join(' ')}\` failed`);
    return;
  }
}
