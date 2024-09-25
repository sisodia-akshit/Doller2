const express = require('express');
const cors = require('cors')
const app = express();

const authRoute = require('./server/routes/authRoute');
const chatroomRoute = require('./server/routes/chatroomRoute');

const corsOptions = {
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    origin: '*',
    // other options
};
// app.use(cors(corsOptions))
app.use(cors())
app.use(express.json({ limit: '10kb' }))
app.use('/auth', authRoute);
app.use('/rooms', chatroomRoute);

module.exports = app;