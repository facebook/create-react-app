import React from 'react';

import styled from 'styled-components';
import { Wrapper, FlexBox, Button } from 'bushido-strap';

import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../../store/actions/counter';

import { Link } from 'react-router-dom';

export default function ReduxCounter() {
  const dispatch = useDispatch();

  const count = useSelector(state => state.counter.count);
  return (
    <Wrapper>
      <HomeLink to="/">Home</HomeLink>

      <Button onClick={() => dispatch(increment())}>++</Button>

      <CodeCount align="center" justify="space-between" width="12rem">
        Clicked <code>{count}</code> times
      </CodeCount>

      <Button onClick={() => dispatch(decrement())}>--</Button>
    </Wrapper>
  );
}

const CodeCount = styled(FlexBox)`
  margin: 1.4rem 1.4rem 1.4rem 0;
  code {
    font-size: 2.5rem;
  }
`;

const HomeLink = styled(Link)`
  margin-bottom: 2rem;
  font-size: 3rem;
  padding: 0.3rem 1rem;
  border-radius: 0.25rem;
`;
