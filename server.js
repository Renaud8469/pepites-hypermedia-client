const express = require('express')
const app = express()

const router = require('./lib/boot/route')

app.set('port', (process.env.PORT || 5000))

router.setRoutes(app)

app.listen(app.get('port'), function () {
  console.log('App listening on port 5000!')
})
