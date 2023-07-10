const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
const cors = require('cors');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: 'https://unique-halva-6abbeb.netlify.app',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
});

io.on('connect', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) {
      return callback && callback(error); // Return error through the callback if provided
    }

    socket.join(user.room);

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to  ${user.room} room.` });
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    if (callback && typeof callback === 'function') {
      callback(); // Call the callback to acknowledge successful join if provided
    }
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    if (!user) {
      // Handle case where user is not found
      return callback && callback('User not found');
    }

    io.to(user.room).emit('message', { user: user.name, text: message });

    if (callback && typeof callback === 'function') {
      callback(); // Call the callback to acknowledge successful message sending if provided
    }
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    }
  });
});

app.use(cors({ origin: 'https://unique-halva-6abbeb.netlify.app' }));
app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));