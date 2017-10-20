# react-scripts

This package includes scripts and configuration used by [Create React App](https://github.com/facebookincubator/create-react-app).<br>
Please refer to its documentation:


The following are also configurable:

collectCoverageFrom
coverageReporters
coverageThreshold
snapshotSerializers

Add any of the above to a Jest config in package.json

for instnace:

``json
 {
   "name": "your-package",
   "jest": {
     "collectCoverageFrom" : [
       "src/**/*.{js,jsx}",
       "!<rootDir>/node_modules/",
       "!<rootDir>/path/to/dir/"
     ],
     "coverageThreshold": {
       "global": {
         "branches": 90,
         "functions": 90,
         "lines": 90,
        "statements": 90
       }
     },
     "coverageReporters": ["text"],
    "snapshotSerializers": ["my-serializer-module"]
   }
 }

* [Getting Started](https://github.com/facebookincubator/create-react-app/blob/master/README.md#getting-started) – How to create a new app.
* [User Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md) – How to develop apps bootstrapped with Create React App.