const path = require('path');

module.exports = {
    entry: {
      global: 'global.js',
      subtheme: 'subtheme.js',
    },
    alias: {
        "@dashboard": "pages/dashboard",
    },
    includePaths: [
        path.resolve(__dirname, "../subtheme/resources"),
    ],
}
