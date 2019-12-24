import React from 'react';

import { Wrapper, Linkton } from 'bushido-strap';

const HomePage = () => {
  return (
    <Wrapper>
      <h1>Hello, world!</h1>
      <Linkton to="/counter">Redux Counter</Linkton>
    </Wrapper>
  );
};

export default HomePage;
