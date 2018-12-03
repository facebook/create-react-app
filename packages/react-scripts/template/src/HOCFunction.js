import React from 'react';

export default function withStuff(Wrapped) {
  return function(props) {
    return <Wrapped {...props} />;
  };
}
