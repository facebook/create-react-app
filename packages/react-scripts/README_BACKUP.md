# ☢ custom-react-scripts ☢
Latest version of original react-scripts: **0.8.4**

### ⚠️ Disclaimer:
> This is **not** a fork of ```create-react-app```. It's just a fork of ```react-scripts``` with simple babel/webpack modifications that can toggle extra features.

The reason for this fork's existence is explained better in [this Medium article](https://medium.com/@kitze/configure-create-react-app-without-ejecting-d8450e96196a).

### 💡Features:
* Decorators
* babel-preset-stage-0
* LESS
* SASS
* CSS modules

**the features are optional and can be turned on/off individually*

### ❔How to use it
```create-react-app my-app --scripts-version custom-react-scripts```

Modify the ```.env``` file in the root of the generated project, and add any of the configuration options below 👇 to enable that feature.

The generated project comes with SASS, LESS, and CSS modules support by default, but you can remove them at any time by removing the options from the ```.env``` file.

### 📝 Configuration options

#### Styling
- ```REACT_APP_SASS=true``` - enable SASS support
- ```REACT_APP_LESS=true``` - enable LESS support
- ```REACT_APP_STYLUS=true``` - enable Stylus support
- ```REACT_APP_CSS_MODULES``` - enable CSS modules

#### Babel
- ```REACT_APP_BABEL_STAGE_0=true``` - enable stage-0 Babel preset
- ```REACT_APP_DECORATORS=true``` - enable decorators support

> ⚠️ Please note that the Babel features are highly experimental (especially stage-0) and still not a part of the ES specification.
> Use them at your own risk of breaking backwards compatibility if they don't make the final version of the spec.

#### Others
- ```PORT=3015``` - change default port (supported in CRA by default)
- ```OPEN_BROWSER=false``` - don't open browser after running webpack server

### 🤔 Why?
The ```create-react-app``` app doesn't allow user configuration and modifications for few reasons:

* Some of the babel presets and plugins that people might use are experimental.  If they're used in a project and then they don't make it in the ES spec, they will break backwards compatibility.
* It's hard to maintain code for all of these custom configurations that people want to use.

But people still want to use some of these features, and they're either ejecting their CRA app, or just don't use ```create-react-app``` because they're *just* missing **X** feature.

So instead of [searching npm](https://www.npmjs.com/search?q=react-scripts) for a ```react-scripts``` fork with the **X** feature you need, this fork provides support for all of these extra features with simply adding a line in the ```.env``` config.

### How does it work?
The CRA team recently [added support](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-development-environment-variables-in-env) for an ```.env``` file in the root of the generated CRA project.

From the original readme:
> To define permanent environment vairables, create a file called .env in the root of your project:
> REACT_APP_SECRET_CODE=abcdef

I just added support for extra environment variables that actually turn on certain plugins, babel plugins, presets, and loaders in the webpack and babel configs of ```react-scripts```.

### Future plans

I will put all of my efforts into supporting this fork to be always on par with features with the newest ```create-react-app``` and ```react-scripts``` versions.
