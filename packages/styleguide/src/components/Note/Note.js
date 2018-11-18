import React from 'react';
import { oneOf, string } from 'prop-types';
import styled from 'styled-components';
import cx from 'classnames';

const propTypes = {
  title: string,
  /* type influences set styles */
  type: oneOf(['warning', 'success', 'error', 'info']),
};

const CLASS_ROOT = 'note';

/* Styles have to be on the top because of Tag and TagTitle */
const StyledNote = styled.div`
  font-family: ${props => props.theme.fontFamily};
  font-weight: ${props => props.theme.fontWeights.normal};
  font-size: ${props => props.theme.fontSizes.base};
  color: ${props => props.theme.colors.black};
  width: 100%;
  margin: 0 0 ${props => props.theme.spaces.medium};
  padding: ${props => props.theme.spaces.small}
    ${props => props.theme.spaces.medium};
  border-left-width: 2px;
  border-left-style: solid;
  border-left-color: ${props => props.theme.colors.greyDarker};
`;

const StyledTitle = styled.div`
  margin: 0 0 ${props => props.theme.spaces.small};
  color: ${props =>
    (props.type === 'success' && props.theme.colors.success) ||
    (props.type === 'warning' && props.theme.colors.warning) ||
    (props.type === 'error' && props.theme.colors.error) ||
    (props.type === 'info' && props.theme.colors.info) ||
    props.theme.colors.greyText};
  text-transform: uppercase;
  font-weight: 700;
`;

const Note = ({ className, children, title, type, ...other }) => {
  const classes = cx(CLASS_ROOT, className);

  return (
    <StyledNote className={classes} type={type} {...other}>
      <StyledTitle type={type}>{title}</StyledTitle>
      {children}
    </StyledNote>
  );
};

Note.displayName = 'Note';
Note.propTypes = propTypes;

export default Note;
