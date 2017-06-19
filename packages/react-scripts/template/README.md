This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app) and customized for ServiceMax.

## ServiceMax Customizations

The standard version of Create React App comes with a minimal app structure. This version was created to provide a standard starting point with tools and concepts recommend for new projects.

For the most information about Create React App and how to perform common tasks, refer to the [create-react-app docs](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

### Folder Structure

After creation, your project should look like this:

```
my-app/
  public/
    favicon.ico
    index.html
    manifest.json
  src/
    actions/
    components/
    containers/
    services/
    store/
    test/
    theme/
    utils/
    index.js
```

### Concepts

Beyond the basics of React, the following concepts are inherent in this project structure.

#### Actions

Actions are functions that describe a request to modify the state of the app, by returning an object with `type` and `payload` properties. Read more about [Flux Actions](https://facebook.github.io/react/blog/2014/07/30/flux-actions-and-the-dispatcher.html) and [Flux Standard Actions](https://github.com/acdlite/flux-standard-action).

#### Components

Components let you split the UI into independent, reusable pieces, and think about each piece in isolation. They are sometimes called "presentational components". Read more [here](https://facebook.github.io/react/docs/components-and-props.html).

#### Containers

Containers are just like components without UI. While components are concerned with *how things **look***, containers are concerned with *how things **work**.*

Containers are typically connected to the global state using `connect()` from the `react-redux` library, and pass state as well as event handlers down to presentational components. Read more [here](http://redux.js.org/docs/basics/UsageWithReact.html).

#### Services

Services are a generic way to encapsulate logic around a resource such as Salesforce, Predix, or a local database. Services are commonly used in action creators to fetch or update some data.

#### Store

The `store` is a high level object containing application state. Most apps only have a single store, although it's possible to have multiple. We use Redux as a store container. Read more [here](http://redux.js.org/?_sm_au_=iPVvJv6v0JVDHR3q).

#### Test

Utilities to enable unit testing such as mocks and fakes. We use Jest. Read more [here](https://facebook.github.io/jest/docs/getting-started.html).

#### Theme

SASS is enabled. Any global theme variables, classes, helpers, and assets must go in the `theme` folder. Component-specific styles should be contained in a `<Component>.scss` file and in the component folder, along with style assets such as images. Read more about SASS [here](http://sass-lang.com/).

#### Utils

Anything that doesn't fit neatly into one of the other concepts may be placed in a utility module.

## Need help?

Join #dev-react channel in ServiceMax Slack.
