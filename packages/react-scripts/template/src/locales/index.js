import en_messages from './en';
import de_messages from './de';
import bs_messages from './bs';
import es_messages from './es';
import en from 'react-intl/locale-data/en';
import de from 'react-intl/locale-data/de';
import bs from 'react-intl/locale-data/bs';
import es from 'react-intl/locale-data/es';

const locales = [
  {
    locale: 'en',
    messages: en_messages,
    data: en,
  },
  {
    locale: 'de',
    messages: de_messages,
    data: de,
  },
  {
    locale: 'bs',
    messages: bs_messages,
    data: bs,
  },
  {
    locale: 'es',
    messages: es_messages,
    data: es,
  },
];

export default locales;
