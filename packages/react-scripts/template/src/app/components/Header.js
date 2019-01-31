import React from 'react';
import styled from 'styled-components';

import icons from 'assets/icons';

import { Logo } from '.';

const Header = () => {
  return (
    <Container>
      <Column>
        <Logo src={icons.logo} />
        <Title>Ivory</Title>
      </Column>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 120px;
  position: relative;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
`;

const Title = styled.h3`
  margin-block-start: 0;
  margin-block-end: 0;
  color: #51afe7;
  font-size: 25px;
`;

export default Header;
