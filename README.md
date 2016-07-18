
# Create React App

Create React apps with no build configuration.

* **One Dependency:** There is just one build dependency. It uses Webpack, Babel, ESLint, and other amazing projects, but provides a cohesive curated experience on top of them.

* **Zero Configuration:** There are no configuration files or command line options. Configuring both development and production builds is handled for you so you can focus on writing code.

* **No Lock-In:** You can “eject” to a custom setup at any time. Run a single command, and all the configuration and build dependencies will be moved directly into your project, so you can pick up where we left off.

## Installation

Install it once globally:

```sh
npm install -g create-react-app
```

## Usage

To create a new app, run:

```sh
create-react-app my-app
cd my-app
```

It will create a directory called `my-app` inside the current folder.  

Inside that directory, it will generate the initial project structure and install the transient dependencies.  
Once the installation is done, you can run some commands inside the project folder!

### `npm start`

Runs the app in the development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.  
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.  
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.  
Your app is ready to be deployed!

### `npm run eject`

**Note: this is a one-way operation. Once you “eject”, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can “eject” at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transient dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever eject. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obliged to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## What’s Inside?

The tools used by Create React App are subject to change.  
Currently it is a thin layer on top of many amazing community projects, such as:

* [webpack](https://webpack.github.io/)
* [webpack-dev-server](https://github.com/webpack/webpack-dev-server)
* [Babel](http://babeljs.io/) with [preset-es2015](https://www.npmjs.com/package/babel-preset-es2015), [preset-es2016](https://www.npmjs.com/package/babel-preset-es2016), [preset-react](https://www.npmjs.com/package/babel-preset-react) and [transform-rest-spread](https://babeljs.io/docs/plugins/transform-object-rest-spread/)
* [Autoprefixer](https://github.com/postcss/autoprefixer)
* [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin)
* [style-loader](https://github.com/webpack/style-loader)
* [ESLint](http://eslint.org/)
* [eslint-config-airbnb](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb)
* and more.

All of them are transient dependencies of the provided npm package so you don’t need to worry about upgrading them or resolving conflicts.

## Limitations

Our goal is to provide a tool that bootstraps a minimal production-ready React project with a great developer experience and sane defaults.

This is why many features such as server rendering, experimental Babel plugins, or custom ESLint configuration, are not supported. It is hard to add features that would work for everyone without adding configuration. Having no configuration is an explicit design decision of this project. Currently, even running tests is not supported, although this limitation is temporary.

If you want an advanced feature, you can still use this tool, and later run `npm run eject` (but then there’s no going back!)

## You Don’t Have to Use This

This is not the “one true way” to create React apps. You don’t need to port your project to use this if you’re happy with your setup.

Historically it has been easy to gradually adopt React, but many people create new single-page React apps from scratch every day. We’ve heard [loud and clear](https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4) that this process can be error-prone and tedious, especially if this is your first JavaScript build stack.

This project is an attempt to figure out a good way to start developing React apps. We don’t claim it’s the best possible stack, and there are intentional limitations, but we think you can ship a production app with it, and with your help we’ll make it better over time.

## Contibuting

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
