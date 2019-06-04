import React from 'react'
import { storiesOf } from '@storybook/react'
import { select, number } from '@storybook/addon-knobs'

import ExamplePage from './ExamplePage'
import FrontierDocsCard from './FrontierDocsCard'
import LearnReactCard from './LearnReactCard'
import ZionCard from './ZionCard'
import NotSignedInCard from './NotSignedInCard'
import SignedInCardReadme from './SignedInCard.md'

storiesOf('ExamplePage', module).add('Default', () => <ExamplePage />)

function log() {
  console.log('You clicked the wheel!')
}

function alerting() {
  /* eslint-disable-next-line no-alert */
  alert('You clicked the wheel!')
}

const colorOptions = { Black: 'black', Red: 'red', Blue: 'blue', Pink: 'pink' }
const animationOptions = {
  range: true,
  min: 0.5,
  max: 20,
  step: 0.5,
}

storiesOf('FrontierDocsCard', module)
  .add('Default (with knobs)', () => (
    <FrontierDocsCard
      logoColor={select('Color', colorOptions, 'black')}
      animationDuration={number('Animation Duration', 10, animationOptions)}
    />
  ))
  .add('Red Wheel', () => <FrontierDocsCard logoColor="red" />)
  .add('Fast Spinning Wheel', () => <FrontierDocsCard animationDuration={5} />)
  .add('Faster Spinning Wheel', () => <FrontierDocsCard animationDuration={1} />)
  .add('Logging on Click', () => <FrontierDocsCard handleLogoClick={log} />)
  .add('Alert on Click', () => <FrontierDocsCard handleLogoClick={alerting} />)

storiesOf('LearnReactCard', module).add('Default', () => <LearnReactCard />)

storiesOf('SignedInCard', module).add('Default', () => null, {
  readme: {
    content: SignedInCardReadme,
  },
})

storiesOf('NotSignedInCard', module).add('Default', () => <NotSignedInCard user={{}} />)

storiesOf('ZionCard', module).add('Default', () => <ZionCard />)
