const express = require('express');
const router = express.Router()
const UserController = require('../controllers/UserController');

router.get('/register', UserController.showRegister)
router.post('/register', UserController.create)
router.get('/login', UserController.showLogin)
router.get('/logout', UserController.logout)

module.exports = router