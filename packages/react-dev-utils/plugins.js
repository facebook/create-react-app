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
const prettier = require('prettier');
const getPackageJson = require('read-pkg-up').sync;
const { dirname, isAbsolute } = require('path');
const semver = require('semver');

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
          throw new Error('Unable to match pre-loader.');
        }
        console.log('holy shit it works');
        path.node.elements.splice(afterIndex + 1, 0, loader);
      },
    });
  } else if (config != null) {
    const { module: { rules: [, { oneOf: rules }] } } = config;
    const loaderIndex = rules.findIndex(
      rule => rule.test.toString() === testStr
    );
    if (loaderIndex === -1) {
      throw new Error('Unable to match pre-loader.');
    }
    rules.splice(loaderIndex + 1, 0, loader);
  }
}

function ejectFile({ filename, code, existingDependencies }) {
  if (filename != null) {
    code = readFileSync(filename, 'utf8');
  }
  let ast = babylon.parse(code);

  let plugins = [];
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
        plugins = _getArrayValues(args[1]);
        path.parentPath.remove();
      }
    },
  });
  let deferredTransforms = [];
  const dependencies = new Map([...existingDependencies]);
  plugins.forEach(p => {
    let path;
    try {
      path = require.resolve(`react-scripts-plugin-${p}`);
    } catch (e) {
      return;
    }

    const { pkg: pluginPackage } = getPackageJson({ cwd: dirname(path) });
    for (const pkg of Object.keys(pluginPackage.dependencies)) {
      const version = pluginPackage.dependencies[pkg];
      if (dependencies.has(pkg)) {
        const prev = dependencies.get(pkg);
        if (
          isAbsolute(version) ||
          semver.satisfies(version.replace(/[\^~]/g, ''), prev)
        ) {
          continue;
        } else if (!semver.satisfies(prev.replace(/[\^~]/g, ''), version)) {
          throw new Error(
            `Dependency ${pkg}@${version} cannot be satisfied by colliding range ${pkg}@${prev}.`
          );
        }
      }
      dependencies.set(pkg, pluginPackage.dependencies[pkg]);
    }

    const pluginCode = readFileSync(path, 'utf8');
    const pluginAst = babylon.parse(pluginCode);
    traverse(pluginAst, {
      enter(path) {
        const { type } = path;
        if (type !== 'CallExpression') {
          return;
        }
        const { node: { callee: { name }, arguments: pluginArgs } } = path;
        switch (name) {
          case 'pushExtensions': {
            const [, _exts] = pluginArgs;
            const exts = _getArrayValues(_exts).map(entry =>
              _getArrayValues(entry)
            );
            deferredTransforms.push(
              pushExtensions.bind(undefined, { ast }, exts)
            );
            break;
          }
          case 'pushExclusiveLoader': {
            const [, { value: testStr }, _loader] = pluginArgs;
            deferredTransforms.push(
              pushExclusiveLoader.bind(undefined, { ast }, testStr, _loader)
            );
            break;
          }
          default: {
            // Not a call we care about
            break;
          }
        }
      },
    });
  });
  // Execute 'em!
  for (const transform of deferredTransforms) {
    transform();
  }
  let { code: outCode } = generator(
    ast,
    { sourceMaps: false, comments: true, retainLines: false },
    code
  );
  outCode = prettier.format(outCode, {
    singleQuote: true,
    trailingComma: 'es5',
  });

  return { code: outCode, dependencies };
}

module.exports = {
  applyPlugins,
  pushExtensions,
  pushExclusiveLoader,
  ejectFile,
};
