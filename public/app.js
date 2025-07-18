const messages = document.getElementById('messages');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const downloadDiv = document.getElementById('download');
const downloadLink = document.getElementById('downloadLink');

const questions = [
  { key: 'appName', text: 'What is the app name?' },
  { key: 'author', text: 'Who is the author?' },
  { key: 'version', text: 'Initial version number?', default: '1.0.0' },
  { key: 'description', text: 'Provide a short description of the app.' },
  { key: 'inputType', text: 'Describe the modular input this add-on should implement.' }
];

let step = 0;
const answers = {};
let currentApp = '';

function askNext() {
  if (step < questions.length) {
    addMessage('system', questions[step].text);
  }
}

sendBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) return;
  addMessage('user', text);
  const q = questions[step];
  answers[q.key] = text || q.default || '';
  input.value = '';
  step++;

  if (step < questions.length) {
    askNext();
    return;
  }

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers)
  });
  const data = await res.json();
  if (data.status === 'ok') {
    currentApp = data.app;
    addMessage('system', `App ${currentApp} generated.`);
    downloadLink.href = `/api/download?app=${currentApp}`;
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

// kick off the conversation
askNext();
