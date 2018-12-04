import React, { useState } from 'react';
import CounterClass from './CounterClass';
import CounterFunction from './CounterFunction';
import HOCClass from './HOCClass';
import HOCFunction from './HOCFunction';

let Hello = window.__createProxy(module, 'Hello');
let HCC = window.__createProxy(module, 'CounterClass');
let HCF = window.__createProxy(module, 'HCF');
let HFC = window.__createProxy(module, 'HFC');
let HFF = window.__createProxy(module, 'HFF');

HCC.__setImpl(HOCClass(CounterClass, 'red'));
HCF.__setImpl(HOCClass(CounterFunction, 'orange'));
HFC.__setImpl(HOCFunction(CounterClass, 'yellow'));
HFF.__setImpl(HOCFunction(CounterFunction, 'green'));
Hello.__setImpl(function HelloImpl() {
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

export default Hello;
