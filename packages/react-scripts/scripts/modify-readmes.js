var fs = require('fs-extra');
var path = require('path');
const args = process.argv;

//read md file as text
require.extensions['.md'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

var filenames = {
  BACKUP: 'README_BACKUP.md',
  README: 'README.MD',
  CUSTOM_README: 'CUSTOM_README.md'
};

var paths = {
  //original
  RSreadme: path.join(__dirname, '..', filenames.README),
  CRAreadme: path.join(__dirname, '../../../', filenames.README),
  //custom
  customReadme: path.join(__dirname, '../bin/', filenames.CUSTOM_README),
  //backup
  RSbackup: path.join(__dirname, '..', filenames.BACKUP),
  CRAbackup: path.join(__dirname, '../../../', filenames.BACKUP)
};

function backupOriginal() {
  fs.copySync(paths.RSreadme, paths.RSbackup);
  fs.copySync(paths.CRAreadme, paths.CRAbackup);
}

function deleteBackup() {
  fs.removeSync(paths.RSbackup);
  fs.removeSync(paths.CRAbackup);
}

function deleteOriginal() {
  fs.removeSync(paths.RSreadme);
  fs.removeSync(paths.CRAreadme);
}

function placeCustom() {
  fs.copySync(paths.customReadme, paths.RSreadme);
  fs.copySync(paths.customReadme, paths.CRAreadme);
}

function placeOriginal() {
  fs.copySync(paths.RSbackup, paths.RSreadme);
  fs.copySync(paths.CRAbackup, paths.CRAreadme);
}

//will set custom readmes
function setCustom() {
  backupOriginal();
  deleteOriginal();
  placeCustom();
}

//will revert original readmes
function revertOriginalBackups() {
  deleteOriginal();
  placeOriginal();
  deleteBackup();
}

var argFunctionMap = {
  '--custom': setCustom,
  '--original': revertOriginalBackups,
}

if (args && args.length >= 2) {
  var command = argFunctionMap[args[2]];
  command && command();
}