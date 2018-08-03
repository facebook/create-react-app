module.exports = function() {
  return function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, PUT, DELETE, CONNECT, OPTIONS, TRACE'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Agent-Request, X-Requested-With'
    );
    next();
  };
};
