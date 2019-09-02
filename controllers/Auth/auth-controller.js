const User = require('../../models/User/UserSchema');

// SIGNUP ---------------------------------------------------------------------
const signup = {
  get: async (req, res, next) => {
    if(req.query.alreadyExists) {
     return res.status(403).send("User Already Exists")  
    }
    return res.send("Signup")
    next()
  }
}

// LOGIN ----------------------------------------------------------------------
const login = {
  get: async (req, res, next) => {
    res.send("Login")
    next()
  }
}

module.exports = { signup, login }