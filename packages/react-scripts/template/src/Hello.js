import React, { Suspense, lazy, useState } from 'react';
import HOCClass from './HOCClass';
import HOCFunction from './HOCFunction';
import CounterClass from './CounterClass';
import CounterFunction, { N } from './CounterFunction';

let LazyCC = lazy(() => import('./CounterClass')),
  LazyCF = lazy(() => import('./CounterFunction'));
let DblCC = CounterClass,
  DblCF = CounterFunction;
let HCC = HOCClass(CounterClass, 'red'),
  HCF = HOCClass(CounterFunction, 'orange'),
  HFC = HOCFunction(CounterClass, 'yellow'),
  HFF = HOCFunction(CounterFunction, 'green');

export default function Hello() {
  const [value] = useState(Math.random());
  return (
    <Suspense fallback={<div />}>
      <h3>
        {N} - {value.toString().slice(0, 5)}
        <br />
        hello world!
        <br />
        class: <CounterClass hocChild />
        <br />
        function: <CounterFunction hocChild />
        <br />
        doublewrapped: <DblCC /> <DblCF />
        <br />
        lazy: <LazyCC /> <LazyCF />
        <br />
        hocs: <HCC /> <HCF /> <HFC /> <HFF />
      </h3>
    </Suspense>
  );
}
