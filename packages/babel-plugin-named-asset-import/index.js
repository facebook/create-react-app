'use strict';

const { extname } = require('path');

function namedAssetImportPlugin({ types: t }) {
  const visited = new WeakSet();

  let generateNewSource = function(loaderMap, moduleName, sourcePath) {
    const ext = extname(sourcePath).substr(1);
    const extMap = loaderMap[ext];
    return extMap[moduleName]
      ? extMap[moduleName].replace(/\[path\]/, sourcePath)
      : sourcePath;
  };
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

        const sourcePath = path.node.source.value;
        const ext = extname(sourcePath).substr(1);

        if (visited.has(path.node) || sourcePath.indexOf('!') !== -1) {
          return;
        }

        if (loaderMap[ext]) {
          path.replaceWithMultiple(
            path.node.specifiers.map(specifier => {
              if (t.isExportDefaultSpecifier(specifier)) {
                const defaultDeclaration = t.exportDeclaration(
                  [
                    t.exportDefaultSpecifier(
                      t.identifier(specifier.local.name)
                    ),
                  ],
                  t.stringLiteral(sourcePath)
                );

                visited.add(defaultDeclaration);
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

              visited.add(namedDeclaration);
              return namedDeclaration;
            })
          );
        }
      },
      ImportDeclaration(
        path,
        {
          opts: { loaderMap },
        }
      ) {
        const sourcePath = path.node.source.value;
        const ext = extname(sourcePath).substr(1);

        if (visited.has(path.node) || sourcePath.indexOf('!') !== -1) {
          return;
        }

        if (loaderMap[ext]) {
          path.replaceWithMultiple(
            path.node.specifiers.map(specifier => {
              if (t.isImportDefaultSpecifier(specifier)) {
                const defaultDeclaration = t.importDeclaration(
                  [
                    t.importDefaultSpecifier(
                      t.identifier(specifier.local.name)
                    ),
                  ],
                  t.stringLiteral(sourcePath)
                );

                visited.add(defaultDeclaration);
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

              visited.add(namedDeclaration);
              return namedDeclaration;
            })
          );
        }
      },
    },
  };
}

module.exports = namedAssetImportPlugin;
