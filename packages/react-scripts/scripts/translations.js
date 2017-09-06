'use strict'
const path = require('path')
const paths = require('../config/paths')
const manageTranslations = require('react-intl-translations-manager').default
const asiagoMessages = path.resolve(paths.asiagoPath, 'dist/messages')

manageTranslations({
  messagesDirectory: asiagoMessages,
  translationsDirectory: 'src/i18n/messages/',
  languages: ['en', 'en-ca', 'en-uk', 'fr', 'fr-ca', 'de', 'zh'], // any language you need
})
