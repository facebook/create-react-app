import React, { forwardRef, memo, useReducer, useLayoutEffect } from 'react';
import HOCFunction from './HOCFunction';

let HFF;
let Counter;
let Fwd;

Counter = window.__assign(
  module,
  'Counter',
  memo(
    memo(function Counter(props) {
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
    })
  )
);
Fwd = window.__assign(
  module,
  'FWD',
  forwardRef((props, ref) => (
    <span ref={ref}>
      <Counter {...props} />
    </span>
  ))
);
HFF = window.__assign(module, 'HFF', HOCFunction(Fwd));
window.__commit(module);

export default Fwd;
