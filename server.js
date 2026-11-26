const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

let onlineUsers = 0;

io.on('connection', (socket) => {
  onlineUsers++;
  io.emit('userCount', onlineUsers);

  // Listen for incoming chat messages
  socket.on('chatMessage', (data) => {
    // Broadcast message to all connected clients (tabs)
    io.emit('chatMessage', {
      id: socket.id,
      username: data.username,
      text: data.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  // Listen for typing indicator
  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username);
  });

  socket.on('stopTyping', () => {
    socket.broadcast.emit('stopTyping');
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    onlineUsers = Math.max(0, onlineUsers - 1);
    io.emit('userCount', onlineUsers);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});