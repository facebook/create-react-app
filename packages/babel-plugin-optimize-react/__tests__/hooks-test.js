'use strict';

const plugin = require('../index.js');
const babel = require('@babel/core');

function transform(code) {
  return babel.transform(code, {
    plugins: [plugin],
  }).code;
}

describe('React hook transforms', () => {
  it('should support transform hook imports', () => {
    const test = `
      import React, {useState} from "react";
    `;
    const output = transform(test);
    expect(output).toMatchSnapshot();
  });

  it('should support hook imports with aliasing', () => {
    const test = `
      import React, {useState as foo} from "react";
    `;
    const output = transform(test);
    expect(output).toMatchSnapshot();
  });

  it('should support destructuring hooks from imports', () => {
    const test = `
      import React, {useState} from "react";

      export function MyComponent() {
        const [counter, setCounter] = useState(0);

        return React.createElement("div", null, counter);
      }
    `;
    const output = transform(test);
    expect(output).toMatchSnapshot();
  });

  it('should support destructuring hooks from imports #2', () => {
    const test = `
      import React from "react";
      const {useState} = React;

      export function MyComponent() {
        const [counter, setCounter] = useState(0);

        return React.createElement("div", null, counter);
      }
    `;
    const output = transform(test);
    expect(output).toMatchSnapshot();
  });

  it('should support destructuring hooks from imports #3', () => {
    const test = `
      import React from "react";
      const useState = React.useState;

      export function MyComponent() {
        const [counter, setCounter] = useState(0);

        return React.createElement("div", null, counter);
      }
    `;
    const output = transform(test);
    expect(output).toMatchSnapshot();
  });

  it('should support destructuring hooks from imports #4', () => {
    const test = `
      import React from "react";
      const foo = React.useState;

      export function MyComponent() {
        const [counter, setCounter] = foo(0);

        return React.createElement("div", null, counter);
      }
    `;
    const output = transform(test);
    expect(output).toMatchSnapshot();
  });

  it('should support destructuring hooks from imports #5', () => {
    const test = `
      import React, {useState as foo} from "react";

      export function MyComponent() {
        const [counter, setCounter] = foo(0);

        return React.createElement("div", null, counter);
      }
    `;
    const output = transform(test);
    expect(output).toMatchSnapshot();
  });

  it('should support destructuring hooks from require calls', () => {
    const test = `
      const React = require("react");
      const {useState} = React;

      export function MyComponent() {
        const [counter, setCounter] = useState(0);

        return React.createElement("div", null, counter);
      }
    `;
    const output = transform(test);
    expect(output).toMatchSnapshot();
  });

  it('should support hook imports with no default', () => {
    const test = `
      import {useState} from "react";
    `;
    const output = transform(test);
    expect(output).toMatchSnapshot();
  });

  it('should support hook CJS require with no default', () => {
    const test = `
      const {useState} = require("react");
    `;
    const output = transform(test);
    expect(output).toMatchSnapshot();
  });

  it('should support mixed hook imports', () => {
    const test = `
      import React from "react";
      import {memo, useState} from "react";
    `;
    const output = transform(test);
    expect(output).toMatchSnapshot();
  });

  it('should support mixed hook imports with no default', () => {
    const test = `
      import {useState} from "react";
      import {memo} from "react";
    `;
    const output = transform(test);
    expect(output).toMatchSnapshot();
  });
});
