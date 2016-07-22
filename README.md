# Create React App

Create React apps with no build configuration.

## tl;dr

```sh
npm install -g create-react-app

create-react-app my-app
cd my-app/
npm start

```

Then open [http://localhost:3000/](http://localhost:3000/) to see your app.

<img src='https://camo.githubusercontent.com/506a5a0a33aebed2bf0d24d3999af7f582b31808/687474703a2f2f692e696d6775722e636f6d2f616d794e66434e2e706e67' width='600' alt='npm start'>

When you’re ready to deploy to production, create a minified bundle with `npm run build`.

## Getting Started

### Installation

Install it once globally:

```sh
npm install -g create-react-app
```

**You’ll need to have Node >= 4 on your machine**. We recommend to use Node >= 6 and npm >= 3 for faster installation speed and better disk usage. You can use [nvm](https://github.com/creationix/nvm#usage) to easily switch Node versions between different projects.

**This tool doesn’t assume a Node backend**. The Node installation is only required for the build tools that rely on it locally, such as Webpack and Babel. The output folder includes an `index.html`, a minified JavaScript bundle, and bundled images and styles, so you can host them anywhere you like.

### Creating an App

To create a new app, run:

```sh
create-react-app my-app
cd my-app
```

It will create a directory called `my-app` inside the current folder.

Inside that directory, it will generate the initial project structure and install the transient dependencies:

```
my-app/
  README.md
  index.html
  favicon.ico
  node_modules/
  package.json
  src/
    App.css
    App.js
    index.css
    index.js
    logo.svg
```

No configuration or complicated folder structures, just the files you need to build your app.

Once the installation is done, you can run some commands inside the project folder:

### `npm start`

Runs the app in development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also build errors and lint warnings in the console.

<img src='https://camo.githubusercontent.com/41678b3254cf583d3186c365528553c7ada53c6e/687474703a2f2f692e696d6775722e636f6d2f466e4c566677362e706e67' width='600' alt='Build errors'>

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## How Do I?...

The generated project will include a guide in its README.  
You can also read its latest version [here](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md).

## Philosophy

* **One Dependency:** There is just one build dependency. It uses Webpack, Babel, ESLint, and other amazing projects, but provides a cohesive curated experience on top of them.

* **Zero Configuration:** There are no configuration files or command line options. Configuring both development and production builds is handled for you so you can focus on writing code.

* **No Lock-In:** You can “eject” to a custom setup at any time. Run a single command, and all the configuration and build dependencies will be moved directly into your project, so you can pick up right where you left off.

## Why Use This?

**If you’re getting started** with React, use `create-react-app` to automate the build of your app. There is no configuration file, and `react-scripts` is the only extra build dependency in your `package.json`. Your environment will have everything you need to build a modern React app:

* React, JSX, and ES6 support.
* Language extras beyond ES6 like the object spread operator.
* A dev server that lints for common errors.
* Import CSS and image files directly from JavaScript.
* Autoprefixed CSS, so you don’t need `-webkit` or other prefixes.
* A `build` script to bundle JS, CSS, and images for production, with sourcemaps.

**The feature set is intentionally limited**. It doesn’t support advanced features such as server rendering or CSS modules. Currently, it doesn’t support testing either. The tool is also **non-configurable** because it is hard to provide a cohesive experience and easy updates across a set of tools when the user can tweak anything.

**You don’t have to use this.** Historically it has been easy to [gradually adopt](https://www.youtube.com/watch?v=BF58ZJ1ZQxY) React. However many people create new single-page React apps from scratch every day. We’ve heard [loud](https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4) and [clear](https://twitter.com/thomasfuchs/status/708675139253174273) that this process can be error-prone and tedious, especially if this is your first JavaScript build stack. This project is an attempt to figure out a good way to start developing React apps.

### Converting to a Custom Setup

**If you’re a power user** and you aren’t happy with the default configuration, you can “eject” from the tool and use it as a boilerplate generator.

Running `npm run eject` copies all the configuration files and the transient dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. Commands like `npm start` and `npm run build` will still work, but they will point to the copied scripts so you can tweak them. At this point, you’re on your own.

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## What’s Inside?

The tools used by Create React App are subject to change.
Currently it is a thin layer on top of many amazing community projects, such as:

* [webpack](https://webpack.github.io/) with [webpack-dev-server](https://github.com/webpack/webpack-dev-server), [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) and [style-loader](https://github.com/webpack/style-loader)
* [Babel](http://babeljs.io/) with ES6 and extensions used by Facebook (JSX, [object spread](https://github.com/sebmarkbage/ecmascript-rest-spread/commits/master), [class properties](https://github.com/jeffmo/es-class-public-fields))
* [Autoprefixer](https://github.com/postcss/autoprefixer)
* [ESLint](http://eslint.org/)
* and more.

All of them are transient dependencies of the provided npm package.

## Limitations

Some features are currently **not supported**:

* Server rendering.
* Testing.
* Some experimental syntax extensions (e.g. decorators).
* CSS Modules.
* LESS or Sass.
* Hot reloading of components.

Some of them might get added in the future if they are stable, are useful to majority of React apps, don’t conflict with existing tools, and don’t introduce additional configuration.

## Contributing

Clone the repo and run `npm install` in the root and the `global-cli` folder.

Once it is done, you can modify any file locally and run `npm start` or `npm run build` just like in a generated project.
If you want to try out the end-to-end flow with the global CLI, you can do this too:

```
npm run create-react-app my-app
cd my-app
```

and then run `npm start` or `npm run build`.

## Acknowledgements

We are grateful to the authors of existing related projects for their ideas and collaboration:

* [@eanplatter](https://github.com/eanplatter)
* [@insin](https://github.com/insin)
* [@mxstbr](https://github.com/mxstbr)

## Alternatives

If you don’t agree with the choices made in this project, you might want to explore alternatives with different tradeoffs:

* [enclave](https://github.com/eanplatter/enclave)
* [nwb](https://github.com/insin/nwb)
* [motion](https://github.com/motion/motion)
* [rackt-cli](https://github.com/mzabriskie/rackt-cli)
* [budō](https://github.com/mattdesl/budo)
* [rwb](https://github.com/petehunt/rwb)

You can also use module bundlers like [webpack](http://webpack.github.io) and [Browserify](http://browserify.org/) directly.  
React documentation includes [a walkthrough](https://facebook.github.io/react/docs/package-management.html) on this topic.
