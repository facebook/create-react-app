# ☢ custom-react-scripts ☢
Support for custom create-react-app config without ejecting the app.

**Features:**
* Decorators
* babel-preset-stage-0
* LESS
* SASS
* CSS modules
* webpack-dashboard

### Disclaimer:
This is **not** a fork of ```create-react-app``` It's just a fork of react-scripts with simple modifications to add extra features. As [@gaearon commented](https://github.com/facebookincubator/create-react-app/issues/682#issue-177762206) on one issue in the official create-react-app repo, this is fine:

> It is not common knowledge that you can fork react-scripts, publish your fork, and then do create-react-app my-app --scripts-version my-react-scripts-fork.

### Compatible with
create-react-app **v0.5.1**

### Why?
The ```create-react-app``` team doesn't want user configuration and modifications for few reasons:

* Some of the babel presets and plugins people might use are experimental.  If they're used in a project and then they don't make it in the ES spec, they will break backwards compatibility.
* It's hard to maintain code for all of these custom configurations that people want to use.

But people still want to use some of these features, and they're either ejecting their CRA app, or just don't use ```create-react-app``` because they're *just* missing **X** feature.

So instead of [searching through npm](https://www.npmjs.com/search?q=react-scripts) for a ```react-scripts``` fork with the **X** feature you need, this fork provides support for all of these extra features with simply adding a line in the ```.env``` config.

### How to use it
```create-react-app my-app --scripts-version custom-react-scripts```

Modify the ```.env``` file in the root of the generated project, and add any of the configuration options below 👇 to enable that feature.

The generated project comes with SASS, LESS, and CSS modules support by default, but you can remove them at any time by removing the options from the ```.env``` file.

### Configuration options

**Styling**
- ```REACT_APP_SASS=true``` - enable SASS support
- ```REACT_APP_LESS=true``` - enable LESS support
- ```REACT_APP_CSS_MODULES``` - enable CSS modules

**Webpack**
- ```REACT_APP_WEBPACK_DASHBOARD=true``` - enable webpack-dashboard *(will disable default CRA console output)*
- ```REACT_APP_DECORATORS=true``` - enable decorators support

**Babel**
- ```REACT_APP_BABEL_STAGE_0=true``` - enable stage-0 Babel preset
- ```REACT_APP_DECORATORS=true``` - enable decorators support

> Please note that the Babel features are highly experimental (especially stage-0) and still not a part of the ES specification.
> Use them at your own risk of breaking backwards compatibility if they don't make the final version of the spec.


### How does it work?
The CRA team recently [added support](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-development-environment-variables-in-env) for an ```.env``` file in the root of the generated CRA project.

> To define permanent environment vairables, create a file called .env in the root of your project:
>```REACT_APP_SECRET_CODE=abcdef```

I just added support for extra environment variables that actually add certain plugins, babel plugins, presets, and loaders to the webpack and babel config of ```react-scripts```.

### Future plans

I will put all of my efforts into supporting this fork to be always on par with features with the newest ```create-react-app``` and ```react-scripts``` versions.

-

# Original readme below 👇

# react-scripts

This package includes scripts and configuration used by [Create React App](https://github.com/facebookincubator/create-react-app).
Please refer to its documentation:

* [Getting Started](https://github.com/facebookincubator/create-react-app/blob/master/README.md#getting-started) – How to create a new app.
* [User Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md) – How to develop apps bootstrapped with Create React App.