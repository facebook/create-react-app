import { St } from './state';
import { VoidPayloadMev, AC } from 'types/store';
import { COUNTER_T } from 'configs/c2Mods';

type IAC = AC<COUNTER_T>;

const delay = (ms = 1000) => new Promise(r => setTimeout(r, ms));

export function incrementBigValue(
  payload: VoidPayloadMev,
  moduleState: St
): Partial<St> {
  return { bigValue: moduleState.bigValue + 50 };
}

export function increment(
  payload: VoidPayloadMev,
  moduleState: St
): Partial<St> {
  return { value: moduleState.value + 1 };
}

export function decrement(
  payload: VoidPayloadMev,
  moduleState: St
): Partial<St> {
  return { value: moduleState.value - 1 };
}

export function incrementByAmount(
  amount: number,
  moduleState: St
): Partial<St> {
  return { value: moduleState.value + amount };
}

export async function incrementAsync(
  amount: number,
  moduleState: St,
  ac: IAC
): Promise<Partial<St>> {
  await delay();
  // or just write ac.dispatch of return
  // await ac.dispatch(incrementByAmount, amount);
  return { value: moduleState.value + amount };
}
