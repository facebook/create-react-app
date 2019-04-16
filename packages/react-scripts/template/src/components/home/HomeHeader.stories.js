import React from 'react'
import { storiesOf } from '@storybook/react'
import HomeHeader from './HomeHeader'

storiesOf('HomeHeader', module)
  .add('Default', () => <HomeHeader />)
  .add('With <p> child', () => (
    <HomeHeader>
      <p>This is an example of the HomeHeader</p>
    </HomeHeader>
  ))
