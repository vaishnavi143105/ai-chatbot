
// ===== ELEMENTS =====
const userInput         = document.getElementById('userInput');
const sendBtn           = document.getElementById('sendBtn');
const messagesList      = document.getElementById('messagesList');
const messagesContainer = document.getElementById('messagesContainer');
const welcomeScreen     = document.getElementById('welcomeScreen');
const newChatBtn        = document.getElementById('newChatBtn');
const menuToggle        = document.getElementById('menuToggle');
const sidebar           = document.querySelector('.sidebar');
const chips             = document.querySelectorAll('.chip');
const historyItems      = document.querySelectorAll('.history-item');
 
// ===== STATE =====
let isTyping = false;
 
// ===== FIX 1: Centralised button-state helper =====
// Previously the button state was only recalculated on 'input' events,
// so after the bot responded the button stayed disabled even if the
// textarea had text in it.
function updateSendBtn() {
  sendBtn.disabled = userInput.value.trim() === '' || isTyping;
}
 
// ===== FIX 2: Textarea auto-resize =====
// The textarea was set to rows="1" but had no JS to grow as the user
// typed. Without this the textarea stays one line tall regardless of content.
function autoResizeInput() {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 160) + 'px';
}
 
// ===== RENDER MESSAGE =====
function renderMessage(text, role) {
  if (welcomeScreen.style.display !== 'none') {
    welcomeScreen.style.display = 'none';
  }
 
  const msg = document.createElement('div');
  msg.classList.add('message', role);
 
  const avatar = document.createElement('div');
  avatar.classList.add('msg-avatar');
  avatar.textContent = role === 'user' ? 'U' : 'N';
 
  const content = document.createElement('div');
  content.classList.add('msg-content');
 
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
 
  content.innerHTML = formatted;
 
  msg.appendChild(avatar);
  msg.appendChild(content);
  messagesList.appendChild(msg);
 
  scrollToBottom();
}
 
// ===== TYPING =====
function showTyping() {
  isTyping = true;
  updateSendBtn(); // Disable send while AI is responding
 
  const msg = document.createElement('div');
  msg.classList.add('message', 'bot');
  msg.id = 'typingMsg';
 
  const avatar = document.createElement('div');
  avatar.classList.add('msg-avatar');
  avatar.textContent = 'N';
 
  const content = document.createElement('div');
  content.classList.add('msg-content');
 
  const indicator = document.createElement('div');
  indicator.classList.add('typing-indicator');
  indicator.innerHTML = '<span></span><span></span><span></span>';
 
  content.appendChild(indicator);
  msg.appendChild(avatar);
  msg.appendChild(content);
  messagesList.appendChild(msg);
 
  scrollToBottom();
}
 
function hideTyping() {
  isTyping = false;
  const el = document.getElementById('typingMsg');
  if (el) el.remove();
  updateSendBtn(); // FIX: Re-evaluate button state now that AI is done
}
 
// ===== SCROLL =====
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
 
// ===== API CALL =====
async function sendMessageToServer(text) {
  try {
    const response = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: text })
    });
 
    const data = await response.json();
    return data.reply;
 
  } catch (error) {
    console.error(error);
    return "⚠️ Error connecting to server!";
  }
}
 
// ===== MAIN SEND FUNCTION =====
async function handleSend(text) {
  if (!text || isTyping) return;
 
  renderMessage(text, 'user');
 
  // FIX 3: Reset textarea value AND height together
  userInput.value = '';
  userInput.style.height = 'auto';
  updateSendBtn();
 
  showTyping();
 
  const reply = await sendMessageToServer(text);
 
  hideTyping();
  renderMessage(reply, 'bot');
}
 
// ===== EVENTS =====
 
// Button click
sendBtn.addEventListener('click', () => {
  const text = userInput.value.trim();
  handleSend(text);
});
 
// Enter key
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const text = userInput.value.trim();
    handleSend(text);
  }
});
 
// Enable/disable button + auto-resize on input
userInput.addEventListener('input', () => {
  autoResizeInput();
  updateSendBtn();
});
 
// Chips
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    const text = chip.dataset.text;
    handleSend(text);
  });
});
 
// New chat
newChatBtn.addEventListener('click', () => {
  messagesList.innerHTML = '';
  welcomeScreen.style.display = 'flex';
  userInput.value = '';
  userInput.style.height = 'auto'; // FIX: Also reset height on new chat
  updateSendBtn();
  userInput.focus();
});
 
// Sidebar toggle
menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});
 
// Close sidebar (mobile)
document.addEventListener('click', (e) => {
  if (
    window.innerWidth <= 680 &&
    !sidebar.contains(e.target) &&
    !menuToggle.contains(e.target)
  ) {
    sidebar.classList.remove('open');
  }
});
 
// History click
historyItems.forEach(item => {
  item.addEventListener('click', () => {
    historyItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});
 
// ===== INIT =====
userInput.focus();