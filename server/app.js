import express from 'express';
import http from 'http';

var app = express();
var server = http.createServer(app);

server.listen(3000, () => {
    console.log('App is running on localhost:3000');
});

exports = module.exports = app;
