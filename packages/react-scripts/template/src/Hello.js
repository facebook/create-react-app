import React, { useState } from 'react';
import CounterClass from './CounterClass';
import CounterFunction from './CounterFunction';
import HOCClass from './HOCClass';
import HOCFunction from './HOCFunction';

let HCC;
let HCF;
let HFC;
let HFF;

let Hello = window.__assign(module, 'Hello', function Hello() {
  const [value] = useState(Math.random());

  return (
    <h3>
      {value.toString().slice(0, 5)}
      <br />
      hello world!
      <br />
      class: <CounterClass hocChild />
      <br />
      function: <CounterFunction hocChild />
      <br />
      hocs: <HCC /> <HCF /> <HFC /> <HFF />
    </h3>
  );
});

HCC = window.__assign(module, 'HCC', HOCClass(CounterClass, 'red'));
HCF = window.__assign(module, 'HCF', HOCClass(CounterFunction, 'orange'));
HFC = window.__assign(module, 'HFC', HOCFunction(CounterClass, 'yellow'));
HFF = window.__assign(module, 'HFF', HOCFunction(CounterFunction, 'green'));

export default Hello;
