#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const pkgFilename = path.join(__dirname, '../packages/react-scripts/package.json');
const pkg = require(pkgFilename);

const installedPackages = fs.readdirSync(path.join(__dirname, '../packages/react-scripts/node_modules'));

pkg.bundledDependencies = Object.keys(pkg.dependencies).filter(p => installedPackages.includes(p))

fs.writeFile(pkgFilename, JSON.stringify(pkg, null, 2), 'utf8', (err) => {
  if (err) throw err;
  console.log('bundled ' + pkg.bundledDependencies.length + ' dependencies.');
});
