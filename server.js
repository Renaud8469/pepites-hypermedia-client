const express = require('express')
const app = express()

const boot = require('./lib/boot')

boot.setPort(app)

boot.setRoutes(app)

boot.startListening(app)
