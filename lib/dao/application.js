const client = require('../client/http.client')
const _ = require('lodash')
let actions = require('./actions.json')

function getAction (actionName) {
  return _.find(actions, (o) => {return o.name === actionName})
}

function updateActionUrls (body) {
  for (let rel in body._links) {
    let action = _.find(actions, (o) => {return o['api-transition'] === rel})
    if (action) {
      let link = body._links[rel].href
      action.url = link.substring(link.indexOf('api/'))
    }
  }
}

exports.pingApplication = function () {
  const action = getAction("home")
  return client.requestAPI(action.url, action.method)
    .then((body) => {
      updateActionUrls(body)
    })
}

exports.getPepiteFromSchool = function (schoolName) {
  const action = getAction("search-school")
  return client.requestAPI(action.url, action.method)
    .then((body) => {
      updateActionUrls(body)
      let pepiteId
      for (let school of body._embedded.school) {
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
      updateActionUrls(body)
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
      updateActionUrls(body)
      return body._id
    })
}

exports.updateApplication = function (id, application) {
  const action = getAction("update-application")
  return client.requestAPI(action.url, action.method, application)
    .then((body) => {
      updateActionUrls(body)
      return true
    })
}

exports.sendApplication = function (id) {
  const action = getAction("send-application")
  return client.requestAPI(action.url, action.method)
    .then((body) => {
      updateActionUrls(body)
      return body.status
    })
}

exports.getApplicationStatus = function (id) {
  const action = getAction("get-application-status")
  return client.requestAPI(action.url, action.method)
    .then((body) => {
      updateActionUrls(body)
      return body.status
    })
}

exports.getToken = function (email, pass) {
  const action = getAction("get-token")
  return client.requestAPI(action.url, action.method, { email: email, password: pass })
    .then((body) => {
      updateActionUrls(body)
      return body.token
    })
}

exports.answerApplication = function (id, answer, token) {
  const action = getAction("answer-application")
  return client.requestAPI(action.url + id, action.method, answer, token)
    .then((body) => {
      updateActionUrls(body)
      return body.status
    })
}
