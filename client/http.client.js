const request = require('request')
const config = require('../boot/setup')

const request_api = function(route, method, req_body, token) {
  const req_config = {
    url: config.api.url + 'api/' + route,
    method: method,
    json: true
  }
  if (req_body)
    req_config.body = req_body
  if (token)
    req_config.headers = {
      'Authorization': 'Bearer ' + token
    }
  return new Promise(function(resolve, reject){
    request(req_config, function(error, response, body) {
      if (!error && response.statusCode < 400)
        resolve(body)
      else
        reject(response ? response.statusCode : 400, error)
    })
  })
}

exports.request_api = request_api
