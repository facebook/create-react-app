var express = require("express");
var path = require("path");
var app = express();

// React App
app.use(express.static(__dirname + "/build"));

const port = process.env.PORT || 3000;
app.listen(port);
console.log("Listening on port " + port)
