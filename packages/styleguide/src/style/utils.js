/* eslint-disable import/prefer-default-export */

import { mix, rem as polishedRem } from 'polished';

import { fontSizes } from './theme';

export function getColorShade(color, weight = 500) {
  if (!color) {
    throw new Error('Missing color definition.');
  }

  return mix(
    Math.abs(weight - 500) * 2 / 1000,
    weight > 500 ? '#000' : '#fff',
    color
  );
}

export function getColor(color, weight = 500) {
  // if single color is defined as string
  if (typeof color === 'string') {
    return getColorShade(color, weight);
  }

  // if color weight is defined
  if (color[weight]) {
    return color[weight];
  }

  // generate color shade
  return getColorShade(color, weight);
}

export function rem(value, base = fontSizes.base) {
  return polishedRem(value, base);
}
