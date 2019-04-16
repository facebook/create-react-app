import React from 'react'
import { storiesOf } from '@storybook/react'

import UserInfoReadme from './UserInfo.md'

storiesOf('UserInfo', module).add('Default', () => null, {
  readme: {
    content: UserInfoReadme,
  },
})
