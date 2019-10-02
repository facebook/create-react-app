import React, { Component } from 'react';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve() {
          return 'world';
        },
      },
    },
  }),
});

class App extends Component {
  state = {};
  componentDidMount() {
    graphql(schema, '{ hello }').then(({ data }) => {
      this.setState({ result: data.hello });
    });
  }
  render() {
    const { result } = this.state;
    return result ? <div className="mjs-gql-result">{result}</div> : null;
  }
}

export default App;
