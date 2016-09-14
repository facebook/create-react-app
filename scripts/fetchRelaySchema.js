var fetch = require('node-fetch');
var fs = require('fs');
var graphQlutilities = require('graphql/utilities');

var buildClientSchema = graphQlutilities.buildClientSchema;
var introspectionQuery = graphQlutilities.introspectionQuery;
var printSchema = graphQlutilities.printSchema;

var path = require('path');
var paths = require('../config/paths')
var SERVER = process.env.GRAPHQL_URL;
console.log(SERVER)
// Save JSON of full schema introspection for Babel Relay Plugin to use
fetch(`${SERVER}`, {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({'query': introspectionQuery}),
})
.then(res => res.json()).then(schemaJSON => {
    console.log(`${paths.appSrc}/schema.json`)
    fs.writeFileSync(
    `${paths.appSrc}/schema.json`,
    JSON.stringify(schemaJSON, null, 2)
    );

  // Save user readable type system shorthand of schema
  var graphQLSchema = buildClientSchema(schemaJSON.data);
  fs.writeFileSync(
    `${paths.appSrc}/schema.graphql`,
    printSchema(graphQLSchema)
    );
})
.catch((err)=>{
    console.log(err)
    console.log(err.stack)
})
