const minimalApplication = require('../data/minimalApplication.json')
const fullApplication = require('../data/fullApplication.json')
const errorHandler = require('../errors/http.error')
const dao = require('../dao/application')

let pepiteEmail, result

const homeActions = function (req, res) {
  result = 'Hey ! Here are the results you want. <br>'

  // Ping the application resource
  result += '<br> Call API root to check if it is working : '
  dao.callHome()
    .then((body) => {
      result += 'Success ! <br>'
      //
      // Call the establishment resource to search for corresponding pepite
      result += '<br> Get PEPITE for CentraleSupélec : '
      return dao.getPepiteFromSchool('CentraleSupélec')
    }).then((pepite) => {
      pepiteEmail = pepite.email
      result += 'Its name is ' + pepite.name + '<br>'
      //
      // Create a minimal application 
      result += '<br> Create a minimal application : '
      return dao.createApplication(minimalApplication)
    }).then((id) => {
      result += 'Success ! My application ID is ' + id
      //
      // Complete the application
      result += '<br> Complete the application : '
      return dao.updateApplication(fullApplication)
    }).then((success) => {
      if (success) {
        result += 'Success ! Application completed. Next step : send it.<br>'
      } else {
        result += 'Oops. Failed.<br>'
        res.send(result)
      }
      //
      // Send the application
      result += '<br> Send the application to the PEPITE : '
      return dao.sendApplication()
    }).then((applicationStatus) => {
      result += 'response received ! Your application status is now : ' + applicationStatus + ' .'
      res.send(result)
    }).catch(errorHandler.logError)
    .then(() => { res.send(result) })
}

const getPepiteEmail = function () {
  return pepiteEmail
}

exports.homeActions = homeActions
exports.getPepiteEmail = getPepiteEmail
