import React from 'react';

const preferredMimeTypes = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
];

const getSupportedMimeType = () => {
  if (typeof window === 'undefined' || typeof window.MediaRecorder === 'undefined') return '';
  return preferredMimeTypes.find((type) => window.MediaRecorder.isTypeSupported?.(type)) || '';
};

const extensionForMimeType = (mimeType) => {
  if (!mimeType) return 'webm';
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mp4') || mimeType.includes('m4a')) return 'm4a';
  if (mimeType.includes('mpeg') || mimeType.includes('mp3')) return 'mp3';
  if (mimeType.includes('wav')) return 'wav';
  return 'webm';
};

const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingError, setRecordingError] = React.useState('');
  const [recordedFile, setRecordedFile] = React.useState(null);
  const [recordedUrl, setRecordedUrl] = React.useState('');

  const recorderRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const chunksRef = React.useRef([]);

  const clearRecordedAudio = React.useCallback(() => {
    if (recordedUrl) {
      window.URL.revokeObjectURL(recordedUrl);
    }
    setRecordedFile(null);
    setRecordedUrl('');
  }, [recordedUrl]);

  React.useEffect(() => () => {
    if (recordedUrl) window.URL.revokeObjectURL(recordedUrl);
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
  }, [recordedUrl]);

  const startRecording = React.useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder === 'undefined') {
      setRecordingError('Voice recording is not supported in this browser.');
      return false;
    }

    clearRecordedAudio();
    setRecordingError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const recorder = mimeType ? new window.MediaRecorder(stream, { mimeType }) : new window.MediaRecorder(stream);
      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const nextMimeType = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: nextMimeType });
        const extension = extensionForMimeType(nextMimeType);
        const file = new File([blob], `voice-message-${Date.now()}.${extension}`, { type: nextMimeType });
        const objectUrl = window.URL.createObjectURL(blob);
        setRecordedFile(file);
        setRecordedUrl(objectUrl);
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        chunksRef.current = [];
      };

      recorder.onerror = () => {
        setRecordingError('Unable to record voice right now.');
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);
      return true;
    } catch (error) {
      setRecordingError(error?.name === 'NotAllowedError'
        ? 'Microphone access was denied.'
        : 'Unable to access the microphone.');
      setIsRecording(false);
      return false;
    }
  }, [clearRecordedAudio]);

  const stopRecording = React.useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
  }, []);

  return {
    isRecording,
    recordingError,
    recordedFile,
    recordedUrl,
    setRecordingError,
    startRecording,
    stopRecording,
    clearRecordedAudio,
  };
};

export default useVoiceRecorder;
