'use strict';

const reactHooks = new Set([
  'useCallback',
  'useContext',
  'useDebugValue',
  'useEffect',
  'useImperativeHandle',
  'useLayoutEffect',
  'useMemo',
  'useReducer',
  'useRef',
  'useState',
]);

module.exports = function(babel) {
  const { types: t } = babel;

  // Collects named imports of React hooks from the "react" package
  function collectReactHooksAndRemoveTheirNamedImports(path, state) {
    const node = path.node;
    const hooks = [];
    if (t.isStringLiteral(node.source) && node.source.value === 'react') {
      const specifiers = path.get('specifiers');
      if (state.hasDefaultSpecifier === undefined) {
        state.hasDefaultSpecifier = false;
      }

      for (let specifier of specifiers) {
        if (t.isImportSpecifier(specifier)) {
          const importedNode = specifier.node.imported;
          const localNode = specifier.node.local;

          if (t.isIdentifier(importedNode) && t.isIdentifier(localNode)) {
            if (reactHooks.has(importedNode.name)) {
              hooks.push({
                imported: importedNode.name,
                local: localNode.name,
              });
              specifier.remove();
            }
          }
        } else if (t.isImportDefaultSpecifier(specifier)) {
          state.hasDefaultSpecifier = true;
        }
      }
      // If there is no default specifier for React, add one
      if (state.hasDefaultSpecifier === false && specifiers.length > 0) {
        const defaultSpecifierNode = t.importDefaultSpecifier(
          t.identifier('React')
        );

        path.pushContainer('specifiers', defaultSpecifierNode);
        state.hasDefaultSpecifier = true;
      }
    }
    return hooks;
  }

  function isReactImport(path) {
    if (t.isIdentifier(path)) {
      const identifierName = path.node.name;
      const binding = path.scope.getBinding(identifierName);

      if (binding !== undefined) {
        const bindingPath = binding.path;

        if (t.isImportDefaultSpecifier(bindingPath)) {
          const parentPath = bindingPath.parentPath;

          if (
            t.isImportDeclaration(parentPath) &&
            t.isStringLiteral(parentPath.node.source) &&
            parentPath.node.source.value === 'react'
          ) {
            return true;
          }
        } else if (t.isVariableDeclarator(bindingPath)) {
          const init = bindingPath.get('init');

          if (
            t.isCallExpression(init) &&
            t.isIdentifier(init.node.callee) &&
            init.node.callee.name === 'require' &&
            init.node.arguments.length === 1 &&
            t.isStringLiteral(init.node.arguments[0]) &&
            init.node.arguments[0].value === 'react'
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function isReferencingReactHook(path) {
    if (t.isIdentifier(path)) {
      const identifierName = path.node.name;
      const binding = path.scope.getBinding(identifierName);

      if (binding !== undefined) {
        const bindingPath = binding.path;

        if (t.isVariableDeclarator(bindingPath)) {
          const init = bindingPath.get('init');
          const bindingId = binding.identifier;

          if (t.isIdentifier(init) && isReactImport(init)) {
            if (reactHooks.has(bindingId.name)) {
              return true;
            }
            const id = bindingPath.get('id');

            if (t.isObjectPattern(id)) {
              const properties = id.get('properties');

              for (let property of properties) {
                if (
                  t.isObjectProperty(property) &&
                  property.node.value === bindingId &&
                  t.isIdentifier(property.node.key) &&
                  reactHooks.has(property.node.key.name)
                ) {
                  return true;
                }
              }
            }
          } else if (t.isMemberExpression(init)) {
            const object = init.get('object');
            const property = init.get('property');

            if (
              isReactImport(object) &&
              t.isIdentifier(property) &&
              reactHooks.has(property.node.name)
            ) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  function isUsingDestructuredArray(path) {
    const parentPath = path.parentPath;

    if (t.isVariableDeclarator(parentPath)) {
      const id = parentPath.get('id');
      return t.isArrayPattern(id);
    }
    return false;
  }

  function isCreateReactElementCall(path) {
    if (t.isCallExpression(path)) {
      const callee = path.get('callee');

      if (t.isMemberExpression(callee)) {
        const object = callee.get('object');
        const property = callee.get('property');

        if (
          isReactImport(object) &&
          t.isIdentifier(property) &&
          property.node.name === 'createElement'
        ) {
          return true;
        }
      }
    }
  }

  function createConstantCreateElementReference(reactReferencePath) {
    const identifierName = reactReferencePath.node.name;
    const binding = reactReferencePath.scope.getBinding(identifierName);
    const createElementReference = t.identifier('__reactCreateElement__');
    const createElementDeclaration = t.variableDeclaration('const', [
      t.variableDeclarator(
        createElementReference,
        t.memberExpression(t.identifier('React'), t.identifier('createElement'))
      ),
    ]);
    const bindingPath = binding.path;

    if (
      t.isImportDefaultSpecifier(bindingPath) ||
      t.isVariableDeclarator(bindingPath)
    ) {
      bindingPath.parentPath.insertAfter(createElementDeclaration);
      // Make sure we declare our new now so scope tracking continues to work
      const reactElementDeclarationPath = bindingPath.parentPath.getNextSibling();
      reactReferencePath.scope.registerDeclaration(reactElementDeclarationPath);
    }
    return createElementReference;
  }

  return {
    name: 'babel-plugin-optimize-react',
    visitor: {
      ImportDeclaration(path, state) {
        // Collect all hooks that are named imports from the React package. i.e.:
        //   import React, {useState} from "react";
        // As we collection them, we also remove the imports from the declaration.

        const importedHooks = collectReactHooksAndRemoveTheirNamedImports(
          path,
          state
        );
        if (importedHooks.length > 0) {
          // Create a destructured variable declaration. i.e.:
          //   const {useEffect, useState} = React;
          // Then insert it below the import declaration node.

          const declarations = t.variableDeclarator(
            t.objectPattern(
              importedHooks.map(({ imported, local }) =>
                t.objectProperty(
                  t.identifier(imported),
                  t.identifier(local),
                  false,
                  imported === local
                )
              )
            ),
            t.identifier('React')
          );
          const hookDeclarationNode = t.variableDeclaration('const', [
            declarations,
          ]);
          path.insertAfter(hookDeclarationNode);
          // Make sure we declare our new now so scope tracking continues to work
          const hookDeclarationPath = path.getNextSibling();
          path.scope.registerDeclaration(hookDeclarationPath);
        }
      },
      CallExpression(path, state) {
        if (state.destructuredCounter === undefined) {
          state.destructuredCounter = 0;
        }
        const calleePath = path.get('callee');

        // Ensure we found a primitive React hook that is using a destructuring array pattern
        if (
          isUsingDestructuredArray(path) &&
          isReferencingReactHook(calleePath)
        ) {
          const parentPath = path.parentPath;

          if (t.isVariableDeclarator(parentPath)) {
            const id = parentPath.get('id');
            const elements = id.get('elements');
            const kind = parentPath.parentPath.node.kind;
            // Replace the array destructure pattern with a reference node.

            const referenceNode = t.identifier(
              '_ref_' + state.destructuredCounter++
            );
            id.replaceWith(referenceNode);
            // Now insert references to the reference node, i.e.:
            //   const counter = __ref__[0];

            let arrayIndex = 0;
            for (let element of elements) {
              const arrayAccessNode = t.variableDeclaration(kind, [
                t.variableDeclarator(
                  element.node,
                  t.memberExpression(
                    referenceNode,
                    t.numericLiteral(arrayIndex++),
                    true
                  )
                ),
              ]);
              parentPath.parentPath.insertAfter(arrayAccessNode);
              // Make sure we declare our new now so scope tracking continues to work
              const arrayAccessPath = path.getNextSibling();
              path.scope.registerDeclaration(arrayAccessPath);
            }
          }
        } else if (isCreateReactElementCall(path)) {
          const callee = path.get('callee');
          const reactReferencePath = callee.get('object');

          if (state.createElementReference === undefined) {
            state.createElementReference = createConstantCreateElementReference(
              reactReferencePath
            );
          }
          callee.replaceWith(state.createElementReference);
        }
      },
    },
  };
};
