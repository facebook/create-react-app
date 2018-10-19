'use strict';

const { extname } = require('path');

function namedAssetImportPlugin({ types: t }) {
  const visited = new WeakSet();

  return {
    visitor: {
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
