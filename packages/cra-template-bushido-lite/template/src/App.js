import React from 'react';

// Set up all routes in App
import { Route } from 'react-router-dom';

// Using custom styled components from Global folder in components
import { AppWrapper } from 'bushido-strap';

// Importing all routes
import HomePage from './components/HomePage';

const App = () => {
  return (
    <AppWrapper>
      <Route path="/" exact render={props => <HomePage {...props} />} />
    </AppWrapper>
  );
};

export default App;
