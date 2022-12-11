class CallController {

    endCall(req, res) {
        console.log(req.query)
        res.render('endCall')
    }

    backCall(req, res) {
        res.render('room')
    }
}

module.exports = new CallController