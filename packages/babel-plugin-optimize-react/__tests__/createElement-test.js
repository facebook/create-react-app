'use strict';

const plugin = require('../index.js');
const babel = require('@babel/core');

function transform(code) {
  return babel.transform(code, {
    plugins: [plugin],
  }).code;
}

describe('React createElement transforms', () => {
  it('should transform React.createElement calls', () => {
    const test = `
      import React from "react";

      export function MyComponent() {
        return React.createElement("div");
      }
    `;
    const output = transform(test);
    expect(output).toMatchSnapshot();
  });

  it('should transform React.createElement calls #2', () => {
    const test = `
      const React = require("react");

      export function MyComponent() {
        return React.createElement("div", null, React.createElement("span", null, "Hello world!"));
      }
    `;
    const output = transform(test);
    expect(output).toMatchSnapshot();
  });

  it('should transform React.createElement calls #3', () => {
    const test = `
      const React = require("react");

      const node = React.createElement("div", null, React.createElement("span", null, "Hello world!"));

      export function MyComponent() {
        return node;
      }
    `;
    const output = transform(test);
    expect(output).toMatchSnapshot();
  });
});
