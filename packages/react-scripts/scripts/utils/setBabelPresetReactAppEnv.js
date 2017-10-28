'use strict';

module.exports = () => {
  const argv = process.argv.slice(2);
  if (argv.indexOf('--coverage') >= 0) {
    process.env.BABEL_PRESET_REACT_APP_ENV = 'coverage';
  }
};
