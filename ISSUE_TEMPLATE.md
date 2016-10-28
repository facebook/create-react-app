If you are reporting a bug, please fill in below. Otherwise feel free to remove this template entirely.

### Can you reproduce the problem with latest npm?

Many errors, especially related to "missing modules", are due to npm bugs.

If you're using Windows, [follow these instructions to update npm](https://github.com/npm/npm/wiki/Troubleshooting#upgrading-on-windows).

If you're using OS X or Linux, run this to update npm:

```
npm install -g npm@latest

cd your_project_directory
rm -rf node_modules
npm install
```

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
