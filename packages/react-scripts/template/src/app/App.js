import React from 'react';
import withStyles from 'react-jss';
import Header from '../components/header/Header';
import Counter from './counter/Counter';

const styles = {
  app: {
    background: '#282c34',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'calc(10px + 2vmin)',
    color: 'white',
  },
};

function App({ classes }) {
  return (
    <div className={classes.app}>
      <Header />
      <Counter />
    </div>
  );
}

export default withStyles(styles)(App);
