
"""
TOLK - Multi-Language Voice Translator (v2.0)
Full-Stack AI Voice-to-Voice Translator with React Frontend & FastAPI Engine.
"""

import os
import uuid
import tempfile
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

import assemblyai as aai
from deep_translator import GoogleTranslator
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# --- API KEYS AND CONFIGURATION ---
# Never hardcode API keys in source code.
ASSEMBLYAI_KEY = os.getenv("ASSEMBLYAI_KEY")
ELEVENLABS_KEY = os.getenv("ELEVENLABS_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID")

# Initialize the ElevenLabs client only when a key is configured.
ELEVENLABS_CLIENT = (
    ElevenLabs(api_key=ELEVENLABS_KEY)
    if ELEVENLABS_KEY
    else None
)


def text_to_speech_concurrent(text, voice_id=None):
    """Converts translated text into speech using ElevenLabs."""
    if not ELEVENLABS_CLIENT:
        raise RuntimeError(
            "ELEVENLABS_KEY is missing. Configure it in your .env file."
        )

    voice_id = voice_id or ELEVENLABS_VOICE_ID
    if not voice_id:
        raise RuntimeError(
            "ELEVENLABS_VOICE_ID is missing from your configuration."
        )

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

    save_file_path = (
        Path(tempfile.gettempdir()) / f"{uuid.uuid4()}.mp3"
    )

    with open(save_file_path, "wb") as audio_file:
        for chunk in response:
            if chunk:
                audio_file.write(chunk)

    return str(save_file_path)


def audio_transcription(audio_file):
    """Transcribes audio using AssemblyAI."""
    if not ASSEMBLYAI_KEY:
        raise RuntimeError(
            "ASSEMBLYAI_KEY is missing. Configure it in your .env file."
        )

    aai.settings.api_key = ASSEMBLYAI_KEY
    transcriber = aai.Transcriber()
    return transcriber.transcribe(audio_file)


def text_translation(text):
    """Translates text into Japanese and Hindi."""
    try:
        ja_text = GoogleTranslator(
            source="auto", target="ja"
        ).translate(text)
    except Exception as exc:
        raise RuntimeError(
            f"Japanese translation failed: {exc}"
        ) from exc

    try:
        hi_text = GoogleTranslator(
            source="auto", target="hi"
        ).translate(text)
    except Exception as exc:
        raise RuntimeError(
            f"Hindi translation failed: {exc}"
        ) from exc

    return ja_text, hi_text


def voice_to_voice(audio_file):
    """Main voice-to-voice processing function."""
    if not audio_file:
        raise ValueError("No audio file received.")

    transcription_response = audio_transcription(audio_file)

    if transcription_response.status == aai.TranscriptStatus.error:
        raise RuntimeError(
            f"Transcription failed: {transcription_response.error}"
        )

    text = transcription_response.text
    if not text:
        raise ValueError("Transcription returned empty text.")

    ja_translation, hi_translation = text_translation(text)

    with ThreadPoolExecutor(max_workers=2) as executor:
        future_ja = executor.submit(
            text_to_speech_concurrent, ja_translation
        )
        future_hi = executor.submit(
            text_to_speech_concurrent, hi_translation
        )

        ja_audio_path = future_ja.result()
        hi_audio_path = future_hi.result()

    return text, Path(ja_audio_path), Path(hi_audio_path)


if __name__ == "__main__":
    # Launch the React + FastAPI application.
    from run import main
    main()
