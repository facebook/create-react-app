'use strict';

/**
 * Get localizations for application
 *
 * Create a localizations directory anywhere in app src
 * containing json files of strings you want to translate
 * ex: within fi.json (finnish):
 * {
 *  "Hello World": "Terve maailma"
 * }
 * @return {object} Localizations
 */

const chalk = require('chalk');
const glob = require('glob');
const path = require('path');
const argv = require('yargs').argv;
const DEFAULT_LOCALIZATION = [{ language: 'en', localizations: null }];

const getArgValue = arg => arg.split('=')[1];

const checkArg = (arg, argValue) => (
  !!arg.indexOf(`--${argValue}`) ||
  !!arg.indexOf(`--env.${argValue}`)
);

const LOCALE = process.argv
  .map( val => checkArg(val, 'LOCALE') && getArgValue(val) )
  .reduce( (curr, next) => curr || next );


const LOCALIZATIONS = glob
  .sync('**/localizations/*.json')
  .map(
    file => (
      {
        language: path.basename(file, path.extname(file)),
        localizations: require(`../${file}`)
      }
    )
  );

const hasLocalizationFile = LOCALIZATIONS
  .some(
    localization => localization.language === LOCALE
  );

const getLocalizations = () => (
  hasLocalizationFile
    ? LOCALIZATIONS.filter( localization => localization.language === LOCALE )
    : DEFAULT_LOCALIZATION
);

module.exports = getLocalizations;
