document.addEventListener('DOMContentLoaded', () => {
  const linksList = document.getElementById('links-list');
  chrome.storage.local.get(null, (items) => {
    for (const url in items) {
      const links = items[url];
      if (Array.isArray(links)) {
        const urlTitle = document.createElement('h2');
        urlTitle.textContent = url;
        linksList.appendChild(urlTitle);
        const ul = document.createElement('ul');
        links.forEach(link => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = link.targetLink;
          a.textContent = `${decodeURIComponent(link.textFragment.replace('#:~:text=', ''))} -> ${link.targetLink}`;
          a.target = '_blank';
          li.appendChild(a);
          ul.appendChild(li);
        });
        linksList.appendChild(ul);
      }
    }
  });
});
