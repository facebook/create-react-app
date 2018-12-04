import React, { useReducer, useLayoutEffect } from 'react';
import HOCFunction from './HOCFunction';

let Counter = window.__createProxy(module, 'Counter');
let HFF = window.__createProxy(module, 'HFF');

HFF.__setImpl(HOCFunction(Counter));
Counter.__setImpl(function CounterImpl(props) {
  const [value, dispatch] = useReducer((v, a) => {
    return a === 'inc' ? v + 1 : v;
  }, 0);
  useLayoutEffect(() => {
    const id = setInterval(() => dispatch('inc'), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span>
      {value}
      {props.hocChild && (
        <>
          (inner HOC: <HFF />)
        </>
      )}
    </span>
  );
});

export default Counter;
