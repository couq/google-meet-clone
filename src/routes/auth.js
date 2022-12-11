const User = require('../models/User')
const express = require('express');
const router = express.Router()
const passport = require('passport');
const isAuth = require('../middlewares/isAuth')
const UserController = require('../controllers/UserController')
require('../middlewares/authenticate')

router.post('/login', UserController.login)


// google oauth
router.get('/auth/google', 
    passport.authenticate('google', {scope: ['email', 'profile']})
)

router.get('/google/callback', 
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/auth/failure'
    })
)

router.get('/auth/failure', isAuth, (req, res) => {
    res.send('auth with google failure')
})

module.exports = router