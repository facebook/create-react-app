import React from 'react';
import { bool } from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';

import './../../assets/icons/plus.svg';
import './../../assets/icons/minus.svg';

const propTypes = {
  isActive: bool
};

const CLASS_ROOT = 'sg-nav__cat';
const activeClass = `${CLASS_ROOT}--is-active`;

const Category = ({ className, isActive, children, ...other }) => {
  const classes = cx(
    CLASS_ROOT,
    {
      [activeClass]: isActive
    },
    className
  );

  const name = isActive ? 'minus' : 'plus';

  return (
    <span className={classes} {...other}>
      {children}
      <StyledSVG role="img" aria-hidden="true">
        <use xlinkHref={`/sprite-sg.svg#${name}`} />
      </StyledSVG>
    </span>
  );
};

Category.displayName = 'Category';
Category.propTypes = propTypes;

const StyledCategory = styled(Category)`
  & {
    display: block;
    position: relative;
    padding: ${props => props.theme.nav.listTopBottomIndent} 0;
    cursor: pointer;
  }
  &.${activeClass} {
    + ul {
      max-height: 4000px;
      transition: max-height 0.2s cubic-bezier(0.98, 0.01, 0.96, 0) 0s,
        padding 0.25s cubic-bezier(0.98, 0.01, 0.96, 0) 0s;
    }
  }
`;

const StyledSVG = styled.svg`
  position: absolute;
  width: 14px;
  height: 14px;
  top: 50%;
  margin-top: -7px;
  right: 0;
`;

export default StyledCategory;
