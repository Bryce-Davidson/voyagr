const User = require('../../models/User/UserSchema');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../../config/keys');

// SIGNUP ---------------------------------------------------------------------
// IMPLEMENT WITH JWT
const signup = {
  post: async (req, res, next) => {
    let { email, password, username } = req.body;
    try {
      let potentailNewUser = await User.findOne({ $or: [{ 'local.email': email }, { 'local.username': username }] })
      if (potentailNewUser) {
        return res.json({ msg: "User already exists." })
      } else {
        let newUser = await new User({
          'local.email': email,
          'local.password': password,
          'local.username': req.body.username
        }).save();
        jwt.sign({ user: newUser.id }, SECRET, { expiresIn: '1d' }, (err, token) => {
          if (err) next(err);
          else {
            res.header({'X-voyagr-token': token})
            res.redirect('/')
          }
        })
      }
    } catch (err) { next(err) };
  },
  get: async (req, res, next) => {
    return res.json({ route: "Signup" })
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
        jwt.sign({ user: userToLogin.id }, SECRET, { expiresIn: '1d' }, (err, token) => {
          if (err) next(err);
          else
            return res.json({ token })
        })
      }
    } catch (err) { next(err) }
  },
  get: async (req, res, next) => {
    res.send("Login")
  }
}

module.exports = { signup, login }