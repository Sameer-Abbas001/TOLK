# 🗣️ TOLK — Next-Gen Multi-Language AI Voice Translator 🌍

<div align="center">

![TOLK Banner](https://img.shields.io/badge/TOLK-AI%20Voice%20Translator-7928CA?style=for-the-badge&logo=soundcharts&logoColor=white)

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)

[![React 19](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

[![AssemblyAI](https://img.shields.io/badge/AssemblyAI-Neural%20STT-blue?style=for-the-badge)](https://www.assemblyai.com/)

[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Multilingual%20v2-black?style=for-the-badge)](https://elevenlabs.io/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**TOLK** is a high-performance, polyglot Voice-to-Voice and Text-to-Voice translation platform. It seamlessly combines **AssemblyAI** neural transcription, concurrent multi-language translation, and **ElevenLabs Multilingual v2** voice cloning synthesis into an ultra-sleek, reactive web experience.

[Key Features](#-key-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Supported Languages](#-supported-languages) • [API Reference](#-api-reference) • [Configuration](#%EF%B8%8F-configuration)

</div>

---

## ✨ Key Features

- **🎙️ High-Fidelity Voice-to-Voice AI**: Record or upload speech in any language, transcribe it with neural accuracy via AssemblyAI, translate into multiple target languages simultaneously, and clone voices in natural accents.

- **✍️ Real-Time Text-to-Voice Mode**: Don't have a microphone? Type or paste text to generate concurrent multi-language translations and synthesized audio on the fly.

- **⚡ Concurrent Polyglot Translation**: Translate and generate audio for multiple languages in parallel threads using modern async processing.

- **🌊 Interactive HTML5 Audio Visualizer**: Live real-time audio visualizer displaying sound waves for active microphone input and synthesized audio playback.

- **🎛️ Glassmorphic Audio Deck**: Sleek audio player cards with waveform scrubbing, native script previews, language flags, and instant `.mp3` export.

- **📊 Real-time Pipeline Progress Tracker**: Step-by-step interactive status indicators detailing transcription, neural translation, and audio rendering stages.

- **⚙️ Dynamic In-App Settings**: Configure custom AssemblyAI/ElevenLabs API keys, voice stability, similarity boost, and custom ElevenLabs Voice IDs directly from the UI or via `.env`.

- **🚀 Single-Command Unified Launcher**: Run `python run.py` to auto-build frontend assets, start the FastAPI engine, find open ports, and launch the browser automatically.

---

## 🏛️ Architecture

```mermaid

flowchart TD

    subgraph Client ["🖥️ React 19 Frontend (Vite)"]

        UI["User Interface (Glassmorphic)"]

        REC["MediaRecorder Audio Capture"]

        VIS["Canvas Frequency Visualizer"]

        PLAY["Audio Deck & MP3 Exporter"]

    end

    subgraph Backend ["⚡ FastAPI Server (Python 3.11+)"]

        API["REST API Layer"]

        STT["AssemblyAI Neural Transcriber"]

        TRANS["Concurrent Google Translator"]

        TTS["ElevenLabs Multilingual v2 Voice Synthesis"]

        CACHE["Audio File Cache"]

    end

    REC -->|Raw Audio (WAV/WEBM)| API

    UI -->|Text / Settings| API

    API --> STT

    STT -->|Transcribed Text| TRANS

    TRANS -->|Concurrent Translations| TTS

    TTS --> CACHE

    CACHE -->|Audio URL (.mp3)| PLAY

    PLAY --> VIS

```

---

## 🌐 Supported Languages

TOLK ships out-of-the-box support for major global languages with automatic native script formatting and regional voice profiles:

| Flag | Language | Native Name | Script | Sample Voice Profile |

|:---:|:---|:---|:---|:---|

| 🇯🇵 | **Japanese** | 日本語 | Japanese (Kanji/Kana) | **Mizuki** |

| 🇮🇳 | **Hindi** | हिन्दी | Devanagari | **Aditi** |

| 🇪🇸 | **Spanish** | Español | Latin | **Sofia** |

| 🇫🇷 | **French** | Français | Latin | **Camille** |

| 🇩🇪 | **German** | Deutsch | Latin | **Marlene** |

| 🇮🇹 | **Italian** | Italiano | Latin | **Carla** |

| 🇰🇷 | **Korean** | 한국어 | Hangul | **Seoyeon** |

| 🇨🇳 | **Chinese** | 中文 (简体) | Simplified Chinese | **Zhiyu** |

| 🇸🇦 | **Arabic** | العربية | Arabic | **Zeina** |

| 🇷🇺 | **Russian** | Русский | Cyrillic | **Tatyana** |

---

## 🚀 Quick Start

### 📋 Prerequisites

- **Python 3.10+** (Tested on Python 3.11 & 3.12)

- **Node.js 18+** & **npm** (for frontend build)

- **(Optional)** Free API keys from [AssemblyAI](https://www.assemblyai.com/) and [ElevenLabs](https://elevenlabs.io/)

### ⚡ 1-Click Launch (Recommended)

1. **Clone the repository**:

```bash

   git clone https://github.com/Sameer-Abbas001/TOLK.git

   cd TOLK

```

2. **Install Python dependencies**:

```bash

   pip install -r requirements.txt

```

3. **Run the unified launcher**:

```bash

   python run.py

```

   > 💡 **`run.py` will automatically install frontend packages, build production assets, find an available port, launch the FastAPI server, and open your browser to `http://127.0.0.1:5000`.**

---

### 🛠️ Manual Development Setup

If you want to run the backend and frontend separately with hot-reloading:

#### 1. Start Backend API

```bash

pip install -r requirements.txt

uvicorn server:app --reload --port 5000

```

#### 2. Start Frontend Dev Server

```bash

cd frontend

npm install

npm run dev

```

Open `http://localhost:5173` in your browser.

---

## ⚙️ Configuration

You can configure TOLK using environment variables or directly inside the web UI's **Settings Modal** (⚙️ button in the top navigation).

### Environment File (`.env`)

Create a `.env` file in the root directory (see [`.env.example`](.env.example)):

```env

# AssemblyAI Speech-to-Text Key

ASSEMBLYAI_KEY=your_assemblyai_key_here

# ElevenLabs Text-to-Speech Key & Voice Model

ELEVENLABS_KEY=your_elevenlabs_key_here

ELEVENLABS_VOICE_ID=your_elevenlabs_voice_id

# Optional Network Configuration

PORT=5000

HOST=127.0.0.1

```

---

## 📡 API Reference

### 1. Health Check

`GET /api/health`

**Response:**

```json

{

  "status": "online",

  "service": "TOLK Voice-to-Voice AI Engine",

  "hasAssemblyKey": true,

  "hasElevenLabsKey": true,

  "voiceId": "your_elevenlabs_voice_id"

}

```

---

### 2. Get Supported Languages

`GET /api/languages`

**Response:** List of supported language objects with language codes, native names, and flags.

---

### 3. Voice-to-Voice Translation

`POST /api/voice-to-voice`

**Form Data Parameters:**

| Parameter | Type | Required | Description |

|:---|:---|:---:|:---|

| `audio` | `File` (Blob) | **Yes** | Input voice audio file (WAV, MP3, WEBM, M4A) |

| `targetLanguages` | `string` | No | Comma-separated language codes (e.g. `ja,hi,es`) |

| `assemblyKey` | `string` | No | Custom AssemblyAI API key |

| `elevenLabsKey` | `string` | No | Custom ElevenLabs API key |

| `voiceId` | `string` | No | Custom ElevenLabs Voice ID |

| `fallbackText` | `string` | No | Fallback text if STT fails or is offline |

**Response:**

```json

{

  "originalText": "Hello, welcome to the future of voice translation.",

  "results": [

    {

      "code": "ja",

      "name": "Japanese",

      "nativeName": "日本語",

      "flag": "🇯🇵",

      "script": "Japanese (Kanji/Kana)",

      "translatedText": "こんにちは、音声翻訳の未来へようこそ。",

      "audioUrl": "/api/audio/e18b4e78-90f7-418a-9f5b-80dfa803f2df.mp3"

    },

    {

      "code": "hi",

      "name": "Hindi",

      "nativeName": "हिन्दी",

      "flag": "🇮🇳",

      "script": "Devanagari",

      "translatedText": "नमस्ते, आवाज अनुवाद के भविष्य में आपका स्वागत है।",

      "audioUrl": "/api/audio/7a1f5d68-07b1-4bb2-b6be-d67b2d56a29e.mp3"

    }

  ]

}

```

---

### 4. Text-to-Voice Translation

`POST /api/text-to-voice`

**Request Body (`application/json`):**

```json

{

  "text": "Artificial Intelligence bridges language barriers worldwide.",

  "targetLanguages": ["ja", "hi", "es"],

  "voiceId": "your_elevenlabs_voice_id",

  "stability": 0.5,

  "similarityBoost": 0.8

}

```

---

### 5. Fetch Audio File

`GET /api/audio/{filename}`

Streams the generated `.mp3` audio file directly for browser playback or download.

---

## 📁 Project Structure

```

TOLK/

├── .github/

│   ├── ISSUE_TEMPLATE/

│   │   ├── bug_report.md

│   │   └── feature_request.md

│   ├── pull_request_template.md

│   └── workflows/

│       └── ci.yml               # GitHub Actions CI Workflow

├── frontend/                    # React 19 + Vite Frontend

│   ├── src/

│   │   ├── components/

│   │   │   ├── AudioPlayerCard.jsx

│   │   │   ├── AudioVisualizer.jsx

│   │   │   ├── PipelineProgress.jsx

│   │   │   └── SettingsModal.jsx

│   │   ├── App.jsx              # Main Application Container

│   │   ├── App.css              # Glassmorphic Styles & Animations

│   │   ├── index.css            # Design System & Tokens

│   │   └── main.jsx             # React DOM Entrypoint

│   ├── package.json

│   ├── vite.config.js

│   └── README.md

├── server.py                    # FastAPI Engine & Concurrent Pipeline

├── run.py                       # Unified 1-Click Launcher

├── simple_vtv.py                # Standalone CLI Voice-to-Voice Processor

├── requirements.txt             # Python Dependencies

├── .env.example                 # Environment Variable Template

├── .gitignore                   # Git Ignore Rules

├── LICENSE                      # MIT License

├── CONTRIBUTING.md              # Contribution Guidelines

├── SECURITY.md                  # Security & Vulnerability Policy

└── README.md                    # Project Documentation

```

---

## 🤝 Contributing

Contributions are warmly welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for full instructions on setting up your local environment, coding guidelines, and submitting pull requests.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ for global communication and polyglot AI voice synthesis.

</div>
