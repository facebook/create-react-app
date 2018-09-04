'use strict';

// @remove-on-eject-begin
const path = require('path');
// @remove-on-eject-end

const aliases = {
  // @remove-on-eject-begin
  // Resolve Babel runtime relative to react-scripts.
  // It usually still works on npm 3 without this but it would be
  // unfortunate to rely on, as react-scripts could be symlinked,
  // and thus @babel/runtime might not be resolvable from the source.
  '@babel/runtime': path.dirname(
    require.resolve('@babel/runtime/package.json')
  ),
  // @remove-on-eject-end
  // Support React Native Web
  // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
  'react-native': 'react-native-web',
};

module.exports = aliases;
