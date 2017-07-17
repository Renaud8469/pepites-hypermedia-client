const express = require('express')
const app = express()
const request = require('request')

const config = require('./config')
const minimal_application = require('./minimal_application.json')
const full_application = require('./full_application.json')

app.set('port', (process.env.PORT || 5000));

function request_api(route, method, req_body) {
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



app.get('/', function(req, res) {
	let result = 'Hey ! Here are the results you want. <br>';
	let pepite_id;
	function apicall_error(code, err) {
		result += 'Error during API call : ' + code + ' ' + err + '<br>';
	};
	function unexpected_response(err) {
		result += 'Error with API response processing : ' + err + '<br>';
	};

	// Ping the application resource
	result += '<br> Ping application resource : '; 
	request_api('application/ping', 'get', null)
		.catch(apicall_error)
		.then((body) => {
			result += body + '<br>';
		}).catch(unexpected_response)
		.then(() => {
			result += '<br> Get PEPITE for CentraleSupélec : ';

	// Call the establishment resource to search for corresponding pepite
			return request_api('establishment','get', null)
		}).catch(apicall_error)
		.then((body) => {
			for (let school of body) {
				if (school.name === "CentraleSupélec")
					pepite_id = school.pepite
			}
			if (!pepite_id)
				throw new Error('Establishment not found');
		}).catch(unexpected_response)
		.then(() => {
		
	// Call to the pepite resource to get name
			return request_api('pepite/' + pepite_id, 'get', null)

		}).catch(apicall_error)
		.then((body) => {
			result += "Its name is " + body.name + '<br>';
		}).catch(unexpected_response)
	
	// Create a minimal application 
		.then(() => {
			result += "<br> Create a minimal application : ";
			return request_api('application', 'post', minimal_application);
		}).catch(apicall_error)
		.then((body) => {
			result += "Success ! My application ID is " + body._id;
		}).catch(unexpected_response)
		.then(() => {
			res.send(result);
		});
});

app.listen(app.get('port'), function () {
	console.log('App listening on port 5000!')
})

