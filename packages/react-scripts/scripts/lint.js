var spawn = require('cross-spawn');

var args = [
    'run',
    'tslint',
    '--config',
    'tslint.json',
    '--exclude',
    'src/**/*.d.ts',
    'src/**/*.ts',
    'src/**/*.tsx'
];
var proc = spawn('npm', args, {
    stdio: 'inherit'
});

// TODO also run eslint
