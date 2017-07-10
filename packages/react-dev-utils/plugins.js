/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const template = require('babel-template');
const generator = require('babel-generator').default;
const { readFileSync } = require('fs');

function applyPlugins(config, plugins, { paths }) {
  const pluginPaths = plugins
    .map(p => {
      try {
        return require.resolve(`react-scripts-plugin-${p}`);
      } catch (e) {
        return null;
      }
    })
    .filter(e => e != null);
  for (const pluginPath of pluginPaths) {
    const { apply } = require(pluginPath);
    config = apply(config, { paths });
  }
  return config;
}

// arr: [[afterExt, strExt1, strExt2, ...], ...]
function pushExtensions(config, arr) {
  const { resolve: { extensions } } = config;

  for (const [after, ...exts] of arr) {
    // Find the extension we want to add after
    const index = extensions.findIndex(s => s === after);
    if (index === -1) {
      throw new Error(`Unable to find extension ${after} in configuration.`);
    }
    // Push the extensions into array in the order we specify
    extensions.splice(index + 1, 0, ...exts);
  }
}

function pushExclusiveLoader(config, testStr, loader) {
  const { module: { rules: [, { oneOf: rules }] } } = config;
  const jsTransformIndex = rules.findIndex(
    rule => rule.test.toString() === testStr
  );
  if (jsTransformIndex === -1) {
    throw new Error('Unable to find babel transform.');
  }
  rules.splice(jsTransformIndex + 1, 0, loader);
}

function _getArrayValues(arr) {
  const { elements } = arr;
  return elements.map(e => {
    if (e.type !== 'StringLiteral') {
      throw new Error('Must be a string.');
    }
    return e.value;
  });
}

function ejectFile(filename) {
  let code = readFileSync(filename, 'utf8');
  let ast = babylon.parse(code);

  let transforms = [];
  traverse(ast, {
    enter(path) {
      const { type } = path;
      if (type === 'VariableDeclaration') {
        const { node: { declarations: [{ id: { name }, init }] } } = path;
        if (name !== 'base') {
          return;
        }
        path.replaceWith(template('module.exports = RIGHT;')({ RIGHT: init }));
      } else if (type === 'AssignmentExpression') {
        const { node: { left, right } } = path;
        if (left.type !== 'MemberExpression') {
          return;
        }
        if (right.type !== 'CallExpression') {
          return;
        }
        const { callee: { name }, arguments: args } = right;
        if (name !== 'applyPlugins') {
          return;
        }
        transforms = _getArrayValues(args[1]);
        path.parentPath.remove();
      }
    },
  });
  console.log(transforms);
  return generator(
    ast,
    { sourceMaps: false, quotes: 'single', comments: true, retainLines: false },
    code
  ).code;
}

module.exports = {
  applyPlugins,
  pushExtensions,
  pushExclusiveLoader,
  ejectFile,
};
