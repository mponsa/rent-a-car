const authService = require('../services/authService.js')

module.exports = (req, res, next) => {
      const token = req.headers.authorization.split(' ')[1];
      
      authService.validateUserToken(token)
      .then(decodedToken => {
          console.log(decodedToken)
          next()
      })
      .catch(error => {
          console.log(error.message)
          res.status(401).send({msg:"Unauthorized!", code:401})
      })
  };