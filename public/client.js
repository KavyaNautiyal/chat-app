const socket = io();

const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg-input');
const usernameInput = document.getElementById('username-input');
const onlineCountEl = document.getElementById('online-count');
const typingIndicator = document.getElementById('typing-indicator');

// Assign a random default username per tab
usernameInput.value = `User_${Math.floor(100 + Math.random() * 900)}`;

let typingTimeout;

// Send message
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = msgInput.value.trim();
  const username = usernameInput.value.trim() || 'Anonymous';

  if (text) {
    socket.emit('chatMessage', { username, text });
    socket.emit('stopTyping');
    msgInput.value = '';
  }
});

// Emit typing event
msgInput.addEventListener('input', () => {
  const username = usernameInput.value.trim() || 'Someone';
  socket.emit('typing', username);

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('stopTyping');
  }, 1000);
});

// Receive message and render bubble
socket.on('chatMessage', (data) => {
  const isSelf = data.id === socket.id;
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${isSelf ? 'sent' : 'received'}`;

  msgDiv.innerHTML = `
    <span class="msg-meta">${isSelf ? 'You' : data.username} • ${data.time}</span>
    <div>${escapeHTML(data.text)}</div>
  `;

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Update online users count
socket.on('userCount', (count) => {
  onlineCountEl.textContent = `${count} ${count === 1 ? 'User' : 'Users'} Online`;
});

// Show/hide typing indicator
socket.on('typing', (username) => {
  typingIndicator.textContent = `${username} is typing...`;
});

socket.on('stopTyping', () => {
  typingIndicator.textContent = '';
});

// Basic XSS protection
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}