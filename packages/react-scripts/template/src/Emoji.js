import React from 'react';

export default ({ emoji, label }) =>
  <span aria-label={label} role="img">
    {emoji}
  </span>;
