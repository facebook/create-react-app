// @flow
import * as React from 'react';
import { forEach } from 'lodash';
import { connect } from 'react-redux';
import { IntlProvider, addLocaleData } from 'react-intl';
import moment from 'moment';

import store from 'store';

import locales from 'constants/locales';

import type { State } from 'types/redux.types';
import type { MapStateToProps } from 'react-redux';

forEach(locales, (locale, key) => moment.defineLocale(key, locale.dateTimeFormat));

// Go over all of the available locales and register them
forEach(locales, (value, key) => {
  addLocaleData({
    locale: key,
    // Couldn't find any documentation about 'pluralRuleFunction', throws error if not present
    pluralRuleFunction: () => {},
  });
});

type ConnectedProps = {
  locale: string,
};

type OwnProps = {
  children: React.Node,
};

const Localization = ({ locale, children }: ConnectedProps & OwnProps) => (
  <IntlProvider locale={locale} key={locale} messages={locales[locale].translations}>
    {children}
  </IntlProvider>
);

const mapStateToProps: MapStateToProps<State, OwnProps, {}> = ({ localization }: State) => ({
  locale: localization.locale,
});

let currentLocale = store.getState().localization.locale;

moment.locale(currentLocale);
store.subscribe(() => {
  const newLocale = store.getState().localization.locale;

  if (newLocale !== currentLocale) {
    currentLocale = newLocale;
    moment.locale(currentLocale);
  }
});

export default connect(mapStateToProps, {})(Localization);
