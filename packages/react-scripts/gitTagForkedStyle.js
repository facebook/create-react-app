const { version, upstreamVersion } = require('./package');
const osUtils = require('./scripts/utils/osUtils');

const command = 'git';
const args = ['tag', `v${version}-upstream-${upstreamVersion}`];
osUtils.runExternalCommandSync(command, args);
