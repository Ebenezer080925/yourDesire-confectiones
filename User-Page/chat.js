const WEBHOOK_URL = 'https://dataknight.app.n8n.cloud/webhook/08b9f58f-c53a-44d9-b918-09d691d92467'; // <-- paste your production webhook URL here

// Grab references to the HTML elements we'll be updating
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const setupNote = document.getElementById('setup-note');

// A random ID so n8n's memory can tell this browser tab's
// conversation apart from anyone else's chatting at the same time
const sessionId = 'session-' + Math.random().toString(36).slice(2, 12);

// Hides the "not connected yet" note once WEBHOOK_URL is filled in
if (WEBHOOK_URL) {
  setupNote.style.display = 'none';
}

// Adds one message bubble to the chat window.
// role is either 'user' (customer) or 'bot' (Stones)
function addMessage(text, role) {
  const el = document.createElement('div');
  el.className = 'msg ' + role;
  el.textContent = text;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight; // auto-scroll to the newest message
  return el;
}

// Shows the bouncing "..." dots while waiting for Stones to reply
function showTyping() {
  const el = document.createElement('div');
  el.className = 'msg typing';
  el.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return el;
}

// This runs every time the customer sends a message
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return; // do nothing if the box is empty

  addMessage(text, 'user'); // show their message immediately
  inputEl.value = '';
  sendBtn.disabled = true;  // prevent double-sends while waiting

  // If the webhook hasn't been set up yet, explain that instead of failing silently
  if (!WEBHOOK_URL) {
    addMessage("Stones isn't connected yet — the site owner still needs to add the production webhook URL.", 'bot');
    sendBtn.disabled = false;
    return;
  }

  const typingEl = showTyping();

  try {
    // Send the customer's message to your n8n workflow
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatInput: text,
        sessionId: sessionId,
        action: 'sendMessage'
      })
    });

    if (!response.ok) throw new Error('Request failed: ' + response.status);

    const data = await response.json();

    // n8n chat responses usually come back shaped like { output: "..." }
    // If Stones' replies don't show up correctly once connected, check
    // what the real response looks like and adjust this one line.
    const reply = data.output || data.text || JSON.stringify(data);

    typingEl.remove();
    addMessage(reply, 'bot');
  } catch (err) {
    typingEl.remove();
    addMessage("Sorry, I couldn't reach the kitchen just now — please try again in a moment.", 'bot');
    console.error('Chat error:', err);
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

// Wire up the Send button and the Enter key
sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') sendMessage();
});
