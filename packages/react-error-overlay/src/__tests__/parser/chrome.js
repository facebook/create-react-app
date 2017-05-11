import { parse } from '../../utils/parser';

test('stack with eval', () => {
  expect(
    parse(
      `TypeError: window[f] is not a function
    at e (file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:25:18)
    at eval (eval at c (file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:12:9), <anonymous>:1:1)
    at a (file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:8:9)
    at file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:32:7`
    )
  ).toEqual([
    {
      functionName: 'e',
      fileName: 'file:///Users/joe/Documents/Development/OSS/stack-frame/index.html',
      lineNumber: 25,
      columnNumber: 18,
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
    {
      functionName: 'eval',
      fileName: 'file:///Users/joe/Documents/Development/OSS/stack-frame/index.html',
      lineNumber: 12,
      columnNumber: 9,
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
      lineNumber: 8,
      columnNumber: 9,
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
    {
      functionName: null,
      fileName: 'file:///Users/joe/Documents/Development/OSS/stack-frame/index.html',
      lineNumber: 32,
      columnNumber: 7,
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
  ]);
});
