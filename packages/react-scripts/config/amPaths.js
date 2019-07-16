'use strict';

const SAAS = 'SAAS';
const SELF_HOSTED = 'SELF_HOSTED';
const SAAS_DIR = 'saas';
const SELF_HOSTED_DIR = 'self-hosted';

const getComponentRoot = () => {
  if (process.env.LOCATION === SAAS) {
    return `src/root/${SAAS_DIR}/index`;
  }
  if (process.env.LOCATION === SELF_HOSTED) {
    return `src/root/${SELF_HOSTED_DIR}/index`;
  }

  throw new Error(
    `env variable LOCATION must be set to ${SAAS} or ${SELF_HOSTED}.  Current value is ${
      process.env.LOCATION
    }`
  );
};

module.exports = {
  componentRoot: getComponentRoot(),
};
