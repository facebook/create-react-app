# Blue Abla - Create React App

This is a fork of [Create React App](https://github.com/facebookincubator/create-react-app/). Please refer to their docs for more in-depth details.

This fork supports Sass and Prettier out of the box, and includes Blue Alba's linting rules.

## Quick Overview

```sh
npx create-react-app my-app --scripts-verion @bluealba/react-scripts
cd my-app
npm start
```
Then open [http://localhost:3000/](http://localhost:3000/) to see your app.<br>
You can also check out [http://localhost:8888/](http://localhost:8888/) to see the Bundle Analyzer.<br>
When you’re ready to deploy to production, create a minified bundle with `npm run build`.

## Creating an App

**You’ll need to have Node >= 6 on your local development machine** (but it’s not required on the server). You can use [nvm](https://github.com/creationix/nvm#installation) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows) to easily switch Node versions between different projects.

To create a new app, run a single command:

```sh
npx create-react-app my-app --scripts-verion @bluealba/react-scripts
```

*([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher, see [instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))*

It will create a directory called `my-app` inside the current folder.<br>
Inside that directory, it will generate the initial project structure and install the transitive dependencies:

```
my-app
├── README.md
├── node_modules
├── package.json
├── .gitignore
├── .env
├── public
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
└── src
    ├── components
    ├── constants
    ├── containers
    │   ├── __test__
    │   │   └── App.test.js
    │   ├── App.scss
    │   └── App.js
    ├── svg
    │   └── logo.svg
    ├── utils
    │   └── registerServiceWorker.svg
    └── index.js
```

Once the installation is done, you can open your project folder:

```sh
cd my-app
```

Inside the newly created project, you can run some built-in commands:

### `npm start` or `yarn start`

Runs the app in development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will automatically reload if you make changes to the code.<br>
You will see the build errors and lint warnings in the console.

<img src='https://camo.githubusercontent.com/41678b3254cf583d3186c365528553c7ada53c6e/687474703a2f2f692e696d6775722e636f6d2f466e4c566677362e706e67' width='600' alt='Build errors'>

### `npm test` or `yarn test`

Runs the test watcher in an interactive mode.<br>
By default, runs tests related to files changed since the last commit.

[Read more about testing.](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#running-tests)

### `npm run build` or `yarn build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
By default, it also [includes a service worker](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#making-a-progressive-web-app) so that your app loads from local cache on future visits.

Your app is ready to be deployed.

### `npm run format` or `yarn format`

Formats your code using prettier rules.
