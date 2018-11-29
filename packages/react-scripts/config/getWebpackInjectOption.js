'use strict';
module.exports = function getHtmlWebpackPluginInjectOption(env) {
  const v = env.raw.REACT_APP_HTML_INJECT;
  switch (true) {
    case v === 'head' || v === 'body':
      return v;
    case v === 'false':
      return false;
    default:
      return true;
  }
};
