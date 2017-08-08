const client = require('../client/http.client')
const _ = require('lodash')
let actions = require('./actions.json')

function getAction (actionName) {
  return _.find(actions, (o) => { return o.name === actionName })
}

function updateActionUrls (body) {
  for (let rel in body._links) {
    let action = _.find(actions, (o) => { return o['api-transition'] === rel })
    if (action) {
      let link = body._links[rel].href
      action.url = link.substring(link.indexOf('api/'))
    }
  }
}

exports.callHome = function () {
  const action = getAction('home')
  return client.requestAPI(action.url, action.method)
    .then((body) => {
      updateActionUrls(body)
    })
}

exports.getPepiteFromSchool = function (schoolName) {
  const searchSchool = getAction('search-school')
  let getSchool = getAction('get-school')
  return client.requestAPI(searchSchool.url, searchSchool.method)
    .then((body) => {
      updateActionUrls(body)
      for (let school of body._embedded.school) {
        if (school.name === schoolName) {
          let link = school._links.self.href
          getSchool.url = link.substring(link.indexOf('api/'))
        }
      }
      return client.requestAPI(getSchool.url, getSchool.method)
    }).then((body) => {
      updateActionUrls(body)
      let getPepite = getAction('get-pepite')
      return client.requestAPI(getPepite.url, getPepite.method)
    }).then((body) => {
      updateActionUrls(body)
      return {
        email: body.email,
        name: body.name
      }
    })
}

exports.createApplication = function (application) {
  const action = getAction('create-application')
  return client.requestAPI(action.url, action.method, application)
    .then((body) => {
      updateActionUrls(body)
      return body._id
    })
}

exports.updateApplication = function (application) {
  const action = getAction('update-application')
  return client.requestAPI(action.url, action.method, application)
    .then((body) => {
      updateActionUrls(body)
      return true
    })
}

exports.sendApplication = function () {
  const action = getAction('send-application')
  return client.requestAPI(action.url, action.method)
    .then((body) => {
      updateActionUrls(body)
      return body.status
    })
}

exports.getApplicationStatus = function (token) {
  const action = getAction('get-application')
  return client.requestAPI(action.url, action.method, undefined, token)
    .then((body) => {
      updateActionUrls(body)
      return body.status
    })
}

exports.answerApplication = function (email, pass, answer) {
  const getToken = getAction('get-token')
  let token
  return client.requestAPI(getToken.url, getToken.method, { email: email, password: pass })
    .then((body) => {
      updateActionUrls(body)
      token = body.token
      let getApplication = getAction('get-application')
      return client.requestAPI(getApplication.url, getApplication.method, undefined, token)
    }).then((body) => {
      updateActionUrls(body)
      const answerApplication = getAction('answer-application')
      return client.requestAPI(answerApplication.url, answerApplication.method, answer, token)
    }).then((body) => {
      updateActionUrls(body)
      return body.status
    })
}
