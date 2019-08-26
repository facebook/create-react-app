import React from 'react';
import styled from 'styled-components';

import Button from '../../Button';

import InteractContext from './state';

const ButtonShowPropsGroup = ({ id, componentName, deepness }) => (
  <InteractContext.Consumer>
    {({ handleShowProps, state }) => (
      <Button
        fontSize="base"
        onClick={e => {
          handleShowProps(e, id);
        }}
        style={{ paddingLeft: 0 }}
      >
        <StyledText>
          {componentName}{' '}
          {state.showProps[id] ? (
            <Triangle variant="up" />
          ) : (
            <Triangle variant="down" />
          )}
        </StyledText>
      </Button>
    )}
  </InteractContext.Consumer>
);

const Triangle = styled.span`
  :before {
    content: '▾';
    font-size: 18px;
    display: inline-block;
    transform: ${props => (props.variant === 'up' ? 'rotate(180deg)' : 'none')};
    transition: transform 0.3s;
  }
`;

const StyledText = styled.span`
  font-size: 20px;
`;

export default ButtonShowPropsGroup;
