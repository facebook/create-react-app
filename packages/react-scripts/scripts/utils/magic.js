const paths = require("../../config/paths");

const chalk = require("chalk");
const error = console.error;

const resolveMagicConfig = () => {
  try {
    return require(paths.resolveApp('magic.config.js'));
  } catch (e) {
    error(chalk.red(`Magic requires a config file ${chalk.underline('(magic.config.js)')} in order to work. No magic config has been detected.`));
    process.exit(0);
  }
}

module.exports = {
  resolveMagicConfig,
}
