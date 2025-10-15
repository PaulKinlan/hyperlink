// scripts/download-models.js
import https from 'https';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import { fileURLToPath } from 'url';

// Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
// This script now only downloads the specified models from Hugging Face.
const HUGGING_FACE_HUB_URL = 'https://huggingface.co';

const FILES_TO_DOWNLOAD = {
  // Models from Hugging Face
  models: [
    {
      repo: 'Xenova/detr-resnet-50-panoptic',
      files: [
        'config.json',
        //'tokenizer.json',
        //'tokenizer_config.json',
        'preprocessor_config.json',
        'onnx/model.onnx',
      ],
    },
    // Add other models here if needed
    // {
    //   repo: 'Xenova/another-model',
    //   files: ['config.json', 'onnx/model.onnx'],
    // },
  ],
};

/**
 * Helper function to download a file from a URL to a specific path using native https.
 * @param {string} fileUrl The URL to download from.
 * @param {string} outputPath The path to save the file to.
 */
function downloadFile(fileUrl, outputPath) {
  return new Promise(async (resolve, reject) => {
    const dir = path.dirname(outputPath);
    // Ensure the output directory exists
    await fs.promises.mkdir(dir, { recursive: true });

    // Check if the file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`- File already exists, skipping: ${outputPath}`);
      resolve();
      return;
    }

    console.log(`- Downloading ${fileUrl} to ${outputPath}...`);

    const request = https.get(fileUrl, (response) => {
      // Handle redirects
      if (
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        const redirectUrl = new URL(response.headers.location, fileUrl).href;
        console.log(`- Redirected to ${redirectUrl}`);
        downloadFile(redirectUrl, outputPath).then(resolve).catch(reject);
        return;
      }

      // Handle non-successful status codes
      if (response.statusCode !== 200) {
        reject(
          new Error(`Failed to get '${fileUrl}' (${response.statusCode})`),
        );
        return;
      }

      const writer = fs.createWriteStream(outputPath);
      response.pipe(writer);

      writer.on('finish', () => {
        writer.close();
        resolve();
      });
      writer.on('error', (err) => {
        fs.unlink(outputPath, () => reject(err)); // Clean up on error
      });
    });

    request.on('error', (err) => {
      fs.unlink(outputPath, () => reject(err)); // Clean up on error
    });
  });
}

/**
 * Main function to orchestrate the download process.
 */
async function main() {
  console.log('Starting Hugging Face model download process...');

  try {
    // Download models
    for (const model of FILES_TO_DOWNLOAD.models) {
      for (const file of model.files) {
        const fileUrl = `${HUGGING_FACE_HUB_URL}/${model.repo}/resolve/main/${file}`;
        const outputPath = path.join(
          __dirname,
          '..',
          'models',
          model.repo,
          file,
        );
        await downloadFile(fileUrl, outputPath);
      }
    }

    console.log('\n✅ All model files downloaded successfully!');
  } catch (error) {
    console.error(
      `\n❌ An error occurred during the download process: ${error.message}`,
    );
    process.exit(1);
  }
}

// Execute the main function
main();
