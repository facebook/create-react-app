# Development setup for https://github.com/NLeSC/create-react-app


## TL;DR / long story short

```
TODO <something here>
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
with hardly anything in it. You can do so with the following setup:

First ``npm install`` the package ``sinopia2``:

```
npm installl -g sinopia2
```

Check to see if it works:

```
sinopia
```
Make a note of the name of the YAML config file. Mine is at
``~/.config/sinopia/config.yaml``.

(Ctrl-C to end)

Now edit the config file as follows. Near the bottom of the section marked
``packages`` there is a line:
```
proxy:npmjs
```
which is used for retrieving any packages missing from sinopia's ``npm`` registry.
Such packages are downloaded from the registry at ``https://registry.npmjs.org/``
instead.

However, note that there are two parts to the ``packages`` section. The proxy
line is in the ``'*':`` part. In order for proxying to work for scoped packages
as well as non-scoped packages, we need to add it to the ``'@*/*':`` part.

Add the line and start ``sinopia`` again:
```
sinopia
```

``sinopia`` should tell you where its registry lives. Mine is at
``http://localhost:4873/``. We will now tell ``npm`` to use the local
``sinopia`` registry instead of ``http://registry.npmjs.com``, as follows:
```
npm set registry http://localhost:4873
```

Let's say you now want to make some changes to the ``create-react-app``
generator application. First get the source code of ``create-react-app`` using
nlesc's fork. I'm checking out the source code into ``~/github/nlesc/:
```
cd ~/github/nlesc/
git clone https://github.com/NLeSC/create-react-app.git
```

Any changes you make will likely be in one of ``create-react-app``'s consituent
packages, which are located at ``create-react-app/packages``. Each of its
subdirectories is a separate ``npm`` package. Let's say you want to make changes to
the App template from ``create-react-app/packages/react-scripts/template/src``.

```
cd create-react-app/packages/react-scripts/template/src
<make changes>
```

Now publish your changes to the ``sinopia`` registry as follows. Walk up the
directory tree until you find a ``package.json``. You should find one in ``create-react-app/packages/react-scripts/``. Look up the value for ``name``.
This will be the name the packaged is published under. For me, it's
``@nlesc/react-scripts``. Now publish the package to sinopia:

TODO you may need to have added an npm user to the repo for this next step
to work.
```
npm publish
```

Now when we want to test if the new version of ``@nlesc/react-scripts`` does
what we want it to do, we can ``cd`` to some other place, let's say ``~/tmp``:

```
cd ~/tmp
```
``npm install`` ``@nlesc/react-scripts`` locally, using sinopia's repo:
```
npm install @nlesc/react-scripts
```

You can now inspect the package at ``~/tmp/node_modules/@nlesc/react-scripts/``.

The local install (``npm install`` without the ``-g`` flag) makes it a little
easier to remove the ``node_modules`` directory when additional changes have
been made to the package, and those changes have been
``npm publish``'ed to the sinopia repository.


Now create a new app using the updated generator as follows:
```
cd ~/tmp # or wherever you want the new app to be
create-react-app the-new-app --scripts-version @nlesc/react-scripts
```
This uses the globally installed ``create-react-app``, but with the custom
version of ``react-scripts``, namely @nlesc/react-scripts from sinopia.






