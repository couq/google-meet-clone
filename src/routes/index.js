const homeRouter = require('./home');
const userRouter = require('./user');
const authRouter = require('./auth');

function route(app) {
    app.use('/', authRouter);
    app.use('/', userRouter);
    app.use('/', homeRouter);
}

module.exports = route;
