var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var Users = require("./../models/Users")

passport.use(new LocalStrategy({
    usernameField: 'username'
  },
  function(username, password, done) {
    Users.findOne({ username: {'$regex' : new RegExp(escapeRegExp(username)), '$options' : 'i'} }, function (err, user) {
      if (err) { return done(err) }
      // Return if user not found in database
      if (!user) {
        return done(null, false, {
          message: 'User not found'
        })
      }
      if (user.status != "Active") {
        return done(null, false, {
          message: 'User is not Active'
        })
      }

      const validator = user.validPassword(password, user)
      // Return if password is wrong
      if (validator == false) {
        return done(null, false, {
          message: 'Password is wrong'
        })
      }
      if (validator == -1) {
        return done(null, { message: "WrongMethod"})
      }

      // If credentials are correct, return the user object
      return done(null, user)
    })
  }
))
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
