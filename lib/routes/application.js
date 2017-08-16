const application = require('../services/application')

const acceptRoute = function (app) {
  app.get('/accept-application/:id', application.acceptApplication)
}

const refuseRoute = function (app) {
  app.get('/refuse-application/:id', application.refuseApplication)
}

const statusRoute = function (app) {
  app.get('/application-status/:id', application.applicationStatus)
}

exports.acceptRoute = acceptRoute
exports.refuseRoute = refuseRoute
exports.statusRoute = statusRoute
