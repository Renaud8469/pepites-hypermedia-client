const client = require('../client/http.client')
const actions = require('./actions.json')
const _ = require('lodash')

function getAction (actionName) {
  return _.find(actions, (o) => {return o.name === actionName})
}

exports.pingApplication = function () {
  return client.requestAPI('api/application/ping', 'get')
}

exports.getPepiteFromSchool = function (schoolName) {
  const action = getAction("search-school")
  return client.requestAPI(action.url, action.method)
    .then((body) => {
      let pepiteId
      for (let school of body) {
        if (school.name === schoolName) {
          pepiteId = school.pepite
        }
      }
      if (!pepiteId) {
        throw new Error('Establishment not found')
      } else {
        return pepiteId
      }
    })
}

exports.getPepiteFromId = function (id) {
  const action = getAction("get-pepite")
  return client.requestAPI(action.url + id, action.method)
    .then((body) => {
      return {
        email: body.email,
        name: body.name
      }
    })
}

exports.createApplication = function (application) {
  const action = getAction("create-application")
  return client.requestAPI(action.url, action.method, application)
    .then((body) => {
      return body._id
    })
}

exports.updateApplication = function (id, application) {
  const action = getAction("update-application")
  return client.requestAPI(action.url + id, action.method, application)
    .then((body) => {
      return true
    })
}

exports.sendApplication = function (id) {
  const action = getAction("send-application")
  return client.requestAPI('api/application/' + id + '/send', action.method)
    .then((body) => {
      return body.status
    })
}

exports.getApplicationStatus = function (id) {
  const action = getAction("get-application-status")
  return client.requestAPI(action.url + id, action.method)
    .then((body) => {
      return body.status
    })
}

exports.getToken = function (email, pass) {
  const action = getAction("get-token")
  return client.requestAPI(action.url, action.method, { email: email, password: pass })
    .then((body) => {
      return body.token
    })
}

exports.answerApplication = function (id, answer, token) {
  const action = getAction("answer-application")
  return client.requestAPI(action.url + id, action.method, answer, token)
    .then((body) => {
      return body.status
    })
}
