/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

//@flow

/** A container holding a script line. */
class ScriptLine {
  /** The line number of this line of source. */
  lineNumber: number;
  /** The content (or value) of this line of source. */
  content: string;
  /** Whether or not this line should be highlighted. Particularly useful for error reporting with context. */
  highlight: boolean;

  constructor(lineNumber: number, content: string, highlight: boolean = false) {
    this.lineNumber = lineNumber;
    this.content = content;
    this.highlight = highlight;
  }
}

/**
 * A representation of a stack frame.
 */
class StackFrame {
  functionName: string | null;
  fileName: string | null;
  lineNumber: number | null;
  columnNumber: number | null;

  _originalFunctionName: string | null;
  _originalFileName: string | null;
  _originalLineNumber: number | null;
  _originalColumnNumber: number | null;

  _scriptCode: ScriptLine[] | null;
  _originalScriptCode: ScriptLine[] | null;

  constructor(
    functionName: string | null = null,
    fileName: string | null = null,
    lineNumber: number | null = null,
    columnNumber: number | null = null,
    scriptCode: ScriptLine[] | null = null,
    sourceFunctionName: string | null = null,
    sourceFileName: string | null = null,
    sourceLineNumber: number | null = null,
    sourceColumnNumber: number | null = null,
    sourceScriptCode: ScriptLine[] | null = null
  ) {
    this.functionName = functionName;

    this.fileName = fileName;
    this.lineNumber = lineNumber;
    this.columnNumber = columnNumber;

    this._originalFunctionName = sourceFunctionName;
    this._originalFileName = sourceFileName;
    this._originalLineNumber = sourceLineNumber;
    this._originalColumnNumber = sourceColumnNumber;

    this._scriptCode = scriptCode;
    this._originalScriptCode = sourceScriptCode;
  }

  /**
   * Returns the name of this function.
   */
  getFunctionName(): string | null {
    return this.functionName;
  }

  /**
   * Returns the source of the frame.
   * This contains the file name, line number, and column number when available.
   */
  getSource(): string {
    let str = '';
    if (this.fileName != null) {
      str += this.fileName + ':';
    }
    if (this.lineNumber != null) {
      str += this.lineNumber + ':';
    }
    if (this.columnNumber != null) {
      str += this.columnNumber + ':';
    }
    return str.slice(0, -1);
  }

  /**
   * Returns a pretty version of this stack frame.
   */
  toString(): string {
    const f = this.getFunctionName();
    if (f == null) {
      return this.getSource();
    }
    return `${f} (${this.getSource()})`;
  }
}

export { StackFrame, ScriptLine };
export default StackFrame;
