const express = require('express')
const router = express.Router()
const generateRoom = require('../helpers/generate-room')
const CallController = require('../controllers/CallController')
const isAuth = require('../middlewares/isAuth')
const e = require('express')

router.get('/', (req, res) => {
        if(req.session.passport !== undefined) {
            const profile = JSON.parse(req.session.passport.user['_raw'])
            const user = {
                "_id": profile['sub'],
                "fullName": profile['name'],
                "email": profile['email'],
                "avatar": profile['picture'],
              }
            res.render('index', {user})
            return
        } else if(req.session.user){
            res.render('index', {user: req.session.user})
        } else {
            res.render('index')
        }
    })

router.get('/end-call', CallController.endCall)

router.get('/join-room', (async (req, res, next) => {
    const { roomLink: room } = req.query
    res.redirect(`${room}`)
}))

router.get('/create-room', (req, res) => {
    res.redirect(`/${generateRoom()}`)
})

router.get('/:room', isAuth, (req, res, next) => {
    // if login with google auth
    if(req.session.passport !== undefined) {
        const profile = JSON.parse(req.session.passport.user['_raw'])
        const user = {
            "_id": profile['sub'],
            "fullName": profile['name'],
            "email": profile['email'],
            "avatar": profile['picture'],
            }
        res.render('room', { roomId: req.params.room, user })
    } else
    res.render('room', { roomId: req.params.room, user: req.session.user })
})

module.exports = router