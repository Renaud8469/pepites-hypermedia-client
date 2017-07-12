const express = require('express')
const app = express()
const request = require('request')

const config = require('./config')
const minimal_application = require('./minimal_application.json')

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

		// Creating an application and saving the ID
		result += 'POSTing to "application/" to create an application : ';
		request({
			url: config.api.url + 'api/application', 
			body: minimal_application,
			method: 'post', 
			json: true
		}, function(error, response, body) {
			if (!error && response.statusCode == 201)
				result += 'Success ! My application can be found with id : ' + body._id;
			else 
				result += 'Failure... ' + error;
			result += '<br>';
			res.send(result);
		});

	});
})

app.listen(app.get('port'), function () {
	console.log('Example app listening on port 5000!')
})

