import React, { useReducer, useLayoutEffect } from 'react';
import HOCFunction from './HOCFunction';

let HFF = HOCFunction(Counter);

function Counter(props) {
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
          (inner HOC: <HFF /> {HFF.field})
        </>
      )}
    </span>
  );
}

export default Counter;
