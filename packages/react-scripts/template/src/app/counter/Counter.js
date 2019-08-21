import React, { useState } from 'react';
import RaisedButton from '@guestyci/foundation/RaisedButton';
import TextField from '@guestyci/foundation/TextField';

import Row from '@guestyci/foundation/Row';

const Counter = () => {
  const [count, setCount] = useState(0);
  const countUp = () => setCount(count + 1);
  return (
      <Row align="center" justify="center">
        <RaisedButton onClick={countUp}>
          Click Me!
        </RaisedButton>
        <TextField size="2xl">{count}</TextField>
      </Row>
  );
};
export default Counter;
