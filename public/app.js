const messages = document.getElementById('messages');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const downloadDiv = document.getElementById('download');
const downloadLink = document.getElementById('downloadLink');

let appName = '';

sendBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) return;
  addMessage('user', text);
  input.value = '';
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appName: text })
  });
  const data = await res.json();
  if (data.status === 'ok') {
    appName = data.app;
    addMessage('system', `App ${appName} generated.`);
    downloadLink.href = `/api/download?app=${appName}`;
    downloadDiv.classList.remove('hidden');
  } else {
    addMessage('system', 'Error generating app');
  }
});

function addMessage(sender, text) {
  const div = document.createElement('div');
  div.textContent = `${sender}: ${text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
