const request = require('request')

const api = {
  url: process.env.NODE_ENV === 'production' ? 'https://pepites-hypermedia.herokuapp.com/' : 'http://localhost:3005/'
}

const requestAPI = function (route, method, reqBody, token) {
  const reqConfig = {
    url: api.url + 'api/' + route,
    method: method,
    json: true
  }
  if (reqBody) { reqConfig.body = reqBody }
  if (token) {
    reqConfig.headers = {
      'Authorization': 'Bearer ' + token
    }
  }
  return new Promise(function (resolve, reject) {
    request(reqConfig, function (error, response, body) {
      if (!error && response.statusCode < 400) { resolve(body) } else { reject(response ? response.statusCode : 400, error) }
    })
  })
}

exports.requestAPI = requestAPI
