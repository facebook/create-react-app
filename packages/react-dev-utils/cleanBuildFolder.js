"use strict";
var recursive = require("recursive-readdir");
var path = require("path");
var fs = require("fs");
var difference = require("lodash/difference");

module.exports = function cleanBuildFolder(appBuild, stats) {
  return new Promise(resolve => {
    // Read the current contents of build folder
    recursive(appBuild, (err, fileNames) => {
      var assets = stats.toJson().assets;
      var assetFileNames = assets
        .map(asset => path.join(appBuild, asset.name)) // Get the full path from stats
        .filter(Boolean);

      // Check the differences in hash
      var differences = difference(fileNames,assetFileNames)
        .filter((names) => names.includes(path.join(appBuild, 'static')))
        // Only delete in the static folder

      differences.forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
      resolve(differences);
    });
  });
};