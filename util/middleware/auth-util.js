module.exports = {
    isLoggedIn: (req, res, next) => {
        if (req.isAuthenticated())
          return next();
        else
          return res.redirect('/login');
    },
    loggedInRedirect: (req, res, next) => {
      if (req.isAuthenticated())
        return res.redirect('/');
      else
        return next()
    },
    isOwner: (doc, path, userid) => {
      return doc[path] == userid;
    }
  }