import React, { useState } from 'react';
import OutlineButton from '@guestyci/foundation/OutlineButton';
import Row from '@guestyci/foundation/Row';

const Counter = () => {
  const [count, setCount] = useState(0);
  const countUp = () => setCount(count + 1);
  return (
    <Row align="center" justify="center">
      <OutlineButton onClick={countUp}>
        Click Me!
      </OutlineButton>
      <span>{count}</span>
    </Row>
  );
};
export default Counter;
