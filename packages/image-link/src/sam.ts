import * as ort from 'onnxruntime-web/all';

// see https://github.com/geronimi73/next-sam/blob/main/app/SAM2.js

const ENCODER_URL =
  'https://huggingface.co/g-ronimo/sam2-tiny/resolve/main/sam2_hiera_tiny_encoder.with_runtime_opt.ort';
const DECODER_URL =
  'https://huggingface.co/g-ronimo/sam2-tiny/resolve/main/sam2_hiera_tiny_decoder_pr1.onnx';

export class SAM2 {
  bufferEncoder: ArrayBuffer | null = null;
  bufferDecoder: ArrayBuffer | null = null;
  sessionEncoder: [ort.InferenceSession, string] | null = null;
  sessionDecoder: [ort.InferenceSession, string] | null = null;
  image_encoded: {
    high_res_feats_0: ort.Tensor;
    high_res_feats_1: ort.Tensor;
    image_embed: ort.Tensor;
  } | null = null;

  constructor() {}

  async downloadModels() {
    this.bufferEncoder = await this.downloadModel(ENCODER_URL);
    this.bufferDecoder = await this.downloadModel(DECODER_URL);
  }

  async downloadModel(url: string) {
    const filename = url.split('/').pop()!;
    const root = await navigator.storage.getDirectory();

    let fileHandle = await root
      .getFileHandle(filename)
      .catch((e) => console.error('File does not exist:', filename, e));

    if (fileHandle) {
      const file = await fileHandle.getFile();
      if (file.size > 0) return await file.arrayBuffer();
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();

      try {
        const fileHandle = await root.getFileHandle(filename, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(buffer);
        await writable.close();

        console.log('Stored ' + filename);
      } catch (e) {
        console.error('Storage of ' + filename + ' failed: ', e);
      }

      return buffer;
    } catch (e) {
      console.error('Download of ' + url + ' failed: ', e);
      return null;
    }
  }

  async createSessions() {
    const success =
      (await this.getEncoderSession()) && (await this.getDecoderSession());

    return {
      success: success,
      device: success ? this.sessionEncoder![1] : null,
    };
  }

  async getORTSession(
    model: ArrayBuffer,
  ): Promise<[ort.InferenceSession, string] | null> {
    for (let ep of ['webgpu', 'cpu']) {
      try {
        const session = await ort.InferenceSession.create(model, {
          executionProviders: [ep],
        });
        return [session, ep];
      } catch (e) {
        console.error(e);
        continue;
      }
    }
    return null;
  }

  async getEncoderSession() {
    if (!this.sessionEncoder)
      this.sessionEncoder = await this.getORTSession(this.bufferEncoder!);

    return this.sessionEncoder;
  }

  async getDecoderSession() {
    if (!this.sessionDecoder)
      this.sessionDecoder = await this.getORTSession(this.bufferDecoder!);

    return this.sessionDecoder;
  }

  async encodeImage(inputTensor: ort.Tensor) {
    const [session, device] = (await this.getEncoderSession()) as [
      ort.InferenceSession,
      string,
    ];
    const results = await session.run({ image: inputTensor });

    this.image_encoded = {
      high_res_feats_0: results[session.outputNames[0]],
      high_res_feats_1: results[session.outputNames[1]],
      image_embed: results[session.outputNames[2]],
    };
  }

  async decode(
    points: { x: number; y: number; label: number }[],
    masks: ort.Tensor | null,
  ) {
    const [session, device] = (await this.getDecoderSession()) as [
      ort.InferenceSession,
      string,
    ];

    const flatPoints = points.map((point) => {
      return [point.x, point.y];
    });

    const flatLabels = points.map((point) => {
      return point.label;
    });

    let mask_input, has_mask_input;
    if (masks) {
      mask_input = masks;
      has_mask_input = new ort.Tensor('float32', [1], [1]);
    } else {
      // dummy data
      mask_input = new ort.Tensor(
        'float32',
        new Float32Array(256 * 256),
        [1, 1, 256, 256],
      );
      has_mask_input = new ort.Tensor('float32', [0], [1]);
    }

    const inputs = {
      image_embed: this.image_encoded!.image_embed,
      high_res_feats_0: this.image_encoded!.high_res_feats_0,
      high_res_feats_1: this.image_encoded!.high_res_feats_1,
      point_coords: new ort.Tensor('float32', flatPoints.flat(), [
        1,
        flatPoints.length,
        2,
      ]),
      point_labels: new ort.Tensor('float32', flatLabels, [
        1,
        flatLabels.length,
      ]),
      mask_input: mask_input,
      has_mask_input: has_mask_input,
    };

    return await session.run(inputs);
  }
}
