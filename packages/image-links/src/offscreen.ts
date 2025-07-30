import * as ort from 'onnxruntime-web';
import { SAM2 } from './sam';

const samCache: { [key: string]: SAM2 } = {};

function Uint8ArrayToFloat32Array(
  imageData: Uint8Array,
  width: number,
  height: number,
) {
  const shape = [1, 3, width, height];

  const [redArray, greenArray, blueArray]: [number[], number[], number[]] = [
    [],
    [],
    [],
  ];

  for (let i = 0; i < imageData.length; i += 4) {
    redArray.push(imageData[i]);
    greenArray.push(imageData[i + 1]);
    blueArray.push(imageData[i + 2]);
    // skip data[i + 3] to filter out the alpha channel
  }

  const transposedData = redArray.concat(greenArray).concat(blueArray);

  let i,
    l = transposedData.length;
  const float32Array = new Float32Array(shape[1] * shape[2] * shape[3]);
  for (i = 0; i < l; i++) {
    float32Array[i] = transposedData[i] / 255.0; // convert to float
  }

  return { float32Array, shape };
}

const getSAMInstance = async (name: string) => {
  if (samCache[name]) {
    return samCache[name];
  } else {
    const sam = new SAM2();
    await sam.downloadModels();
    await sam.createSessions();
    samCache[name] = sam;
    return sam;
  }
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.target !== 'offscreen') {
    return false;
  }
  console.log('Received message:', request, sender);
  handleMessage(request, sender).then((response) => {
    console.log('Response from offscreen:', request, response);
    // Forward the response back to the content script
    sendResponse(response);
  });
  return true; // Keep the message channel open for async response
});

const handleMessage = async (request, sender) => {
  if (request.action === 'encodeImage') {
    let sam = await getSAMInstance(request.name);
    if (sam.image_encoded) {
      return { imageEncoded: true };
    }

    const { float32Array, shape } = Uint8ArrayToFloat32Array(
      new Uint8Array(Object.values(request.imageData)),
      request.width,
      request.height,
    );
    const imgTensor = new ort.Tensor('float32', float32Array, shape);

    await sam.encodeImage(imgTensor);
    console.log('Encoded image:', sam.image_encoded);

    return sam.image_encoded;
  }

  if (request.action === 'decodeMask') {
    let sam = await getSAMInstance(request.name);

    const { image_encoded } = sam;

    const { points, maskArray, maskShape } = request.maskData;

    const startTime = performance.now();

    let decodingResults;

    //const maskTensor = new ort.Tensor('float32', maskArray, maskShape);
    decodingResults = await sam.decode(points, null);

    // decodingResults = Tensor [B=1, Masks, W, H]
    console.log(`Decoding took ${performance.now() - startTime} ms`);
    console.log('Decoding results:', decodingResults);

    return decodingResults;
    // masks = Tensor [B=1, Masks, W, H]
    // decodingResults = Tensor [B=1, Masks, W, H]
  }
};
