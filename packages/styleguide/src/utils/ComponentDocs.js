import React from 'react';
import { ComponentDocs } from './../components';

export default props => (
  <ComponentDocs
    resolver={path => import(`!!raw-loader!./../components/${path}`)}
    {...props}
  />
);
