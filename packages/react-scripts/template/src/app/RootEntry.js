import React, { PureComponent } from 'react';
import styled from 'styled-components';

import fsm from './services/StateMachine';

import { Header } from './components';
import { Auth, Home } from './screens';

class RootComponent extends PureComponent {
  state = {
    currentState: fsm.state,
  };

  componentDidMount() {
    fsm.listen().subscribe({
      next: value => this.handleStateUpdated(value),
      error: err => console.log('* Error caught in fsm listener', err),
      complete: () => console.log(' * fsm is done listening'),
    });
  }

  handleStateUpdated = state => {
    this.setState({
      currentState: state.currentState,
      authUser: state.authUser,
    });
  };

  _displayScreenBasedOnState = () => {
    const currentState = fsm.state;
    const authUser = fsm.authUser;
    switch (currentState) {
      case 'unauthed':
        return <Auth />;
      default:
        return <Home authUser={authUser} />;
    }
  };

  render() {
    const { currentState } = this.state;
    return (
      <Container>
        <Header currentState={currentState} />
        <Body>{this._displayScreenBasedOnState()}</Body>
      </Container>
    );
  }
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin-block-start: 30px;
`;

export default RootComponent;
