const http = require('http');
const app = require('./app')
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Server = require('socket.io')

const WebSockets = require('./server/utils/WebSocket')

dotenv.config({ path: './config.env' });
let users = [];

mongoose.connect(process.env.CONN_URL, {
});

mongoose.connection.on('connected', () => {
    console.log('Mongo has connected succesfully')
});
mongoose.connection.on('reconnected', () => {
    console.log('Mongo has reconnected')
});
mongoose.connection.on('error', (error) => {
    console.log('Mongo connection has an error', error);
    mongoose.disconnect()
});
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose connection disconnected')
})

const server = http.createServer(app);

global.io = Server(server, {
    cors: {
        // origin: 'http://192.168.29.126:3001', // Replace with your React app's URL
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true
    }
});

global.io.on('connection', (socket) => {
    const userName = socket.handshake.query.userName;
    console.log(userName,' connected')
    
    socket.on('join room', (user, roomId) => {
        socket.join(user, roomId);  // Join the specified room
        const oldUser=users.find(curr=>curr === user)
        if(!oldUser){
            users.push(user);
        }
        console.log(`${user} joined the room: ${roomId}`);  
        global.io.sockets.emit('join room', { newEntry: user, msg: `${user} joined the room`,users});
    });
    
    // socket.on('send message', (userName, message) => {
    //     // Emit the message to all sockets in the room
    //     // global.io.sockets.emit('new message', { userName, message });
    // });

    socket.on('disconnect', () => {
        console.log(`${userName} disconnected`);
        global.io.sockets.emit('disconnected',userName,`${userName} disconnected`)
    });
    socket.on('leave room', (user,users) => {
        const updateUsers = users.filter(curr=>curr !== user)
        users = updateUsers;
        console.log(`${user} left the room.`);
        global.io.sockets.emit('leave room',user,users)
    });


    
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
})