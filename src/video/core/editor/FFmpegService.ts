import { Platform } from 'react-native';

// Web imports (these will be ignored safely by metro on native if not strictly required, but usually we handle this via dynamic imports or file extensions)
// For Web, we use @ffmpeg/ffmpeg
let FFmpegWeb: any = null;
let fetchFileWeb: any = null;
let toBlobURLWeb: any = null;

if (Platform.OS === 'web') {
  // Dynamically require web dependencies so native builds don't crash trying to link them
  const { FFmpeg } = require('@ffmpeg/ffmpeg');
  const { fetchFile } = require('@ffmpeg/util');
  const { toBlobURL } = require('@ffmpeg/util');
  FFmpegWeb = FFmpeg;
  fetchFileWeb = fetchFile;
  toBlobURLWeb = toBlobURL;
}

export class FFmpegService {
  private static ffmpegInstance: any = null;

  /**
   * Initializes the FFmpeg engine.
   * On Web, it downloads the WebAssembly core.
   * On Native, FFmpegKit is already bundled in the C++ layer.
   */
  static async initialize() {
    if (Platform.OS === 'web') {
      if (this.ffmpegInstance) return;
      
      this.ffmpegInstance = new FFmpegWeb();
      this.ffmpegInstance.on('log', ({ message }: any) => {
        console.log('[FFmpeg Web]', message);
      });

      // Load ffmpeg.wasm-core
      // baseURL could be a CDN or local public folder
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await this.ffmpegInstance.load({
        coreURL: await toBlobURLWeb(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURLWeb(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      console.log('[FFmpeg Web] Engine loaded successfully');
    } else {
      console.log('[FFmpeg Native] Ready');
    }
  }

  /**
   * Executes a raw FFmpeg command array
   * @param args Array of FFmpeg arguments e.g., ['-i', 'input.mp4', '-c', 'copy', 'output.mp4']
   * @param inputFiles Record of filename to URI mappings to write to virtual FS (Web only)
   * @param outputFileName Expected output filename to read from virtual FS (Web only)
   * @returns Blob URL on Web, or local file URI on Native
   */
  static async execute(args: string[], inputFiles?: Record<string, string>, outputFileName?: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      await this.initialize();
      const ffmpeg = this.ffmpegInstance;

      // 1. Write input files to virtual FS
      if (inputFiles) {
        for (const [fileName, uri] of Object.entries(inputFiles)) {
          const fileData = await fetchFileWeb(uri);
          await ffmpeg.writeFile(fileName, fileData);
        }
      }

      // 2. Execute command
      console.log('[FFmpeg Web] Executing:', args.join(' '));
      const code = await ffmpeg.exec(args);
      if (code !== 0) {
        console.error('[FFmpeg Web] Execution failed with code', code);
        return null;
      }

      // 3. Read output and convert to Blob
      if (outputFileName) {
        const data = await ffmpeg.readFile(outputFileName);
        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        return URL.createObjectURL(blob);
      }
      return null;
    } else {
      // Native Mobile Implementation using FFmpegKit
      // const { FFmpegKit } = require('@wokcito/ffmpeg-kit-react-native');
      // const commandString = args.join(' ');
      // console.log('[FFmpeg Native] Executing:', commandString);
      // 
      // const session = await FFmpegKit.execute(commandString);
      // const returnCode = await session.getReturnCode();
      // 
      // if (returnCode.isValueSuccess()) {
      //   console.log('[FFmpeg Native] Success');
      //   // The output file URI should be managed by the caller
      //   return 'success';
      // } else {
      //   console.error('[FFmpeg Native] Failed. Output:', await session.getOutput());
      //   return null;
      // }
      return null;
    }
  }
}
