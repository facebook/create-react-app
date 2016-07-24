# Contributing to `create-react-app`

♥ `create-react-app` and want to get involved? Thanks! There are plenty of ways you can help!

Please take a moment to review this document in order to make the contribution process easy and effective for everyone involved.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue or assessing patches and features.

## Core ideas

We do not want any flags or configuration, that would defeat the purpose of this tool. We want to find good defaults and actively find ways to improve the developer experience.

We try not to make any controversial choices. If the community is split between different tools, we won't just pick the least controversial or most popular, the tool itself should be agnostic between them.

*These ideas are subject to change at any time*

## Submitting a Pull Request

Good pull requests - patches, improvements, new features - are a fantastic help. They should remain focused in scope and avoid containing unrelated commits.

Please **ask first** is somebody else is already working on this or the core developers think your feature is in-scope for `create-react-app`. Generally always have a related issue with discussions for whatever you are including.

Please also provide a **test plan**, i.e. specify how you verified what you added works.

## Setting up a local copy of the repository

1. Clone the repo with `git clone https://github.com/facebookincubator/create-react-app`

2. Run `npm install` in the root `create-react-app` folder **and** the `create-react-app/global-cli` folder

Once it is done, you can modify any file locally and run `npm start` or `npm run build` just like in a generated project.

If you want to try out the end-to-end flow with the global CLI, you can do this too:

```
npm run create-react-app my-app
cd my-app
```

and then run `npm start` or `npm run build`.

*Many thanks to [h5bp](https://github.com/h5bp/html5-boilerplate/blob/master/CONTRIBUTING.md) for the inspiration with this contributing guide*
