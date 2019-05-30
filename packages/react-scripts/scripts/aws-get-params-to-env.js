/**
 * Usage
 *
 * To use this module you require a js or JSON file that exports a map of keynames to aws env paths
 *
 * e.g. { "GIT_PUBLISH_TOKEN": '/env/default/GIT_PUBLISH_TOKEN'}
 *
 * The default location for the configuration is relative to cwd at path /config/aws-params.
 * this can be overwritten by using --config=path/to/config
 * region defaults to us-west-2 and can be overweritten using --region=new-region
 * to decrypt values ensure the flag --with-decryption is used
 *
 * options:
 * --with-decryption
 * --config={path/to/config}
 * --region={region}
 * --debug
 */

'use strict';

const path = require('path');
const SSM = require('aws-sdk/clients/ssm');
const { argv } = require('yargs');

const cliOpts = {
  configPath: path.join(process.cwd(), argv.config || 'config/aws-params'),
  region: argv.region || 'us-west-2',
  withDecryption: !!argv.withDecryption,
};

if (argv.debug) {
  console.log('Options');
  ['configPath', 'region', 'withDecryption'].forEach(opt => {
    console.log(`${opt}: ${cliOpts[opt]}`);
  });
}

let config;

try {
  config = require(cliOpts.configPath);
} catch (e) {
  console.error(e, '\n', 'config file could not be found');
  process.exit(1);
}

const getConfigKeyByRef = ref => {
  return Object.entries(config).find(([_, value]) => value === ref)[0];
};

const awsOptions = {
  region: cliOpts.region,
};

const callParams = {
  Names: Object.values(config),
  WithDecryption: cliOpts.withDecryption,
};

const awsSSM = new SSM(awsOptions);

awsSSM.getParameters(callParams, (e, data) => {
  if (e) {
    console.error(e);
    process.exit(1);
  }
  const vars = data.Parameters.reduce(
    (accu, param) => ({
      ...accu,
      [getConfigKeyByRef(param.Name)]: param.Value,
    }),
    {}
  );
  Object.entries(vars).forEach(([key, value]) =>
    console.log(`${key}="${value}"`)
  );
});
