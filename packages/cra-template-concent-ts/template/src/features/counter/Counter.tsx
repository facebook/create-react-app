import React, { useState } from 'react';
import { useC2Mod } from 'configs/useC2Mod';
import { COUNTER } from 'configs/c2Mods';
import styles from './Counter.module.css';

export function Counter() {
  const ctx = useC2Mod(COUNTER);
  // module state, module computed, module reducer
  const { state, moduleComputed, mr } = ctx;
  const [incrementAmount, setIncrementAmount] = useState('2');

  return (
    <div>
      <div className={styles.row}>
        <button
          className={styles.button}
          aria-label="Increment value"
          onClick={mr.increment}
        >
          +
        </button>
        <span className={styles.value}>{state.value}</span>
        <span className={styles.value}>
          doubleCount: {moduleComputed.doubleCount}
        </span>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={mr.decrement}
        >
          -
        </button>
      </div>
      <div className={styles.row}>
        <input
          className={styles.textbox}
          aria-label="Set increment amount"
          value={incrementAmount}
          onChange={e => setIncrementAmount(e.target.value)}
        />
        <button
          className={styles.button}
          onClick={() => mr.incrementByAmount(Number(incrementAmount) || 0)}
        >
          Add Amount
        </button>
        <button
          className={styles.asyncButton}
          onClick={() => mr.incrementAsync(Number(incrementAmount) || 0)}
        >
          Add Async
        </button>
        <button className={styles.normalButton} onClick={mr.incrementBigValue}>
          Add Big Value
        </button>
      </div>
    </div>
  );
}
