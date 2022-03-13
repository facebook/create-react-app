// It looks like you might not have defined a start script in your package.json file or your project does not contain a server.js file.

// If there is a server.js file in the root of your package, then npm will default the start command to node server.js.

https://docs.npmjs.com/misc/scripts#default-values

// You could either change the name of your application script to server.js or add the following to your package.json

"scripts": {
    "start": "node your-script.js"
}

Or ... you could just run node your-script.js directly