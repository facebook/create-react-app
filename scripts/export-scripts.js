var fs = require('fs');

if (!(
  process.argv[2] === '--i-know-what-im-doing' &&
  process.argv[3] === '--there-is-no-going-back'
)) {
  console.log(
    'This command will copy all the scripts and configurations',
    'from the create-react-app command to your directory.',
    'You will be able to tweak and extend them but be aware that',
    'this is a one way operation, there is no going back'
  );
  console.log(
    'If you want to run this, please type the following command'
  );
  console.log(
    '  npm run export-scripts --i-know-what-im-doing --there-is-no-going-back'
  );
  process.exit(1);
}

console.log('Extracting scripts...');

var hostPath = __dirname;
var selfPath = hostPath + '/node_modules/create-react-app-scripts';

var files = [
  'scripts',
  '.webpack.config.dev.js',
  '.webpack.config.prod.js',
  '.babelrc',
  '.eslintrc',
];

// Ensure that the host folder is clean and we won't override any files
files.forEach(function(file) {
  if (fs.existsSync(hostPath + '/' + file)) {
    console.error(
      '`' + file + '` already exists on your app folder, we cannot ' +
      'continue as you would lose all the changes.',
      'Please delete it (maybe make a copy for backup) and run this ' +
      'command again.'
    );
    process.exit(1);
  }
});

// Move the files over
files.forEach(function(file) {
  fs.renameSync(selfPath + '/' + file, hostPath + '/' + file);
});

var hostPackage = require(hostPath + '/package.json');
var selfPackage = require(selfPath + '/package.json');

// Copy over dependencies
hostPackage.dependencies = hostPackage.dependencies || {};
for (var key in selfPackage.dependencies) {
  hostPackage.devDependencies[key] = selfPackage.dependencies[key];
}

delete hostPackage.dependencies['create-react-app-scripts'];

// Update the script rules
['start', 'build'].forEach(function(command) {
  hostPackage.scripts[command] = 'node scripts/' + command + '.js local';
});
delete hostPackage['export-scripts'];

fs.writeFileSync(hostPath + '/package.json', JSON.stringify(hostPackage, null, 2));

// TODO: run npm install in hostPath

// Move the src folder

console.log('Done!');
