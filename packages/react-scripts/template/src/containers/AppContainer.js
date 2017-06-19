// @flow
import React from 'react';
import { connect } from 'react-redux';
import App from 'components/App';
import helloActions from 'actions/hello';

const mapStateToProps = state => ({
  greeting: state.hello.greeting,
  loading: state.loading,
});

const mapDispatchToProps = dispatch => ({
  sayHello: async (name: string) => dispatch(helloActions.greet(name)),
});

export class AppContainer extends React.PureComponent {
  onSubmitHello = ({ name }: Object) => {
    this.props.sayHello(name);
  }

  render() {
    return (
      <App
        {...this.props}
        onSubmitHello={this.onSubmitHello}
        />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
