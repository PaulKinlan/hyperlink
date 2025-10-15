import fs from 'fs/promises';
import path from 'path';

// --- Configuration ---
// The directory where the files will be downloaded.
const OUTPUT_DIR = path.join(process.cwd(), 'dist', 'wasm');

// List of the essential ONNX runtime files needed by Transformers.js.
const FILES_TO_DOWNLOAD = [
  'ort-wasm.wasm',
  'ort-wasm-simd.wasm',
  'ort-wasm-threaded.wasm',
  'ort-wasm-simd-threaded.wasm',
  'ort-wasm.jsep.mjs',
  'ort-wasm-simd.jsep.mjs',
  'ort-wasm-threaded.jsep.mjs',
  'ort-wasm-simd-threaded.jsep.mjs',
  'transformers.js',
  'transformers.js.map',
  'transformers.min.js',
  'transformers.min.js.map',
  'transformers.node.cjs',
  'transformers.node.cjs.map',
  'transformers.node.min.cjs',
  'transformers.node.min.cjs.map',
  'transformers.node.min.mjs',
  'transformers.node.min.mjs.map',
  'transformers.node.mjs',
  'transformers.node.mjs.map',
  'transformers.web.js',
  'transformers.web.js.map',
  'transformers.web.min.js',
  'transformers.web.min.js.map',
];
// -------------------

/**
 * Reads the project's package.json to find the installed version of transformers.
 * @returns {Promise<string>} The version string (e.g., "3.7.2").
 */
async function getLibraryVersion() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    const version =
      packageJson.dependencies?.['@huggingface/transformers'] ||
      packageJson.devDependencies?.['@huggingface/transformers'];

    if (!version) {
      throw new Error(
        'Could not find "@huggingface/transformers" in package.json dependencies.',
      );
    }
    // Return the version, removing any prefixes like '^' or '~'.
    return version.replace(/[\^~]/g, '');
  } catch (error) {
    console.error(`Error reading version from package.json: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Downloads a single file from the JSDelivr CDN.
 * @param {string} fileName The name of the file to download.
 * @param {string} version The library version to use for the URL.
 */
async function downloadFile(fileName, version) {
  const cdnUrl = `https://cdn.jsdelivr.net/npm/@huggingface/transformers@${version}/dist/${fileName}`;
  const outputPath = path.join(OUTPUT_DIR, fileName);

  try {
    const response = await fetch(cdnUrl);
    if (!response.ok) {
      // If the file is not found (404), we can skip it.
      if (response.status === 404) {
        console.warn(
          `- Skipping ${fileName}: Not found on CDN for version ${version}.`,
        );
        return; // Don't treat as a failure
      }
      throw new Error(
        `Failed to download ${fileName}. Status: ${response.status} ${response.statusText}`,
      );
    }

    const fileBuffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(outputPath, fileBuffer);
    console.log(`- Downloaded ${fileName} to ${outputPath}`);
  } catch (error) {
    console.error(`Error downloading ${fileName}: ${error.message}`);
    throw error; // Propagate the error to stop the script
  }
}

/**
 * Main function to orchestrate the download process.
 */
async function main() {
  console.log('Downloading Transformers.js WASM files from CDN...');
  const version = await getLibraryVersion();
  console.log(`Detected @huggingface/transformers version: ${version}`);

  try {
    // Ensure the output directory exists.
    try {
      await fs.stat(OUTPUT_DIR); //
    } catch (error) {
      console.error(`Error checking output directory: ${error.message}`);
      console.log(`Output directory does not exist: ${OUTPUT_DIR}`);
      await fs.mkdir(OUTPUT_DIR, { recursive: true });
    }

    console.log(FILES_TO_DOWNLOAD.length, 'files to download:');
    // Create and execute all download promises.
    const downloadPromises = FILES_TO_DOWNLOAD.map((file) =>
      downloadFile(file, version),
    );
    await Promise.all(downloadPromises);

    console.log('\n✅ All available WASM files downloaded successfully!');
  } catch (error) {
    console.error(
      '\n❌ Build script failed. Could not download all required files.',
    );
    process.exit(1);
  }
}

main();
