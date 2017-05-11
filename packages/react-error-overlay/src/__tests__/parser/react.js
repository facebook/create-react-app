import { parse } from '../../utils/parser';

test('15.y.z', () => {
  expect(
    parse(
      `Warning: Each child in array should have a unique "key" prop. Check render method of \`FileA\`.
     in div (at FileA.js:9)
     in FileA (at App.js:9)
     in div (at App.js:8)
     in App (at index.js:7)`
    )
  ).toEqual([
    {
      functionName: 'div',
      fileName: 'FileA.js',
      lineNumber: 9,
      columnNumber: null,
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
    {
      functionName: 'FileA',
      fileName: 'App.js',
      lineNumber: 9,
      columnNumber: null,
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
    {
      functionName: 'div',
      fileName: 'App.js',
      lineNumber: 8,
      columnNumber: null,
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
    {
      functionName: 'App',
      fileName: 'index.js',
      lineNumber: 7,
      columnNumber: null,
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
  ]);
});
