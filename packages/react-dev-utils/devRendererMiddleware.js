'use strict';

const chalk = require('chalk');
const Module = require('module');
const path = require('path');
const tmp = require('tmp');
const fs = require('fs');
const clearConsole = require('./clearConsole');

module.exports = function devRendererMiddleware(
  nodeBuildPath,
  registerSourceMap
) {
  return (req, res, next) => {
    let cache = {};
    let { webpackStats, fs: memoryFs } = res.locals;

    // The index.html file contains `<script>` and `<link>` files that load
    // the web bundle. We provide it to the node app by writing it to a
    // temporary file.
    let indexMemoryPathname = path.join(nodeBuildPath, 'index.html');
    let indexHtmlTemplate = memoryFs.readFileSync(indexMemoryPathname, 'utf8');
    let { name: indexPathname, fd } = tmp.fileSync();
    fs.writeSync(fd, indexHtmlTemplate, 0, 'utf8');

    let cleanup = () => {
      clearCache(cache);
      fs.close(fd);
    };

    let handleError = (error = 'Unknown Error') => {
      try {
        // Handle any errors by injecting the stack trace into the rendered
        // HTML.
        if (error && typeof error !== 'string') {
          let indexHtml = indexHtmlTemplate
            .replace(/%\w+%/g, '')
            .replace(
              '<body>',
              '<body><pre style="border: 2px red solid; margin: 1rem; padding: 1rem;">' +
                error.stack +
                '</pre>'
            );
          renderError(res, indexHtml, error);
        } else {
          next(error);
        }
      } finally {
        cleanup();
      }
    };

    try {
      let stats = webpackStats.toJson({
        all: false,
        assets: true,
        entrypoints: true,
      });
      let node = stats.children[1];
      let nodeEntrypoints = node.entrypoints.main.assets
        .filter(asset => /\.js$/.test(asset))
        .map(asset => path.join(nodeBuildPath, asset));

      // Find any source map files, and pass them to the calling app so that
      // it can transform any error stack traces appropriately.
      for (let { name } of node.assets) {
        let pathname = path.join(nodeBuildPath, name);
        if (/\.map$/.test(pathname) && memoryFs.existsSync(pathname)) {
          registerSourceMap(pathname, memoryFs.readFileSync(pathname, 'utf8'));
        }
      }

      let { default: app } = requireFromFS(nodeEntrypoints[0], memoryFs, cache);
      process.env.HTML_TEMPLATE_PATH = indexPathname;
      let maybePromise = app(req, res, handleError);
      if (maybePromise && maybePromise.then) {
        maybePromise.then(cleanup, handleError);
      } else {
        cleanup();
      }
    } catch (error) {
      handleError(error);
    }
  };
};

function renderError(res, template, error) {
  res.status(500);
  res.send(template);

  clearConsole();
  console.log();
  console.log(chalk.red('An error occured while server-rendering your app:'));
  console.log();
  console.error(error);
}

// Stubs the `require()` function within any evaluated code, so that entire
// bundles can be loaded from a memory FS like the one passed in by Webpack.
//
// Based on require-from-string
// MIT License, Copyright (c) Vsevolod Strukchinsky
// https://github.com/floatdrop/require-from-string/blob/d1575a49065eb7a49b86b4de963f04f1a14dfd60/index.js
function requireFromFS(absoluteFilename, fs, cache = {}) {
  if (typeof absoluteFilename !== 'string') {
    throw new Error(
      '[requireFromFS] filename must be a string, not ' +
        typeof absoluteFilename
    );
  }

  let cached = cache[absoluteFilename];
  if (cached) {
    return cached.exports;
  }

  let moduleDirname = path.dirname(absoluteFilename);
  let moduleExtension = path.extname(absoluteFilename);
  let code = fs.readFileSync(absoluteFilename, 'utf8');

  if (typeof code !== 'string') {
    throw new Error(
      '[requireFromFS] code must be a string, not ' + typeof code
    );
  }

  if (moduleExtension === '.json') {
    code = 'module.exports = ' + code;
  }

  let paths = Module._nodeModulePaths(moduleDirname);
  let parent = module.parent;
  let m = new Module(absoluteFilename, parent);
  m.filename = absoluteFilename;
  m.require = filename => {
    if (filename[0] === '.') {
      let resolvedFilename = m.require.resolve(filename);
      return requireFromFS(resolvedFilename, fs, cache);
    } else {
      return require(filename);
    }
  };
  m.require.resolve = filename => {
    if (filename[0] === '.') {
      let resolvedFilename = path.resolve(moduleDirname, filename);
      if (fs.existsSync(resolvedFilename)) {
        return resolvedFilename;
      } else {
        throw new Error(`Cannot find module '${filename}'`);
      }
    } else {
      return require.resolve(filename);
    }
  };
  m.paths = paths;
  m._compile(code, absoluteFilename);
  cache[absoluteFilename] = m;
  require.cache[absoluteFilename] = m;

  if (parent && parent.children) {
    parent.children.splice(parent.children.indexOf(m), 1);
  }

  return m.exports;
}

function clearCache(cache) {
  let keys = Object.keys(cache);
  for (let key of keys) {
    delete cache[key];
    delete require.cache[key];
  }
}
