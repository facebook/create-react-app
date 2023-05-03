---
id: updating-to-new-releases
title: Updating to New Releases
---

Create React App is divided into two packages:

- `create-react-app` is a global command-line utility that you use to create new projects.
- `react-scripts` is a development dependency in the generated projects (including this one).

When you run `npx create-react-app my-app` it automatically installs the latest version of Create React App.

> If you've previously installed `create-react-app` globally via `npm install -g create-react-app`, please visit [Getting Started](getting-started.md) to learn about current installation steps.

Create React App creates the project with the latest version of `react-scripts` so you’ll get all the new features and improvements in newly created apps automatically.

To update an existing project to a new version of `react-scripts`, [open the changelog](https://github.com/facebook/create-react-app/blob/main/CHANGELOG.md), find the version you’re currently on (check `package.json` in this folder if you’re not sure), and apply the migration instructions for the newer versions.

In most cases bumping the `react-scripts` version in `package.json` and running `npm install` (or `yarn install`) in this folder should be enough, but it’s good to consult the [changelog](https://github.com/facebook/create-react-app/blob/main/CHANGELOG.md) for potential breaking changes.

We commit to keeping the breaking changes minimal so you can upgrade `react-scripts` painlessly.
