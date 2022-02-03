const React = require('react');
const {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} = require('graphql');

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

class App extends React.Component {
  state = {};
  componentDidMount() {
    graphql(schema, '{ hello }').then(({ data }) => {
      this.setState({ result: data.hello });
    });
  }
  render() {
    const { result } = this.state;
    return result ? <div className="cjs-gql-result">{result}</div> : null;
  }
}

export default App;
