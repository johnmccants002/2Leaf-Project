const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

const User = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  emailToken: String,
  isVerified: Boolean,
})


User.plugin(passportLocalMongoose);

// userSchema.pre('save', function(next) {
//     // Save the reference to the user doc
//     const user = this;
//     if (!user.isModified('password')) return next();
//     // password has been changed - salt and hash it
//     bcrypt.hash(user.password, SALT_ROUNDS, function(err, hash) {
//       if (err) return next(err);
//       // Update the password property with the hash
//       user.password = hash;
//       return next();
//     });
//   });

// const User = mongoose.model('User', userSchema)

module.exports = mongoose.model('User', User);