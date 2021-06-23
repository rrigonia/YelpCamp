const express = require('express');
const router = express.Router();
const users = require('../controllers/users')
const passport = require('passport');
const wrapError = require('../utils/wrapError')

router.route('/register')
    .get(users.renderRegister)
    .post(wrapError(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);


router.get('/logout', users.logout)

module.exports = router;
