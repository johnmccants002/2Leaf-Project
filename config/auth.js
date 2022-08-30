const User = require('../models/user');

var middlewareObjc = {};

module.exports = function isLoggedIn(req, res, next) {
    // Pass the req/res to the next middleware/route handler
    if ( req.isAuthenticated() ) return next();
    // Redirect to login if the user is not already logged in
    res.redirect('/login');
  }


middlewareObjc.isNotVerified = async function(req, res, next) {
  try {
    const user = await User.findOne({username: "parent"});
    if(user) {
      return next()
    }
  
    return res.redirect('/')
  } catch(error) {
    console.log(error);

    res.redirect('/')
  } 
}

module.exports = middlewareObjc;

