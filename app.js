const express = require('express')
const app = express()
const request = require('request')

const config = require('./config')
const minimal_application = require('./minimal_application.json')
const full_application = require('./full_application.json')

app.set('port', (process.env.PORT || 5000));

function request_api(route, method, req_body, result) {
	const req_config = {
		url: config.api.url + 'api/' + route,
		method: method,
		json: true
	};
	if (req_body)
		req_config.body = req_body;
	return new Promise(function(resolve, reject){
		request(req_config, function(error, response, body) {
			if (!error && response.statusCode < 400)
				resolve(body)
			else
				reject(response.statusCode, error)
		})
	});
}

app.get('/promises', function(req, res) {
	let result = 'Hey ! Here are the results you want. <br>';
	// Ping the application resource
	request_api('application/ping', 'get', null, result)
		.catch((statuscode, error) => {
			result += 'Error during API call : ' + statuscode + ' ' + error + '<br>';
		}).then((body) => {
			result += 'Ping application resource : ' + body + '<br>';
		}).catch((error) => {
			result += 'Error with API response processing : ' + error + '<br>';
		}).then(() => {
			res.send(result);
		});
});

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

		// Get PEPITE for the establishment
		result += 'Search for the PEPITE for CentraleSupélec : ';
		request(config.api.url + 'api/establishment', function(error, response, body) {
			if (!error && response.statusCode == 200) {
				let pepite_id;
				for (let establishment of JSON.parse(body)) {
					if (establishment.name === "CentraleSupélec")
						pepite_id = establishment.pepite
				}
				// get pepite name
				request(config.api.url + 'api/pepite/' + pepite_id, function(error, response, body) {
					if (!error && response.statusCode == 200)
						result += 'Found ! It is called ' + JSON.parse(body).name;
					else {
						result += response.statusCode + ' ' + error;
					}
					res.send(result);
				});	

			} else {
				result += response.statusCode + ' ' + error;
				res.send(result);
			}
			result += '<br>';
		});

		/*
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
		*/

	});
})

app.listen(app.get('port'), function () {
	console.log('Example app listening on port 5000!')
})

