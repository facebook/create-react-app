import React from 'react';
import styled from 'styled-components';
import {} from 'prop-types';

const propTypes = {};

const Card = ({ bgColor, ...other }) => (
  <StyledCard bgColor={bgColor} {...other} />
);

const StyledCard = styled.div`
  background-color: ${props => props.bgColor};
  margin-bottom: ${props => props.theme.contentSpacing};
  padding: ${props => props.theme.spaces.medium};
  border: 1px solid ${props => props.theme.colors.grey};
  box-shadow: ${props => props.theme.shadows.default};
`;

Card.displayName = 'Card';
Card.propTypes = propTypes;

export default Card;
