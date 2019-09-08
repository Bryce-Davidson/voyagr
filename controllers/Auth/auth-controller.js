const User = require('../../models/User/UserSchema');

// SIGNUP ---------------------------------------------------------------------
const signup = {
  get: async (req, res, next) => {
    if(req.query.alreadyExists) {
      console.log('EXISTS')
     return res.status(403).json({msg: "User Already Exists"})  
    }
    return res.json({route: "Signup"})
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