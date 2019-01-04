import React, { forwardRef, memo, useReducer, useLayoutEffect } from 'react';
import HOCFunction from './HOCFunction';

let Fwd = forwardRef((props, ref) => (
  <span ref={ref}>
    <Counter {...props} />
  </span>
));
let HFF = HOCFunction(Fwd);

let Counter = memo(
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

export let N = 10;
export default Fwd;
