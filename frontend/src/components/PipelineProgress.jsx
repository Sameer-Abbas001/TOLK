import React from 'react';
import { Mic, Sparkles, Languages, Volume2, CheckCircle2, Loader2 } from 'lucide-react';

export default function PipelineProgress({ stage, error }) {
  // Stages: 0 = Idle, 1 = Ingesting/Recording, 2 = Transcribing (AssemblyAI), 3 = Translating (Neural), 4 = Synthesizing (ElevenLabs), 5 = Completed

  const steps = [
    {
      id: 1,
      title: 'Audio Capture',
      subtitle: 'Acoustic waveform processing',
      icon: Mic,
      color: 'from-blue-500 to-cyan-400',
      activeBorder: 'border-cyan-400 shadow-cyan-500/30',
    },
    {
      id: 2,
      title: 'AssemblyAI STT',
      subtitle: 'Neural speech transcription',
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-400',
      activeBorder: 'border-indigo-400 shadow-indigo-500/30',
    },
    {
      id: 3,
      title: 'Polyglot Matrix',
      subtitle: 'Concurrent neural translation',
      icon: Languages,
      color: 'from-purple-500 to-pink-400',
      activeBorder: 'border-pink-400 shadow-pink-500/30',
    },
    {
      id: 4,
      title: 'ElevenLabs Voice',
      subtitle: 'Cloned voice speech synthesis',
      icon: Volume2,
      color: 'from-amber-500 to-orange-400',
      activeBorder: 'border-amber-400 shadow-amber-500/30',
    },
  ];

  if (stage === 0 && !error) return null;

  return (
    <div className="w-full my-6 p-6 rounded-2xl glass-panel relative overflow-hidden transition-all duration-500">
      {/* Background Animated Glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            Real-Time Translation Pipeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {stage === 5
              ? '✨ Processing complete! Multi-language voice synthesized.'
              : error
              ? '⚠️ Encountered processing interruption.'
              : '⚡ Executing concurrent neural AI pipeline stages...'}
          </p>
        </div>
        {stage > 0 && stage < 5 && !error && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            Stage {stage} of 4 Active
          </div>
        )}
        {stage === 5 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            100% Ready
          </div>
        )}
      </div>

      {/* Steps Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {steps.map((step) => {
          const isDone = stage > step.id || stage === 5;
          const isCurrent = stage === step.id;
          const isUpcoming = stage < step.id && stage !== 5;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`relative p-4 rounded-xl transition-all duration-300 border ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                  : isCurrent
                  ? `bg-slate-800/80 ${step.activeBorder} shadow-xl scale-[1.02]`
                  : 'bg-slate-900/30 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${
                    isDone
                      ? 'bg-emerald-500 shadow-md shadow-emerald-500/40'
                      : isCurrent
                      ? `bg-gradient-to-br ${step.color} shadow-md`
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Icon className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
                  {isDone ? 'DONE' : isCurrent ? 'RUNNING' : `STEP ${step.id}`}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-slate-100">{step.title}</h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{step.subtitle}</p>

              {/* Progress bar inside card */}
              <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isDone
                      ? 'w-full bg-emerald-400'
                      : isCurrent
                      ? 'w-3/4 shimmer-progress'
                      : 'w-0'
                  }`}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
