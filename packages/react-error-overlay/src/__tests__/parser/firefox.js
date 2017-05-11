import { parse } from '../../utils/parser';

test('eval 1', () => {
  expect(
    parse(
      `test1@file:///C:/example.html line 7 > eval line 1 > eval:1:1
test2@file:///C:/example.html line 7 > eval:1:1
test3@file:///C:/example.html:7:6`.split('\n')
    )
  ).toEqual([
    {
      fileName: 'file:///C:/example.html',
      functionName: 'test1',
      lineNumber: 7,
      columnNumber: null,
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
    {
      fileName: 'file:///C:/example.html',
      functionName: 'test2',
      lineNumber: 7,
      columnNumber: null,
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
    {
      functionName: 'test3',
      fileName: 'file:///C:/example.html',
      lineNumber: 7,
      columnNumber: 6,
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
  ]);
});

test('eval 2', () => {
  expect(
    parse({
      stack: `anonymous@file:///C:/example.html line 7 > Function:1:1
@file:///C:/example.html:7:6`,
    })
  ).toEqual([
    {
      fileName: 'file:///C:/example.html',
      functionName: 'anonymous',
      lineNumber: 7,
      columnNumber: null,
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
    {
      fileName: 'file:///C:/example.html',
      functionName: null,
      lineNumber: 7,
      columnNumber: 6,
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
  ]);
});

test('stack with eval', () => {
  expect(
    parse(
      `e@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:25:9
@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html line 17 > eval:1:1
a@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:8:9
@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:32:7`
    )
  ).toEqual([
    {
      functionName: 'e',
      fileName: 'file:///Users/joe/Documents/Development/OSS/stack-frame/index.html',
      columnNumber: 9,
      lineNumber: 25,
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
      lineNumber: 17,
      columnNumber: null,
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
      columnNumber: 9,
      lineNumber: 8,
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
      columnNumber: 7,
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

test('v14 to v29', () => {
  expect(
    parse(
      `trace@file:///C:/example.html:9
b@file:///C:/example.html:16
a@file:///C:/example.html:19
@file:///C:/example.html:21`
    )
  ).toEqual([
    {
      functionName: 'trace',
      lineNumber: 9,
      columnNumber: null,
      fileName: 'file:///C:/example.html',
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
    {
      functionName: 'b',
      lineNumber: 16,
      columnNumber: null,
      fileName: 'file:///C:/example.html',
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
    {
      functionName: 'a',
      lineNumber: 19,
      columnNumber: null,
      fileName: 'file:///C:/example.html',
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
    {
      functionName: null,
      lineNumber: 21,
      columnNumber: null,
      fileName: 'file:///C:/example.html',
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
  ]);
});

test('v30+', () => {
  expect(
    parse(
      `trace@file:///C:/example.html:9:17
b@file:///C:/example.html:16:13
a@file:///C:/example.html:19:13
@file:///C:/example.html:21:9`
    )
  ).toEqual([
    {
      functionName: 'trace',
      lineNumber: 9,
      columnNumber: 17,
      fileName: 'file:///C:/example.html',
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
    {
      functionName: 'b',
      lineNumber: 16,
      columnNumber: 13,
      fileName: 'file:///C:/example.html',
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
    {
      functionName: 'a',
      lineNumber: 19,
      columnNumber: 13,
      fileName: 'file:///C:/example.html',
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
    {
      functionName: null,
      lineNumber: 21,
      columnNumber: 9,
      fileName: 'file:///C:/example.html',
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
    },
  ]);
});
