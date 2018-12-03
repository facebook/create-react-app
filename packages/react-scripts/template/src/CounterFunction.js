import { useState, useRef, useLayoutEffect } from 'react';

export default function Counter() {
  const [value, setValue] = useState(0);
  useLayoutEffect(() => {
    const id = setInterval(() => setValue(c => c + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return value;
}
