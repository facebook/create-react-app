import { St } from './state';

// only value change will triiger this function to execute again
export function doubleCount({ value }: St) {
  return value * 2;
}
