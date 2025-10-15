const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

import { pipeline, env } from '@huggingface/transformers';

env.backends.onnx.wasm.wasmPaths = {
  'ort-wasm.wasm': chrome.runtime.getURL('dist/wasm/ort-wasm.wasm'),
  'ort-wasm-simd.wasm': chrome.runtime.getURL('dist/wasm/ort-wasm-simd.wasm'),
  'ort-wasm-threaded.wasm': chrome.runtime.getURL(
    'dist/wasm/ort-wasm-threaded.wasm',
  ),
  'ort-wasm-simd-threaded.wasm': chrome.runtime.getURL(
    'dist/wasm/ort-wasm-simd-threaded.wasm',
  ),
  'ort-wasm-simd-threaded.mjs': chrome.runtime.getURL(
    'dist/wasm/ort-wasm-simd-threaded.mjs',
  ),
  'ort-wasm-simd-threaded.jesp.mjs': chrome.runtime.getURL(
    'dist/wasm/ort-wasm-simd-threaded.jesp.mjs',
  ),
};

env.allowLocalModels = true;

// **THE FIX: Force single-threaded execution to avoid dynamic import()** 🧑‍💻
// This tells the library to use a WASM backend version that doesn't
// need to dynamically import worker scripts.
env.backends.onnx.wasm.numThreads = 1;
class PipelineSingleton {
  static task = 'image-segmentation';
  static model = 'Xenova/detr-resnet-50-panoptic';
  static instance = null;

  static async getInstance(progress_callback = null) {
    this.instance ??= pipeline(this.task, this.model, {
      progress_callback,
      local_files_only: true,
    });

    return this.instance;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender).then((response) => {
    console.log('Response from offscreen:', request, response);
    // Forward the response back to the content script
    sendResponse(response);
  });
  return true; // Keep the message channel open for async response
});

const handleMessage = async (request, sender) => {
  if (request.action === 'encodeImage') {
    // Create the offscreen document if it doesn't exist
    if (!(await hasOffscreenDocument())) {
      await chrome.offscreen.createDocument({
        url: OFFSCREEN_DOCUMENT_PATH,
        reasons: [chrome.offscreen.Reason.DOM_SCRAPING],
        justification: 'Analyzing images in the background',
      });
    }

    const pipeline = await PipelineSingleton.getInstance(console.log);
    const segmentation = await pipeline(request.imageData);

    // const imageResponse = await chrome.runtime.sendMessage({
    //   target: 'offscreen',
    //   action: 'encodeImage',
    //   name: request.name,
    //   imageData: request.imageData,
    //   height: request.height,
    //   width: request.width,
    // });

    return imageResponse;
  } else if (request.action === 'decodeMask') {
    // Create the offscreen document if it doesn't exist
    if (!(await hasOffscreenDocument())) {
      await chrome.offscreen.createDocument({
        url: OFFSCREEN_DOCUMENT_PATH,
        reasons: [chrome.offscreen.Reason.DOM_SCRAPING],
        justification: 'Decoding masks in the background',
      });
    }

    const decodingResults = await chrome.runtime.sendMessage({
      target: 'offscreen',
      action: 'decodeMask',
      name: request.name,
      maskData: request.maskData,
    });

    return decodingResults;
  }
};

async function hasOffscreenDocument() {
  // @ts-expect-error - clients is not in the types
  const matchedClients = await clients.matchAll();
  for (const client of matchedClients) {
    if (client.url.endsWith(OFFSCREEN_DOCUMENT_PATH)) {
      return true;
    }
  }
  return false;
}
