const minimalApplication = require('../data/minimalApplication.json')
const fullApplication = require('../data/fullApplication.json')
const answers = require('../data/answers.json')
const client = require('../client/http.client')
const errorHandler = require('../errors/http.error')
const dao = require('../dao/application')

const pass = process.env.PEPITE_PASS || ''
let pepiteId, pepiteEmail, applicationId, result, token

const homeActions = function (req, res) {
  result = 'Hey ! Here are the results you want. <br>'

  // Ping the application resource
  result += '<br> Ping application resource : '
  client.requestAPI('application/ping', 'get', null)

    .then((body) => {
      result += body + '<br>'
    }).then(() => {
      //
      // Call the establishment resource to search for corresponding pepite
      result += '<br> Get PEPITE for CentraleSupélec : '
      return client.requestAPI('establishment', 'get')
    }).then((body) => {
      pepiteId = dao.getPepiteFromSchool(body, 'CentraleSupélec') 
      if (!pepiteId) { throw new Error('Establishment not found') }
    }).then(() => {
      //
      // Call to the pepite resource to get name
      return client.requestAPI('pepite/' + pepiteId, 'get')
    }).then((body) => {
      pepiteEmail = dao.getPepiteEmail(body)
      result += 'Its name is ' + dao.getPepiteName(body) + '<br>'
    }).then(() => {
      //
      // Create a minimal application 
      result += '<br> Create a minimal application : '
      return client.requestAPI('application', 'post', minimalApplication)
    }).then((body) => {
      applicationId = dao.getApplicationId(body)
      result += 'Success ! My application ID is ' + applicationId
    }).then(() => {
      //
      // Complete the application
      result += '<br> Complete the application : '
      return client.requestAPI('application/' + applicationId, 'put', fullApplication)
    }).then((body) => {
      result += 'Success ! Application completed. Next step : send it.<br>'
      //
      // Send the application
    }).then(() => {
      result += '<br> Send the application to the PEPITE : '
      return client.requestAPI('application/' + applicationId + '/send', 'put')
    }).then((body) => {
      result += 'response received ! Your application status is now : ' + dao.getApplicationStatus(body) + ' .'
    }).then(() => {
      res.send(result)
    }).catch(errorHandler.logError)
}

const reviewApplication = function (verdict) {
  return function (req, res) {
    result = 'The application was '
    if (!applicationId) {
      result += "not defined and thus can't be reviewed. Start with the root url to complete it then come back here."
      res.send(result)
    } else {
      // First request to get the authent token
      client.requestAPI('auth/', 'post', { email: pepiteEmail, password: pass })
        .then((body) => {
          token = dao.getToken(body)
        }).then(() => {
          // Actual request to access 
          return client.requestAPI('committeeAnswer/' + applicationId, 'put',
            verdict === 'accept' ? answers.accepted : answers.rejected,
            token)
        }).then((body) => {
          result += dao.getApplicationStatus(body) + ' ! '
        }).then(() => {
          res.send(result)
        }).catch(errorHandler.logError)
    };
  }
}

const acceptApplication = reviewApplication('accept')
const refuseApplication = reviewApplication('refuse')

const applicationStatus = function (req, res) {
  result = 'Your application '
  if (!applicationId) {
    result += ' is not yet defined. Start with the root url to complete it.'
    res.send(result)
  } else {
    result += ' status is : '
    client.requestAPI('application/' + applicationId, 'get')

      .then((body) => {
        result += dao.getApplicationStatus(body) + '.'
      })
      .then(() => {
        res.send(result)
      }).catch(errorHandler.logError)
  }
}

exports.homeActions = homeActions
exports.acceptApplication = acceptApplication
exports.refuseApplication = refuseApplication
exports.applicationStatus = applicationStatus
