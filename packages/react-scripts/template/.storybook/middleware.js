require('dotenv')
const setupProxy = require('@fs/react-scripts/proxy/setupProxy')

module.exports = router => {
  setupProxy(router)

  router.get('/dev-env', (req, res) => {
    res.status(200).send({ environment: process.env.REMOTE_ENV || 'beta' })
  })
}
