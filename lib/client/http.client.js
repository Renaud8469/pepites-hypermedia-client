const request = require('request-promise-native')

const api = {
  url: process.env.NODE_ENV === 'production' ? 'https://pepites-hypermedia.herokuapp.com/' : 'http://localhost:3005/'
}

const requestAPI = function (route, method, reqBody, token) {
  const reqConfig = {
    uri: api.url + route,
    method: method,
    json: true
  }
  if (reqBody) { reqConfig.body = reqBody }
  if (token) {
    reqConfig.headers = {
      'Authorization': 'Bearer ' + token
    }
  }
  return request(reqConfig)
}

exports.requestAPI = requestAPI
