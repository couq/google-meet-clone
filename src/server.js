const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const path = require('path')
const bodyParser = require('body-parser');
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const route = require('./routes/index')
const { v4: uuidv4 } = require('uuid');



require('dotenv').config()

const db = require('./db/connect')

// connect to db
db.connect()

// view engine
app.set('view engine', 'ejs')

// middleware
app.set('views', __dirname + '/views')
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded())
app.use(express.json());

//auth


app.use(flash())
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  genid: (req) => uuidv4(),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  cookie:{
    maxAge: 1000 * 60 * 60 * 24
  },
  store: session.MemoryStore()
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// router init
route(app)

let raisehands = new Map()
let raisehandQueue = new Map()

let muteList = new Map()

let users = new Map() // to set for participants tab

// to set id and name for video when new user join 
let userStreamIdAndUserObject = new Map()

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    io.emit('hello')

    socket.on('streamId and userObject', (userStreamId, user) => {
      users.set(user.userId, user)
      // console.log('connect' + users)
      userStreamIdAndUserObject.set(userStreamId, user)
      io.emit('streamId and userObject', Array.from(userStreamIdAndUserObject))
      io.emit('set name for participants tab', Array.from(users))
    })

    // send message
    socket.on(roomId, (msg, sender) => {
      io.emit(roomId, msg, sender)
    });

    // send image
    socket.on(roomId + 'image', (image, sender) => {
      io.emit(roomId + 'image', image, sender); 
    });

    // set muteButton 
    socket.on(roomId + 'set muteButton', (isMute, userStreamId) => {
      muteList.set(userStreamId, isMute)
      io.emit(roomId + 'set muteButton', isMute, Array.from(muteList), userStreamId)
    })
    
    // use streamId to set raisehand for all video 
    socket.on(roomId + 'raise hand', (isRaiseHand, userStreamId) => {
      raisehands.set(userStreamId, isRaiseHand)
      io.emit(roomId + 'raise hand', isRaiseHand, userStreamId, Array.from(raisehands));
    })

    // set user is rising hand for queue
    socket.on(roomId + 'raise hand queue', (isRaiseHand, sender, time) => {
      sender['isRaiseHand'] = isRaiseHand
      sender['time'] = time
      raisehandQueue.set(sender.userId, sender)
      io.emit(roomId + 'raise hand queue', Array.from(raisehandQueue))
    })

    // share screen
    socket.on(roomId + 'share screen', stream => {
      // console.log(stream)
      io.emit(roomId + 'share screen', stream)
    })

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)

      users.delete(userId)
      io.emit('set name for participants tab', Array.from(users))

      raisehandQueue.delete(userId)
      io.emit(roomId + 'raise hand queue', Array.from(raisehandQueue))
    })

  })
})


server.listen(3000)