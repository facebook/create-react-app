This is a fork of [create-react-app](https://github.com/facebookincubator/create-react-app) to make creating Deskpro Apps easy.

To start a new app:

```
npx create-react-app --scripts-version=@deskpro/apps-react-scripts my-app
```

That's it! Refer to the README in your new app for more hints about developing apps.

# Developing this repository

The easiest way to develop this repository (i.e. modify scripts etc) is to link them:

```
# Checkout and link this repos
cd /my/dev/home/dir
git clone git@github.com:deskpro/apps-create.git
cd apps-create/
npm link

# Say you have an app already
cd /my/dev/home/dir
npx create-react-app --scripts-version=@deskpro/apps-react-scripts sample-app
cd sample-app
npm link @deskpro/apps-react-scripts
```

Now you can modify apps-create but test them out and use them in sample-app. Remember that _any_ change to npm in sample-app will erase the link. For example, if you add a new dependency with `npm install`, then the link will be reverted. You must re-link again with `npm link @deskpro/apps-react-scripts` to re-create the link whenever you make a change.
