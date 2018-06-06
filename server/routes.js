export default function (app) {
    app.use('/api/users', require('./api/user'));
    app.use('/api/session', require('./api/auth/basic'));
}
