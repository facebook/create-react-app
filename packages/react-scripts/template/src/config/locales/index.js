import en_messages from './en'
import de_messages from './de'
import ru_messages from './ru'
import bs_messages from './bs'
import es_messages from './es'
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/dist/locale-data/de'
import '@formatjs/intl-relativetimeformat/dist/locale-data/en'
import '@formatjs/intl-relativetimeformat/dist/locale-data/ru'
import '@formatjs/intl-relativetimeformat/dist/locale-data/bs'
import '@formatjs/intl-relativetimeformat/dist/locale-data/es'

const locales = [
  {
    locale: 'en',
    messages: en_messages
  },
  {
    locale: 'de',
    messages: de_messages
  },
  {
    locale: 'bs',
    messages: bs_messages
  },
  {
    locale: 'ru',
    messages: ru_messages
  },
  {
    locale: 'es',
    messages: es_messages
  }
]

export default locales
