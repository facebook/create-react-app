# Create React App End-to-End Tests

These tests ensure various functionality contracts are upheld across dependency upgrades.

To get started locally, run `cd packages/react-scripts/ && yarn link; cd ../../test/ && ../node_modules/.bin/jest --watchAll`.

It's suggested that you filter down tests to avoid re-running everything. The most common tests will be the webpack messages.<br>
To only run the webpack messages, type `p` followed by `webpack-message` and press `[enter]`.
