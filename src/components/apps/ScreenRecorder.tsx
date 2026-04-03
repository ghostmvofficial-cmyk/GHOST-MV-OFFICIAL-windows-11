import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Square, 
  Download, 
  Video, 
  Monitor, 
  Layout, 
  Settings, 
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const ScreenRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'screen' | 'window'>('screen');
  const [isPreparing, setIsPreparing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    setError(null);
    setIsPreparing(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: mode === 'screen' ? 'monitor' : 'window',
        },
        audio: true
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        setRecordingUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setRecordedBlob(null);
      setRecordingUrl(null);
    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError(err.message || 'Failed to start recording. Please ensure you have given permission.');
    } finally {
      setIsPreparing(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadRecording = () => {
    if (recordingUrl) {
      const a = document.createElement('a');
      a.href = recordingUrl;
      a.download = `recording-${new Date().getTime()}.webm`;
      a.click();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Screen Recorder</h2>
            <p className="text-[10px] opacity-60">Capture your screen or windows</p>
          </div>
        </div>
        
        {isRecording && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full animate-pulse">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-mono font-bold">{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-600"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold mb-1">Recording Error</p>
                <p className="opacity-80">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recording Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setMode('screen')}
            disabled={isRecording}
            className={cn(
              "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center",
              mode === 'screen' 
                ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400" 
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100",
              isRecording && "opacity-40 cursor-not-allowed"
            )}
          >
            <Monitor className="w-8 h-8" />
            <div>
              <p className="text-sm font-bold">Entire Screen</p>
              <p className="text-[10px] opacity-60">Capture everything on your display</p>
            </div>
          </button>

          <button 
            onClick={() => setMode('window')}
            disabled={isRecording}
            className={cn(
              "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center",
              mode === 'window' 
                ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400" 
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100",
              isRecording && "opacity-40 cursor-not-allowed"
            )}
          >
            <Layout className="w-8 h-8" />
            <div>
              <p className="text-sm font-bold">Specific Window</p>
              <p className="text-[10px] opacity-60">Select a single application window</p>
            </div>
          </button>
        </div>

        {/* Main Action Button */}
        <div className="flex flex-col items-center justify-center py-8">
          {!isRecording ? (
            <button 
              onClick={startRecording}
              disabled={isPreparing}
              className="group relative w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPreparing ? (
                <Loader2 className="w-10 h-10 animate-spin" />
              ) : (
                <Play className="w-10 h-10 ml-1" />
              )}
              <span className="absolute -bottom-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
                {isPreparing ? 'Preparing...' : 'Start Recording'}
              </span>
            </button>
          ) : (
            <button 
              onClick={stopRecording}
              className="group relative w-24 h-24 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg transition-all active:scale-95"
            >
              <Square className="w-10 h-10 fill-current" />
              <span className="absolute -bottom-8 text-xs font-bold text-red-500 uppercase tracking-widest animate-pulse">
                Stop Recording
              </span>
            </button>
          )}
        </div>

        {/* Recorded Result */}
        <AnimatePresence>
          {recordingUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold">Recording Saved</span>
                </div>
                <button 
                  onClick={downloadRecording}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Download WebM
                </button>
              </div>
              <div className="aspect-video bg-black flex items-center justify-center">
                <video 
                  src={recordingUrl} 
                  controls 
                  className="max-w-full max-h-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-6">
        <div className="flex items-center gap-1.5 opacity-50">
          <Clock className="w-3 h-3" />
          <span className="text-[10px]">Max 10 mins</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-50">
          <Settings className="w-3 h-3" />
          <span className="text-[10px]">High Quality</span>
        </div>
      </div>
    </div>
  );
};
