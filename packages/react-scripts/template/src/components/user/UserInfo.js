import React from 'react'
import { useUser } from '@fs/zion-user'
import { useTranslation } from 'react-i18next'

export default function UserInfo() {
  const user = useUser()
  const { t } = useTranslation()
  return <div>{t('user.greeting', { user, defaultValue: 'Hello, {{user.displayName}}!' })}</div>
}
