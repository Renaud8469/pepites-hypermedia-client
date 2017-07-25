const minimalApplication = require('../data/minimalApplication.json')
const fullApplication = require('../data/fullApplication.json')
const errorHandler = require('../errors/http.error')
const dao = require('../dao/application')

let pepiteId, pepiteEmail, applicationId, result

const homeActions = function (req, res) {
  result = 'Hey ! Here are the results you want. <br>'

  // Ping the application resource
  result += '<br> Ping application resource : '
  dao.pingApplication()
    .then((body) => {
      result += body + '<br>'
      //
      // Call the establishment resource to search for corresponding pepite
      result += '<br> Get PEPITE for CentraleSupélec : '
      return dao.getPepiteFromSchool('CentraleSupélec')
    }).then((pepite) => {
      pepiteId = pepite
      //
      // Call to the pepite resource to get name
      return dao.getPepiteFromId(pepiteId)
    }).then((pepite) => {
      pepiteEmail = pepite.email
      result += 'Its name is ' + pepite.name + '<br>'
      //
      // Create a minimal application 
      result += '<br> Create a minimal application : '
      return dao.createApplication(minimalApplication)
    }).then((id) => {
      applicationId = id
      result += 'Success ! My application ID is ' + applicationId
      //
      // Complete the application
      result += '<br> Complete the application : '
      return dao.updateApplication(applicationId, fullApplication)
    }).then((success) => {
      if (success) {
        result += 'Success ! Application completed. Next step : send it.<br>'
      } else {
        result += 'Oops. Failed.<br>'
      }
      //
      // Send the application
      result += '<br> Send the application to the PEPITE : '
      return dao.sendApplication(applicationId)
    }).then((applicationStatus) => {
      result += 'response received ! Your application status is now : ' + applicationStatus + ' .'
      res.send(result)
    }).catch(errorHandler.logError)
}

const getPepiteEmail = function () {
  return pepiteEmail
}

const getApplicationId = function () {
  return applicationId
}

exports.homeActions = homeActions
exports.getApplicationId = getApplicationId
exports.getPepiteEmail = getPepiteEmail
