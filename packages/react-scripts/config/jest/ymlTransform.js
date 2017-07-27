var yaml = require('js-yaml');

module.exports = {
  process(src, filename, config, options) {
    this.cacheable && this.cacheable();
    var res = yaml.safeLoad(src);
    return 'module.exports = ' + JSON.stringify(res, undefined, '\t') + ';';
  },
};