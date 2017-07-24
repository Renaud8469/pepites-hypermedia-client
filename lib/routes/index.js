const main = require('./main')
const application = require('./application')

const all = {}

all.home = main.homeRoute
all.accept = application.acceptRoute
all.refuse = application.refuseRoute
all.checkStatus = application.statusRoute

module.exports = all
