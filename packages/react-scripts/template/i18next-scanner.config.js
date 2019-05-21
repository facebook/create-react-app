module.exports = {
  options: {
    debug: true,
    sort: true,
    defaultLng: 'en',
    func: {
      list: ['i18next.t', 'i18n.t', 't', '$t'],
    },
    lngs: ['en'],
    resource: {
      loadPath: 'src/locales/{{lng}}/{{ns}}.json',
      savePath: '{{lng}}/{{ns}}.json',
    },
    keySeparator: false, // keeps dotted key paths flat instead of nested
  },
}
