The original create-react-app does not have all the feature we want.

The features we want come from different sources.

Sources:

* PunchCardJS (npm scripts)
* Molviewer (jspm)
* angular-cli
* create-ts-app
* any yeoman or other generator/startkit

Features:

* Clutter-free

 * Not too many commands 
 * Not too many config files

* Transpile from Typescript to Javascript
* Transpile tsx to Javascript
* Uses npm for application dependencies (not bower, jspm)
* Target ES6 and evergreen browsers (Chrome/Firefox/Edge), transpile/polyfill functionality not available in those browsers 
* Reload browser when code changes
* Rebuild when code changes, so page can be reloaded in browser manually
* Fast rebuilds, using for eg. incremental builds or hot reload
* Typescript2 (@types instead of typings)
* Original source code in browser using source maps
* Minify of js 
* Minify of css
* Bundle (aka concatenate) of js
* Bundle css
* Testing

  * Unit
  * Against dom
  * End2End testing, eg. testling-ci, saucelabs, protractor or selenium
  
    * Test across Browser/Version/OS/Devices matrix
    
  * Coverage of original code
  * Report coverage of untested code
  * Error stacktraces of original code
  * Written in Typescript
  * Advanced assertions eg. chai
  * Mocking ability eg. sinon
  * Must have it() and describe() or equivalent
  * Command to run tests
  * Run tests when source code changes (watcher)

* Minimize duplication, eg. installing library should not take many steps 
* Linting

  * In editor by installing a editor plugin 
  * Document how to prep editor for linting
  * Before build or commit or release perform lint
  * Lint Typescript using tslint 
  * Lint Typescript using eslint
  * No conflicts between linters
  * Lint css
  * Lint tsx
  * Has editor config
  * Lint errors should prevent next step from running (ie build should fail) 
  
* Linting, testing, building must be runnable on Continous Intergration platform like Travis-CI
* Purge command, to clear build, test results and dependencies
* Deploy to Github Pages command
* Generate API documentation command

  * Include documentation for private members

* Include Typescript declaration of js package which is not available as @type/...
* Opening repo in editor should just work
* Environment flag (production/development) which can be used in code
* Proxy To Backend
* Offline
* Doucment how to install dependencies
* Document usual suspects for routing/state/async/fetch: react-router, react-redux, redux-thunk, isomorphic-fetch
* use of ES7 

  * object spread, very nice for redux
  * decorator, nice to have for mobx
  * generator, nice for redux-saga
 
