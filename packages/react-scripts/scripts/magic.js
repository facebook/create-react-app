const chalk = require('chalk');

const error = console.error;
const red = chalk.red;

const resolveConfigFile = path => {
  try {
    const config = require(path);
    return config;
  } catch {
    error(
      red(
        'Magic requires a config file in order to work. No magic config file found in:'
      )
    );
    error(red('--' + path));
  }
};

module.exports = {
  resolveConfigFile,
};
