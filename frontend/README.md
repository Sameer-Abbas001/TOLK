# TOLK Frontend 🎨

The user interface for **TOLK** is built with **React 19**, **Vite**, and **Vanilla CSS** featuring a modern, dark-themed glassmorphism aesthetic with real-time HTML5 Canvas audio visualization.

---

## 🚀 Features

- **🎙️ Live Audio Recording & Visualizer**: Visualizes microphone frequency waves in real time during recording and synthesized audio playback.
- **⚡ Dual Mode Input**: Seamless toggle between Voice Input (Microphone / Audio Upload) and Direct Text Input.
- **🌍 Multi-Language Selector**: Pick one or multiple target languages simultaneously for concurrent polyglot translation.
- **📊 Real-time Pipeline Progress**: Interactive step-by-step progress tracking for Speech Recognition, Translation, and Voice Synthesis.
- **🎛️ Audio Playback Cards**: Interactive cards with Play/Pause, seekable waveforms, script badges, native text, and single-click `.mp3` export.
- **⚙️ Dynamic Settings Modal**: Configure AssemblyAI keys, ElevenLabs keys, voice stability, similarity boost, and custom Voice IDs directly on the fly.
- **🎉 Confetti Celebrations**: Subtle micro-interactions on successful synthesis and translation.

---

## 🛠️ Tech Stack

- **React 19**
- **Vite 8**
- **Lucide Icons (`lucide-react`)**
- **Canvas Confetti (`canvas-confetti`)**
- **HTML5 Web Audio & MediaRecorder APIs**

---

## 💻 Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Vite Dev Server**:
   ```bash
   npm run dev
   ```
   The dev server will run on `http://localhost:5173`. In development mode, Vite proxies API requests to `http://127.0.0.1:5000`.

3. **Build for Production**:
   ```bash
   npm run build
   ```
   Outputs optimized static assets to `dist/`, which are automatically served by the FastAPI backend in production.

4. **Lint Code**:
   ```bash
   npm run lint
   ```
