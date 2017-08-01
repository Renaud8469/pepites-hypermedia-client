const client = require('../client/http.client')

exports.pingApplication = function () {
  return client.requestAPI('application/ping', 'get')
}

exports.getPepiteFromSchool = function (schoolName) {
  return client.requestAPI('establishment', 'get')
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
  return client.requestAPI('pepite/' + id, 'get')
    .then((body) => {
      return {
        email: body.email,
        name: body.name
      }
    })
}

exports.createApplication = function (application) {
  return client.requestAPI('application', 'post', application)
    .then((body) => {
      return body._id
    })
}

exports.updateApplication = function (id, application) {
  return client.requestAPI('application/' + id, 'put', application)
    .then((body) => {
      return true
    })
}

exports.sendApplication = function (id) {
  return client.requestAPI('application/' + id + '/send', 'put')
    .then((body) => {
      return body.status
    })
}

exports.getApplicationStatus = function (id) {
  return client.requestAPI('application/' + id, 'get')
    .then((body) => {
      return body.status
    })
}

exports.getToken = function (email, pass) {
  return client.requestAPI('auth/', 'post', { email: email, password: pass })
    .then((body) => {
      return body.token
    })
}

exports.answerApplication = function (id, answer, token) {
  return client.requestAPI('committeeAnswer/' + id, 'put', answer, token)
    .then((body) => {
      return body.status
    })
}
