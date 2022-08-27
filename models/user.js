const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  email: String,
  password: {
    type: String,
    trim: true,
    minLength: 3,
    required: true
  },
}, {
  timestamps: true,
})

userSchema.pre('save', function(next) {
    // Save the reference to the user doc
    const user = this;
    if (!user.isModified('password')) return next();
    // password has been changed - salt and hash it
    bcrypt.hash(user.password, SALT_ROUNDS, function(err, hash) {
      if (err) return next(err);
      // Update the password property with the hash
      user.password = hash;
      return next();
    });
  });

const User = mongoose.model('User', userSchema)

module.exports = mongoose.model('User', userSchema);