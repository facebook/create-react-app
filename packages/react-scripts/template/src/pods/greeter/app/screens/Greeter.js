import React from 'react';
import { map } from 'rxjs/operators';
import { observe } from 'frint-react';
import styled from 'styled-components';

const Greeter = ({ regionData, ...rest }) => {
  const { name: firstName, family_name: lastName } = regionData.user.attributes;
  return (
    <Container>
      <Header>
        <div>
          Welcome, {firstName} {lastName}!
        </div>
        <Anchor
          href="https://www.ivory.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          What is Ivory?
        </Anchor>
      </Header>
    </Container>
  );
};

const Container = styled.div`
  text-align: center;
  margin-block-start: 80px;
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #282c34;
  font-size: calc(10px + 2vmin);
  color: white;
`;

const Anchor = styled.a`
  color: #61dafb;
  margin-block-start: 20px;
`;

const ObservedGreeter = observe((app, props$) => {
  const region = app.get('region');
  const regionData$ = region
    .getData$()
    .pipe(map(regionData => ({ regionData })));
  return regionData$;
})(Greeter);

export default ObservedGreeter;
