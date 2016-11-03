
# legend

The table records what is currently available and working _in the listed repo_, not what could work with some extra effort. Recording these facts helps to keep the discussions clean.

- :grey_question: : unknown
- :white_check_mark: : implemented
- :x: : not implemented



# general

|feature description |  [create-react-app](https://github.com/facebookincubator/create-react-app) |  [punchcardjs](https://github.com/nlesc-sherlock/punchcardjs) |  [molviewer](https://github.com/3D-e-Chem/molviewer-tsx) |  [angular-cli](https://github.com/angular/angular-cli) |  [create-ts-app](https://github.com/vgmr/create-ts-app) | yeoman generator | issues |
|---|---|---|---|---|---|---|---|
| transpile from TS to JS | :x: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | #2 |
| transpile TSX to JS | :x: | :x: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | [#2](/issues/#2) |
| transpile errors are terminal | :grey_question: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| doesn't use ``gulp`` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| doesn't use ``grunt`` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| doesn't use ``bower`` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| doesn't use ``jspm`` | :white_check_mark: | :white_check_mark: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| targets es5 | :white_check_mark: | :white_check_mark: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| targets latest chrome | :grey_question: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| targets latest firefox | :grey_question: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| targets latest edge | :grey_question: | :grey_question: | :grey_question: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| automatic reload browser on code change | :white_check_mark: | :x: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| automatic rebuild on code changes, manual browser reload | :white_check_mark: | :x: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| fast rebuilds | :white_check_mark: | :x: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| can handle TS2 ``@types/`` | :x: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| in-browser debugging of original source code | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| minification of js | :white_check_mark: | :white_check_mark: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| minification of css | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| bundling of js | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| bundling of css | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| linting can run on Travis or similar | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| testing can run on Travis or similar | :white_check_mark: | :white_check_mark: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| building can run on Travis or similar | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| has ``purge`` command: | :x: | :white_check_mark: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| has deploy app to gh-pages command | :white_check_mark: | :x: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| has deploy docs to gh-pages command | :x: | :white_check_mark: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| has generate api docs command | :x: | :white_check_mark: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| can handle es7 object spread | :white_check_mark: | :x: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| can handle es7 decorators | :x: | :x: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| can handle es7 generator | :grey_question: | :x: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| can use untyped JS libs | :x: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| can differentiate prod/dev | :white_check_mark: | :x: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| can access external api server | :white_check_mark: | :x: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |


# testing

|feature description |  [create-react-app](https://github.com/facebookincubator/create-react-app) |  [punchcardjs](https://github.com/nlesc-sherlock/punchcardjs) |  [molviewer](https://github.com/3D-e-Chem/molviewer-tsx) |  [angular-cli](https://github.com/angular/angular-cli) |  [create-ts-app](https://github.com/vgmr/create-ts-app) | yeoman generator | issues |
|---|---|---|---|---|---|---|---|
| unit testing | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| dom testing | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| e2e testing | :x: | :x: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| testing across browsers/OS/devices | :x: | :x: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| coverage of original code  | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| coverage includes untouched code  | :grey_question: | :grey_question: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| error stacktrace of original code  | :grey_question: | :grey_question: | :grey_question: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| tests written in TS  | :x: | :x: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| has ``it()`` and ``describe()`` or similar  | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| has command to run tests  | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| automatic run tests on source change | :white_check_mark: | :x: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| Advanced assertions, e.g. Chai  | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| Mocking ability, e.g. Sinon  | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |


# linting

|feature description |  [create-react-app](https://github.com/facebookincubator/create-react-app) |  [punchcardjs](https://github.com/nlesc-sherlock/punchcardjs) |  [molviewer](https://github.com/3D-e-Chem/molviewer-tsx) |  [angular-cli](https://github.com/angular/angular-cli) |  [create-ts-app](https://github.com/vgmr/create-ts-app) | yeoman generator | issues |
|---|---|---|---|---|---|---|---|
| tslint by editor plugin | :x: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| csslint by editor plugin | :x: | :x: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| esjshint by editor plugin | :white_check_mark: | :x: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| prebuild linting | :grey_question: | :white_check_mark: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| precommit linting | :grey_question: | :x: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| prerelease linting | :grey_question: | :white_check_mark: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| tslint the TS src | :x: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| eslint src | :white_check_mark: | :x: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| no conflicts between linters | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| lint css | :x: | :white_check_mark: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| linter tsx aware | :x: | :x: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| has .editorconfig | :x: | :white_check_mark: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| lint errors are terminal | :grey_question: | :x: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |





# Remaining

* Not too many commands
* Not too many config files
* Minimize duplication, eg. installing library should not take many steps
* Opening repo in editor should just work
* Doucment how to install dependencies
* Document usual suspects for routing/state/async/fetch: react-router, react-redux, redux-thunk, isomorphic-fetch
* dependency management: npm, unpkg
* autoprefixing vendor specific css ``-webkit-box-orient`` and such
* static asset management, including fonts, images and such
* avoid browser caching of static assets


| allows offline mode | :white_check_mark: | :x: | :x: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| allows standalone mode | :grey_question: | :x: | :white_check_mark: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
























