import React, { forwardRef, memo, useReducer, useLayoutEffect } from 'react';
import HOCFunction from './HOCFunction';

let HFF;
let Counter;
let Fwd;

Counter = memo(
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
);

Fwd = forwardRef((props, ref) => (
  <span ref={ref}>
    <Counter {...props} />
  </span>
));
HFF = HOCFunction(Fwd);

module.hot.accept(['./HOCFunction'], window.__invalidate);

export let N = 10;
export default Fwd;
