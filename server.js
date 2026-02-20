const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Serve static files (HTML/CSS/JS)
app.use(express.static('public'));

// Store users online
let users = {};

// When someone connects
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // User joins with username
  socket.on('join', (username) => {
    users[socket.id] = username;
    io.emit('userList', Object.values(users)); // Send updated user list
    socket.broadcast.emit('chat message', `${username} joined the chat!`);
  });

  // Handle chat messages
  socket.on('chat message', (msg) => {
    io.emit('chat message', `${users[socket.id]}: ${msg}`);
  });

  // User disconnects
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      io.emit('chat message', `${users[socket.id]} left the chat!`);
      delete users[socket.id];
      io.emit('userList', Object.values(users));
    }
  });
});

// # Add these routes to server.js (5 lines!):

// if (req.url === '/') {
//   res.end('<h1>Home Page</h1>');
// } else if (req.url === '/about') {
//   res.end('<h1>About Me - Full Stack Dev</h1>');
// } else {
//   res.end('<h1>404 - Page Not Found</h1>');
// }

server.listen(5000, () => {
  console.log('🚀 Chat server running on http://localhost:5000');
});