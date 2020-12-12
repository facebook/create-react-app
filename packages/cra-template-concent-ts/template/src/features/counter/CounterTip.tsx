import React, { useState } from 'react';
import { useC2Mod } from 'configs/useC2Mod';
import { COUNTER } from 'configs/c2Mods';

export const CounterTip = React.memo(function CounterTip() {
  const ctx = useC2Mod(COUNTER);
  // module state, module computed
  const { state, moduleComputed } = ctx;

  return (
    <div>
      <span> value:{state.value}</span>
      <span> bigValue:{state.bigValue}</span>
      <span> doubleCount:{moduleComputed.doubleCount}</span>
    </div>
  );
});
