const request = require('request-promise-native')

const api = {
  url: process.env.NODE_ENV === 'production' ? 'https://pepites-hypermedia.herokuapp.com/' : 'http://localhost:3005/'
}

const requestAPI = function (action, reqBody, token) {
  if (action.url && action.method) {
    const reqConfig = {
      uri: api.url + action.url,
      method: action.method,
      json: true,
      headers: {
        Accept: 'application/vnd.siren+json'
      }
    }
    if (reqBody) { reqConfig.body = reqBody }
    if (token) {
      reqConfig.headers.Authorization = 'Bearer ' + token
    }
    return request(reqConfig)
  } else {
    return new Promise((success, fail) => { 
      fail(Error("No URL or Method available for action : " + action.name))
    })
  }
}

exports.requestAPI = requestAPI
