import React, { useState } from 'react';
import CounterClass from './CounterClass';
import CounterFunction from './CounterFunction';
import HOCClass from './HOCClass';
import HOCFunction from './HOCFunction';

let HCC = HOCClass(CounterClass, 'red');
let HCF = HOCClass(CounterFunction, 'orange');
let HFC = HOCFunction(CounterClass, 'yellow');
let HFF = HOCFunction(CounterFunction, 'green');

function Hello() {
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
}

export default Hello;
