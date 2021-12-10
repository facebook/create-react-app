# Create React App End-to-End Tests

## Individual packages

These are run as part of e2e or npm test -ws --if-present

## Integration

npm run test:integration

## Local E2E

npm run test:local

### CI testing with private packages

**create-react-app** relies on main registry to fetch all dependencies, but, if you are in the need to usage of custom private packages that need to be fetch while running E2E test you might need a different configuration.

#### Customizing E2E registry configuration

We use [verdaccio](https://github.com/verdaccio/verdaccio) to emulate packages publishing in a registry using a default configuration. You might modify the current behaviour by editing the file `task/verdaccio.yaml`.

For more information about the configuration check out the [Verdaccio documentation](https://verdaccio.org/docs/en/configuration).

## Usage

These tests ensure various functionality contracts are upheld across dependency upgrades.

To get started locally, run `npx jest test/ --watchAll`.

It's suggested that you filter down tests to avoid re-running everything. The most common tests will be the webpack messages.<br>
To only run the webpack messages, type `p` followed by `webpack-message` and press `[enter]`.

## How do these work?

### `fixtures/`

Each `fixture/` gets spun up in a temporary directory and has its dependencies installed.

A global (`testSetup`) is created which has a few interesting properties:

- `testSetup.testDirectory`: the directory containing the test application
- `testSetup.scripts`: an object allowing you to invoke `react-scripts` commands and friends

All tests for each `fixture/` are then ran.

#### `testSetup.scripts`

##### `start`

This will run the `start` command, it can be ran asynchronously or blocking if `{ smoke: true }` is used.<br>
If ran asynchronously, it will return the `port` and a `done` function to clean up the process.
If ran blocking, it will return the `stdout` and `stderr` of the process.

##### `build`

This will run the `build` command and return the `stdout` and `stderr` of the process.

##### `test`

This will run the `test` command and return the `stdout` and `stderr` of the process.

##### `serve`

This will run serve the application.
It will return the `port` and a `done` function to clean up the process.

# Contributing to Create React App's E2E tests

This is an end to end kitchensink test suite, but has multiple usages in it.

## Running the test suite

Tests are automatically run by the CI tools.
In order to run them locally, without having to manually install and configure everything, the `npm run e2e` CLI command can be used.

This is a script that runs a **Docker** container, where the node version, git branch to clone, and test suite can be chosen.
Run `npm run e2e -- --help` to get additional info.

If you need guidance installing **Docker**, you should follow their [official docs](https://docs.docker.com/engine/installation/).

## Writing tests

Each time a new feature is added, it is advised to add at least one test covering it.

Features are categorized by their scope:

- _env_, all those which deal with environment variables (e.g. `NODE_PATH`)

- _syntax_, all those which showcase a single EcmaScript syntax feature that is expected to be transpiled by **Babel**

- _webpack_, all those which make use of webpack settings, loaders or plugins

### Using it as Unit Tests

In it's most basic for this serve as a collection of unit tests on a single functionality.

Unit tests are written in a `src/features/**/*.test.js` file located in the same folder as the feature they test, and usually consist of a `ReactDOM.render` call.

These tests are run by **jest** and the environment is `test`, so that it resembles how a **Create React App** application is tested.

### Using it as Integration Tests

This suite tests how the single features as before behave while development and in production.
A local HTTP server is started, then every single feature is loaded, one by one, to be tested.

Test are written in `integration/{env|syntax|webpack}.test.js`, depending on their scope.

For every test case added there is only a little chore to do:

- a `case` statement must be added in `src/App.js`, which performs a dynamic `import()` of the feature

- add a test case in the appropriate integration test file, which calls and awaits `initDOM` with the previous `SwitchCase` string

A usual flow for the test itself is something similar to:

- add an `id` attribute in a target HTML tag in the feature itself

- since `initDOM` returns a `Document` element, the previous `id` attribute is used to target the feature's DOM and `expect` accordingly
