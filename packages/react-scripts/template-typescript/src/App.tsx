import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost';
import React from 'react';
import Shell from 'walrus/build/components/shell/Shell';

const client = new ApolloClient({
  uri: 'http://cloud.digitalocean.com/graphql',
  fetchOptions: {
    credentials: 'include'
  },
  onError: ({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      window.console.log('graphql Errors', graphQLErrors);
    }
    if (networkError) {
      window.console.log('network Errors', networkError);
    }
  }
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Shell />
    </ApolloProvider>
  );
}

export default App;
