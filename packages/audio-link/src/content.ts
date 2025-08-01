const FRAGMENT_DIRECTIVE = '#:~:text=';

const processAudioFragments = () => {
  if (!location.hash.startsWith(FRAGMENT_DIRECTIVE)) {
    return;
  }

  const fragment = location.hash.substring(FRAGMENT_DIRECTIVE.length);
  const decodedFragment = decodeURIComponent(fragment);

  const audioElements = document.querySelectorAll('audio');
  if (audioElements.length === 0) {
    return;
  }

  for (const audioElement of audioElements) {
    const src = audioElement.src;
    if (!src) {
      continue;
    }

    chrome.runtime.sendMessage({
      type: 'find-audio-fragment',
      payload: {
        src,
        text: decodedFragment,
      },
    });
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'audio-fragment-found') {
    const { src, timestamp } = message.payload;
    const audioElements = document.querySelectorAll('audio');
    for (const audioElement of audioElements) {
      if (audioElement.src === src) {
        audioElement.currentTime = timestamp;
        audioElement.play();
        break;
      }
    }
  }
});

processAudioFragments();
