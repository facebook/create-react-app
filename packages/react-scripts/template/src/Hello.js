import React, { Suspense, lazy, useState } from 'react';
import HOCClass from './HOCClass';
import HOCFunction from './HOCFunction';
import CounterClass from './CounterClass';
import CounterFunction from './CounterFunction';

let LazyCC;
let LazyCF;
let DblCC;
let DblCF;
let HCC;
let HCF;
let HFC;
let HFF;

console.log('running Hello');

let Hello = window.__assign(module, 'Hello', function Hello() {
  const [value] = useState(Math.random());
  return (
    <Suspense fallback={<div />}>
      <h3>
        {value.toString().slice(0, 5)}
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
});

LazyCC = window.__assign(
  module,
  'LazyCC',
  lazy(() => import('./CounterClass'))
);
LazyCF = window.__assign(
  module,
  'LazyCF',
  lazy(() => import('./CounterFunction'))
);
DblCC = window.__assign(module, 'DblCC', CounterClass);
DblCF = window.__assign(module, 'DblCF', CounterFunction);
HCC = window.__assign(module, 'HCC', HOCClass(CounterClass, 'red'));
HCF = window.__assign(module, 'HCF', HOCClass(CounterFunction, 'orange'));
HFC = window.__assign(module, 'HFC', HOCFunction(CounterClass, 'yellow'));
HFF = window.__assign(module, 'HFF', HOCFunction(CounterFunction, 'green'));
window.__commit(module);

export default Hello;
