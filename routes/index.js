const express = require('express');
const ctrl = require('../controllers/controller')
const router = express.Router();
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({
	extended: false
})

router.get('/', ctrl.index);
router.get('/register', ctrl.showRegister);
router.post('/register', urlencodedParser, ctrl.register);
router.post('/levelup/mailing', urlencodedParser, ctrl.mailSignUp);
router.get('/login', ctrl.showLogin);
router.post('/login', ctrl.login);
router.get('/logout', ctrl.logout);
router.get('/ping', ctrl.ping);
router.get('/parentportal', ctrl.showParentPortal);
router.get('/verify-email', ctrl.verifyUser);
router.get('/verify-email/levelup', ctrl.verifyMailUser)
module.exports = router;

