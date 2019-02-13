import React, { Component } from 'react';
import ApolloClient, { gql } from 'apollo-boost';
import { ApolloProvider, Query } from 'react-apollo';

const GET_PIKA = gql`
  {
    pokemon(name: "Pikachu") {
      name
    }
  }
`;

const client = new ApolloClient({
  uri: 'https://graphql-pokemon.now.sh/graphql',
});

class Pokemon extends Component {
  render() {
    const { name } = this.props.pokemon;
    return (
      <h1>
        Pokemon name: <span className="Pokemon-Name-Data">{name}</span>
      </h1>
    );
  }
}

class Data extends Component {
  state = {};
  componentDidCatch() {
    this.setState({ hasError: true });
  }
  render() {
    const { hasError } = this.state;
    return hasError ? (
      <div className="Pokemon-Name-Data">Error :(</div>
    ) : (
      <Query query={GET_PIKA}>
        {({ loading, error, data }) => {
          if (loading) {
            return <div>Loading...</div>;
          }
          if (error) {
            return <div className="Pokemon-Name-Data">Error :(</div>;
          }
          return <Pokemon pokemon={data.pokemon} />;
        }}
      </Query>
    );
  }
}

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Data />
      </ApolloProvider>
    );
  }
}

export default App;
