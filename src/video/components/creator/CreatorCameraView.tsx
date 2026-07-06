import { useStyles } from "@/core/hooks/useStyles";
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { VideoTimelineScrubber } from './VideoTimelineScrubber';
import { VideoEditor } from '../../core/editor/VideoEditor';
export const CreatorCameraView = () => {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center'
    },
    cameraView: {
      flex: 1,
      width: '100%',
      justifyContent: 'flex-end'
    },
    editorContainer: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center'
    },
    controlsContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 40
    },
    recordButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 5,
      borderColor: colors.text,
      backgroundColor: 'transparent'
    },
    recordingActive: {
      backgroundColor: '#ff0000',
      borderColor: '#ff0000'
    },
    text: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold'
    },
    subtext: {
      color: 'gray',
      fontSize: 12,
      marginTop: 10,
      textAlign: 'center'
    },
    actionButton: {
      marginTop: 20,
      padding: 15,
      backgroundColor: '#ff0050',
      borderRadius: 8
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold'
    }
  }));
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const micStatus = await Camera.requestMicrophonePermissionsAsync();
      setHasPermission(cameraStatus.status === 'granted' && micStatus.status === 'granted');
    })();
  }, []);
  const handleRecordVideo = async () => {
    if (cameraRef.current) {
      if (isRecording) {
        setIsRecording(false);
        cameraRef.current.stopRecording();
      } else {
        setIsRecording(true);
        try {
          const videoData = await cameraRef.current.recordAsync({
            maxDuration: 60
          });
          setRecordedVideoUri(videoData.uri);
        } catch (error) {
          console.error('[CreatorCameraView] Record error', error);
          setIsRecording(false);
        }
      }
    }
  };
  const handleTrim = async (startMs: number, endMs: number) => {
    if (!recordedVideoUri) return;
    console.log(`[CreatorCameraView] Requesting trim from ${startMs}ms to ${endMs}ms`);
    // Example hookup to VideoEditor
    const output = await VideoEditor.trimVideo(recordedVideoUri, startMs, endMs);
    console.log('[CreatorCameraView] Trimmed output:', output);
  };
  if (hasPermission === null) {
    return <View style={styles.container}><Text style={styles.text}>Requesting permissions...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text style={styles.text}>No access to camera or microphone</Text></View>;
  }
  return <View style={styles.container}>
      {!recordedVideoUri ? <CameraView ref={cameraRef} style={styles.cameraView} facing="back" mode="video">
          <View style={styles.controlsContainer}>
            <TouchableOpacity onPress={handleRecordVideo} style={[styles.recordButton, isRecording && styles.recordingActive]} />
          </View>
        </CameraView> : <View style={styles.editorContainer}>
          <Text style={styles.text}>Preview & Edit Mode</Text>
          <Text style={styles.subtext}>Video saved to: {recordedVideoUri}</Text>
          <VideoTimelineScrubber duration={60000} onTrimChange={handleTrim} />
          
          <TouchableOpacity style={styles.actionButton} onPress={() => setRecordedVideoUri(null)}>
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
        </View>}
    </View>;
};