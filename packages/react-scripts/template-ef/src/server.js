const path = require('path');
const express = require('express');
const app = express();

// Statically serve up the production built React App
app.use(express.static(`${__dirname}/build`));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
