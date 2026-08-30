import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Copy, Check, Volume2, RotateCcw, Sparkles } from 'lucide-react';

export default function AudioPlayerCard({ item, index }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef(null);

  const audioSrc = item.audioUrl;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioSrc]);

  const togglePlay = () => {
    if (!audioRef.current || !audioSrc) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const handleCopy = () => {
    if (item.translatedText) {
      navigator.clipboard.writeText(item.translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Border and accent based on language
  const colors = [
    'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400',
    'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
    'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    'from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-400',
  ];
  const colorStyle = colors[index % colors.length];

  return (
    <div className="glass-panel glass-panel-interactive p-6 flex flex-col justify-between relative group overflow-hidden transition-all duration-300">
      {/* Decorative Glow Spot */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/15 transition-all"></div>

      {audioSrc && (
        <audio ref={audioRef} src={audioSrc} preload="metadata" />
      )}

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow-md">{item.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-heading font-bold text-lg text-white">
                  {item.name}
                </h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                  {item.nativeName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-wide mt-0.5">
                {item.script || 'Neural Voice Model'}
              </p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
            title="Copy Translation"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Translated Text Display */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-5 relative min-h-[85px] flex items-center">
          <p className="text-base text-slate-100 font-medium leading-relaxed select-all">
            {item.translatedText || 'Translating...'}
          </p>
        </div>
      </div>

      {/* Audio Controls Section */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-3 mb-3">
          {/* Play/Pause Main Button */}
          <button
            onClick={togglePlay}
            disabled={!audioSrc}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all transform active:scale-95 shadow-lg ${
              isPlaying
                ? 'bg-rose-500 shadow-rose-500/40 hover:bg-rose-600'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105'
            } disabled:opacity-40 disabled:pointer-events-none`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Scrubber & Waveform Equalizer */}
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1.5">
              <span>{formatTime(currentTime)}</span>
              {isPlaying && (
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-1 bg-cyan-400 rounded-full eq-bar-1"></span>
                  <span className="w-1 bg-indigo-400 rounded-full eq-bar-2"></span>
                  <span className="w-1 bg-purple-400 rounded-full eq-bar-3"></span>
                  <span className="w-1 bg-pink-400 rounded-full eq-bar-4"></span>
                </div>
              )}
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.01"
              value={currentTime}
              onChange={handleSeek}
              disabled={!audioSrc}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>
        </div>

        {/* Footer Actions: Speed Pills & Download */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 font-mono mr-1">Speed:</span>
            {[0.75, 1.0, 1.25, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => changeSpeed(s)}
                className={`px-2 py-0.5 rounded-lg text-xs font-mono transition-all ${
                  speed === s
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {audioSrc && (
            <a
              href={audioSrc}
              download={`${item.code}_translated_speech.mp3`}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/60 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>MP3</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
