const express = require('express')
const app = express()
const request = require('request')

const config = require('./config')

app.set('port', (process.env.PORT || 5000));

app.get('/', function (req, res) {
	let result = 'Hello World! <br> Here are the API call results : <br>';
	
	// Ping the application resource to check the connection to the API
	request(config.api.url + 'api/application/ping', function(error, response, body) {
		result += 'application/ping : ';
		if (!error && response.statusCode == 200)
			result += body;
		else 
			result += response.statusCode + ' ' + error;
		result += '<br>';
		res.send(result);
	});
})

app.listen(app.get('port'), function () {
	console.log('Example app listening on port 5000!')
})

