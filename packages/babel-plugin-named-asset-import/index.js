'use strict';

const { extname } = require('path');

function namedAssetImportPlugin({ types: t }) {
  const visited = new WeakSet();

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
                const newDefaultImport = t.exportDeclaration(
                  [
                    t.exportDefaultSpecifier(
                      t.identifier(specifier.local.name)
                    ),
                  ],
                  t.stringLiteral(sourcePath)
                );

                visited.add(newDefaultImport);
                return newDefaultImport;
              }

              const newImport = t.exportNamedDeclaration(
                null,
                [
                  t.exportSpecifier(
                    t.identifier(specifier.local.name),
                    t.identifier(specifier.exported.name)
                  ),
                ],
                t.stringLiteral(
                  loaderMap[ext][specifier.local.name]
                    ? loaderMap[ext][specifier.local.name].replace(
                        /\[path\]/,
                        sourcePath
                      )
                    : sourcePath
                )
              );

              visited.add(newImport);
              return newImport;
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
                const newDefaultImport = t.importDeclaration(
                  [
                    t.importDefaultSpecifier(
                      t.identifier(specifier.local.name)
                    ),
                  ],
                  t.stringLiteral(sourcePath)
                );

                visited.add(newDefaultImport);
                return newDefaultImport;
              }

              const newImport = t.importDeclaration(
                [
                  t.importSpecifier(
                    t.identifier(specifier.local.name),
                    t.identifier(specifier.imported.name)
                  ),
                ],
                t.stringLiteral(
                  loaderMap[ext][specifier.imported.name]
                    ? loaderMap[ext][specifier.imported.name].replace(
                        /\[path\]/,
                        sourcePath
                      )
                    : sourcePath
                )
              );

              visited.add(newImport);
              return newImport;
            })
          );
        }
      },
    },
  };
}

module.exports = namedAssetImportPlugin;
