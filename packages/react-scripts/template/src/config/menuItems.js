import React from 'react'
import Icon from '@material-ui/core/Icon'
import allLocales from './locales'
import allThemes from './themes'
import LanguageIcon from '@material-ui/icons/Language'
import StyleIcon from '@material-ui/icons/Style'
import Brightness2 from '@material-ui/icons/Brightness2'
import Brightness7 from '@material-ui/icons/Brightness7'
import SettingsIcon from '@material-ui/icons/SettingsApplications'
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import LockIcon from '@material-ui/icons/Lock'

const getMenuItems = (props) => {
  const {
    locale,
    updateTheme,
    switchNightMode,
    updateLocale,
    intl,
    themeSource,
    auth,
    isGranted,
    deferredPrompt,
    isAppInstallable,
    isAppInstalled,
    isAuthMenu,
    handleSignOut
  } = props

  const isAuthorised = auth.isAuthorised

  const themeItems = allThemes.map((t) => {
    return {
      value: undefined,
      visible: true,
      primaryText: intl.formatMessage({ id: t.id }),
      onClick: () => { updateTheme(t.id) },
      leftIcon: <StyleIcon style={{ color: t.color }} />
    }
  })

  const localeItems = allLocales.map((l) => {
    return {
      value: undefined,
      visible: true,
      primaryText: intl.formatMessage({ id: l.locale }),
      onClick: () => { updateLocale(l.locale) },
      leftIcon: <LanguageIcon />
    }
  })

  if (isAuthMenu) {
    return [
      {
        value: '/my_account',
        primaryText: intl.formatMessage({ id: 'my_account' }),
        leftIcon: <AccountBoxIcon />
      },
      {
        value: '/signin',
        onClick: handleSignOut,
        primaryText: intl.formatMessage({ id: 'sign_out' }),
        leftIcon: <LockIcon />
      }
    ]
  }

  return [
    {
      value: '/dashboard',
      visible: isAuthorised,
      primaryText: intl.formatMessage({ id: 'dashboard' }),
      leftIcon: <Icon className='material-icons' >dashboard</Icon>
    },
    {
      visible: isAuthorised,
      primaryText: intl.formatMessage({ id: 'chats' }),
      primaryTogglesNestedList: true,
      leftIcon: <Icon className='material-icons' >chats</Icon>,
      nestedItems: [
        {
          value: '/chats',
          visible: isAuthorised,
          primaryText: intl.formatMessage({ id: 'private' }),
          leftIcon: <Icon className='material-icons' >person</Icon>
        },
        {
          value: '/public_chats',
          visible: isAuthorised,
          primaryText: intl.formatMessage({ id: 'public' }),
          leftIcon: <Icon className='material-icons' >group</Icon>
        },
        {
          value: '/predefined_chat_messages',
          visible: isAuthorised,
          primaryText: intl.formatMessage({ id: 'predefined_messages' }),
          leftIcon: <Icon className='material-icons' >textsms</Icon>
        }
      ]
    },
    {
      value: '/companies',
      visible: isGranted('read_companies'),
      primaryText: intl.formatMessage({ id: 'companies' }),
      leftIcon: <Icon className='material-icons' >business</Icon>
    },
    {
      value: '/tasks',
      visible: isAuthorised,
      primaryText: intl.formatMessage({ id: 'tasks' }),
      leftIcon: <Icon className='material-icons' >list</Icon>
    },
    {
      visible: isAuthorised,
      primaryTogglesNestedList: true,
      primaryText: intl.formatMessage({ id: 'firestore' }),
      leftIcon: <Icon className='material-icons' >flash_on</Icon>,
      nestedItems: [
        {
          value: '/document',
          primaryText: intl.formatMessage({ id: 'document' }),
          leftIcon: <Icon className='material-icons' >flash_on</Icon>
        },
        {
          value: '/collection',
          primaryText: intl.formatMessage({ id: 'collection' }),
          leftIcon: <Icon className='material-icons' >flash_on</Icon>
        }
      ]
    },
    {
      value: '/about',
      visible: isAuthorised,
      primaryText: intl.formatMessage({ id: 'about' }),
      leftIcon: <Icon className='material-icons' >info_outline</Icon>
    },
    {
      visible: isAuthorised, // In prod: isGranted('administration'),
      primaryTogglesNestedList: true,
      primaryText: intl.formatMessage({ id: 'administration' }),
      leftIcon: <Icon className='material-icons' >security</Icon>,
      nestedItems: [
        {
          value: '/users',
          visible: isAuthorised, // In prod: isGranted('read_users'),
          primaryText: intl.formatMessage({ id: 'users' }),
          leftIcon: <Icon className='material-icons' >group</Icon>
        },
        {
          value: '/roles',
          visible: isGranted('read_roles'),
          primaryText: intl.formatMessage({ id: 'roles' }),
          leftIcon: <Icon className='material-icons' >account_box</Icon>
        }
      ]
    },
    {
      divider: true,
      visible: isAuthorised
    },
    {
      primaryText: intl.formatMessage({ id: 'settings' }),
      primaryTogglesNestedList: true,
      leftIcon: <SettingsIcon />,
      nestedItems: [
        {
          primaryText: intl.formatMessage({ id: 'theme' }),
          secondaryText: intl.formatMessage({ id: themeSource.source }),
          primaryTogglesNestedList: true,
          leftIcon: <StyleIcon />,
          nestedItems: themeItems
        },
        {
          primaryText: intl.formatMessage({ id: 'language' }),
          secondaryText: intl.formatMessage({ id: locale }),
          primaryTogglesNestedList: true,
          leftIcon: <LanguageIcon />,
          nestedItems: localeItems
        }
      ]
    },
    {
      onClick: () => { switchNightMode(!themeSource.isNightModeOn) },
      primaryText: intl.formatMessage({ id: themeSource.isNightModeOn ? 'day_mode' : 'night_mode' }),
      leftIcon: themeSource.isNightModeOn ? <Brightness7 /> : <Brightness2 />
    },
    {
      visible: isAppInstallable && !isAppInstalled,
      onClick: () => { deferredPrompt.prompt() },
      primaryText: intl.formatMessage({ id: 'install' }),
      leftIcon: <VerticalAlignBottomIcon />
    }
  ]
}

export default getMenuItems
