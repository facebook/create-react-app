# Rangle Create React App

Rangle customization for [Create React apps](https://github.com/facebookincubator/create-react-app) with no build configuration.
The following briefly lists all changes performed over facebook standard Creat React App:

- CSS loaders
- ESLint and Stylelint 
- Redux dependencies
- Jest custom configuration

## CSS loaders

Check the [postcss](https://github.com/rangle/create-react-app/tree/master/packages/react-scripts/config/rangle/postcss.js) configuration that replaces the standard css setup. 
[Tachyons](http://tachyons.io/) dependency comes by default now.

You can override the default browsers list by creating a `browsers.json` file in the root folder of the generated project. The configuration won't be merged, it will override the standard setup.
The following is a `browsers.json` file example:

```json
{
  "browsers": [
    ">1%",
    "last 4 versions",
    "Firefox ESR",
    "not ie < 9"
  ]
}
```

## ESLint and Stylelint
 
Stylelint [plugin](https://github.com/rangle/create-react-app/tree/master/packages/react-scripts/config/rangle/plugins.js) added to webpack. 

Default ESlint [file](https://github.com/rangle/create-react-app/tree/master/packages/react-scripts/template/.eslintrc) and Stylelint [file](https://github.com/rangle/create-react-app/tree/master/packages/react-scripts/template/.stylelintrc) will be included by default in the root folder when project is generated.
 
## Redux dependencies
 
Redux dependencies added to the project along with routers and few other libraries listed below:

```json
...
     "react-redux": "^5.0.1",
     "react-router": "^3.0.0",
     "react-router-redux": "^4.0.7",
     "redux": "^3.6.0",
     "redux-form": "^6.4.3",
...
```

## Jest custom configuration

To customize Jest when running tests, add a `jest-config.json` file in the root folder of the generated app. The content should be the object you would normally assign to the `"jest"` property inside the `package.json` file. Check Jest's [docs](https://facebook.github.io/jest/docs/configuration.html) for more options.

Everything inside `jest-config.json` will have preference over any standard configuration, so be careful with what you're changing.
For instance, if you want to add `coverageThreshold` in jest you would have something similar to this in your package.json:

```json
...
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 50,
        "functions": 50,
        "lines": 50,
        "statements": 50
      }
    }
  }
...
```

Put this same configuration inside `jest-config.json` in the root folder, but note that the `"jest"` property is not necessary:
  
```json
{
  "coverageThreshold": {
    "global": {
      "branches": 50,
      "functions": 50,
      "lines": 50,
      "statements": 50
    }
  }
}
```

### Ejecting and `jest-config.json`

Note that when ejecting `jest-config.json` will be wiped out and its content with be added, along with the standard jest configuration, into the new generated `package.json`. 