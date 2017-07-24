const setup = require('./setup')
const router = require('./route')

module.exports = {
  setPort: setup.setPort,
  setRoutes: router.setRoutes,
  startListening: setup.startListening
}
