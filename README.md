# Create _Preact_ App [![Build Status](https://travis-ci.org/just-boris/create-preact-app.svg?branch=preact)](https://travis-ci.org/just-boris/create-preact-app.svg?branch=preact)

Create Preact apps with no build configuration.

This is fork of [create-react-app](https://github.com/facebookincubator/create-react-app) that does the same, but uses [Preact](https://github.com/developit/preact) instead of React.

## Quick Overview

You can use it with the same `create-react-app` command as well as upstream repo. You just need to specify custom versions of react-scripts package:

```sh
npx install -g create-react-app

npx create-react-app my-app --scripts-version @just-boris/preact-scripts
cd my-app
```

Because of [the issue in Create-react-app](https://github.com/facebookincubator/create-react-app/issues/2462) you will need to replace React with Preact manually:

```sh
npm uninstall react react-dom
npm install preact preact-compat
```

Now you can start dev-server

```
npm start
```

Then open [http://localhost:3000/](http://localhost:3000/) to see your app.<br>
When you’re ready to deploy to production, create a minified bundle with `npm run build`.

## Documentation

For the detailed information, please see [the original repo](https://github.com/facebookincubator/create-react-app). It contains all necessary information, this project doesn't have any differences.

## Updates

This reposiory has automatic synchronization with upstream via [Backstroke](https://backstroke.us/). Newer versions will be published whenever there will be new release in the original repo.

## Many thanks to maintainers of the original project for their awesome work!
