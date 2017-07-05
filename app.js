const express = require('express')
const app = express()

app.set('port', (process.env.PORT || 5000));

app.get('/', function (req, res) {
	res.send('Hello World! This is just the beginning.')
})

app.listen(app.get('port'), function () {
	console.log('Example app listening on port 3000!')
})

