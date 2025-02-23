// Create a .env file at your project root and specify port number there PORT=3005 then in package json start script use like this "start": "react-scripts start" Sample package json file below

{
    "name": "r",
    "version": "0.1.0",
    "private": true,
    "devDependencies": {
      "react-scripts": "0.8.4"
    },
    "dependencies": {
      "react": "^15.4.2",
      "react-dom": "^15.4.2"
    },
    "scripts": {
      "start": "react-scripts start",
      "build": "react-scripts build",
      "test": "react-scripts test --env=jsdom",
      "eject": "react-scripts eject"
    }
  }
  