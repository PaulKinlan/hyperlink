chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'updateSummary') {
    const container = document.getElementById('summary-container');
    container.innerHTML = '';
    for (const summary of request.summaries) {
      const div = document.createElement('div');
      div.className = 'summary-item';
      div.textContent = summary;
      container.appendChild(div);
    }
  }
});
