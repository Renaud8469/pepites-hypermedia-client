const answers = require('../data/answers.json')
const errorHandler = require('../errors/http.error')
const dao = require('../dao/application')

const main = require('./main')

const pass = process.env.PEPITE_PASS || ''
let result, token

const reviewApplication = function (verdict) {
  return function (req, res) {
    let applicationId = main.getApplicationId()
    result = 'The application was '
    if (!applicationId) {
      result += "not defined and thus can't be reviewed. Start with the root url to complete it then come back here."
      res.send(result)
    } else {
      // First request to get the authent token
      dao.getToken(main.getPepiteEmail(), pass)
        .then((authToken) => {
          token = authToken
          // Actual request to access 
          return dao.answerApplication(applicationId,
            verdict === 'accept' ? answers.accepted : answers.rejected,
            token)
        }).then((applicationStatus) => {
          result += applicationStatus + ' ! '
          res.send(result)
        }).catch(errorHandler.logError)
    };
  }
}

const acceptApplication = reviewApplication('accept')
const refuseApplication = reviewApplication('refuse')

const applicationStatus = function (req, res) {
  let applicationId = main.getApplicationId()
  result = 'Your application '
  if (!applicationId) {
    result += ' is not yet defined. Start with the root url to complete it.'
    res.send(result)
  } else {
    result += ' status is : '
    dao.getApplicationStatus(applicationId)
      .then((applicationStatus) => {
        result += applicationStatus + '.'
        res.send(result)
      }).catch(errorHandler.logError)
  }
}

exports.acceptApplication = acceptApplication
exports.refuseApplication = refuseApplication
exports.applicationStatus = applicationStatus
