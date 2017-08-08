const client = require('../client/http.client')
const _ = require('lodash')
let actions = require('./actions.json')

function getAction (actionName) {
  return _.find(actions, (o) => { return o.name === actionName })
}

function updateActionUrls (body) {
  for (let possibleTransition of body.actions) {
    let action = _.find(actions, (o) => { return o['api-transition'] === possibleTransition.name })
    if (action) {
      let link = possibleTransition.href
      action.url = link.substring(link.indexOf('api/'))
      action.method = possibleTransition.method
    }
  }
  // Exclude collection cases
  if (body.properties) {
    for (let possibleTransition of body.entities) {
      let action = _.find(actions, (o) => { return possibleTransition.rel.indexOf(o['api-transition']) > -1 })
      if (action) {
        let link = _.find(possibleTransition.links, (o) => { return o.rel.indexOf('self') > -1 })
        action.url = link.href.substring(link.href.indexOf('api/'))
        action.method = 'get'
      }
    }
  }
}

exports.callHome = function () {
  const action = getAction('home')
  return client.requestAPI(action)
    .then((body) => {
      updateActionUrls(body)
    })
}

exports.getPepiteFromSchool = function (schoolName) {
  const searchSchool = getAction('search-school')
  let getSchool = getAction('get-school')
  return client.requestAPI(searchSchool)
    .then((body) => {
      updateActionUrls(body)
      for (let school of body.entities) {
        if (school.properties.name === schoolName) {
          let link = _.find(school.links, (o) => { return o.rel.indexOf('self') > -1 })
          getSchool.url = link.href.substring(link.href.indexOf('api/'))
        }
      }
      return client.requestAPI(getSchool)
    }).then((body) => {
      updateActionUrls(body)
      let getPepite = getAction('get-pepite')
      return client.requestAPI(getPepite)
    }).then((body) => {
      updateActionUrls(body)
      return {
        email: body.properties.email,
        name: body.properties.name
      }
    })
}

exports.createApplication = function (application) {
  const action = getAction('create-application')
  return client.requestAPI(action, application)
    .then((body) => {
      updateActionUrls(body)
      return body.properties._id
    })
}

exports.updateApplication = function (application) {
  const action = getAction('update-application')
  return client.requestAPI(action, application)
    .then((body) => {
      updateActionUrls(body)
      return true
    })
}

exports.sendApplication = function () {
  const action = getAction('send-application')
  return client.requestAPI(action)
    .then((body) => {
      updateActionUrls(body)
      return body.properties.status
    })
}

exports.getApplicationStatus = function (token) {
  const action = getAction('get-application')
  return client.requestAPI(action, undefined, token)
    .then((body) => {
      updateActionUrls(body)
      return body.properties.status
    })
}

exports.answerApplication = function (email, pass, answer) {
  const getToken = getAction('get-token')
  let token
  return client.requestAPI(getToken, { email: email, password: pass })
    .then((body) => {
      updateActionUrls(body)
      token = body.properties.token
      let getApplication = getAction('get-application')
      return client.requestAPI(getApplication, undefined, token)
    }).then((body) => {
      updateActionUrls(body)
      const answerApplication = getAction('answer-application')
      return client.requestAPI(answerApplication, answer, token)
    }).then((body) => {
      updateActionUrls(body)
      return body.properties.status
    })
}
