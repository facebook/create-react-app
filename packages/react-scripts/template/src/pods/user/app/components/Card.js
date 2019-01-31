import React from 'react';
import styled from 'styled-components';

import Button from './Button';

const Card = ({
  title = '',
  back,
  btnSubmitLabel = 'Submit',
  isLoading = false,
  children,
  onSubmit,
  handleStateChange,
  Anchor,
}) => {
  const _preventSubmitOnEnter = ev => {
    ev.preventDefault();
  };
  return (
    <Container>
      <CardBody>
        <Row>
          {back && (
            <BackButton
              className="icon-left-1"
              onClick={handleStateChange(back)}
            />
          )}
          <Title>{title}</Title>
        </Row>
        <Form onSubmit={_preventSubmitOnEnter}>{children}</Form>
        <ButtonSubmit
          isLoading={isLoading}
          disabled={isLoading}
          onClick={onSubmit}
          label={btnSubmitLabel}
        />
      </CardBody>
      {Anchor}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: ${window.width}px;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 320px;
  width: 25%;
  margin: 0 auto;
  background-color: #f5fffa;
  padding: 48px 24px;
  border-radius: 6px;
  box-shadow: 1px 1px 36px 6px rgba(195, 195, 195, 0.76);
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
`;

const Title = styled.div`
  font-size: 24px;
  text-align: center;
  border-radius: 6px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const BackButton = styled.div`
  cursor: pointer;
  position: absolute;
  left: 0;
`;

const ButtonSubmit = styled(Button)`
  margin-block-start: 10px;
  border-radius: 6px;
  min-width: 120px;
  height: 42px;
  background-color: charcoal;
`;

export default Card;
