# Development setup

(for https://github.com/NLeSC/create-react-app)


## long story short

```
npm install -g create-react-app
npm install -g verdaccio
verdaccio
npm set registry http://localhost:4873
git clone https://github.com/NLeSC/create-react-app.git
cd create-react-app/packages/react-scripts
<make changes>
npm version <major|minor|patch|...>
npm adduser --registry http://localhost:4873/
npm publish
cd <somewhere else>
create-react-app my-app --scripts-version @nlesc/react-scripts

```



## long story long

A user who just wants to automatically generate an initial setup for a React app
could do so by installing the ``create-react-app`` generator as follows:
```
npm install -g create-react-app
```

Afterwards, you will have a command available that will allow you to run the
line below and create a new React app:
```
create-react-app <your-app-name>
```

This will create a directory ``your-app-name`` that contains a complete setup for
developing the newly created React app, including testing, code coverage generation,
bundling, minification, incremental buidling, linting, etc.

Note that the above uses the ``npm`` registry at ``https://registry.npmjs.org/``.
Now let's say you'd want to make changes to the template used to generate new
apps, for example because you want new apps to be in TypeScript instead of the
default JavaScript. For this, it is useful to run your own, local ``npm`` registry 
using [verdaccio](https://github.com/verdaccio/verdaccio). Verdaccio sits between
you and https://registry.npmjs.com. It lets you publish development versions of 
your npm package to the local, private repo, while still being able to retrieve
any other packages from the 'normal' registry at npmjs. 

Install verdaccio with:

```
npm install -g verdaccio
```

Check to see if it works:

```
verdaccio
```

``verdaccio`` should tell you where its registry lives. Mine is at
``http://localhost:4873/``. We will now tell ``npm`` to use the local
``verdaccio`` registry instead of ``http://registry.npmjs.com``, as follows:
```
npm set registry http://localhost:4873
```
If you want to return to the normal setup at a later point in time, you can do
so with:
```
npm set registry https://registry.npmjs.com
```

Let's say you now want to make some changes to the ``create-react-app``
generator application. First get the source code of ``create-react-app`` using
nlesc's fork. I'm checking out the source code into ``~/github/nlesc/``:
```
cd ~/github/nlesc/
git clone https://github.com/NLeSC/create-react-app.git
```

Any changes you make will likely be in one of ``create-react-app``'s constituent
packages, which are located at ``create-react-app/packages``. Each of its
subdirectories is a separate ``npm`` package. Let's say you want to make changes
to the App template from ``create-react-app/packages/react-scripts/template/src``.

```
cd create-react-app/packages/react-scripts/template/src
<make changes>
```

Before publishing your changes, you need to:

1. increment the semantic versioning of the package
1. add yourself as a user to verdaccio's npm registry server

Let's first check what the current semantic version number is, as follows. Walk
up the directory tree until you find a ``package.json``. You should find one in
``create-react-app/packages/react-scripts/``. Look up the value for ``version``.
Now go back to the terminal and use ``npm version patch`` to increment the patch
part of the semantic version number. The 'patch' part of the
version value in package.json should have been incremented (reload your editor
if necessary).

Now let's add a user to verdaccio, as follows:
```
npm adduser --registry http://localhost:4873/
```
This will ask you to enter a user name, password, and e-mail address, which will
be stored in verdaccio. It doesn't really matter what you enter on any of the
three questions.


Now look up the value for ``name`` in package.json. This will be the name the
package is published under. For me, it's ``@nlesc/react-scripts``.

Verify that verdaccio is the active npm registry with ``npm get registry``, and
that verdaccio is in fact up and running, then publish the package to verdaccio
with:

```
npm publish
```

You can point your browser to http://localhost:4873/ to get an overview of
packages that are present in verdaccio's registry.

Now when we want to test if the new version of ``@nlesc/react-scripts`` does
what we want it to do, we can ``cd`` to some other place, let's say ``~/tmp``:

```
cd ~/tmp
```
``npm install`` ``@nlesc/react-scripts`` locally (still using verdaccio's repo):
```
npm install @nlesc/react-scripts
```

You can now inspect the package at ``~/tmp/node_modules/@nlesc/react-scripts/``.

The local install (``npm install`` without the ``-g`` flag) makes it a little
easier to remove the ``node_modules`` directory when additional changes have
been made to the package, and those changes have been ``npm publish``'ed to the
verdaccio registry.


Now create a new app using the updated generator as follows:
```
cd ~/tmp # or wherever you want the new app to be
create-react-app the-new-app --scripts-version @nlesc/react-scripts
```
This uses the globally installed ``create-react-app``, but with the custom
version of ``react-scripts``, namely ``@nlesc/react-scripts`` from verdaccio.






