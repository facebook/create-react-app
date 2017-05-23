'use strict';

const template = require('babel-template');

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

function hoistFunctionalComponentToWindow(
  t,
  name,
  generatedName,
  params,
  body
) {
  return template(
    `
    window[GEN_NAME] = function NAME(PARAMS) {
      BODY
    }
    `
  )({
    GEN_NAME: t.StringLiteral(generatedName),
    NAME: t.Identifier(`__hot__${name}__`),
    PARAMS: params,
    BODY: body,
  });
}

function decorateFunctionName(t, name, generatedName) {
  return template(
    `
    try {
      Object.defineProperty(window[GEN_NAME], 'name', {
        value: NAME
      });
    } catch (_ignored) {}
    `
  )({
    GEN_NAME: t.StringLiteral(generatedName),
    NAME: t.StringLiteral(name),
  });
}

function exportHoistedFunctionCallProxy(t, name, generatedName) {
  return template(
    `
    export default function NAME() {
      return window[GEN_NAME].apply(this, arguments);
    }
    `,
    { sourceType: 'module' }
  )({
    GEN_NAME: t.StringLiteral(generatedName),
    NAME: t.Identifier(name),
  });
}

module.exports = function({ types: t }) {
  return {
    visitor: {
      ExportDefaultDeclaration(path, state) {
        const { type } = path.node.declaration;
        if (
          type !== 'FunctionDeclaration' ||
          !functionReturnsElement(path.node.declaration)
        ) {
          return;
        }
        const { id: { name }, params, body } = path.node.declaration;

        const generatedName = `__hot__${state.file.opts.filename}$$${name}`;

        path.replaceWithMultiple([
          hoistFunctionalComponentToWindow(
            t,
            name,
            generatedName,
            params,
            body
          ),
          decorateFunctionName(t, name, generatedName),
          exportHoistedFunctionCallProxy(t, name, generatedName),
          template(
            `
            if (!module.hot.data) {
              module.hot.accept();
            } else {
              module.hot.data.acceptNext = () => module.hot.accept();
            }
            `
          )(),
          template(
            `
            module.hot.dispose(data => {
              window.__enqueueForceUpdate(() => {
                if (typeof data.acceptNext === 'function') {
                  data.acceptNext();
                }
              });
            });
            `
          )({}),
        ]);
      },
    },
  };
};
