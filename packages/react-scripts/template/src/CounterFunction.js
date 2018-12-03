import React, { useState, useRef, useLayoutEffect } from 'react';
import HOCFunction from './HOCFunction';

const HFF = HOCFunction(Counter);

export default function Counter({ hocChild }) {
  const [value, setValue] = useState(0);
  useLayoutEffect(() => {
    const id = setInterval(() => setValue(c => c + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      {value}
      {hocChild && (
        <>
          (inner HOC: <HFF />)
        </>
      )}
    </>
  );
}
