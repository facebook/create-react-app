
# Create React App

Create React apps with no build configuration.

* **One Dependency:** Once you create an app, there is just one build dependency. Internally we use Webpack, Babel, ESLint, and other amazing projects, but we manage their versions and provide a curated experience on top of them.

* **Zero Configuration:** There are no configuration files or command line options. Let us take care of configuring the build both for development and production so you can focus on creating an app.

* **No Lock-In:** You can “graduate” to a custom setup at any time. Run a single command, and we will remove the tool and copy all the configuration and dependencies into your project, so you can pick up where we left off.

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

This will create a directory called `my-app` inside the current folder.  

Inside that directory, we will generate the initial project structure and install the transient dependencies.  
Once it’s finished, you can run some commands inside the project folder!

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

### `npm run graduate`

**Note: this is a one-way operation. Once you “graduate”, you can’t go back!**

If you aren’t satisfied with the defaults we provide, and want to change or extend your build configuration, you can graduate at any time. This command will remove the single build dependency we provided from your project.

Instead, it will copy all the configuration files and the dependencies we have been using under the hood into your project so you have full control over them. All of the commands except `graduate` will still work, but we will point them to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever graduate. We intend to keep the curated feature set suitable for small and middle deployments, and you shouldn’t feel obliged to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Limitations

We don’t currently intend to support advanced features such as server rendering, experimental Babel plugins, custom ESLint configuration, etc. Our goal is to provide a tool that bootstraps a minimal production-ready React project with a great developer experience and sane defaults. If you want an advanced feature, you can still use this tool, and later run `npm run graduate` to customize the experience (but then there’s no going back!)

## What’s Inside?

The tools used by Create React App are subject to change.  
Currently we use:

* [webpack](https://webpack.github.io/)
* [webpack-dev-server](https://github.com/webpack/webpack-dev-server)
* [Babel](http://babeljs.io/) with [preset-es2015](https://www.npmjs.com/package/babel-preset-es2015), [preset-es2016](https://www.npmjs.com/package/babel-preset-es2016) and [transform-rest-spread](https://babeljs.io/docs/plugins/transform-object-rest-spread/)
* [Autoprefixer](https://github.com/postcss/autoprefixer)
* [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin)
* [style-loader](https://github.com/webpack/style-loader)
* [ESLint](http://eslint.org/)
* [eslint-config-airbnb](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb)
* and some more.

We hide all of them behind our npm package so you don’t need to worry about upgrading them or solving conflicts.

## You Don’t Have to Use This

This is not the “one true way” to create React apps. You don’t need to port your project to use this if you’re happy with your setup. There are also many things we won’t provide (see “Limitations” above).

Historically we’ve made it easy to gradually adopt React, but many people create new single-page React apps every day, and we’ve heard [loud and clear](https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4) that this process can be error-prone and tedious, especially if this is your first JavaScript build stack.

This project is our attempt to figure out a good way to start developing React apps. We don’t claim it’s the best possible stack, and there are intentional limitations, but we think you can ship a production app with it, and we’ll make it even better over time.

We also want you to feel in control so you can “graduate” from this tool at any time (see instructions above!).

## Contibuting

Clone the repo and run `npm install`.

Once it is done, you can modify any file locally and run `npm start` or `npm run build` just like in a generated project.  
If you want to try out the end-to-end flow with the global CLI, you can do this too:

```
npm run create-react-app my-app
cd my-app
```

and then run `npm start` or `npm run build`.
