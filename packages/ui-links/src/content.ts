import { ForeignHtmlRenderer } from './renderSvg.js';

const getUIHandler = async (message, sender, sendResponse) => {
  let elementImageData;
  const { elementSelector } = message.payload;
  console.log(message);
  if (elementSelector != null) {
    const element = document.querySelector(elementSelector);
    const stylesheets = document.styleSheets;
    const foreignHtmlRenderer = new ForeignHtmlRenderer(stylesheets);

    if (element == null) {
      console.log('Unable to find element to capture');
      sendResponse(undefined);
    }

    foreignHtmlRenderer
      .renderToSVG(element.outerHTML, element.clientWidth, element.clientHeight)
      .then((svg) => {
        // const context = canvas.getContext('2d');

        // elementImageData = context?.getImageData(
        //   0,
        //   0,
        //   canvas.width,
        //   canvas.height,
        // );
        //console.log(elementImageData);
        console.log(svg);

        sendResponse({
          svgElement: svg,
          // elementImageData: elementImageData.data,
          width: element.width,
          height: element.height,
        });
      });
  }
};

chrome.runtime.onMessage.addListener(function (
  message: any,
  sender,
  sendResponse,
) {
  if (message.type != 'GET_UI') {
    return false;
  }

  getUIHandler(message, sender, sendResponse);

  return true;
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type !== 'SHOW_UI') {
    return;
  }

  showUIHanlder(message, sender, sendResponse);

  return true;
});

const showUIHanlder = async (message, sender, sendResponse) => {
  const { elementImageData, svgElement, width, height, linkUrl } =
    message.payload;

  let canvas: HTMLCanvasElement;

  if (svgElement == null) {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const uiElementImageData = new ImageData(width, height);
    uiElementImageData.data.set(
      new Uint8ClampedArray(Object.values(elementImageData)),
    );

    const imageBitmap = await createImageBitmap(uiElementImageData);

    context?.drawImage(imageBitmap, 0, 0);
  }

  // Find the link that triggered the event
  const link = document.querySelector(`a[href="${linkUrl}"]`);
  if (!link) {
    console.error('Could not find the source link on the page.');
    return;
  }

  const linkRect = link.getBoundingClientRect();

  // Create the video container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = `${window.scrollY + linkRect.bottom}px`;
  container.style.left = `${window.scrollX + linkRect.left}px`;
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.border = '2px solid #007bff';
  container.style.borderRadius = '8px';
  container.style.overflow = 'hidden';
  container.style.zIndex = '9999';
  container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  container.style.backgroundColor = '#fff';

  // Create the video element
  if (svgElement) {
    container.innerHTML = svgElement;
  } else if (canvas != null) {
    container.appendChild(canvas);
  }
  // Create a close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '5px';
  closeButton.style.right = '5px';
  closeButton.style.zIndex = '10000';
  closeButton.style.background = 'rgba(0,0,0,0.5)';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '50%';
  closeButton.style.width = '24px';
  closeButton.style.height = '24px';
  closeButton.style.lineHeight = '24px';
  closeButton.style.textAlign = 'center';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontSize = '18px';
  closeButton.onclick = () => {
    container.remove();
  };

  container.appendChild(closeButton);
  document.body.appendChild(container);
};

document.addEventListener(
  'contextmenu',
  async function (event) {
    if (event.target.tagName !== 'A') {
      return;
    }
    const href = event.target.getAttribute('href');
    if (!href) {
      chrome.runtime.sendMessage({
        message: 'updateContextMenu',
        enabled: false,
      });
    }

    const url = new URL(href);
    const hash = url.hash.slice(1); // Remove the '#'
    const params = new URLSearchParams(hash);
    const selector = params.get(':ui:');

    await chrome.runtime.sendMessage({
      message: 'updateContextMenu',
      enabled: !!selector,
    });
  },
  true,
);
