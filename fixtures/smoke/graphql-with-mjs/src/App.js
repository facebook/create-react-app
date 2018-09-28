import React, { Component } from 'react';

import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

const client = new ApolloClient({
  uri: '/whatever',
});

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <div />
      </ApolloProvider>
    );
  }
}

export default App;
