import React, { useState } from 'react';
import CounterClass from './CounterClass';

export default function Hello() {
  const [value] = useState(Math.random());
  return (
    <h1>
      {value.toString().slice(0, 5)}
      <br />
      b
      <CounterClass />
    </h1>
  );
}
