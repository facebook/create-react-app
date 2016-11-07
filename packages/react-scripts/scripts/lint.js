var spawn = require('cross-spawn');

var args = [
    '--config',
    'tslint.json',
    '--exclude',
    'src/**/*.d.ts',
    'src/**/*.ts',
    'src/**/*.tsx'
];
var proc = spawn('tslint', args, {
    stdio: 'inherit'
});

// TODO also run eslint
