'use strict';

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

function hotAssign(name, func) {
  return [
    {
      type: 'VariableDeclaration',
      kind: 'let',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: name },
          init: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'window' },
              property: { type: 'Identifier', name: '__assign' },
              computed: false,
            },
            arguments: [
              { type: 'Identifier', name: 'module' },
              { type: 'StringLiteral', value: name },
              func,
            ],
          },
        },
      ],
    },
    {
      type: 'ExportDefaultDeclaration',
      declaration: { type: 'Identifier', name: name },
    },
  ];
}

function getExportDefaultDeclaration(t) {
  return function ExportDefaultDeclaration(path) {
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
    path.replaceWithMultiple(hotAssign(name, path.node.declaration));

    // const generatedName = `__hot__${state.file.opts.filename}$$${name}`;

    // path.replaceWithMultiple([
    //   hoistFunctionalComponentToWindow(t, name, generatedName, params, body),
    //   decorateFunctionName(t, name, generatedName),
    //   exportHoistedFunctionCallProxy(t, name, generatedName),
    //   decorateFunctionId(t, name, generatedName),
    //   template(
    //     `
    //   module.hot.accept();
    //   `
    //   )(),
    //   template(
    //     `
    //   module.hot.dispose(() => {
    //     setTimeout(() => window.__enqueueForceUpdate(NAME));
    //   });
    //   `
    //   )({ NAME: t.Identifier(name) }),
    // ]);
  };
}

module.exports = function({ types }) {
  return {
    name: 'hot-reload',
    visitor: {
      ExportDefaultDeclaration: getExportDefaultDeclaration(types),
    },
  };
};
