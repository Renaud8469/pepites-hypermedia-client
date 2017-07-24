const application = require('../services/application')

exports.homeRoute = function (app) {
  app.get('/', application.homeActions)
}
