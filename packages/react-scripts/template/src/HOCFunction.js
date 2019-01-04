import React from 'react';

export default function withStuff(Wrapped, color) {
  function Wrapper(props) {
    return (
      <span style={{ color }}>
        <Wrapped {...props} />
      </span>
    );
  }
  Wrapper.field = 42;
  return Wrapper;
}
