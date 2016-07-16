# Create React App

A new blessed “getting started” experience for building SPAs in React that we can actually ship.

## Goal

Make it easy to get started with React.

## Why This Won't Fail

* We hide a small curated set of tools behind a CLI with zero configuration. The scope is very limited: we intentionally offer the minimal tools we think are useful, and we don't allow any addons or feature creep.
* We let you exit the "getting started" experience at any time. A single CLI command removes the dependency on React CLI and replaces it with real Webpack/ESLint/Babel configs and commands. You are on your own now.
* We promote the hell out of it on in the docs. This is built by the team so people trust it.

## Philosophy

### Zero Configuration

This is a hard constraint. We are committed to having zero configuration in the project.

If you use `create-react-app`, you should have `src/index.js`, your bundle will be compiled to `build/index.html`, and it will run at http://localhost:3000 in development. You can’t change this.

It will have Babel, ESLint, Autprefixr and some other stuff we think it useful for getting started, but you won’t be exposed to it, and won’t be able to configure it. We curate the setup completely.

### Exit Strategy

You can say goodbye to `create-react-app` at any time. Type `npm run export-scripts`, and it will create the configs and replace the generated `scripts` in `package.json` with the equivalent "real thing" (e.g. `webpack-dev-server` and `webpack` calls). You're on your own now.

This is why "zero configuration" can work as a constraint. We can punt on many real-world features (code splitting, Google Analytics, custom Babel plugins) because we let you leave the "getting started" experience any time.

This makes Create React App a feasible way to get started with a "real" React project without learning the tools. Once you export, you can't go back.

### One Dependency

It works like `react-native-cli`. There is just one thing in your `devDependencies`, and it hides Babel, ESLint, and all the other stuff. But as I wrote above, you can `npm run exports-scripts` at any time.

## How to use

Install once:

```bash
npm install -g create-react-app
```

When creating a new app:

```
create-react-app my-app
cd my-app
npm start
```

Done!

If you want to build it for production

```
npm run build
```

and if you want to tweak it

```
npm run exports-scripts # Beware, this is a one-way operation, can't go back!
```

## How to develop it

You first need to

```
npm install
```

Once it is done, you can modify any file locally and do

```
npm start
npm run build
```

If you want to try out the end to end flow with the global cli

```
npm run create-react-app my-app
cd my-app
npm run
```

