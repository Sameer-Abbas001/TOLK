import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Upload,
  Sparkles,
  Volume2,
  Settings,
  Languages,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  FileAudio,
  Radio,
  Sliders,
  History,
  Info,
  Layers,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

import AudioVisualizer from './components/AudioVisualizer';
import PipelineProgress from './components/PipelineProgress';
import AudioPlayerCard from './components/AudioPlayerCard';
import SettingsModal from './components/SettingsModal';

const PRESET_PHRASES = [
  "Hello, welcome to TOLK! I am testing voice cloning across multiple languages.",
  "Artificial intelligence is breaking down language barriers across the world.",
  "Good morning, how is the weather in Tokyo and New Delhi today?",
];

const DEFAULT_LANGUAGES = [
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', script: 'Kanji / Hiragana' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', script: 'Devanagari' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', script: 'Latin' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', script: 'Latin' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', script: 'Latin' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', script: 'Latin' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', script: 'Hangul' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', script: 'Simplified Chinese' },
];

export default function App() {
  // Input Modes: 'voice' | 'text'
  const [inputMode, setInputMode] = useState('voice');
  const [selectedLangs, setSelectedLangs] = useState(['ja', 'hi']);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [visualizerMode, setVisualizerMode] = useState('bars'); // 'bars' | 'wave'

  // Text Mode State
  const [textInput, setTextInput] = useState('');

  // Processing & Pipeline
  const [pipelineStage, setPipelineStage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Translation Results
  const [originalTranscript, setOriginalTranscript] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);

  // Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useState({
    voiceId: 'gO8Kb3hHPEPElVxVHDwT',
    assemblyKey: '',
    elevenLabsKey: '',
    stability: 0.5,
    similarityBoost: 0.8,
  });

  // Audio Context & Recording Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Cleanup audio URLs
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Handle Recording Timer
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  // Start Audio Recording
  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize Web Audio API for real-time visualizer
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      // MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioFile(new File([blob], 'recorded_voice.wav', { type: 'audio/wav' }));
        
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone permission error:', err);
      setError('Microphone access denied or not available. You can also upload an audio file or type text directly.');
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle Audio File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioBlob(file);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Toggle Language Selection
  const toggleLanguage = (code) => {
    setSelectedLangs((prev) => {
      if (prev.includes(code)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter((c) => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  // Execute Voice or Text Translation
  const handleProcessTranslation = async () => {
    setError(null);
    setIsProcessing(true);
    setPipelineStage(1);

    try {
      if (inputMode === 'voice') {
        if (!audioFile && !audioBlob) {
          setError('Please record a voice clip or upload an audio file first.');
          setIsProcessing(false);
          setPipelineStage(0);
          return;
        }

        // Animated stage advance
        setTimeout(() => setPipelineStage(2), 600);

        const formData = new FormData();
        formData.append('audio', audioFile || audioBlob, 'input_audio.wav');
        formData.append('targetLanguages', selectedLangs.join(','));
        formData.append('voiceId', config.voiceId);
        if (config.assemblyKey) formData.append('assemblyKey', config.assemblyKey);
        if (config.elevenLabsKey) formData.append('elevenLabsKey', config.elevenLabsKey);

        setTimeout(() => setPipelineStage(3), 1500);

        const response = await fetch('/api/voice-to-voice', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || 'Failed to process voice-to-voice translation.');
        }

        setPipelineStage(4);
        const data = await response.json();
        setOriginalTranscript(data.originalText);
        setResults(data.results || []);
        setPipelineStage(5);

        // Confetti celebration
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#06b6d4', '#ec4899', '#f59e0b'],
          });
        } catch (_) {}

      } else {
        // Text-to-Voice Mode
        if (!textInput.trim()) {
          setError('Please enter some text to translate.');
          setIsProcessing(false);
          setPipelineStage(0);
          return;
        }

        setPipelineStage(2);
        setTimeout(() => setPipelineStage(3), 500);

        const response = await fetch('/api/text-to-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textInput.trim(),
            targetLanguages: selectedLangs,
            voiceId: config.voiceId,
            elevenLabsKey: config.elevenLabsKey || undefined,
            stability: config.stability,
            similarityBoost: config.similarityBoost,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || 'Failed to process text translation.');
        }

        setPipelineStage(4);
        const data = await response.json();
        setOriginalTranscript(data.originalText);
        setResults(data.results || []);
        setPipelineStage(5);

        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#38bdf8', '#a855f7', '#10b981'],
          });
        } catch (_) {}
      }
    } catch (err) {
      console.error('Translation error:', err);
      setError(err.message || 'An error occurred during translation synthesis.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-grid-pattern relative pb-24 selection:bg-indigo-500 selection:text-white">
      {/* Background Radial Lights */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="fixed bottom-10 right-1/4 w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      {/* Navigation & Header */}
      <header className="border-b border-slate-800/80 backdrop-blur-xl bg-slate-950/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/25 border border-white/20 animate-float">
              🗣️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight gradient-text-hero">
                  TOLK
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-mono font-bold tracking-wider uppercase">
                  v2.0 Neural
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Multi-Language Neural Voice Translater 🌍
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              AI Engine Ready
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all hover:scale-105 shadow-sm"
              title="Voice Settings & API Keys"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/70 text-slate-300 text-xs font-medium mb-4 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AssemblyAI Speech-to-Text &bull; Neural Polyglot &bull; ElevenLabs Voice Cloning</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight mb-4">
            Speak Naturally. <br />
            <span className="gradient-text-cyan">Hear Your Cloned Voice Across Languages.</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Record your voice in English and listen to high-fidelity cloned speech translation in{' '}
            <strong className="text-slate-200">Japanese (日本語)</strong>,{' '}
            <strong className="text-slate-200">Hindi (हिन्दी)</strong>, Spanish, French, and more.
          </p>
        </div>

        {/* Input Mode Switcher */}
        <div className="flex justify-center mb-8">
          <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-1 shadow-xl">
            <button
              onClick={() => setInputMode('voice')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                inputMode === 'voice'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Mic className="w-4 h-4" />
              Voice-to-Voice Mode
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                inputMode === 'text'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Languages className="w-4 h-4" />
              Text-to-Voice Mode
            </button>
          </div>
        </div>

        {/* Main Work Area Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input Studio */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-panel p-6 sm:p-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {inputMode === 'voice' ? <Mic className="w-5 h-5" /> : <Languages className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-white">
                      {inputMode === 'voice' ? '1. Source Audio Studio' : '1. Source Text Studio'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {inputMode === 'voice' ? 'Record live mic or upload audio file' : 'Type or select an English phrase'}
                    </p>
                  </div>
                </div>

                {inputMode === 'voice' && (
                  <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setVisualizerMode('bars')}
                      className={`px-2 py-1 rounded-lg font-mono transition-colors ${
                        visualizerMode === 'bars' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
                      }`}
                    >
                      Bars
                    </button>
                    <button
                      onClick={() => setVisualizerMode('wave')}
                      className={`px-2 py-1 rounded-lg font-mono transition-colors ${
                        visualizerMode === 'wave' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
                      }`}
                    >
                      Sine
                    </button>
                  </div>
                )}
              </div>

              {/* VOICE MODE CONTENT */}
              {inputMode === 'voice' && (
                <div className="space-y-6">
                  {/* Real-Time Visualizer Canvas */}
                  <AudioVisualizer
                    isRecording={isRecording}
                    analyser={analyserRef.current}
                    mode={visualizerMode}
                  />

                  {/* Big Microphone Action Area */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 ${
                          isRecording
                            ? 'btn-recording'
                            : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/30 hover:scale-105'
                        }`}
                      >
                        {isRecording ? (
                          <MicOff className="w-7 h-7 animate-bounce" />
                        ) : (
                          <Mic className="w-7 h-7" />
                        )}
                      </button>
                      <div>
                        <div className="font-heading font-bold text-sm text-white flex items-center gap-2">
                          {isRecording ? (
                            <>
                              <span className="text-rose-400">Recording Live Voice...</span>
                              <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                                {formatTimer(recordingTime)}
                              </span>
                            </>
                          ) : (
                            'Tap to Record Microphone'
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isRecording ? 'Speak clearly into your microphone' : 'Capture clear English speech'}
                        </p>
                      </div>
                    </div>

                    {audioUrl && !isRecording && (
                      <div className="w-full sm:w-auto flex items-center gap-2">
                        <audio src={audioUrl} controls className="h-9 w-full sm:w-44 accent-indigo-500" />
                      </div>
                    )}
                  </div>

                  {/* Or Drag-and-drop Audio Upload */}
                  <div className="relative">
                    <div className="text-center my-3 relative">
                      <span className="bg-slate-900 px-3 text-xs text-slate-400 uppercase tracking-wider font-mono">
                        Or Upload Audio File
                      </span>
                    </div>

                    <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 bg-slate-950/40 hover:bg-slate-900/40 transition-all cursor-pointer group">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 group-hover:scale-110 transition-all mb-2" />
                      <span className="text-xs font-semibold text-slate-200">
                        {audioFile ? audioFile.name : 'Click to select or drag & drop WAV, MP3, M4A'}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">Max size: 25MB</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* TEXT MODE CONTENT */}
              {inputMode === 'text' && (
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      rows={5}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type or paste the English text you want to synthesize and translate..."
                      className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-400 leading-relaxed font-sans"
                    ></textarea>
                    <div className="absolute bottom-3 right-3 text-xs font-mono text-slate-400">
                      {textInput.length} chars
                    </div>
                  </div>

                  {/* Quick Preset Phrases */}
                  <div>
                    <span className="text-xs font-mono text-slate-400 block mb-2">Preset Quick Phrases:</span>
                    <div className="space-y-2">
                      {PRESET_PHRASES.map((phrase, idx) => (
                        <button
                          key={idx}
                          onClick={() => setTextInput(phrase)}
                          className="w-full text-left p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-300 transition-all flex items-center justify-between group"
                        >
                          <span className="truncate pr-2 font-medium">"{phrase}"</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector Studio */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-purple-400" />
                  <h4 className="font-heading font-bold text-sm text-white">
                    2. Target Polyglot Languages ({selectedLangs.length} Selected)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Select 1 or more</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {DEFAULT_LANGUAGES.map((lang) => {
                  const isSelected = selectedLangs.includes(lang.code);
                  return (
                    <button
                      key={lang.code}
                      onClick={() => toggleLanguage(lang.code)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500/60 shadow-md shadow-indigo-600/10 scale-[1.02]'
                          : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{lang.flag}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">{lang.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{lang.nativeName}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trigger Button */}
            <button
              onClick={handleProcessTranslation}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl btn-gradient-primary text-base font-heading font-bold flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50 disabled:pointer-events-none"
            >
              {isProcessing ? (
                <>
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  Processing Neural Synthesis...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  🚀 Translate & Synthesize Cloned Voice
                </>
              )}
            </button>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Right Column: Dynamic Pipeline & Output Cards */}
          <div className="lg:col-span-6 space-y-6">
            {/* Real-Time Processing Pipeline Tracker */}
            <PipelineProgress stage={pipelineStage} error={error} />

            {/* Original Transcribed Text Banner */}
            {originalTranscript && (
              <div className="glass-panel p-5 border-l-4 border-l-cyan-400">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    Transcribed English Voice
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">AssemblyAI Neural Model</span>
                </div>
                <p className="text-base text-slate-100 font-medium italic">
                  "{originalTranscript}"
                </p>
              </div>
            )}

            {/* Generated Multi-Language Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-indigo-400" />
                  Synthesized Speech Output
                </h3>
                {results.length > 0 && (
                  <span className="text-xs font-mono text-slate-400">
                    {results.length} Language{results.length > 1 ? 's' : ''} Ready
                  </span>
                )}
              </div>

              {results.length === 0 ? (
                <div className="glass-panel p-10 text-center flex flex-col items-center justify-center text-slate-400 border-dashed">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-2xl mb-4 text-slate-500">
                    🎧
                  </div>
                  <h4 className="font-heading font-semibold text-slate-200 text-base mb-1">
                    No Audio Generated Yet
                  </h4>
                  <p className="text-xs max-w-sm leading-relaxed text-slate-400">
                    Record your speech on the left or type a phrase and click <strong className="text-indigo-400">Translate & Synthesize</strong> to generate cloned voice audio.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {results.map((item, index) => (
                    <AudioPlayerCard key={item.code} item={item} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={(newConfig) => setConfig(newConfig)}
      />
    </div>
  );
}
