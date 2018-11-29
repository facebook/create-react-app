'use strict';

const fs = require('fs');
const path = require('path');

exports.makeDotEnvFile = function(appPath, lang) {
  const envLocal = [
    'NODE_PATH=src',
    'GENERATE_SOURCEMAP=true',
    'REACT_APP_IS_DEBUG=true'
  ];

  const envProd = [
    'NODE_PATH=src',
    'GENERATE_SOURCEMAP=false',
    'REACT_APP_IS_DEBUG=false'
  ];
  const devLang = 'DEV_LANG=' + lang;
  const envLocalPath = path.resolve(appPath, '.env');
  const envProdPath = path.resolve(appPath, '.env.production');

  if (fs.existsSync(envLocalPath)) {
    fs.removeSync(envLocalPath);
  }

  if (fs.existsSync(envProdPath)) {
    fs.removeSync(envProdPath);
  }

  fs.writeFile(envLocalPath, envLocal.concat([devLang]).join('\n'), 'utf8', function(err){
    if (err) {
      console.error(err);
    }
  });

  fs.writeFile(envProdPath, envProd.concat([devLang]).join('\n'), 'utf8', function(err){
    if (err) {
      console.error(err);
    }
  });
}