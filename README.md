
# Create React App

Create React apps with no build configuration.

* **One Dependency:** There is just one build dependency. It uses Webpack, Babel, ESLint, and other amazing projects, but provides a cohesive curated experience on top of them.

* **Zero Configuration:** There are no configuration files or command line options. Configuring both development and production builds is handled for you so you can focus on writing code.

* **No Lock-In:** You can “eject” to a custom setup at any time. Run a single command, and all the configuration and build dependencies will be moved directly into your project, so you can pick up right where you left off.

## Installation

Install it once globally:

```sh
npm install -g create-react-app
```

**You’ll need to have Node >= 4 on your machine**. We recommend to use Node >= 6 and npm >= 3 for faster installation speed and better disk usage. You can use [n](https://github.com/creationix/nvm#usage) to easily switch the Node versions between different projects.

**This tool doesn’t assume a Node backend**. The Node installation is only required for the build tools that rely on it locally, such as Webpack and Babel. The output folder includes an `index.html`, a minified JavaScript bundle, and bundled images and styles, so you can host them anywhere you like.

## Why Use This?

**If you’re getting started** with React, use `create-react-app` to automate the build of your app. There is no configuration file, and `react-scripts` is the only extra build dependency in your `package.json`. Your environment will have everything you need to build a modern React app:

* React, JSX, and ES6 support
* Language extras beyond ES6 like the object spread operator
* A dev server that lints for common errors
* Import css and image files directly from JavaScript
* Autoprefixed CSS, so you don't need `-webkit` or other prefixes
* A `build` script to bundle js, css, and images for production, with sourcemaps

**The feature set is intentionally limited**. It doesn’t support advanced features such as server rendering or CSS modules. Currently, it doesn’t support testing either. The tool is also **non-configurable** because it is hard to provide a cohesive experience and easy updates across a set of tools when the user can tweak anything.

**If you’re a power user** and are comfortable with configuring build dependencies yourself, you can use this tool as a boilerplate generator. When you “eject” from it, the tool moves all the configuration right into your project, and removes itself from the dependencies. This way you can customize everything in this setup but you won’t get the upstream updates of the curated set of plugins.

**You don’t have to use this.** Historically it has been easy to [gradually adopt](https://www.youtube.com/watch?v=BF58ZJ1ZQxY) React. However many people create new single-page React apps from scratch every day. We’ve heard [loud](https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4) and [clear](https://twitter.com/thomasfuchs/status/708675139253174273) that this process can be error-prone and tedious, especially if this is your first JavaScript build stack. This project is an attempt to figure out a good way to start developing React apps.

## Usage

To create a new app, run:

```sh
create-react-app my-app
cd my-app
```

It will create a directory called `my-app` inside the current folder.

Inside that directory, it will generate the initial project structure and install the transient dependencies.<br>
Once the installation is done, you can run some commands inside the project folder!

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transient dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## What’s Inside?

The tools used by Create React App are subject to change.
Currently it is a thin layer on top of many amazing community projects, such as:

* [webpack](https://webpack.github.io/) with [webpack-dev-server](https://github.com/webpack/webpack-dev-server), [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) and [style-loader](https://github.com/webpack/style-loader)
* [Babel](http://babeljs.io/) with ES2016 and the extensions we use at Facebook (JSX, [object spread](https://github.com/sebmarkbage/ecmascript-rest-spread/commits/master), [class properties](https://github.com/jeffmo/es-class-public-fields))
* [Autoprefixer](https://github.com/postcss/autoprefixer)
* [ESLint](http://eslint.org/)
* and more.

All of them are transient dependencies of the provided npm package.

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

* [enclave](https://github.com/eanplatter/enclave) by [@eanplatter](https://github.com/eanplatter)
* [nwb](https://github.com/insin/nwb) by [@insin](https://github.com/insin)
* [react-boilerplate](https://github.com/mxstbr/react-boilerplate) by [@mxstbr](https://github.com/mxstbr)
