import React, { PureComponent, Fragment } from 'react';
import { Auth } from 'aws-amplify';
import styled from 'styled-components';

import icons from 'user-assets/icons';
import { Modal } from './components';

class SignoutEntry extends PureComponent {
  state = {
    isModalShown: false,
  };

  _showModal = () => this.setState({ isModalShown: true });
  hideModal = () => this.setState({ isModalShown: false });
  signOut = async () => {
    const event = new Event('signout');
    await Auth.signOut().catch(err =>
      alert(`* Error caught on sign out. ${err}`)
    );
    this.hideModal();
    window.dispatchEvent(event);
  };
  render() {
    const { isModalShown } = this.state;
    return (
      <Fragment>
        <SignoutButton data-testid='signout-button' src={icons.signout} onClick={this._showModal} />
        {isModalShown ? (
          <Modal
            headerLabel="Sign out"
            confirmBtnLabel="Sign out"
            confirmBtnDataTest="confirm-button-signout"
            confirmActionFn={this.signOut}
            actionBtnType="destructive"
            hideModal={this.hideModal}
            dataTest="signout-modal"
          >
            <ConfirmMessage>
              You are about to sign out. <br />
              Are you sure you wish to continue?
            </ConfirmMessage>
          </Modal>
        ) : null}
      </Fragment>
    );
  }
}

const SignoutButton = styled.img`
  width: 25px;
  height: 25px;
  cursor: pointer;

  :active {
    transform: scale(0.965);
  }
`;

const ConfirmMessage = styled.p`
  padding-inline-start: 10px;
  line-height: 30px;
`;

export default SignoutEntry;
