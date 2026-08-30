"""
TOLK - Multi-Language Voice Translator (v2.0)
Full-Stack AI Voice-to-Voice Translator with React Frontend & FastAPI Engine.
"""

import os
import sys
import uuid
import tempfile
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import assemblyai as aai
from deep_translator import GoogleTranslator
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs

# --- API KEYS AND CONFIGURATION ---
ASSEMBLYAI_KEY = os.environ.get("ASSEMBLYAI_KEY", "53943ab29c08425e21dc240")
ELEVENLABS_KEY = os.environ.get("ELEVENLABS_KEY", "ac81e47504a2cea72745cb44b8da857f823882081f8")
ELEVENLABS_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "gO8Kb3hHPEPElVxVHDwT")

# Initialize ElevenLabs client
try:
    ELEVENLABS_CLIENT = ElevenLabs(api_key=ELEVENLABS_KEY)
except Exception as e:
    ELEVENLABS_CLIENT = None
    print(f"Warning: ElevenLabs client init error: {e}")


def text_to_speech_concurrent(text, voice_id=ELEVENLABS_VOICE_ID):
    """Converts the translated text into speech using ElevenLabs."""
    if not ELEVENLABS_CLIENT:
        return ""
    try:
        response = ELEVENLABS_CLIENT.text_to_speech.convert(
            voice_id=voice_id,
            optimize_streaming_latency="1",
            output_format="mp3_22050_32",
            text=text,
            model_id="eleven_multilingual_v2",
            voice_settings=VoiceSettings(
                stability=0.5,
                similarity_boost=0.8,
                style=0.5,
                use_speaker_boost=True,
            ),
        )
        temp_dir = tempfile.gettempdir()
        save_file_path = Path(temp_dir) / f"{uuid.uuid4()}.mp3"
        with open(save_file_path, "wb") as f:
            for chunk in response:
                if chunk:
                    f.write(chunk)
        return str(save_file_path)
    except Exception as e:
        print(f"TTS Error: {e}")
        return ""


def audio_transcription(audio_file):
    """Initializes AssemblyAI and transcribes the audio file."""
    aai.settings.api_key = ASSEMBLYAI_KEY
    transcriber = aai.Transcriber()
    transcription = transcriber.transcribe(audio_file)
    return transcription


def text_translation(text):
    """Translates text into Japanese and Hindi using neural translators."""
    try:
        ja_text = GoogleTranslator(source="auto", target="ja").translate(text)
    except Exception:
        ja_text = text
    try:
        hi_text = GoogleTranslator(source="auto", target="hi").translate(text)
    except Exception:
        hi_text = text
    return ja_text, hi_text


def voice_to_voice(audio_file):
    """Main voice to voice processing function."""
    if not audio_file:
        raise ValueError("No audio file received.")
        
    transcription_response = audio_transcription(audio_file)
    if transcription_response.status == aai.TranscriptStatus.error:
        raise ValueError(f"Transcription failed: {transcription_response.error}")
    
    text = transcription_response.text
    if not text:
        raise ValueError("Transcription returned empty text.")

    ja_translation, hi_translation = text_translation(text)

    with ThreadPoolExecutor(max_workers=2) as executor:
        future_ja = executor.submit(text_to_speech_concurrent, ja_translation)
        future_hi = executor.submit(text_to_speech_concurrent, hi_translation)
        ja_audio_path = future_ja.result()
        hi_audio_path = future_hi.result()

    return text, Path(ja_audio_path), Path(hi_audio_path)


if __name__ == "__main__":
    # Launch the ultra-dynamic full-stack React + FastAPI experience and auto-open browser
    from run import main
    main()
