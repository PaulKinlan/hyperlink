import { pipeline, env } from '@xenova/transformers';

// Since we will not be using a bundler, we must load the model from a URL.
// This is a placeholder and should be replaced with the actual model URL.
env.allowLocalModels = false;

// The pipeline function will be used to create the transcription pipeline.
let transcriber: any;

chrome.runtime.onMessage.addListener(async (message: any) => {
  if (message.type === 'find-audio-fragment') {
    if (!transcriber) {
      // Load the Whisper model
      transcriber = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny.en',
      );
    }

    const { src, text } = message.payload;

    // Transcribe the audio
    const transcription = await transcriber(src, {
      chunk_length_s: 30,
      stride_length_s: 5,
      language: 'english',
      task: 'transcribe',
    });

    // Find the timestamp of the text
    const chunk = transcription.chunks.find((chunk: any) =>
      chunk.text.toLowerCase().includes(text.toLowerCase()),
    );

    if (chunk) {
      const timestamp = chunk.timestamp[0];
      chrome.runtime.sendMessage({
        type: 'audio-fragment-found',
        payload: {
          src,
          timestamp,
        },
      });
    }
  }
});
