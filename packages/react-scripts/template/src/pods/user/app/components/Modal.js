import React, { PureComponent } from 'react';
import styled from 'styled-components';
import ReactDOM from 'react-dom';
import Button from './Button';
import icons from 'user-assets/icons';

class Modal extends PureComponent {
  static modalRoot = document.getElementById('modal-root');
  constructor(props) {
    super(props);
    this.modalEl = document.createElement('div');
  }
  componentDidMount() {
    const { modalRoot } = Modal;
    modalRoot.appendChild(this.modalEl);
    document.addEventListener('click', this._handleBackDropClick);
  }

  componentWillUnmount() {
    const { modalRoot } = Modal;
    modalRoot.removeChild(this.modalEl);
    document.removeEventListener('click', this._handleBackDropClick);
  }

  _handleBackDropClick = ev => {
    const bodyEl = document.getElementById('modal-body');
    const isClickInside = bodyEl.contains(ev.target);
    const { hideModal } = this.props;
    if (!isClickInside) {
      hideModal();
    }
  };

  _pickConfirmButtonLabel = () => {
    const { actionBtnType } = this.props;
    switch (actionBtnType) {
      case 'destructive':
        return '#e74c3c';
      case 'info':
        return '#3498db';
      default:
        return '#2ecc71';
    }
  };

  render() {
    const {
      children,
      headerLabel,
      hideModal,
      confirmBtnLabel,
      confirmActionFn,
      confirmBtnDataTest
    } = this.props;
    return ReactDOM.createPortal(
      <Body>
        <Card id="modal-body">
          <Row>
            <Header>{headerLabel}</Header>
            <CloseIcon src={icons.close} alt="Close" onClick={hideModal} />
          </Row>
          <Content>{children}</Content>
          <Footer>
            <Row paddingBottom="10px">
              <CancelButton label="Cancel" onClick={hideModal} />
              <ConfirmButton
                data-test={confirmBtnDataTest}
                label={confirmBtnLabel}
                onClick={confirmActionFn}
                confirmButtonColour={this._pickConfirmButtonLabel()}
              />
            </Row>
          </Footer>
        </Card>
      </Body>,
      this.modalEl
    );
  }
}

const Body = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 10, 10, 0.75);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  color: #000;
  width: ${window.innerWidth / 3}px;
  max-width: 500px;
  height: ${window.innerHeight / 2}px;
  max-height: 400px;
  background-color: #fff;
  border-radius: 5px;
  position: relative;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding-block-start: ${props => props.paddingTop || '15px'};
  padding-inline-end: ${props => props.paddingRight || '10px'};
  padding-block-end: ${props => props.paddingBottom || '15px'};
  padding-inline-start: ${props => props.paddingLeft || '10px'};
  border-block-end: 1px solid #e5e5e5;
`;

const Header = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: #484848;
`;

const CloseIcon = styled.img`
  width: 10px;
  height: 10px;
  cursor: pointer;

  :active {
    transform: scale(0.965);
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  position: absolute;
  bottom: 0;
  border-block-start: 1px solid #e5e5e5;
`;

const ModalButton = styled(Button)`
  height: 40px;
  background-color: transparent;
  border-radius: 5px;
  min-width: 100px;
  max-width: 200px;
  font-size: 15px;
  color: #484848;
`;

const CancelButton = styled(ModalButton)``;

const ConfirmButton = styled(ModalButton)`
  margin-inline-start: 5px;
  background-color: ${props => props.confirmButtonColour};
  color: #fff;
`;

export default Modal;
