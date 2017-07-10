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
const t = require('babel-types');
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

function _getArrayValues(arr) {
  const { elements } = arr;
  return elements.map(e => {
    if (e.type === 'StringLiteral') {
      return e.value;
    }
    return e;
  });
}

// arr: [[afterExt, strExt1, strExt2, ...], ...]
function pushExtensions({ config, ast }, arr) {
  if (ast != null) {
    traverse(ast, {
      enter(path) {
        const { type } = path;
        if (type !== 'ArrayExpression') {
          return;
        }
        const { key } = path.parent;
        if (key == null || key.name !== 'extensions') {
          return;
        }
        const { elements } = path.node;
        const extensions = _getArrayValues(path.node);
        for (const [after, ...exts] of arr) {
          // Find the extension we want to add after
          const index = extensions.findIndex(s => s === after);
          if (index === -1) {
            throw new Error(
              `Unable to find extension ${after} in configuration.`
            );
          }
          // Push the extensions into array in the order we specify
          elements.splice(
            index + 1,
            0,
            ...exts.map(ext => t.stringLiteral(ext))
          );
          // Simulate into our local copy of the array to keep proper indices
          extensions.splice(index + 1, 0, ...exts);
        }
      },
    });
  } else if (config != null) {
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
}

function pushExclusiveLoader({ config, ast }, testStr, loader) {
  if (ast != null) {
    traverse(ast, {
      enter(path) {
        const { type } = path;
        if (type !== 'ArrayExpression') {
          return;
        }
        const { key } = path.parent;
        if (key == null || key.name !== 'oneOf') {
          return;
        }
        const entries = _getArrayValues(path.node);
        const afterIndex = entries.findIndex(entry => {
          const { properties } = entry;
          return (
            properties.find(property => {
              if (property.value.type !== 'RegExpLiteral') {
                return false;
              }
              return property.value.pattern === testStr.slice(1, -1);
            }) != null
          );
        });
        if (afterIndex === -1) {
          throw new Error('Unable to match pre-transform.');
        }
        entries.splice(afterIndex + 1, 0, loader);
      },
    });
  } else if (config != null) {
    const { module: { rules: [, { oneOf: rules }] } } = config;
    const jsTransformIndex = rules.findIndex(
      rule => rule.test.toString() === testStr
    );
    if (jsTransformIndex === -1) {
      throw new Error('Unable to match pre-transform.');
    }
    rules.splice(jsTransformIndex + 1, 0, loader);
  }
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
