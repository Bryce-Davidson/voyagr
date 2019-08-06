const User = require('../../models/User/UserSchema');

// SIGNUP ---------------------------------------------------------------------
const signup = {
  get: async (req, res, next) => {
    res.send("Signup")
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