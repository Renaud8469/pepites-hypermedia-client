const express = require('express')
const app = express()

const minimalApplication = require('./lib/data/minimalApplication.json')
const fullApplication = require('./lib/data/fullApplication.json')
const answers = require('./lib/data/answers.json')

const pass = process.env.PEPITE_PASS || ''

let pepiteId, pepiteEmail, applicationId, result, token

const client = require('./lib/client/http.client')

// Define the 2 error handlers we will use
function apiCallError (code, err) {
  result += 'Error during API call : ' + code + ' ' + err + '<br>'
}
function unexpectedResponse (err) {
  result += 'Error with API response processing : ' + err + '<br>'
}

app.set('port', (process.env.PORT || 5000))

app.get('/', function (req, res) {
  result = 'Hey ! Here are the results you want. <br>'

  // Ping the application resource
  result += '<br> Ping application resource : '
  client.requestAPI('application/ping', 'get', null)
    .catch(apiCallError)
    .then((body) => {
      result += body + '<br>'
    }).catch(unexpectedResponse)

  // Call the establishment resource to search for corresponding pepite
    .then(() => {
      result += '<br> Get PEPITE for CentraleSupélec : '
      return client.requestAPI('establishment', 'get')
    }).catch(apiCallError)
    .then((body) => {
      for (let school of body) {
        if (school.name === 'CentraleSupélec') { pepiteId = school.pepite }
      }
      if (!pepiteId) { throw new Error('Establishment not found') }
    }).catch(unexpectedResponse)

  // Call to the pepite resource to get name
    .then(() => {
      return client.requestAPI('pepite/' + pepiteId, 'get')
    }).catch(apiCallError)
    .then((body) => {
      pepiteEmail = body.email
      result += 'Its name is ' + body.name + '<br>'
    }).catch(unexpectedResponse)

  // Create a minimal application 
    .then(() => {
      result += '<br> Create a minimal application : '
      return client.requestAPI('application', 'post', minimalApplication)
    }).catch(apiCallError)
    .then((body) => {
      applicationId = body._id
      result += 'Success ! My application ID is ' + applicationId
    }).catch(unexpectedResponse)

  // Complete the application
    .then(() => {
      result += '<br> Complete the application : '
      return client.requestAPI('application/' + applicationId, 'put', fullApplication)
    }).catch(apiCallError)
    .then((body) => {
      result += 'Success ! Application completed. Next step : send it.<br>'

      // Send the application
    }).then(() => {
      result += '<br> Send the application to the PEPITE : '
      return client.requestAPI('application/' + applicationId + '/send', 'put')
    }).catch(apiCallError)
    .then((body) => {
      result += 'response received ! Your application status is now : ' + body.status + ' .'
    }).catch(unexpectedResponse)
    .then(() => {
      res.send(result)
    })
})

// Group code for application reviewing 
function reviewApplication (verdict) {
  return function (req, res) {
    result = 'The application was '
    if (!applicationId) {
      result += "not defined and thus can't be reviewed. Start with the root url to complete it then come back here."
      res.send(result)
    } else {
      // First request to get the authent token
      client.requestAPI('auth/', 'post', { email: pepiteEmail, password: pass })
        .catch(apiCallError)
        .then((body) => {
          token = body.token
        }).catch(unexpectedResponse)
        .then(() => {
          // Actual request to access 
          return client.requestAPI('committeeAnswer/' + applicationId, 'put',
            verdict === 'accept' ? answers.accepted : answers.rejected,
            token)
        }).catch(apiCallError)
        .then((body) => {
          result += body.status + ' ! '
        }).catch(unexpectedResponse)
        .then(() => {
          res.send(result)
        })
    };
  }
}
app.get('/accept-application', reviewApplication('accept'))
app.get('/refuse-application', reviewApplication('refuse'))

app.get('/application-status', (req, res) => {
  result = 'Your application '
  if (!applicationId) {
    result += ' is not yet defined. Start with the root url to complete it.'
    res.send(result)
  } else {
    result += ' status is : '
    client.requestAPI('application/' + applicationId, 'get')
      .catch(apiCallError)
      .then((body) => {
        result += body.status + '.'
      }).catch(unexpectedResponse)
      .then(() => {
        res.send(result)
      })
  }
})

app.listen(app.get('port'), function () {
  console.log('App listening on port 5000!')
})
