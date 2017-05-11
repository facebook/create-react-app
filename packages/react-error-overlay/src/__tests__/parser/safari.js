import { parse } from '../../utils/parser';

test('stack with eval', () => {
  expect(
    parse(
      `e@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:25:18
eval code
eval@[native code]
a@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:8:10
global code@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:32:8`
    )
  ).toEqual([
    {
      functionName: 'e',
      fileName: 'file:///Users/joe/Documents/Development/OSS/stack-frame/index.html',
      columnNumber: 18,
      lineNumber: 25,
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
    {
      functionName: 'a',
      fileName: 'file:///Users/joe/Documents/Development/OSS/stack-frame/index.html',
      columnNumber: 10,
      lineNumber: 8,
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
    {
      functionName: 'global code',
      fileName: 'file:///Users/joe/Documents/Development/OSS/stack-frame/index.html',
      columnNumber: 8,
      lineNumber: 32,
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
  ]);
});
