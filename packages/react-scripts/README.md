# react-scripts

This package includes scripts and configuration used by [Create React App](https://github.com/facebook/create-react-app).<br>
Please refer to its documentation:

- [Getting Started](https://facebook.github.io/create-react-app/docs/getting-started) – How to create a new app.
- [User Guide](https://facebook.github.io/create-react-app/) – How to develop apps bootstrapped with Create React App.

# This is a fork – set up and update instructions

We chose to use react-scripts for lightning's build system instead of custom webpack, babel, and jest configs. We used to have separate configs for each of these, but it was very difficult to keep up-to-date. react-scripts allows us to more-easily update our build system with the "latest and greatest" tech, as well as serve as a forcing function for us to follow common conventions with the general React community.

Unfortunately, we cannot use vanilla react-scripts. We considered some other alternatives, including react-app-rewired and ejecting, but both of those come at some negative traceoffs. react-app-rewired relies on hacking node's module loading mechanism to change behavior of react-scripts, which is brittle, and also limiting in that it only enables some specific overrides. Ejecting is not great either, because it means we'll diverge from create-react-app and we'll end up in the same situation in only a few months later.

So instead, we have decided to fork react-scripts. This comes at the tradeoff that we'll need to do some extra work to handle merge conflicts whenever we update from upstream. It's even more tricky because we'd like to keep this project in the same monorepo as our other JavaScript projects. Even considering these issues, we still feel this solution offers the best solution.

See the accompanying MODIFICATIONS.md for a list of things we changed from the original react-scripts.
