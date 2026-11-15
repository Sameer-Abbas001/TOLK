import React, { useState } from 'react';
import { X, Sliders, Key, Mic, Check, RotateCcw } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) {
  const [localConfig, setLocalConfig] = useState(config);
  const [savedToast, setSavedToast] = useState(false);

  if (!isOpen) return null;

  const popularVoices = [
    { id: 'wXvR48IpOq9HACltTmt7', name: 'Custom Voice Profile', desc: 'wXvR48IpOq9HACltTmt7' },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George (Warm British Male)', desc: 'Core Multilingual Voice' },
    { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily (Expressive British Female)', desc: 'Core Multilingual Voice' },
    { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica (Warm American Female)', desc: 'Core Multilingual Voice' },
    { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam (Energetic American Male)', desc: 'Core Multilingual Voice' },
    { id: 'FZkK3TvQ0pjyDmT8fzIW', name: 'Custom Voice Profile', desc: 'User Voice ID' },
  ];

  const handleSave = () => {
    onSaveConfig(localConfig);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    const defaultConfig = {
      voiceId: 'JBFqnCBsd6RMkjVDRZzb',
      assemblyKey: '',
      elevenLabsKey: '',
      stability: 0.5,
      similarityBoost: 0.8,
    };
    setLocalConfig(defaultConfig);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel p-6 bg-slate-900/90 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-white">Voice & Model Settings</h3>
              <p className="text-xs text-slate-400">Configure neural speech synthesis parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}



        {/* Voice Sliders */}
        <div className="space-y-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-300">Voice Stability</span>
              <span className="font-mono text-indigo-400">{Math.round(localConfig.stability * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={localConfig.stability}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, stability: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>More Dynamic & Emotional</span>
              <span>More Stable & Consistent</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-300">Clarity + Similarity Boost</span>
              <span className="font-mono text-cyan-400">{Math.round(localConfig.similarityBoost * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={localConfig.similarityBoost}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, similarityBoost: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* API Key Overrides */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-amber-400" />
            API Key Overrides (Optional)
          </label>
          <p className="text-[11px] text-slate-400">
            Leave blank to use pre-configured project credentials automatically.
          </p>

          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Custom AssemblyAI API Key</span>
            <input
              type="password"
              value={localConfig.assemblyKey || ''}
              onChange={(e) => setLocalConfig({ ...localConfig, assemblyKey: e.target.value })}
              placeholder="assemblyai_key_..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400 block">Custom ElevenLabs Secret API Key</span>
              <span className="text-[10px] text-indigo-400 font-mono">Starts with 'sk_'</span>
            </div>
            <input
              type="password"
              value={localConfig.elevenLabsKey || ''}
              onChange={(e) => setLocalConfig({ ...localConfig, elevenLabsKey: e.target.value })}
              placeholder="sk_..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            {localConfig.elevenLabsKey && !localConfig.elevenLabsKey.startsWith('sk_') && localConfig.elevenLabsKey.length === 64 && (
              <p className="mt-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 leading-relaxed">
                ⚠️ This appears to be your 64-character <strong>Key ID</strong>. ElevenLabs requires the <strong>Secret Key</strong> (starts with <code>sk_</code>). Please create or rotate your key in your ElevenLabs dashboard (Settings &gt; API Keys).
              </p>
            )}
          </div>
        </div>
      

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl btn-gradient-primary text-xs font-semibold"
          >
            {savedToast ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                Saved!
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
    
  );
}
