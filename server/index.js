const express = require('express');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const dotenv = require('dotenv');

const router = require('./routes/index');
const connectDB = require('./databse/db');
const path = require("path");
const app = express();
const errorHandler = require('./middleware/errorHandlingMiddleware');

dotenv.config();

const PORT = process.env.SERVER_PORT || 1000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static', 'chats')));
app.use(express.static(path.resolve(__dirname, 'static', 'users')));

app.use(fileUpload({}));

app.use(cookieParser());

app.use('/api', router);

app.use(errorHandler);

const api_server = app.listen(PORT, () => console.log(`Server ha started at ${PORT}`));

const io = require('socket.io')(api_server, {
    pingTimeout: 60000,
    cors: {
        origin: '*'
    }
})

io.on('connection', (socket) =>
{
    console.log('connected')

    socket.on('setup', (userData) =>
    {
        socket.join(userData._id);
        socket.emit('connected');
    });

    socket.on('join chat', (room) =>
    {
        socket.join(room);
        console.log(`user joined room ${room}`);
    });

    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

    socket.on('new message', (message) =>
    {
        let chat = message.chat;

        if(!chat.users)
            return;

        chat.users.forEach(user =>
        {
            if(user._id == message.sender._id)
                return;

            socket.in(user._id).emit('message received', message);
        })
    })

    socket.off('setup', (userData) =>
    {
        socket.leave(userData.id)
    })
})