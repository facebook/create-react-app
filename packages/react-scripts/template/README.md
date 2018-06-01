# ‌‌ [![LOGO][logo-image]][logo-url] React Most Wanted
[![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![License][license-image]][license-url]
[![Code Coverage][coverage-image]][coverage-url]
[![Code Style][code-style-image]][code-style-url]

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

This is a `shell` for my future applications with the minimum features I would like them to have. Because of this I have designed it to be as simple as possible and without regrets about feature implementations.

You can find an example of this project in this [DEMO](https://www.react-most-wanted.com/).

For quesions you can join our [gitter room](https://gitter.im/react-most-wanted/Lobby).

I tried to make the project as clean as possible and to use all libraries in their pure ways.

This readme is just a brief overview of the project. Here are some related articles that descripe some parts of this project in depth:
- [Beyond create-react-app](https://codeburst.io/beyond-create-react-app-cra-a2063196a124)
- [Organising your Firebase CLoud Functions](https://codeburst.io/organizing-your-firebase-cloud-functions-67dc17b3b0da)
- [Firekit concepts to sync Firebase and redux](https://codeburst.io/firekit-concepts-to-sync-firebase-and-redux-606a1e3e50d6)
- [Firebase and react Continuous Deployment](https://codeburst.io/firebase-and-react-continuous-deployment-2e6d81f0b6a1)
- [Redux simple values](https://codeburst.io/redux-simple-values-7712694f311)
- [React Most Wanted](https://medium.com/@tarikhuber/react-most-wanted-d4e916782c2e)

## Table of Contents

- [Features](#features)
- [Folder Structure](#folder-structure)
- [Usage](#usage)
  - [Simple run](#simple-run)
  - [Reuse for own project](#reuse-for-own-project)
- [Customization](#customization)
  - [Internationalization](#internationalization)
  - [Theming](#theming)
  - [Firebase lists](#firebase-lists)
  - [Drawer width](#drawer-width)
  - [Authorisation](#authorisation)
- [TO DO](#to-do)
- [License](#license)
- [Logo](#logo)


## Features

`React Most Wanted` is a "base project", "starter kit", "boilerplate" (call it whatever you like) project with my **personal** "Most Wanted" features:
* **easy to maintain**
* ***PWA** - has Progressive Web App features
* **responsive** - included with PWA
* **material-ui**
* **routing**
* **theming**
* **forms** - with realtime sync of untouched fields
* **internationalization**
* **authentication**
* **authorisation**
* **code splitting**
* **CI** and **CD**

All these features can be programmed from scratch. But why should anyone do this? There are so many great developers out there creating great applications, libraries and tools to help them and you to develop fast and easily. This is my small contribution to help others have an easier time beginning to use React.

If all that is true, then why did I create this project? There must already be a great starter kit for React applications! Well, there are lots of them but unfortunately none of them was as I would like it to be. Some don't have enough features to just start and some have so many that I had to delete features I don't need. I want to create a starting point that has, as said before, my **personal** "Most Wanted" features. If someone likes it, great :)

There are also other cool features:
* **realtime database**
* **realtime forms**
* **messaging/notifications** - every logged user that approved messaging on login will receive notifications for new tasks created
* **full authentication** - with Google, Facebook, Twitter, GitHub, email and **phone**
* **online and last time offline state for users**
* **file uploads to the firebase storage**


The further text explains which libraries/modules are used, and why. Some of them are installed and used in their `pure` way as described in their documentation. In those cases we will just show the link to the official documentation to avoid outdated descriptions of their usage.

## Folder Structure

The project has following folder structure:

```
react-most-wanted/
  .gitignore
  README.md
  node_modules/
  package.json
  sw-precache-config.js
  public/
    icons/
    index.html
    favicon.ico
    manifest.json
  src/
    components/
    containers/
    firebase/
    utils/
    locales/
    store/
      index.js
      reducers.js
    themes/
    config.js
    index.js
```

All application parts and code should be stored in the `src` folder.

All `react` components should be separated in presentational and container components. This great [article](https://www.fullstackreact.com/p/using-presentational-and-container-components-with-redux/) describes the why and how. For this purpose we have the `components` and `containers` folders.

All `redux` related files are in the `store` folder. You can find more about redux [here](http://redux.js.org/docs/introduction/).

The folders `locales` and `themes` are used to store data for different locales and themes.

## Usage

### Simple run


To just run the project on you own device you should have installed: git, node and npm. Let's assume that this is the case.

Now in your console go to the destination where you want to save the project and run this command:

```js
git clone https://github.com/TarikHuber/react-most-wanted
```

or

```js
git clone https://github.com/TarikHuber/react-most-wanted my_project
```

if you want to save the project into a specific folder (in this example "my_project"). The folder must be empty!

Now go with the console into the folder. If you haven't provided a name like "my_project" then it will be the default "react-most-wanted".

Once in the project folder, you should install NPM dependendencies by running:

```js
npm install
```

Then, run this command to start the development mode of the project:

```js
npm start
```

For publishing run:

```js
npm run build
```

After it finished follow the instructions or publish the project build folder to your preferred  provider or own server.

### Reuse for own project

You can either fork this project or clone it into your own repo. I use the second for new projects. You can find [here](https://help.github.com/articles/duplicating-a-repository/) more information about how to clone/duplicate a repo into your own.

After cloning the repo into your own you should change the configurations like project name and the firebase config. Here is a list of all changes you should make:
* **package.json**  - here you should change the name and version
* **src/config.js**  - here you should change all firebase data and other options
* **public/index.html**  - change the title (it will be overridden, but it looks better)
* **public/firebase-messaging-sw.js**  - change the ``messagingSenderId``


After setting up the code we need to deploy our application to Firebase. As first create an application build by running `npm run build`.

To use firebase we need to install the firebase tools by running `npm install -g firebase-tools` and after that login to firebase with `firebase login`.

After the login run `firebase init` to setup the Firebase project. Override the existing project and select yours from your Firebase console.
Override only the '.firebasesrc' file and leave the other as they are because the database and storage rules, functions and firebase settings should stay as they are. If you override them the project will probably not work as it should.

Don't forget to setup the email configs into the firebase functions using `firebase functions:config:set gmail.email="myusername@gmail.com" gmail.password="secretpassword"`.

You should now be able to deploy your application to your Firebase using `firebase deploy`.


##Customization

### Internationalization

Internationalization is very important. Even if you use just a single language your application should be prepared for more of them. It is easier to apply this from the start than to refactor the whole application afterwards.

The only thing you'll have to do to add a new language is that you have to add the localisationData in the locales [index.js](https://github.com/TarikHuber/react-most-wanted/blob/master/src/locales/index.js) folder like in the code sniped below. Here we add the language for to the project:

```js

import fr from 'react-intl/locale-data/fr';
import fr_messages from './fr';

//... other code

const locales = [
  {
    locale: 'en',
    messages: en_messages,
    data: en
  },
  {
    locale: 'de',
    messages: de_messages,
    data: de
  },
  {
    locale: 'bs',
    messages: bs_messages,
    data: bs
  },
  {
    locale: 'fr',
    messages: fr_messages,
    data: fr
  },

]

```

We also need to create a file 'fr.js' into the 'locales' folder. I would recommend to juts copy the 'en.js' file and to translate the strings.

To add more translated strings just add them to every language file you have in the 'locales' folder.

### Theming

To change or to add a new theme you would have to add or edit a theme file into the 'themes' folder and a reference to it into the 'index.js' file.

For example we crate a file 'my_theme.js' and change the 'index.j' file like below. You can use the 'ics_theme' as bootstrap for new projects or get a new one from the official 'material-ui' documentation.

```js

import ics_theme from './ics_theme';
import my_theme from './my_theme';

const themes= [
  {
    id: 'light',
    source: lightBaseTheme,
  },
  {
    id: 'dark',
    source: darkBaseTheme,
  },
  {
    id: 'ics',
    source: ics_theme,
  },
  {
    id: 'my_theme',
    source: my_theme,
  },
];

```

### Firebase lists

To add a new list that is synced with Firebase there are more steps to take.
First we need to create a component that will represent the list. You can use the 'Tasks.js' component as example.

In that you should change following code parts to make it work:

```js
//....code before
const actions = new ListActions('your_list').createActions();
//....code after

```

In the folder 'store' you should add the generated reducers into the 'reducers.js' file, like so:

```js
//....code before
const reducers = combineReducers({
  browser: responsiveStateReducer,
  responsiveDrawer,
  form: formReducer,
  auth,
  connection,
  dialogs,
  messaging,
  locale,
  theme,
  tasks: getListReducers('public_tasks'),
  companies: getListReducers('companies'),
  your_list: getListReducers('your_list'), //your new list
  users: getListReducers('users')
})
//....code after

```

That is all you have to do to add a new list. It is up to you how the lists will be presented. Just don't forget to leave into the mounting and unmounting part of you component following code parts:

```js
//....code before
componentDidMount() {
  const {initialiseList}=this.props;
  initialiseList();
}

componentWillUnmount() {
  const {unsubscribeList}=this.props;
  unsubscribeList();
}
//....code after

```

These are initializing the list and unsubscribing from it if we leave the component. You can add other code to those functions or move those calls to other places of your component life cycle if you wish.

### Drawer width

To change the drawer (left menu) width go to the 'config.js' file and change the value of  'drawer_width' :)

### Authorization

Note that authentication and authorization are not the same thing! With authentication we identify who we have as user and with authorization we identify what that user can do in our application. In this project authorization is managed over `grants` and `roles`. Every grant gives the user the authorization to do a specific action (read, create, edit or delete) in the database. Roles are defining a group of grants you can give a user. They are just for managing large number of grants easily. Every grant can still be managed separately.

Only administrators have access to add or remove grants and roles to a user. Only administrators can make other users to administrators.

**WARNING:** In this demo the rules are manipulated such that everyone can make other users admins, and a user can even become an admin on their own. Everyone can see how this part works. In production a change should be made in the database.rules file.

From:

```js
"admins":{
  ".read": "auth != null",
  "$uid":{
    ".write": "auth != null || root.child('admins/'+auth.uid).exists()"
  }
},

```

To:

```js
"admins":{
  ".read": "auth != null",
  "$uid":{
    ".write": "auth != null && root.child('admins/'+auth.uid).exists()"
  }
},

```

## Thanks

[<img src="https://www.browserstack.com/images/mail/browserstack-logo-footer.png" width="120">](https://www.browserstack.com/)

Thank you to [BrowserStack](https://www.browserstack.com/) for providing the infrastructure that allows us to test in real browsers.

## TO DO
- [X] update to material-ui@next
- [ ] finish tests

## License

MIT

## Logo

Thanks to @SiradDev for creating the logo for this project :)

[logo-image]: https://www.react-most-wanted.com/favicon-32x32.png
[logo-url]: https://github.com/TarikHuber/react-most-wanted/blob/master/README.md
[travis-image]: https://travis-ci.org/TarikHuber/react-most-wanted.svg?branch=master
[travis-url]: https://travis-ci.org/TarikHuber/react-most-wanted
[daviddm-image]: https://img.shields.io/david/TarikHuber/react-most-wanted.svg?style=flat-square
[daviddm-url]: https://david-dm.org/TarikHuber/react-most-wanted
[coverage-image]: https://img.shields.io/codecov/c/github/TarikHuber/react-most-wanted.svg?style=flat-square
[coverage-url]: https://codecov.io/gh/TarikHuber/react-most-wanted
[license-image]: https://img.shields.io/npm/l/express.svg
[license-url]: https://github.com/TarikHuber/react-most-wanted/master/LICENSE
[code-style-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[code-style-url]: http://standardjs.com/
