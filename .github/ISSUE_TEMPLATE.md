If you are reporting a bug, please fill in below. Otherwise feel free to remove this template entirely.

### Can you reproduce the problem with npm 4.x?

Many errors, especially related to "missing modules", are due to npm bugs.

Try to update npm to 4.x first:

```
npm install -g npm@4

cd your_project_directory
rm -rf node_modules
npm install
```

**This is especially important if `npm -v` gives you 5 because npm 5 is [known to have many issues](https://github.com/npm/npm/issues/16991).**

Then try to reproduce the issue again.

Can you still reproduce it?

### Description

What are you reporting?

### Expected behavior

Tell us what you think should happen.

### Actual behavior

Tell us what actually happens.

### Environment

Run these commands in the project folder and fill in their results:

1. `npm ls react-scripts` (if you haven’t ejected): 
2. `node -v`: 
3. `npm -v`:

Then, specify:

1. Operating system:
2. Browser and version:

### Reproducible Demo

Please take the time to create a new app that reproduces the issue.

Alternatively, you could copy your app that experiences the problem and start removing things until you’re left with the minimal reproducible demo.

(Accidentally, you might get to the root of your problem during that process.)

Push to GitHub and paste the link here.

By doing this, you're helping the Create React App contributors a big time!
Demonstrable issues gets fixed faster.
