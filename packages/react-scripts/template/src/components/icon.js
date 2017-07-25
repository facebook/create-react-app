import React from 'react';

export default function Icon({
  glyph,
  className
}) {
  return (
    <svg className={className}>
      <use xlinkHref={`#${glyph}`} />
    </svg>
  );
}
