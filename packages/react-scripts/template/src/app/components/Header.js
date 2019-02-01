import React from 'react';
import styled from 'styled-components';
import { Region } from 'frint-react';

import icons from 'assets/icons';

import { Logo } from '.';

const Header = ({ user }) => {
  const hasUser = Object.keys(user).length !== 0;
  return (
    <Container>
      <Column>
        <AnimatedLogo src={icons.logo} />
        <Title>Ivory</Title>
      </Column>
      {hasUser ? (
        <SignoutWrapper>
          <Region name="signout" />
        </SignoutWrapper>
      ) : null}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 120px;
  position: relative;
  padding-block-start: 30px;
  padding-block-end: 30px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h3`
  margin-block-start: 0;
  margin-block-end: 0;
  color: #51afe7;
  font-size: 25px;
`;
const AnimatedLogo = styled(Logo)`
  animation: logo-scale infinite 3s ease;
`;

const SignoutWrapper = styled.div`
  position: absolute;
  top: 30px;
  right: 30px;
`;

export default Header;
