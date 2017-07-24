const main = require('../services/main')

exports.homeRoute = function (app) {
  app.get('/', main.homeActions)
}
