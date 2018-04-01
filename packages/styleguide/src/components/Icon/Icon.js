import React from 'react';
import { string, oneOf } from 'prop-types';
import styled from 'styled-components';
import cx from 'classnames';

import './../../assets/icons/code.svg';
import './../../assets/icons/minus.svg';
import './../../assets/icons/plus.svg';

const propTypes = {
  alt: string,
  name: string,
  size: oneOf(['default', 'large']),
  fill: string
};

const CLASS_ROOT = 'icon';

const Icon = ({ className, name, alt, size, fill, ...other }) => {
  const classes = cx(CLASS_ROOT, className);
  /** temporary solution for Button component needs */
  return (
    <StyledIcon
      size={size}
      className={classes}
      role={alt ? 'presentation' : 'img'}
      {...(alt ? { 'aria-label': alt } : { 'aria-hidden': 'true' })}
      {...other}
    >
      <use fill={fill} xlinkHref={`/sprite-sg.svg#${name}`} />
    </StyledIcon>
  );
};

Icon.displayName = 'Icon';
Icon.propTypes = propTypes;
Icon.defaultProps = {
  size: 'default'
};

const iconSizes = {
  default: '1rem',
  large: '1.5rem'
};

const StyledIcon = styled.svg`
  display: inline-block;
  vertical-align: middle;
  fill: currentColor;
  width: ${props => iconSizes[props.size]};
  height: ${props => iconSizes[props.size]};
`;

export default Icon;
