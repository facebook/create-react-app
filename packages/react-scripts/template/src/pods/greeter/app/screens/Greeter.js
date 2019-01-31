import React from 'react';
import { map } from 'rxjs/operators';
import { observe } from 'frint-react';
import styled from 'styled-components';

import icons from 'greeter-assets/icons';

const Greeter = ({ regionData, ...rest }) => {
  const {
    name: firstName,
    family_name: lastName,
  } = regionData.authUser.attributes;
  return (
    <Container>
      <Header>
        <Logo src={icons.logo} alt="logo" />
        <Message>
          Welcome, {firstName} {lastName}!
        </Message>
        <Anchor
          href="https://www.ivory.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          About Ivory
        </Anchor>
      </Header>
    </Container>
  );
};

const Container = styled.div`
  text-align: center;
`;

const Header = styled.header`
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
`;

const Logo = styled.img`
  animation: logo-scale infinite 7s ease-in-out;
  height: 40vmin;
  pointer-events: none;
`;

const Message = styled.p``;

const Anchor = styled.a`
  color: #61dafb;
`;

const ObservedGreeter = observe((app, props$) => {
  const region = app.get('region');
  const regionData$ = region
    .getData$()
    .pipe(map(regionData => ({ regionData })));
  return regionData$;
})(Greeter);

export default ObservedGreeter;
