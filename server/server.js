const { instrument } = require('@socket.io/admin-ui');

const io = require('socket.io')(3000, {
  cors: {
    origin: ['http://localhost:8080', 'https://admin.socket.io/'],
  },
});

// Authentication with username: test
const userIo = io.of('/user');
userIo.on('connection', (socket) => {
  console.log('Connected to username with username ' + socket.username);
});

userIo.use((socket, next) => {
  if (socket.handshake.auth.token) {
    socket.username = getUsernameFromToken(socket.handshake.auth.token);
    next();
  } else {
    next(new Error('Please send token'));
  }
});

function getUsernameFromToken(token) {
  return token;
}

io.on('connection', (socket) => {
  console.log(socket.id);
  socket.on('send-message', (message, room) => {
    if (room === '') {
      // Sends to everybody except you. socket.broadcast
      socket.broadcast.emit('receive-message', message);
    } else {
      socket.to(room).emit('receive-message', message);
    }
  });
  socket.on('join-room', (room, cb) => {
    socket.join(room);
    cb(`Joined Room: ${room}`);
  });
  //   socket.on('ping', (n) => console.log(n));
});

instrument(io, { auth: false });
