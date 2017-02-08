
var fs = require('fs');
var path = require('path');
var dotenv = require('dotenv');
var paths = require('../config/paths');
var pkg = require(paths.appPackageJson);
var git = require('git-rev-sync');

var env = process.env.NODE_ENV;
var appDirectory = fs.realpathSync(process.cwd());

// CRA assumes two environments: development or production.
// There are some scenarios where we need to explicitly know that
// we are in a staging environment.
process.env.TC_ENV = env;

process.env.TC_CLIENT_APP_NAME = pkg.name,
process.env.TC_CLIENT_BUILD_COMMIT = git.long(),
process.env.TC_CLIENT_BUILD_TIME = (new Date()).toISOString()


// dotenv will not change values that are already set, sourcing the
// overrides firsts means they will beat anything in the default
// [process.env.NODE_ENV].env file.
dotenv.config({
  silent: true, // Don't complain if there isn't a file
  path: path.resolve(appDirectory, env + '.env.overrides')
});

dotenv.config({
  silent: true,
  path: path.resolve(appDirectory, env + '.env')
});
