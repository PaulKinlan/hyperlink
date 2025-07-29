import * as ort from 'onnxruntime-web';
import { SAM2 } from './sam';
import { float32ArrayToCanvas } from './imageutils';

let isOptionKeyPressed = false;
let currentImage: HTMLImageElement | null = null;
let sam: SAM2 | null = null;

document.addEventListener('keydown', (event) => {
  if (event.key === 'Alt') {
    isOptionKeyPressed = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'Alt') {
    isOptionKeyPressed = false;
    if (currentImage) {
      // areset a canvas or something
    }
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
  if (!sam) {
    sam = new SAM2();
    await sam.downloadModels();
    await sam.createSessions();
  }

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.style.position = 'absolute';
  canvas.style.top = image.offsetTop + 'px';
  canvas.style.left = image.offsetLeft + 'px';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  context.drawImage(image, 0, 0, image.width, image.height);
  const imageData = context.getImageData(0, 0, image.width, image.height);

  const tensor = new ort.Tensor('uint8', new Uint8Array(imageData.data), [
    image.height,
    image.width,
    4,
  ]);
  await sam.encodeImage(tensor);

  canvas.style.pointerEvents = 'auto';
  canvas.addEventListener('click', async (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const results = await sam.decode([{ x, y, label: 1 }], null);
    const mask = results['masks'];
    const maskCanvas = float32ArrayToCanvas(
      mask.data as Float32Array,
      mask.dims[3],
      mask.dims[2],
    );
    context.drawImage(maskCanvas, 0, 0);

    const objectName = 'object';
    const index = 0;
    const url = `${image.src}#${objectName}_${index}`;
    navigator.clipboard.writeText(url);
    console.log(`Copied to clipboard: ${url}`);
  });
}
