const routes = require('../routes')

exports.setRoutes = function (app) {
  routes.home(app)
  routes.accept(app)
  routes.refuse(app)
  routes.checkStatus(app)
}
