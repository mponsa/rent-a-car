const { authApi } = require('../config/config')
const jwtDecode = require('jwt-decode')


const login = (user,password) => {}


const validateUserToken = (token) => {
    const decoded = jwtDecode(token)

    return decoded
}

module.exports = {login, validateUserToken}