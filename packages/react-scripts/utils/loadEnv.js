
var fs = require('fs');
var path = require('path');
var dotenv = require('dotenv');

var env = process.env.NODE_ENV;
var appDirectory = fs.realpathSync(process.cwd());

// CRA assumes two environments: development or production.
// There are some scenarios where we need to explicitly know that
// we are in a staging environment.
process.env.TC_ENV = env;

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
