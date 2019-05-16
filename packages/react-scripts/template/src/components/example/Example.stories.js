import React from 'react'
import { storiesOf } from '@storybook/react'
import ExamplePage from './ExamplePage'
import FrontierDocsCard from './FrontierDocsCard'
import LearnReactCard from './LearnReactCard'
import ZionCard from './ZionCard'
import NotLoggedInCard from './NotLoggedInCard'
import LoggedInCardReadme from './LoggedInCard.md'

storiesOf('ExamplePage', module).add('Default', () => <ExamplePage />)

storiesOf('FrontierDocsCard', module).add('Default', () => <FrontierDocsCard />)

storiesOf('LearnReactCard', module).add('Default', () => <LearnReactCard />)

storiesOf('LoggedInCard', module).add('Default', () => null, {
  readme: {
    content: LoggedInCardReadme
  }
})

storiesOf('NotLoggedInCard', module).add('Default', () => <NotLoggedInCard />)

storiesOf('ZionCard', module).add('Default', () => <ZionCard />)

