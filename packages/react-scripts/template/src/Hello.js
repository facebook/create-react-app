import React, { Suspense, lazy, useState } from 'react';
import HOCClass from './HOCClass';
import HOCFunction from './HOCFunction';
import CounterClass from './CounterClass';
import CounterFunction, { N } from './CounterFunction';

let LazyCC;
let LazyCF;
let DblCC;
let DblCF;
let HCC;
let HCF;
let HFC;
let HFF;

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

LazyCC = lazy(() => import('./CounterClass'));
LazyCF = lazy(() => import('./CounterFunction'));

DblCC = CounterClass;
DblCF = CounterFunction;
HCC = HOCClass(CounterClass, 'red');
HCF = HOCClass(CounterFunction, 'orange');
HFC = HOCFunction(CounterClass, 'yellow');
HFF = HOCFunction(CounterFunction, 'green');
module.hot.accept(
  ['./CounterFunction', './CounterClass', './HOCFunction', './HOCClass'],
  window.__invalidate
);
