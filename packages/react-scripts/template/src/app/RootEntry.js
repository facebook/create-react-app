import React, { PureComponent } from 'react';
import styled from 'styled-components';

import fsm from './services/StateMachine';
import 'assets/animations.css';
import { Header } from './components';
import { Auth, Home } from './screens';

class RootEntry extends PureComponent {
  state = {
    currentState: fsm.state,
    user: fsm.user,
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
      user: state.user,
    });
  };

  _displayScreenBasedOnState = () => {
    const currentState = fsm.state;
    const user = fsm.user;
    switch (currentState) {
      case 'unauthed':
        return <Auth />;
      default:
        return <Home user={user} />;
    }
  };

  render() {
    const { currentState, user } = this.state;
    return (
      <Container>
        <Header currentState={currentState} user={user} />
        <Body>{this._displayScreenBasedOnState()}</Body>
      </Container>
    );
  }
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #282c34;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin-block-start: 30px;
`;

export default RootEntry;
