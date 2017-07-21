const express = require('express')
const app = express()

const config = require('./boot/setup')
const minimal_application = require('./data/minimal_application.json')
const full_application = require('./data/full_application.json')
const answers = require('./data/answers.json')

const pass = process.env.PEPITE_PASS || ''; 

let pepite_id, pepite_email, application_id, result, token;

const client = require('./client/http.client')

// Define the 2 error handlers we will use
function apicall_error(code, err) {
	result += 'Error during API call : ' + code + ' ' + err + '<br>';
}
function unexpected_response(err) {
	result += 'Error with API response processing : ' + err + '<br>';
}

app.set('port', (process.env.PORT || 5000));


app.get('/', function(req, res) {
	result = 'Hey ! Here are the results you want. <br>';

	// Ping the application resource
	result += '<br> Ping application resource : '; 
	client.request_api('application/ping', 'get', null)
		.catch(apicall_error)
		.then((body) => {
			result += body + '<br>';
		}).catch(unexpected_response)
	
	// Call the establishment resource to search for corresponding pepite
		.then(() => {
			result += '<br> Get PEPITE for CentraleSupélec : ';
			return client.request_api('establishment','get')
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
			return client.request_api('pepite/' + pepite_id, 'get')
		}).catch(apicall_error)
		.then((body) => {
			pepite_email = body.email;
			result += "Its name is " + body.name + '<br>';
		}).catch(unexpected_response)
	
	// Create a minimal application 
		.then(() => {
			result += "<br> Create a minimal application : ";
			return client.request_api('application', 'post', minimal_application);
		}).catch(apicall_error)
		.then((body) => {
			application_id = body._id;
			result += "Success ! My application ID is " + application_id;
		}).catch(unexpected_response)
	
	// Complete the application
		.then(() => {
			result += "<br> Complete the application : ";
			return client.request_api('application/' + application_id, 'put', full_application);
		}).catch(apicall_error)
		.then((body) => {
			result += "Success ! Application completed. Next step : send it.<br>";
	
	// Send the application
		}).then(() => {
			result += "<br> Send the application to the PEPITE : ";
			return client.request_api('application/' + application_id + '/send', 'put');
		}).catch(apicall_error)
		.then((body) => {
			result += "response received ! Your application status is now : " + body.status + ' .';
		}).catch(unexpected_response)
		.then(() => {
			res.send(result);
		});
});


// Group code for application reviewing 
function review_application(verdict) {
	return function(req, res) {
		result = 'The application was ';
		if (!application_id) {
			result += "not defined and thus can't be reviewed. Start with the root url to complete it then come back here.";
			res.send(result);
		} else {
			// First request to get the authent token
			client.request_api('auth/', 'post', { email: pepite_email, password : pass })
				.catch(apicall_error)
				.then((body) => {
					token = body.token;
				}).catch(unexpected_response)
				.then(() => {
					// Actual request to access 
					return client.request_api('committeeAnswer/' + application_id, 'put', 
							verdict === 'accept' ? answers.accepted : answers.rejected,
							token);
				}).catch(apicall_error)
				.then((body) => {
					result += body.status + ' ! '
				}).catch(unexpected_response)
				.then(() => {
					res.send(result)
				});
		};
	}
}
app.get('/accept-application', review_application('accept'));
app.get('/refuse-application', review_application('refuse'));



app.get('/application-status', (req, res) => {
	result = "Your application ";
	if (!application_id) {
		result += " is not yet defined. Start with the root url to complete it.";
		res.send(result);
	} else {
		result += " status is : ";
		client.request_api('application/' + application_id, 'get')
			.catch(apicall_error)
			.then((body) => {
				result += body.status + '.';
			}).catch(unexpected_response)
			.then(() => {
				res.send(result)
			});
	}
});

app.listen(app.get('port'), function () {
	console.log('App listening on port 5000!')
})

