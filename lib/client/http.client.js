const request = require('request')
const config = require('../boot/setup')

const requestAPI = function (route, method, reqBody, token) {
  const reqConfig = {
    url: config.api.url + 'api/' + route,
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
