'use strict';
const { execSync } = require('child_process');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const getSources = (paths = [], sourceMethod = function() {}, exclude = []) => {
  const getSource = (somePath = '') => {
    try {
      if (fs.lstatSync(somePath).isDirectory()) {
        if (
          exclude.includes(somePath) ||
          exclude.find(excluded => somePath.startsWith(excluded))
        ) {
          return somePath;
        }
        const fileList = fs.readdirSync(somePath);
        return getSources(
          fileList.map(file => path.join(somePath, file)),
          sourceMethod
        );
      } else {
        return sourceMethod(somePath);
      }
    } catch (ignored) {
      return somePath;
    }
  };
  let result = '';
  for (let i = paths.length - 1; i >= 0; i--) {
    result += getSource(paths[i]);
  }
  return result;
};

const getSourceMethod = key => {
  const cases = {
    content: filePath => fs.readFileSync(filePath, 'utf-8'),
    mtime: filePath => `${filePath}_${fs.statSync(filePath).mtime}`,
  };

  const found = cases[key];

  if (found) {
    return found;
  }

  console.error(
    'Error from createHashFromPaths:\n\n',
    'Source method is not recognized, possible values are:\n\n',
    Object.keys(cases).map(e => '`' + e + '`').join(', '),
    '\n'
  );
  process.exit(1);
};

const toRelative = filePath => path.relative(process.cwd(), filePath);

const createHashFromPaths = ({ paths, exclude, method = 'mtime' }) => {
  try {
    const fileList = paths.map(toRelative).join(' ');
    const excludedPaths = exclude.map(toRelative).join(' ');
    const command = `tar --exclude ${excludedPaths} -cf - ${fileList} | md5`;
    return String(execSync(command));
  } catch (ignored) {
    const hash = crypto.createHash('md5');
    hash.update(paths.join(''));
    if (Array.isArray(paths)) {
      const sourceMethod = getSourceMethod(method);
      const sources = getSources(paths, sourceMethod, exclude);
      hash.update(sources);
    }
    return hash.digest('hex');
  }
};

module.exports = createHashFromPaths;
