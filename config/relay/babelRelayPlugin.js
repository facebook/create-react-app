var paths = require('../paths');
var getbabelRelayPlugin = require('babel-relay-plugin');

var schema = require(paths.relaySchema);

module.exports = getbabelRelayPlugin(schema.data);
