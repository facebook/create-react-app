var path = require('path');
var chalk = require('chalk');

var pkg = require('../../package.json')

var friendlySyntaxErrorLabel = 'Syntax error';
function isLikelyASyntaxError(message) {
  return message.indexOf('SyntaxError') !== -1;
}

function formatMessage(message) {
  return message
    // Make some common errors shorter:
    .replace(
      // Babel syntax error
      'Module build failed: SyntaxError:',
      friendlySyntaxErrorLabel
    )
    .replace(
      // Webpack file not found error
      /Module not found: Error: Cannot resolve 'file' or 'directory'/,
      'Module not found:'
    )
    // Internal stacks are generally useless so we strip them
    .replace(/^\s*at\s.*:\d+:\d+[\s\)]*\n/gm, '') // at ... ...:x:y
    // Webpack loader names obscure CSS filenames
    .replace('./~/css-loader!./~/postcss-loader!', '');
}

var cli = require('pretty-cli')({
  template: require('./cli-template')
});

cli.addCustomMethod('clear', function(){
  process.stdout.write('\x1bc');
})

cli.addCustomMethod('displayHeader', function(){
  cli.log(pkg.name.toUpperCase() +' '+pkg.version + '\n')
})

cli.addCustomMethod('buildInfo', function(stats){

  'use strict';
  var buildInfo = [];
  try {
    var packageData = require(process.cwd() + '/package.json');
    buildInfo.push('Name: '+packageData.name)
    buildInfo.push('Version: '+packageData.version)
  } catch (e) {
    // There was no package.json
    return;
  }

  buildInfo.push('Compiling time: '+ ((stats.endTime-stats.startTime)/ 1000).toFixed(2)+'ms')
  buildInfo.push('HASH: '+ stats.hash+'\n')
  cli.info({type:'title', name:'PKG', message:buildInfo})
})
cli.addCustomMethod('displayWarnings', function(title, messages){
  if(!messages.length) return;

  cli.warning({type:'title', name:'WARNING', message: title});

  var rx = path.join(__dirname,'../../')+'.*\n';
  var processDir = path.join(process.cwd(),'../')
  messages.forEach(message=>{
    var messageString = formatMessage(message)
                          .replace(new RegExp(rx,''), '\033[0m')
                          .replace(new RegExp(processDir), './');
    cli.warning('Warning in '+ messageString);
  })

  cli.note(['You may use special comments to disable some warnings.',
  'Use ' + chalk.yellow('// eslint-disable-next-line') + ' to ignore the next line.',
  'Use ' + chalk.yellow('/* eslint-disable */') + ' to ignore all warnings in a file.'
  ]);
})

cli.addCustomMethod('displayErrors', function(title, messages){
  if(!messages.length) return;
  cli.error({type:'title', name:'ERROR', message: title});
  var isSyntaxError = false;
  if (messages.some(isLikelyASyntaxError)) {
    // If there are any syntax errors, show just them.
    // This prevents a confusing ESLint parsing error
    // preceding a much more useful Babel syntax error.
    messages = messages.filter(isLikelyASyntaxError);
    isSyntaxError = true;
  }

  var rx = path.join(__dirname,'../../')+'[^:]*: ';
  var processDir = path.join(process.cwd(),'../')

  messages.forEach(message => {
    var messageString = formatMessage(message)
                          .replace(new RegExp(rx,''), '   ')
                          .replace(new RegExp(processDir), './');
    // if(isSyntaxError){
      cli.error(messageString);
    // } else {
      // cli.error('Error in ' + messageString);
    // }

  });

})
module.exports = cli;
