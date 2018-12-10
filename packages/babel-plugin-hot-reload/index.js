'use strict';
const sysPath = require('path');
const fs = require('fs');

function functionReturnsElement(path) {
  const { body } = path.body;
  const last = body[body.length - 1];
  if (typeof last !== 'object' || last.type !== 'ReturnStatement') {
    return false;
  }
  const { type: returnType } = last.argument;
  if (returnType !== 'JSXElement') {
    return false;
  }
  return true;
}

function hotAssign(types, name, func) {
  return [
    types.variableDeclaration('var', [
      types.variableDeclarator(
        types.identifier(name),
        hotRegister(types, name, func)
      ),
    ]),
    types.exportDefaultDeclaration({ type: 'Identifier', name: name }),
  ];
}

function isHotCall(call) {
  return (
    call &&
    call.type === 'CallExpression' &&
    call.callee.type === 'MemberExpression' &&
    call.callee.object.name === 'window' &&
    call.callee.property.name === '__assign'
  );
}

function isIdentifierCandidate(identifier) {
  return (
    identifier.type === 'Identifier' &&
    identifier.name[0] >= 'A' &&
    identifier.name[0] <= 'Z'
  );
}

function isVariableCandidate(declaration) {
  return (
    isIdentifierCandidate(declaration.id) &&
    declaration.init &&
    !isHotCall(declaration.init)
  );
}

function isAssignmentCandidate(assignment) {
  return isIdentifierCandidate(assignment.left) && assignment.operator === '=';
}

function hotRegister(t, name, content) {
  if (t.isFunctionDeclaration(content)) {
    content.type = 'FunctionExpression'; // TODO: why do we have to do this hack?
  }
  return t.callExpression(
    t.memberExpression(t.identifier('window'), t.identifier('__assign')),
    [t.identifier('module'), t.stringLiteral(name), content]
  );
}

function hotDeclare(types, path) {
  path.replaceWith(
    types.variableDeclarator(
      types.identifier(path.node.id.name),
      hotRegister(types, path.node.id.name, path.node.init)
    )
  );
}

function isFile(path) {
  try {
    const stats = fs.lstatSync(path);
    return stats.isFile();
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

function naiveResolve(path, exts = ['js', 'jsx', 'ts', 'tsx']) {
  return [path, ...exts.map(ext => path + '.' + ext)].find(isFile) || null;
}

function shouldReloadFile(file) {
  // TODO: this is really naive
  const contents = fs.readFileSync(file, 'utf8');
  return contents.includes('React');
}

module.exports = function({ types }) {
  return {
    name: 'hot-reload',
    visitor: {
      ImportDeclaration(path) {
        if (this.file.code.includes('no-hot')) {
          return;
        }

        if (!types.isStringLiteral(path.node.source)) {
          return;
        }

        const target = path.node.source.value;
        if (!target.startsWith('.')) {
          return;
        }

        const file = naiveResolve(
          sysPath.resolve(sysPath.dirname(this.file.opts.filename), target)
        );
        if (file == null) {
          return;
        }

        if (shouldReloadFile(file)) {
          path.insertAfter(
            types.expressionStatement(
              types.callExpression(
                types.memberExpression(
                  types.memberExpression(
                    types.identifier('module'),
                    types.identifier('hot')
                  ),
                  types.identifier('accept')
                ),
                [
                  types.stringLiteral(target),
                  types.memberExpression(
                    types.identifier('window'),
                    types.identifier('__invalidate')
                  ),
                ]
              )
            )
          );
        }
      },
      ExportDefaultDeclaration(path) {
        if (this.file.code.includes('no-hot')) {
          return;
        }

        const { type } = path.node.declaration;
        if (
          type !== 'FunctionDeclaration' ||
          !functionReturnsElement(path.node.declaration)
        ) {
          return;
        }
        const {
          id: { name },
        } = path.node.declaration;
        path.replaceWithMultiple(hotAssign(types, name, path.node.declaration));
      },
      VariableDeclaration(path) {
        if (path.parent.type !== 'Program') {
          // Only traverse top level variable declaration
          return;
        }
        if (this.file.code.includes('no-hot')) {
          return;
        }

        path.traverse({
          VariableDeclarator(path) {
            if (isVariableCandidate(path.node)) {
              hotDeclare(types, path);
            }
          },
        });
      },
      ExpressionStatement(path) {
        if (path.parent.type !== 'Program') {
          // Only traverse top level variable declaration
          return;
        }
        if (this.file.code.includes('no-hot')) {
          return;
        }

        path.traverse({
          AssignmentExpression(path) {
            if (isAssignmentCandidate(path.node)) {
              if (!isHotCall(path.node.right)) {
                path.node.right = hotRegister(
                  types,
                  path.node.left.name,
                  path.node.right
                );
              }
            }
          },
        });
      },
    },
  };
};
