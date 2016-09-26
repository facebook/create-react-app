var express    = require('express');
var server     = express();

server.use(express.static(__dirname));

var port = process.env.PORT || 1337;
server.listen(port, function() {
    console.log('listening on port ' + port);
});