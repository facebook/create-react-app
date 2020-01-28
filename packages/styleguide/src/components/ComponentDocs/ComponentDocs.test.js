import React from 'react';
import { render } from '@testing-library/react';

import ComponentDocs from '.';

const Dummy = () => {};

Dummy.__docgenInfo = {
  description: 'This is an awesome looking button for React.',
  props: {
    label: {
      type: {
        name: 'string',
      },
      required: false,
      description: 'Label for the button.',
    },
    onClick: {
      type: {
        name: 'func',
      },
      required: false,
      description: 'Triggered when clicked on the button.',
    },
  },
};

describe('rendering', () => {
  it('ComponentDocs', () => {
    const { getByRole } = render(<ComponentDocs component={Dummy} />);
    expect(getByRole('table')).toBeInTheDocument();
  });
});
