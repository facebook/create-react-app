'use strict';

const { extname } = require('path');

function namedAssetImportPlugin({ types: t }) {
  const visited = new WeakSet();

  function generateNewSourcePath(loaderMap, moduleName, sourcePath) {
    const ext = extname(sourcePath).substr(1);
    const extMap = loaderMap[ext];
    return extMap[moduleName]
      ? extMap[moduleName].replace(/\[path\]/, sourcePath)
      : sourcePath;
  }

  function replaceMatchingSpecifiers(path, loaderMap, callback) {
    const sourcePath = path.node.source.value;
    const ext = extname(sourcePath).substr(1);

    if (visited.has(path.node) || sourcePath.indexOf('!') !== -1) {
      return;
    }

    if (loaderMap[ext]) {
      path.replaceWithMultiple(
        path.node.specifiers.map(specifier => {
          const newSpecifier = callback(specifier, sourcePath);
          visited.add(newSpecifier);

          return newSpecifier;
        })
      );
    }
  }

  return {
    visitor: {
      ExportNamedDeclaration(path, { opts: { loaderMap } }) {
        if (!path.node.source) {
          return;
        }

        replaceMatchingSpecifiers(path, loaderMap, (specifier, sourcePath) => {
          if (t.isExportDefaultSpecifier(specifier)) {
            return t.exportDeclaration(
              [t.exportDefaultSpecifier(t.identifier(specifier.local.name))],
              t.stringLiteral(sourcePath)
            );
          }

          return t.exportNamedDeclaration(
            null,
            [
              t.exportSpecifier(
                t.identifier(specifier.local.name),
                t.identifier(specifier.exported.name)
              ),
            ],
            t.stringLiteral(
              generateNewSourcePath(loaderMap, specifier.local.name, sourcePath)
            )
          );
        });
      },
      ImportDeclaration(path, { opts: { loaderMap } }) {
        replaceMatchingSpecifiers(path, loaderMap, (specifier, sourcePath) => {
          if (t.isImportDefaultSpecifier(specifier)) {
            return t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier(specifier.local.name))],
              t.stringLiteral(sourcePath)
            );
          }

          return t.importDeclaration(
            [
              t.importSpecifier(
                t.identifier(specifier.local.name),
                t.identifier(specifier.imported.name)
              ),
            ],
            t.stringLiteral(
              generateNewSourcePath(
                loaderMap,
                specifier.imported.name,
                sourcePath
              )
            )
          );
        });
      },
    },
  };
}

module.exports = namedAssetImportPlugin;
