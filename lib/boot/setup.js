function setPort (app) {
  app.set('port', (process.env.PORT || 5000))
}

function startListening (app) {
  app.listen(app.get('port'), function () {
    console.log('App listening on port ' + app.get('port') + ' !')
  })
}

exports.setPort = setPort
exports.startListening = startListening
