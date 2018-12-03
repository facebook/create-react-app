import React, { useState } from 'react';
import CounterClass from './CounterClass';
import CounterFunction from './CounterFunction';
import HOCClass from './HOCClass';
import HOCFunction from './HOCFunction';
const HCC = HOCClass(CounterClass);
const HCF = HOCClass(CounterFunction);
const HFC = HOCFunction(CounterClass);
const HFF = HOCFunction(CounterFunction);

export default function Hello() {
  const [value] = useState(Math.random());

  return (
    <h3>
      {value.toString().slice(0, 5)}
      <br />
      hello!
      <br />
      class: <CounterClass hocChild />
      <br />
      function: <CounterFunction hocChild />
      <br />
      hocs: <HCC /> <HCF /> <HFC /> <HFF />
    </h3>
  );
}
