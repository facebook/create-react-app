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

function createMemberExpression(t, path) {
  if (path.length > 2) {
    return t.MemberExpression(
      createMemberExpression(t, path.slice(0, -1)),
      t.Identifier(path[path.length - 1])
    );
  } else if (path.length === 2) {
    return t.MemberExpression(t.Identifier(path[0]), t.Identifier(path[1]));
  } else {
    return t.Identifier(path[0]);
  }
}

function createFunctionCall(t, path, args = []) {
  return t.CallExpression(createMemberExpression(t, path), args);
}

function hoistFunctionalComponentToWindow(t, name, params, body) {
  return t.ExpressionStatement(
    t.AssignmentExpression(
      '=',
      createMemberExpression(t, ['window', `__${name}__`]),
      t.FunctionExpression(t.Identifier(`__${name}__`), params, body)
    )
  );
}

function decorateFunctionName(t, name) {
  return t.TryStatement(
    t.BlockStatement([
      t.ExpressionStatement(
        createFunctionCall(
          t,
          ['Object', 'defineProperty'],
          [
            createMemberExpression(t, ['window', `__${name}__`]),
            t.StringLiteral('name'),
            t.ObjectExpression([
              t.ObjectProperty(t.Identifier('value'), t.StringLiteral(name)),
            ]),
          ]
        )
      ),
    ]),
    t.CatchClause(t.Identifier('_ignored'), t.BlockStatement([]))
  );
}

function exportHoistedFunctionCallProxy(t, name) {
  return t.ExportDefaultDeclaration(
    t.FunctionDeclaration(
      t.Identifier(name),
      [],
      t.BlockStatement([
        t.ReturnStatement(
          createFunctionCall(
            t,
            ['window', `__${name}__`, 'apply'],
            [t.ThisExpression(), t.Identifier('arguments')]
          )
        ),
      ])
    )
  );
}

module.exports = function({ types: t }) {
  return {
    visitor: {
      ExportDefaultDeclaration(path) {
        const { type } = path.node.declaration;
        if (
          type !== 'FunctionDeclaration' ||
          !functionReturnsElement(path.node.declaration)
        ) {
          return;
        }
        const { id: { name }, params, body } = path.node.declaration;

        path.replaceWithMultiple([
          hoistFunctionalComponentToWindow(t, name, params, body),
          decorateFunctionName(t, name),
          exportHoistedFunctionCallProxy(t, name),
          t.IfStatement(
            t.UnaryExpression(
              '!',
              createMemberExpression(t, ['module', 'hot', 'data'])
            ),
            t.BlockStatement([
              t.ExpressionStatement(
                createFunctionCall(t, ['module', 'hot', 'accept'])
              ),
            ]),
            t.BlockStatement([
              t.ExpressionStatement(
                t.AssignmentExpression(
                  '=',
                  createMemberExpression(t, [
                    'module',
                    'hot',
                    'data',
                    'acceptNext',
                  ]),
                  t.ArrowFunctionExpression(
                    [],
                    createFunctionCall(t, ['module', 'hot', 'accept'])
                  )
                )
              ),
            ])
          ),
          t.ExpressionStatement(
            createFunctionCall(
              t,
              ['module', 'hot', 'dispose'],
              [
                t.ArrowFunctionExpression(
                  [t.Identifier('data')],
                  t.BlockStatement([
                    t.ExpressionStatement(
                      createFunctionCall(
                        t,
                        ['window', '__enqueueForceUpdate'],
                        [
                          t.ArrowFunctionExpression(
                            [],
                            t.BlockStatement([
                              t.IfStatement(
                                t.BinaryExpression(
                                  '===',
                                  t.UnaryExpression(
                                    'typeof',
                                    createMemberExpression(t, [
                                      'data',
                                      'acceptNext',
                                    ])
                                  ),
                                  t.StringLiteral('function')
                                ),
                                t.BlockStatement([
                                  t.ExpressionStatement(
                                    createFunctionCall(t, [
                                      'data',
                                      'acceptNext',
                                    ])
                                  ),
                                ]),
                                null
                              ),
                            ])
                          ),
                        ]
                      )
                    ),
                  ])
                ),
              ]
            )
          ),
        ]);
      },
    },
  };
};
