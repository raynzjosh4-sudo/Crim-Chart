import { Platform } from 'react-native';
import { FFmpegService } from './FFmpegService';

export class VideoEditor {
  /**
   * Trims a video from start time to end time.
   * @param inputUri The local or remote URI of the video
   * @param startMs Start time in milliseconds
   * @param endMs End time in milliseconds
   * @returns The output URI of the trimmed video
   */
  static async trimVideo(inputUri: string, startMs: number, endMs: number): Promise<string | null> {
    const startSec = (startMs / 1000).toFixed(3);
    const endSec = (endMs / 1000).toFixed(3);
    
    // Example: ffmpeg -ss 00:00:01.500 -to 00:00:05.000 -i input.mp4 -c copy output.mp4
    const args = [
      '-ss', startSec,
      '-to', endSec,
      '-i', Platform.OS === 'web' ? 'input_trim.mp4' : inputUri,
      '-c', 'copy',
      Platform.OS === 'web' ? 'output_trim.mp4' : 'file:///tmp/output_trim.mp4'
    ];

    const inputFiles = Platform.OS === 'web' ? { 'input_trim.mp4': inputUri } : undefined;
    const outputFileName = Platform.OS === 'web' ? 'output_trim.mp4' : undefined;

    return await FFmpegService.execute(args, inputFiles, outputFileName);
  }

  /**
   * Stitches an audio track over the video. Mutes the original video audio.
   * Loops the audio if it's shorter than the video, or trims it if it's longer.
   * @param videoUri The video to overlay
   * @param audioUri The audio track to add
   */
  static async mixAudio(videoUri: string, audioUri: string): Promise<string | null> {
    // Example: ffmpeg -i video.mp4 -stream_loop -1 -i audio.mp3 -c:v copy -map 0:v:0 -map 1:a:0 -shortest output.mp4
    const args = [
      '-i', Platform.OS === 'web' ? 'input_video.mp4' : videoUri,
      '-stream_loop', '-1',
      '-i', Platform.OS === 'web' ? 'input_audio.mp3' : audioUri,
      '-c:v', 'copy',
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-shortest',
      Platform.OS === 'web' ? 'output_mix.mp4' : 'file:///tmp/output_mix.mp4'
    ];

    const inputFiles = Platform.OS === 'web' ? { 
      'input_video.mp4': videoUri,
      'input_audio.mp3': audioUri
    } : undefined;
    const outputFileName = Platform.OS === 'web' ? 'output_mix.mp4' : undefined;

    return await FFmpegService.execute(args, inputFiles, outputFileName);
  }
}
