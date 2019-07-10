const CorberWebpackPlugin = require('corber-webpack-plugin');

console.log('Our react-script updates are here');
console.log(
  'CorberWebpackPlugin installed correctly',
  CorberWebpackPlugin != undefined,
  CorberWebpackPlugin
);
module.exports = {
  plugins: [new CorberWebpackPlugin()],
};
