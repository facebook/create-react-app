import React from 'react';
import { string, array } from 'prop-types';
import cx from 'classnames';

import { Bar, BarItem } from './../Bar';
import { H5 } from './../Typography';

const propTypes = {
  title: string,
  actions: array
};

const CLASS_ROOT = '';

const PreviewTitleBar = ({ className, title, actions = [], ...other }) => {
  const classes = cx(CLASS_ROOT, className);

  return (
    <StyledBar className={classes} {...other}>
      <BarItem fill>
        <H5>{title}</H5>
      </BarItem>

      {actions && (
        <BarItem>
          <Bar>
            {actions.map(action => <BarItem key={action}>{action}</BarItem>)}
          </Bar>
        </BarItem>
      )}
    </StyledBar>
  );
};

PreviewTitleBar.displayName = 'PreviewTitleBar';
PreviewTitleBar.propTypes = propTypes;

const StyledBar = Bar.withComponent('header').extend`
  margin-bottom: ${props => props.theme.spaces.small};
`;

export default PreviewTitleBar;
