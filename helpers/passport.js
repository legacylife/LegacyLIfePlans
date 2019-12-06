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
        // return done(null, false, {
        //   message: 'User is not Active'
        // })

        if(user.status == 'Pending' && user.profileSetup != 'yes'){
          return done(null, false, {
            message: 'User not found'
          })
        }
        else if(user.userType == 'advisor' && user.status == 'Pending' && user.profileSetup == 'yes'){
          return done(null, false, {
            message: 'Under review'
          })
        }
        else {
          return done(null, false, {
            message: 'User is not Active'
          })
        }

      }else if (user.deceased != null && user.deceased.status=="Active") {
        var legacyEndDate = new Date(user.lockoutLegacyDate);
        var currentDate  = new Date();
        if(legacyEndDate < currentDate ) {
          return done(null, false, {
            message: 'User is deceased'
          })
        }
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
