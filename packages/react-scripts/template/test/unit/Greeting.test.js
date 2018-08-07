import React from 'react';
import renderer from 'react-test-renderer';
import Greeting from '../../src/Greeting';

it('Greeting renders correctly in the loading state', () => {
  const tree = renderer.create(<Greeting />).toJSON();

  expect(tree).toMatchSnapshot();
});

it('Greeting renders correctly in the ready state', () => {
  const tree = renderer.create(<Greeting me={{ name: 'Joe Kool' }} />).toJSON();

  expect(tree).toMatchSnapshot();
});
