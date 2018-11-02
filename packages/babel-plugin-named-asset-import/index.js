'use strict';

const { extname } = require('path');

function namedAssetImportPlugin({ types: t }) {
  const visited = new WeakSet();

  function generateNewSource(loaderMap, moduleName, sourcePath) {
    const ext = extname(sourcePath).substr(1);
    const extMap = loaderMap[ext];
    return extMap[moduleName]
      ? extMap[moduleName].replace(/\[path\]/, sourcePath)
      : sourcePath;
  }

  function replaceNotVisitedSpecifiers(path, loaderMap, callback) {
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
      ExportNamedDeclaration(
        path,
        {
          opts: { loaderMap },
        }
      ) {
        if (!path.node.source) {
          return;
        }

        replaceNotVisitedSpecifiers(
          path,
          loaderMap,
          (specifier, sourcePath) => {
            if (t.isExportDefaultSpecifier(specifier)) {
              const defaultDeclaration = t.exportDeclaration(
                [t.exportDefaultSpecifier(t.identifier(specifier.local.name))],
                t.stringLiteral(sourcePath)
              );

              return defaultDeclaration;
            }

            const namedDeclaration = t.exportNamedDeclaration(
              null,
              [
                t.exportSpecifier(
                  t.identifier(specifier.local.name),
                  t.identifier(specifier.exported.name)
                ),
              ],
              t.stringLiteral(
                generateNewSource(loaderMap, specifier.local.name, sourcePath)
              )
            );

            return namedDeclaration;
          }
        );
      },
      ImportDeclaration(
        path,
        {
          opts: { loaderMap },
        }
      ) {
        replaceNotVisitedSpecifiers(
          path,
          loaderMap,
          (specifier, sourcePath) => {
            if (t.isImportDefaultSpecifier(specifier)) {
              const defaultDeclaration = t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier(specifier.local.name))],
                t.stringLiteral(sourcePath)
              );

              return defaultDeclaration;
            }

            const namedDeclaration = t.importDeclaration(
              [
                t.importSpecifier(
                  t.identifier(specifier.local.name),
                  t.identifier(specifier.imported.name)
                ),
              ],
              t.stringLiteral(
                generateNewSource(
                  loaderMap,
                  specifier.imported.name,
                  sourcePath
                )
              )
            );

            return namedDeclaration;
          }
        );
      },
    },
  };
}

module.exports = namedAssetImportPlugin;
