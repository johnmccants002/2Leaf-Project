var express = require('express');
var router = express.Router();

/* GET home page. */
var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var router = express.Router();
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var jsonParser = bodyParser.json()
var MagicLinkStrategy = require('passport-magic-link').Strategy;
var sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(process.env.SENDGRID_API_KEY)
const crypto = require('crypto')
const {isNotVerified, isLoggedIn} = require('..//config/auth')
var MailUser = require('../models/mailuser')


router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register2', urlencodedParser, function(req, res) {
    console.log("this is the username: ", req.body.username, req.body.password)
    User.register(new User({username : req.body.username }), req.body.password, function(err, user) {
        if (err) {
            return res.render('register', { user : user });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.post('/register', urlencodedParser, async function(req, res) {
    console.log(req.body.mailuser,  "Mail User Checkbox")
    
    var newUser = new User({
        username : req.body.username,
        name: req.body.name,
        email : req.body.email,
        emailToken: crypto.randomBytes(64).toString('hex')
    });

    if (req.body.mailuser == "on") {
        var newMailUser = new MailUser({
            name: newUser.name,
            email: newUser.email,
            emailToken: newUser.emailToken
        })
        newUser.isMailUser = true;
        newUser.mailUser = newUser._id;
        await newMailUser.save()
    } else {
        newUser.isMailUser = false;

    }
    
    User.register(newUser, req.body.password, async function(err, user) {
        if(err) {
            return res.redirect('/register')
        }
        // <a href="http://${req.headers.host}/verify-email?token=${user.emailToken}"
        // <p>Click the link below to finish signing in to LevelUp.</p><p><a href="' + link + '">Sign in</a></p>
        console.log("this is the user email", user.email)
        var msg = {
            to: user.email,
            from: process.env.EMAIL,
            subject: 'Sign in to Level Up',
            text: `Hello! Click the link below to finish signing in to LevelUp. http://localhost:3000/verify-email?token=${user.emailToken}`,
            html: `<a href="http://localhost:3000/verify-email/?token=${user.emailToken}"> Email Verificaton Click Here</a>`
          };

        try {
            await sendgrid.send(msg);
            console.log("Success sending Sendgrid message")
            res.redirect('/')

        } catch(error) {
            console.log(error);
            
        }
    })

});

router.post('/levelup/mailing', urlencodedParser, async function(req, res) {

    try {
        const mailUser = await MailUser.findOne({email: req.body.email})
        if (mailUser) {
            console.log('already have user')
            res.redirect('/')
        }
    } catch(error) {
        console.log(error)
    
    
    var newMailUser = new MailUser({
        name : req.body.name,
        email : req.body.email,
        emailToken: crypto.randomBytes(64).toString('hex')
    });
   await newMailUser.save()
    var link = `http://localhost:3000/verify-email?token=${newMailUser.emailToken}`
    var msg = {
        to: newMailUser.email,
        from: process.env.EMAIL,
        subject: 'Sign in to Level Up',
        text: `Hello! Click the link below to finish signing in to LevelUp. http://localhost:3000/verify-email/levelup?token=${newMailUser.emailToken}`,
        html: `<a href="http://localhost:3000/verify-email/levelup?token=${newMailUser.emailToken}"> Email Verificaton Click Here</a>`
      };
      try {
        await sendgrid.send(msg);
        console.log("Success sending Sendgrid message")
        res.redirect('/')

    } catch(error) {
        console.log(error);
        res.redirect('/')
        
    }
}


})

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', isNotVerified, passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

router.get('/parentportal', function(req, res) {
    res.render('portal')
})

router.get('/login/email/verify', passport.authenticate('magiclink', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login'
  }));

router.post('/login/email', passport.authenticate('magiclink', {
    action: 'requestToken',
    failureRedirect: '/login'
  }), function(req, res, next) {
    res.redirect('/login/email/check');
  });

router.get('/login/email/check', async function(req, res, next) {
    res.render('login/email/check');

});

router.get('/verify-email', async function(req, res) {
    try {
        const user = await User.findOne({emailToken: req.query.token});
    if (!user) {
        
        return res.redirect('/')
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
    await req.login(user, async(err) => {
        if(err) return next(err);
    
        const redirectUrl = req.session.redirectTo || '/';
        res.redirect(redirectUrl);
    });
} catch(error) {
    console.log(error, "Error email check");
    res.redirect('/')
}
})

router.get('/verify-email/levelup', async function(req, res) {
    try {
        const mailUser = await MailUser.findOne({emailToken: req.query.token});

        if(!mailUser) {
            return res.redirect('/')
        }
        mailUser.emailToken = null;
        mailUser.isVerified = true;

        await mailUser.save(); 
        res.render('success')

    } catch(error) {
        console.log(error, "Error email check");
        res.redirect('/')
    }
})
  
  

module.exports = router;

