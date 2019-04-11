const setProxies = require('@fs/react-scripts/proxy/setupProxy')
const app = require('./server')()

if (app.get('env') === 'development') {
  app.stack.front(() => {
    setProxies(app)
  })
}

module.exports = app
