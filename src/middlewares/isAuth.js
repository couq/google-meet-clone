const isAuth = (req, res, next) => {
    if(req.session.user || req.user) {
        return next()
    } else {
        return res.redirect('/login')
    }
}

module.exports = isAuth