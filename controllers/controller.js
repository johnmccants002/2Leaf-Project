const User = require("../models/user");
const sendgrid = require("@sendgrid/mail");
const crypto = require("crypto");
const MailUser = require("../models/mailuser");
const passport = require("passport");
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  login: loginUser,
  register: registerUser,
  mailSignUp,
  logout,
  showParentPortal,
  verifyUser,
  verifyMailUser,
  index,
  showRegister,
  showLogin,
  ping,
};

function index(req, res) {
  res.render("index", {
    user: req.user,
    username: "parent",
  });
}

function loginUser(req, res) {
  req.body.username = "parent";
  if (!req.body.username) {
    res.json({
      success: false,
      message: "Username was not given",
    });
  } else {
    if (!req.body.password) {
      res.json({
        success: false,
        message: "Password was not given",
      });
      res.redirect("/");
    } else {
      passport.authenticate("local", function (err, user, info) {
        if (err) {
          res.json({
            success: false,
            message: err,
          });
        } else {
          if (!user) {
            res.json({
              success: false,
              message: "username or password incorrect",
            });
          } else {
            req.login(user, function (err) {
              if (err) {
                res.json({
                  success: false,
                  message: err,
                });
                res.redirect("/");
              } else {
                res.redirect("/parentportal");
              }
            });
          }
        }
      })(req, res);
    }
  }
}

async function registerUser(req, res) {
  console.log(req.body.mailuser, "Mail User Checkbox");
  var newUser = new User({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    emailToken: crypto.randomBytes(64).toString("hex"),
  });
  if (req.body.mailuser == "on") {
    var newMailUser = new MailUser({
      name: newUser.name,
      email: newUser.email,
      emailToken: newUser.emailToken,
    });
    newUser.isMailUser = true;
    newUser.mailUser = newUser._id;
    await newMailUser.save();
  } else {
    newUser.isMailUser = false;
  }
  User.register(newUser, req.body.password, async function (err, user) {
    if (err) {
      return res.redirect("/register");
    }
    var msg = {
      to: user.email,
      from: process.env.EMAIL,
      subject: "Email Confirmation: Level Up",
      text: `Hello! Click the link below to verify your email!`,
      html: `<a href="https://levelup-2leaf.herokuapp.com//verify-email/?token=${user.emailToken}"> Email Verificaton Click Here</a>`,
    };
    try {
      await sendgrid.send(msg);
      console.log("Success sending Sendgrid message");
      res.redirect("/");
    } catch (error) {
      console.log(error);
    }
  });
}

async function mailSignUp(req, res) {
  console.log(req.body.email, "this is the email");
  const mailUser = await MailUser.findOne({
    email: req.body.email,
  });
  console.log(mailUser);
  if (mailUser) {
    console.log("already have user");
    return res.redirect("/");
  }
  var newMailUser = new MailUser({
    name: req.body.name,
    email: req.body.email,
    emailToken: crypto.randomBytes(64).toString("hex"),
  });
  var msg = {
    to: newMailUser.email,
    from: process.env.EMAIL,
    subject: "Sign in to Level Up",
    text: `Hello! Click the link below to finish signing in to LevelUp. https://levelup-2leaf.herokuapp.com/verify-email/levelup?token=${newMailUser.emailToken}`,
    html: `<a href="https://levelup-2leaf.herokuapp.com/verify-email/levelup?token=${newMailUser.emailToken}"> Email Verificaton Click Here</a>`,
  };
  try {
    await newMailUser.save();
    await sendgrid.send(msg);
    console.log("Success sending Sendgrid message");
  } catch (error) {
    console.log(error);
  } finally {
    return res.redirect("/");
  }
}

function showLogin(req, res) {
  res.render("login", {
    user: req.user,
  });
}

function logout(req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

function showParentPortal(req, res) {
  if (req.user) {
    res.render("portal");
  } else {
    res.redirect("/");
  }
}

async function verifyUser(req, res) {
  try {
    const user = await User.findOne({
      emailToken: req.query.token,
    });
    if (!user) {
      return res.redirect("/");
    }
    user.emailToken = null;
    user.isVerified = true;
    if (user.isMailUser) {
      const mailUser = await MailUser.findById(user.mailUser);
      mailUser.emailToken = null;
      mailUser.isVerified = true;
      await mailUser.save();
    }
    await user.save();
    await req.login(user, async (err) => {
      if (err) return next(err);
      const redirectUrl = req.session.redirectTo || "/";
      return res.redirect(redirectUrl);
    });
  } catch (error) {
    console.log(error, "Error email check");
    return res.redirect("/");
  }
}

async function verifyMailUser(req, res) {
  try {
    const mailUser = await MailUser.findOne({
      emailToken: req.query.token,
    });
    if (!mailUser) {
      return res.redirect("/");
    }
    mailUser.emailToken = null;
    mailUser.isVerified = true;
    await mailUser.save();
    res.redirect("/");
  } catch (error) {
    console.log(error, "Error email check");
    return res.redirect("/");
  }
}

function showRegister(req, res) {
  res.render("register", {});
}

function ping(req, res) {
  res.status(200).send("pong!");
}
