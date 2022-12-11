const User = require('../models/User');
const passport = require('passport');

class UserController {

    showRegister(req, res) {
        res.render('register')
    }

    create(req, res, next) {
        const defaultAvatarFemale = 'https://media.istockphoto.com/id/477333976/photo/female-portrait-icon-as-avatar-or-profile-picture.jpg?s=612x612&w=0&k=20&c=GL-wQYLh_UlsqeFvkgCwQXWFDFTtz0ApA1e7WPZdfYY='
        const defaultAvatarMale = 'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png'
        const thirdGenderAvatar = 'https://cafebiz.cafebizcdn.vn/k:2015/5-150627tektut1-42778-1435395988693/facebook-tung-cong-cu-luc-sac-avatar-ung-ho-cong-dong-lgbt.png'
        if(req.body.gender == 'male') {
            req.body['avatar'] = defaultAvatarMale
        } else if(req.body.gender == 'female') {
            req.body['avatar'] = defaultAvatarFemale
        } else {
            req.body['avatar'] = thirdGenderAvatar
        }
        
        const user = new User(req.body)
        user
            .save()
            .then(() => {
                res.render('login')
            })
            .catch(err => res.send(err))
        }
        
    showLogin(req, res, next) {
        res.render('login')
    }

    login(req, res, next) { 
        User.findOne(req.body)
        .then(user => {
            var hour = 1000 * 60 * 60 * 24
                req.session.cookie.expires = new Date(Date.now() + hour)
                req.session.cookie.maxAge = hour
                req.session.user = user 
                if(user) {
                    res.redirect('/')
                } 
                else {
                    res.send('Something went wrong! Please type again')
                }
            })
        .catch(err => res.send('Something went wrong! Please type again'))
    }

    logout(req, res, next) {
        req.logOut(() => {
            res.redirect('/')
        })
    } 
}

module.exports = new UserController