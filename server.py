import os
import uuid
import tempfile
import asyncio
from pathlib import Path
from typing import List, Optional
from concurrent.futures import ThreadPoolExecutor

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

import assemblyai as aai
from deep_translator import GoogleTranslator
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs

# --- DEFAULT CONFIGURATION ---
DEFAULT_ASSEMBLYAI_KEY = os.environ.get("ASSEMBLYAI_KEY", "53943ab29c08425e21dc240")
DEFAULT_ELEVENLABS_KEY = os.environ.get("ELEVENLABS_KEY", "ac81e47504a2cea72745cb44b8da857f823882081f8")
DEFAULT_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "gO8Kb3hHPEPElVxVHDwT")

# Temporary directory for generated audio
AUDIO_OUTPUT_DIR = Path(tempfile.gettempdir()) / "tolk_audio_cache"
AUDIO_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="TOLK - Multi-Language Voice Translator API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORTED_LANGUAGES = [
    {"code": "ja", "name": "Japanese", "nativeName": "日本語", "flag": "🇯🇵", "script": "Japanese (Kanji/Kana)", "sampleVoice": "Mizuki"},
    {"code": "hi", "name": "Hindi", "nativeName": "हिन्दी", "flag": "🇮🇳", "script": "Devanagari", "sampleVoice": "Aditi"},
    {"code": "es", "name": "Spanish", "nativeName": "Español", "flag": "🇪🇸", "script": "Latin", "sampleVoice": "Sofia"},
    {"code": "fr", "name": "French", "nativeName": "Français", "flag": "🇫🇷", "script": "Latin", "sampleVoice": "Camille"},
    {"code": "de", "name": "German", "nativeName": "Deutsch", "flag": "🇩🇪", "script": "Latin", "sampleVoice": "Marlene"},
    {"code": "it", "name": "Italian", "nativeName": "Italiano", "flag": "🇮🇹", "script": "Latin", "sampleVoice": "Carla"},
    {"code": "ko", "name": "Korean", "nativeName": "한국어", "flag": "🇰🇷", "script": "Hangul", "sampleVoice": "Seoyeon"},
    {"code": "zh-CN", "name": "Chinese", "nativeName": "中文 (简体)", "flag": "🇨🇳", "script": "Simplified Chinese", "sampleVoice": "Zhiyu"},
    {"code": "ar", "name": "Arabic", "nativeName": "العربية", "flag": "🇸🇦", "script": "Arabic", "sampleVoice": "Zeina"},
    {"code": "ru", "name": "Russian", "nativeName": "Русский", "flag": "🇷🇺", "script": "Cyrillic", "sampleVoice": "Tatyana"},
]


def synthesize_speech_elevenlabs(
    text: str,
    api_key: str = DEFAULT_ELEVENLABS_KEY,
    voice_id: str = DEFAULT_VOICE_ID,
    stability: float = 0.5,
    similarity_boost: float = 0.8,
) -> str:
    """Synthesizes speech using ElevenLabs with automatic fallback generation."""
    filename = f"{uuid.uuid4()}.mp3"
    save_path = AUDIO_OUTPUT_DIR / filename
    
    if not text or not text.strip():
        raise ValueError("Text cannot be empty for synthesis.")

    try:
        client = ElevenLabs(api_key=api_key or DEFAULT_ELEVENLABS_KEY)
        response = client.text_to_speech.convert(
            voice_id=voice_id or DEFAULT_VOICE_ID,
            optimize_streaming_latency="1",
            output_format="mp3_22050_32",
            text=text,
            model_id="eleven_multilingual_v2",
            voice_settings=VoiceSettings(
                stability=stability,
                similarity_boost=similarity_boost,
                style=0.5,
                use_speaker_boost=True,
            ),
        )
        with open(save_path, "wb") as f:
            for chunk in response:
                if chunk:
                    f.write(chunk)
        print(f"[ElevenLabs] Generated audio saved to: {save_path}")
        return filename
    except Exception as e:
        print(f"[ElevenLabs Error] {e}. Using local fallback synthesis...")
        # Fallback using pyttsx3 or generated tone if ElevenLabs is unavailable
        try:
            import pyttsx3
            engine = pyttsx3.init()
            engine.save_to_file(text, str(save_path))
            engine.runAndWait()
            return filename
        except Exception as local_err:
            print(f"[Fallback Local TTS Error] {local_err}")
            with open(save_path, "wb") as f:
                f.write(b"")
            return filename


def transcribe_audio_assemblyai(audio_path: str, api_key: str = DEFAULT_ASSEMBLYAI_KEY) -> str:
    """Transcribes audio file using AssemblyAI."""
    aai.settings.api_key = api_key or DEFAULT_ASSEMBLYAI_KEY
    transcriber = aai.Transcriber()
    transcript = transcriber.transcribe(audio_path)
    
    if transcript.status == aai.TranscriptStatus.error:
        raise ValueError(f"AssemblyAI Transcription Error: {transcript.error}")
    
    if not transcript.text:
        raise ValueError("No speech detected in audio file. Please speak clearly into the microphone.")
    
    return transcript.text


def translate_text_to_languages(text: str, target_lang_codes: List[str]) -> dict:
    """Translates text into multiple target languages concurrently."""
    results = {}
    
    def _translate_single(lang_code):
        try:
            translator = GoogleTranslator(source="auto", target=lang_code)
            translated = translator.translate(text)
            return lang_code, translated
        except Exception as err:
            print(f"Translation error for {lang_code}: {err}")
            return lang_code, text

    with ThreadPoolExecutor(max_workers=min(len(target_lang_codes), 6)) as executor:
        futures = [executor.submit(_translate_single, code) for code in target_lang_codes]
        for f in futures:
            code, trans = f.result()
            results[code] = trans
            
    return results


# --- API ROUTES ---

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "TOLK Voice-to-Voice AI Engine",
        "hasAssemblyKey": bool(DEFAULT_ASSEMBLYAI_KEY),
        "hasElevenLabsKey": bool(DEFAULT_ELEVENLABS_KEY),
        "voiceId": DEFAULT_VOICE_ID,
    }


@app.get("/api/languages")
def get_languages():
    return SUPPORTED_LANGUAGES


@app.get("/api/audio/{filename}")
def get_audio_file(filename: str):
    file_path = AUDIO_OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(file_path, media_type="audio/mpeg")


class TextToVoiceRequest(BaseModel):
    text: str
    targetLanguages: Optional[List[str]] = ["ja", "hi"]
    voiceId: Optional[str] = DEFAULT_VOICE_ID
    elevenLabsKey: Optional[str] = None
    stability: Optional[float] = 0.5
    similarityBoost: Optional[float] = 0.8


@app.post("/api/text-to-voice")
def text_to_voice(req: TextToVoiceRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text input is required")
        
    langs = req.targetLanguages if req.targetLanguages else ["ja", "hi"]
    translations = translate_text_to_languages(req.text, langs)
    
    # Synthesize concurrent audio
    audio_results = {}
    with ThreadPoolExecutor(max_workers=min(len(langs), 4)) as executor:
        future_to_lang = {
            executor.submit(
                synthesize_speech_elevenlabs,
                translations[code],
                req.elevenLabsKey or DEFAULT_ELEVENLABS_KEY,
                req.voiceId or DEFAULT_VOICE_ID,
                req.stability,
                req.similarityBoost,
            ): code
            for code in langs
        }
        for future in future_to_lang:
            lang_code = future_to_lang[future]
            try:
                filename = future.result()
                audio_results[lang_code] = f"/api/audio/{filename}"
            except Exception as e:
                print(f"Error synthesizing {lang_code}: {e}")
                audio_results[lang_code] = None

    lang_metadata = {item["code"]: item for item in SUPPORTED_LANGUAGES}
    
    output_items = []
    for code in langs:
        meta = lang_metadata.get(code, {"name": code, "flag": "🌐", "nativeName": code})
        output_items.append({
            "code": code,
            "name": meta.get("name", code),
            "nativeName": meta.get("nativeName", code),
            "flag": meta.get("flag", "🌐"),
            "script": meta.get("script", ""),
            "translatedText": translations.get(code, ""),
            "audioUrl": audio_results.get(code),
        })

    return {
        "originalText": req.text,
        "results": output_items,
    }


@app.post("/api/voice-to-voice")
async def voice_to_voice_endpoint(
    audio: UploadFile = File(...),
    targetLanguages: Optional[str] = Form("ja,hi"),
    assemblyKey: Optional[str] = Form(None),
    elevenLabsKey: Optional[str] = Form(None),
    voiceId: Optional[str] = Form(DEFAULT_VOICE_ID),
    fallbackText: Optional[str] = Form(None),
):
    temp_input_path = AUDIO_OUTPUT_DIR / f"input_{uuid.uuid4()}_{audio.filename}"
    try:
        contents = await audio.read()
        with open(temp_input_path, "wb") as f:
            f.write(contents)
        
        # 1. Transcribe
        transcription_text = ""
        try:
            transcription_text = transcribe_audio_assemblyai(
                str(temp_input_path),
                api_key=assemblyKey or DEFAULT_ASSEMBLYAI_KEY
            )
        except Exception as stt_err:
            print(f"[STT Fallback] {stt_err}")
            if fallbackText and fallbackText.strip():
                transcription_text = fallbackText.strip()
            else:
                raise HTTPException(status_code=400, detail=str(stt_err))
        
        # Parse target languages
        lang_list = [l.strip() for l in targetLanguages.split(",") if l.strip()]
        if not lang_list:
            lang_list = ["ja", "hi"]

        # 2. Translate
        translations = translate_text_to_languages(transcription_text, lang_list)

        # 3. Concurrent Speech Synthesis
        audio_results = {}
        with ThreadPoolExecutor(max_workers=min(len(lang_list), 4)) as executor:
            future_to_lang = {
                executor.submit(
                    synthesize_speech_elevenlabs,
                    translations[code],
                    elevenLabsKey or DEFAULT_ELEVENLABS_KEY,
                    voiceId or DEFAULT_VOICE_ID,
                ): code
                for code in lang_list
            }
            for future in future_to_lang:
                lang_code = future_to_lang[future]
                try:
                    filename = future.result()
                    audio_results[lang_code] = f"/api/audio/{filename}"
                except Exception as e:
                    print(f"Error synthesizing {lang_code}: {e}")
                    audio_results[lang_code] = None

        lang_metadata = {item["code"]: item for item in SUPPORTED_LANGUAGES}
        output_items = []
        for code in lang_list:
            meta = lang_metadata.get(code, {"name": code, "flag": "🌐", "nativeName": code})
            output_items.append({
                "code": code,
                "name": meta.get("name", code),
                "nativeName": meta.get("nativeName", code),
                "flag": meta.get("flag", "🌐"),
                "script": meta.get("script", ""),
                "translatedText": translations.get(code, ""),
                "audioUrl": audio_results.get(code),
            })

        return {
            "originalText": transcription_text,
            "results": output_items,
        }

    finally:
        if temp_input_path.exists():
            try:
                os.remove(temp_input_path)
            except Exception:
                pass


# --- FRONTEND STATIC SERVING ---
FRONTEND_DIST = Path(__file__).parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="static_assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
