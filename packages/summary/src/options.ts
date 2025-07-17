const form = document.querySelector('form');
const apiKeyInput = document.querySelector<HTMLInputElement>('#apiKey');

if (apiKeyInput) {
  // Load the saved API key when the options page is opened
  chrome.storage.sync.get('apiKey', (data) => {
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
    }
  });
}

if (form && apiKeyInput) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const apiKey = apiKeyInput.value;
    chrome.storage.sync.set({ apiKey }, () => {
      console.log('API key saved');
    });
  });
}
