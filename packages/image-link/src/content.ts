import { float32ArrayToCanvas, resizeCanvas, sliceTensor } from './imageutils';

let isOptionKeyPressed = false;
let currentImage: HTMLImageElement | null = null;
const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

document.addEventListener('keydown', (event) => {
  if (event.key === 'Alt') {
    isOptionKeyPressed = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'Alt') {
    isOptionKeyPressed = false;
  }
});

document.addEventListener('mouseover', (event) => {
  if (isOptionKeyPressed && event.target instanceof HTMLImageElement) {
    currentImage = event.target;
    handleImageHover(currentImage);
  }
});

document.addEventListener('mouseout', (event) => {
  if (
    event.target instanceof HTMLImageElement &&
    event.target == currentImage
  ) {
    currentImage = null;
  }
});

async function handleImageHover(image: HTMLImageElement) {
  const { src } = image;

  const encodedSrc = src.replace(/[^a-zA-Z0-9]/g, '_');
  const cachedImage = document.querySelector(
    `canvas[data-src="${encodedSrc}"]`,
  );
  if (cachedImage) {
    console.log('Using cached image:', cachedImage);
    return; // Already processed this image
  }

  const canvas = document.createElement('canvas');
  canvas.setAttribute('data-src', encodedSrc);
  canvas.width = 1024; //image.naturalWidth;
  canvas.height = 1024; //  image.naturalWidth;
  canvas.style.position = 'absolute';
  canvas.style.top = image.offsetTop + 'px';
  canvas.style.left = image.offsetLeft + 'px';
  canvas.style.width = image.width + 'px';
  canvas.style.height = image.height + 'px';
  canvas.style.zIndex = '1000';

  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  context.drawImage(image, 0, 0, 1024, 1024);
  const imageData = context.getImageData(0, 0, 1024, 1024);

  const imageResponse = await chrome.runtime.sendMessage({
    action: 'encodeImage',
    name: src,
    imageData: new Uint8Array(imageData.data),
    height: 1024,
    width: 1024,
  });

  console.log('Encoded image:', imageResponse);

  canvas.style.pointerEvents = 'auto';
  canvas.addEventListener('click', async (event) => {
    const rect = canvas.getBoundingClientRect();
    // Need to scale the click coordinates to the image size
    // Assuming the canvas is 1024x1024, scale from image accordingly
    const x = (event.clientX - rect.left) * (canvas.width / image.width);
    const y = (event.clientY - rect.top) * (canvas.height / image.height);
    console.log(`Clicked at (${x}, ${y}) on image: ${src}`);
    const decodeResult = await chrome.runtime.sendMessage({
      action: 'decodeMask',
      name: src,
      maskData: {
        points: [{ x, y, label: 1 }],
        maskArray: null,
        maskShape: null,
      },
    });
    console.log('Decoded mask:', decodeResult);

    // fix decodeResults because of JSON serialization
    decodeResult.iou_predictions.cpuData = new Float32Array(
      Object.values(decodeResult.iou_predictions.cpuData),
    );
    decodeResult.masks.cpuData = new Float32Array(
      Object.values(decodeResult.masks.cpuData),
    );

    const imageSize = { w: 1024, h: 1024 };
    const maskTensors = decodeResult.masks;
    const [bs, noMasks, width, height] = maskTensors.dims;
    const maskScores = decodeResult.iou_predictions.cpuData;
    const bestMaskIdx = maskScores.indexOf(Math.max(...maskScores));
    const bestMaskArray = sliceTensor(maskTensors, bestMaskIdx);
    let bestMaskCanvas = float32ArrayToCanvas(bestMaskArray, width, height);
    bestMaskCanvas = resizeCanvas(bestMaskCanvas, imageSize);

    context.drawImage(bestMaskCanvas, 0, 0);

    const objectName = 'object';
    const index = 0;
    const url = `${image.src}#${objectName}_${index}`;
    navigator.clipboard.writeText(url);
    console.log(`Copied to clipboard: ${url}`);
  });
}
