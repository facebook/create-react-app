import React from 'react';

export default function({ me }) {
  return me ? <h1>Hi, {me.name}</h1> : <p>Loading...</p>;
}
