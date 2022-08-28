const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

const MailUser = new mongoose.Schema({
  name: String,
  email: String,
  emailToken: String,
  isVerified: Boolean,
})


MailUser.plugin(passportLocalMongoose);

module.exports = mongoose.model('MailUser', MailUser);