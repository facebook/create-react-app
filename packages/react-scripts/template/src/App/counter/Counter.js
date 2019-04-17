import React, { useState, useCallback } from 'react';
import withStyles from 'react-jss';

const styles = {
  counter: {
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center',
  },
  button: {
    background: 'transparent',
    color: 'white',
    border: '1px solid white',
    padding: '6px 9px',
    cursor: 'pointer',
    outline: 0,
  },
  count: {
    marginLeft: 5,
  },
};
const Counter = ({ classes }) => {
  const [count, setCount] = useState(0);
  const countUp = useCallback(() => {
    console.log('count', count);
    setCount(count + 1);
  }, [count]);
  return (
    <div className={classes.counter}>
      <button className={classes.button} onClick={countUp}>
        Click Me!
      </button>
      <span className={classes.count}>{count}</span>
    </div>
  );
};
export default withStyles(styles)(Counter);
