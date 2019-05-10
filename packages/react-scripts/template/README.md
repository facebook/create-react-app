[![Build Status](https://travis-ci.org/fs-webdev/{GITHUB_REPO}.svg?branch=master)](https://travis-ci.org/fs-webdev/{GITHUB_REPO})

This project was bootstrapped with FamilySearch's [Fork of Create React App](https://github.com/fs-webdev/create-react-app).

## Running App Locally
There are a few steps to get this app cloned and ready to run locally.
1. Clone this repo to your machine  
  `git clone https://github.com/fs-webdev/{GITHUB_REPO}.git`
2. Run `npm install`
3. Make sure you have @fs/fr-cli installed  
  `npm i -g @fs/fr-cli`
4. Run `fr env` to make a .env file for you automatically
5. You should now be in a good state to run/develop the app locally

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode on `localhost:{SOME_PORT}`. `SOME_PORT` gets set to whatever is in
your .env file, or falls back to port 3000 if .env's PORT is not set.

The page will reload if you make edits. Hooray!<br>
You will also see any lint errors in the console.

### `npm test`

Runs a linting script to make sure there are no issues, and then launches the test runner jest in the interactive watch mode.<br>

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>

See the section about [deployment](https://www.familysearch.org/frontier/docs/#/develop/deploy) for more information.

## Learn More

You can learn more in the [Frontier Documentation](https://www.familysearch.org/frontier/docs/).
