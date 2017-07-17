const express = require('express')
const app = express()
const request = require('request')

const config = require('./config')
const minimal_application = require('./minimal_application.json')
const full_application = require('./full_application.json')


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


let pepite_id, application_id;


app.set('port', (process.env.PORT || 5000));


app.get('/', function(req, res) {
	let result = 'Hey ! Here are the results you want. <br>';

	// Define the 2 error handlers we will use
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
	
	// Call the establishment resource to search for corresponding pepite
		.then(() => {
			result += '<br> Get PEPITE for CentraleSupélec : ';
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

	// Call to the pepite resource to get name
		.then(() => {
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
			application_id = body._id;
			result += "Success ! My application ID is " + application_id;
		}).catch(unexpected_response)
	
	// Complete the application
		.then(() => {
			result += "<br> Complete the application : ";
			return request_api('application/' + application_id, 'put', full_application);
		}).catch(apicall_error)
		.then((body) => {
			result += "Success ! Application completed. Next step : send it.<br>";
	
	// Send the application
		}).then(() => {
			result += "<br> Send the application to the PEPITE : ";
			return request_api('application/' + application_id + '/send', 'put', null);
		}).catch(apicall_error)
		.then((body) => {
			result += "response received ! Your application status is now : " + body.status + ' .';
		}).catch(unexpected_response)
		.then(() => {
			res.send(result);
		});
});

app.listen(app.get('port'), function () {
	console.log('App listening on port 5000!')
})

