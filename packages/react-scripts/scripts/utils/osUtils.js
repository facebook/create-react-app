'use strict';

const spawn = require('react-dev-utils/crossSpawn');

module.exports = {
  runExternalCommandSync,
};

function runExternalCommandSync(command, args, ignoreErrors = false) {
  const proc = spawn.sync(command, args, { stdio: 'inherit' });
  if (proc.status !== 0) {
    const message = `\`${command} ${args.join(' ')}\` failed with status ${proc.status}`;
    console.error(message);
    if (!ignoreErrors) {
      throw new Error(message);
    }
  }
}
