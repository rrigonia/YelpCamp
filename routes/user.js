const express = require('express');
const router = express.Router();
const passport = require('passport')
const User = require('../models/user');
const wrapError = require('../utils/wrapError')

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', wrapError(async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const newUser = await User.register(user, password);
        req.login(newUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to the Yelp-Campground');
            res.redirect('/campgrounds')
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/register')
    }

}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Successfully Logout')
    res.redirect('/campgrounds')
})

module.exports = router;
