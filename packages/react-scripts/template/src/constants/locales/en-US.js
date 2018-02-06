// @flow
import type { Locale } from 'types/common.types';

const enUS: Locale = {
  dateTimeFormat: {
    parentLocale: 'en',
    longDateFormat: {
      LT: 'HH:mm',
      L: 'MM/DD/YYYY',
      LL: 'MM/DD/YYYY HH:mm',
    },
    week: {
      dow: 1,
    },
  },
  translations: {
    'homepage.title': 'Hello World',
  },
};

export default enUS;
