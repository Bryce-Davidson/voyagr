const User = require('../../models/User/UserSchema');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../../config/keys');

// SIGNUP ---------------------------------------------------------------------
const signup = {
  get: async (req, res, next) => {
    if (req.query.alreadyExists) {
      console.log('EXISTS')
      return res.status(403).json({ msg: "User Already Exists" })
    }
    return res.json({ route: "Signup" })
    next()
  }
}

// LOGIN ----------------------------------------------------------------------
const login = {
  post: async (req, res, next) => {
    let { email, password, expiresIn } = req.body;
    try {
      let userToLogin = await User.findOne({ 'local.email': email });
      if (!userToLogin) { return res.status(404).json({ msg: "User does not exist" }) };
      if (!userToLogin.validPassword(password)) return res.satus(401).json({ msg: "Invalid password" })
      else {
        jwt.sign({user: userToLogin.id}, SECRET, {expiresIn: '1d'}, (err, token) => {
          if(err) next(err);
          else 
            return res.json({token})
        })
      }
    } catch (err) { next(err) }
  },
  get: async (req, res, next) => {
    res.send("Login")
  }
}

module.exports = { signup, login }