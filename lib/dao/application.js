exports.getPepiteFromSchool = function (body, schoolName) {
  for (let school of body) {
    if (school.name === schoolName) {
      return school.pepite
    }
  }
}

exports.getPepiteEmail = function (body) {
  return body.email
}

exports.getPepiteName = function (body) {
  return body.name
}

exports.getApplicationId = function (body) {
  return body._id
}

exports.getApplicationStatus = function (body) {
  return body.status
}

exports.getToken = function (body) {
  return body.token
}
