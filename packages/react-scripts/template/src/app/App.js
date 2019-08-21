import React from 'react';
import withStyles from 'react-jss';
import Section from '@guestyci/foundation/Section';
import Header from '../components/header/Header';
import Counter from './counter/Counter';

// This is a demo scaffolding for guesty create-react-app
// One development starts clear this file and set your own App.js
// REMOVE the styling
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
// This is your App entry point.
// Add the desired configuration and logic here
// REMOVE the comments once development starts
function App({ classes }) {
  return (
      <Section col className={classes.app}>
        <Header />
        <Counter />
      </Section>
  );
}

export default withStyles(styles)(App);
