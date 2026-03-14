import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Mic, X, Check, RotateCcw, Square, Image, Volume2 } from "lucide-react";

type CaptureMode = "idle" | "camera" | "audio";

interface MediaCaptureProps {
  onPhotoCapture?: (dataUrl: string) => void;
  onAudioCapture?: (blob: Blob, duration: number) => void;
  onClose?: () => void;
}

export function MediaCapture({ onPhotoCapture, onAudioCapture, onClose }: MediaCaptureProps) {
  const [mode, setMode] = useState<CaptureMode>("idle");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // File input fallback
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioWaveform, setAudioWaveform] = useState<number[]>(new Array(30).fill(0));
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedPhoto(dataUrl);
      setMode("camera");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMode("camera");
      setCapturedPhoto(null);
    } catch {
      // Camera unavailable — fallback to file picker
      fileInputRef.current?.click();
    }
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setCapturedPhoto(dataUrl);
      stopCamera();
    }
  };

  const confirmPhoto = () => {
    if (capturedPhoto) {
      onPhotoCapture?.(capturedPhoto);
      setCapturedPhoto(null);
      setMode("idle");
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const startAudioRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        audioContext.close();
        cancelAnimationFrame(animFrameRef.current);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);
      setMode("audio");

      // Waveform animation
      const updateWaveform = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const bars = Array.from(dataArray).slice(0, 30).map((v) => v / 255);
        setAudioWaveform(bars);
        animFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();
    } catch {
      // 权限被拒绝
    }
  }, []);

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setTimeout(() => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        onAudioCapture?.(blob, recordingDuration);
        setMode("idle");
        setRecordingDuration(0);
      }, 200);
    }
  };

  // Recording timer
  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopCamera();
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [stopCamera, isRecording]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Idle - show capture buttons
  if (mode === "idle") {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/50">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />
        <button
          onClick={startCamera}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl text-white shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          <Camera className="w-4 h-4" />
          <span className="text-xs">拍照</span>
        </button>
        <button
          onClick={startAudioRecording}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl text-white shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          <Mic className="w-4 h-4" />
          <span className="text-xs">录音</span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-2 text-[#8a7a6a] hover:text-[#5a4a3a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Camera mode
  if (mode === "camera") {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <canvas ref={canvasRef} className="hidden" />

        {capturedPhoto ? (
          // Preview captured photo
          <>
            <div className="flex-1 flex items-center justify-center">
              <img src={capturedPhoto} alt="captured" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex items-center justify-center gap-8 py-8 bg-black/80">
              <button
                onClick={retakePhoto}
                className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center"
              >
                <RotateCcw className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={confirmPhoto}
                className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl"
              >
                <Check className="w-7 h-7 text-white" />
              </button>
            </div>
          </>
        ) : (
          // Live camera
          <>
            <div className="flex-1 relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Viewfinder overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[15%] left-[10%] w-8 h-8 border-l-2 border-t-2 border-white/50 rounded-tl-lg" />
                <div className="absolute top-[15%] right-[10%] w-8 h-8 border-r-2 border-t-2 border-white/50 rounded-tr-lg" />
                <div className="absolute bottom-[25%] left-[10%] w-8 h-8 border-l-2 border-b-2 border-white/50 rounded-bl-lg" />
                <div className="absolute bottom-[25%] right-[10%] w-8 h-8 border-r-2 border-b-2 border-white/50 rounded-br-lg" />
              </div>
            </div>

            {/* Camera Controls */}
            <div className="flex items-center justify-center gap-8 py-8 bg-black/80">
              <button
                onClick={() => { stopCamera(); setMode("idle"); }}
                className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={takePhoto}
                className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center"
                style={{ width: 72, height: 72 }}
              >
                <div className="w-14 h-14 bg-white rounded-full hover:bg-white/80 transition-colors active:scale-90" />
              </button>
              <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Image className="w-5 h-5 text-white" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Audio recording mode
  if (mode === "audio") {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-900 to-purple-950 flex flex-col items-center justify-center">
        {/* Waveform Visualization */}
        <div className="flex items-center gap-1 h-24 mb-8">
          {audioWaveform.map((level, i) => (
            <div
              key={i}
              className="w-1.5 bg-gradient-to-t from-purple-300 to-pink-300 rounded-full transition-all duration-100"
              style={{ height: `${Math.max(4, level * 96)}px` }}
            />
          ))}
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-2xl text-white font-mono">
            {formatDuration(recordingDuration)}
          </span>
        </div>
        <p className="text-xs text-white/50 mb-12">正在录制语音备忘</p>

        {/* Controls */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => {
              if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
              }
              setMode("idle");
              setRecordingDuration(0);
            }}
            className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={stopAudioRecording}
            className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white/30"
          >
            <Square className="w-8 h-8 text-white fill-white" />
          </button>
          <div className="w-14 h-14 flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-white/40" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
