const createJestConfig = require('../scripts/utils/createJestConfig');

module.exports = (resolve, rootDir, isEjecting) => {
  const config = createJestConfig(resolve, rootDir, isEjecting);
  config.testMatch.push(
    '<rootDir>/test/**/?(*.)(spec|test).{js,jsx,mjs}',
    '<rootDir>/test/**/?(*.)(spec|test).{js,jsx,mjs}'
  );

  return config;
};
