const { authApi } = require('../config/config')
const jwtDecode = require('jwt-decode')
const jwt = require('jsonwebtoken')


const login = (user,password) => {

}

const validateUserToken = async (token) => {
    const jwtDecoded = jwtDecode(token, {header: true})
    const verified = await jwt.verify(token, process.env.PRIVATE_AUTH_KEY, {algorithms: jwtDecoded.alg})

    return verified
}

module.exports = {login, validateUserToken}