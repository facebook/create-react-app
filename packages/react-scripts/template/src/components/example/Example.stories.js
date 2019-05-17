import React from 'react'
import { storiesOf } from '@storybook/react'
import ExamplePage from './ExamplePage'
import FrontierDocsCard from './FrontierDocsCard'
import LearnReactCard from './LearnReactCard'
import ZionCard from './ZionCard'
import NotSignedInCard from './NotSignedInCard'
import SignedInCardReadme from './SignedInCard.md'

storiesOf('ExamplePage', module).add('Default', () => <ExamplePage />)

storiesOf('FrontierDocsCard', module).add('Default', () => <FrontierDocsCard />)

storiesOf('LearnReactCard', module).add('Default', () => <LearnReactCard />)

storiesOf('SignedInCard', module).add('Default', () => null, {
  readme: {
    content: SignedInCardReadme,
  },
})

storiesOf('NotSignedInCard', module).add('Default', () => <NotSignedInCard />)

storiesOf('ZionCard', module).add('Default', () => <ZionCard />)
