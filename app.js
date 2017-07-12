const express = require('express')
const app = express()
const request = require('request')

const config = require('./config')

app.set('port', (process.env.PORT || 5000));

app.get('/', function (req, res) {
	let application_ping, result = 'Hello World! <br> The API ';

	request(config.api.url + 'api/application/ping', function(error, response, body) {
		if (!error && response.statusCode == 200) {
			application_ping = body;
			result += 'responded well : ' + application_ping;
		} else { 
			result += 'did not respond well.';
		}
		res.send(result);
	});
})

app.listen(app.get('port'), function () {
	console.log('Example app listening on port 5000!')
})

