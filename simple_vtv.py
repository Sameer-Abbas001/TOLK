
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
from deep_translator import GoogleTranslator, MyMemoryTranslator
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# --- API KEYS AND CONFIGURATION ---
ASSEMBLYAI_KEY = os.getenv("ASSEMBLYAI_KEY", "")
ELEVENLABS_KEY = os.getenv("ELEVENLABS_KEY", "")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")
FREE_TIER_VOICE = "JBFqnCBsd6RMkjVDRZzb"


def text_to_speech_concurrent(text, voice_id=None):
    """Converts translated text into speech using ElevenLabs with automatic fallback."""
    key = os.getenv("ELEVENLABS_KEY", ELEVENLABS_KEY)
    if not key:
        raise RuntimeError(
            "ELEVENLABS_KEY is missing. Configure it in your .env file."
        )

    if not key.startswith("sk_") and len(key) == 64:
        raise RuntimeError(
            "ElevenLabs API Key ID used as API key. Only valid Secret API keys starting with 'sk_' can be used. "
            "Please create or rotate your key in your ElevenLabs dashboard (Settings > API Keys) to copy the secret key."
        )

    client = ElevenLabs(api_key=key)
    vid = voice_id or os.getenv("ELEVENLABS_VOICE_ID", ELEVENLABS_VOICE_ID)
    if not vid:
        raise RuntimeError(
            "ELEVENLABS_VOICE_ID is missing from your configuration."
        )

    def _convert(target_v):
        res = client.text_to_speech.convert(
            voice_id=target_v,
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
        return b"".join(c for c in res if c)

    try:
        try:
            audio_bytes = _convert(vid)
        except Exception as v_err:
            if "library voices" in str(v_err).lower() or "paid_plan_required" in str(v_err).lower():
                print(f"[simple_vtv] Voice {vid} requires paid plan. Falling back to core voice George...")
                audio_bytes = _convert(FREE_TIER_VOICE)
            else:
                raise

        save_file_path = (
            Path(tempfile.gettempdir()) / f"{uuid.uuid4()}.mp3"
        )

        with open(save_file_path, "wb") as audio_file:
            audio_file.write(audio_bytes)

        return str(save_file_path)
    except Exception as exc:
        if hasattr(exc, "body") and isinstance(exc.body, dict):
            detail = exc.body.get("detail", {})
            if isinstance(detail, dict) and "message" in detail:
                raise RuntimeError(f"ElevenLabs speech synthesis error: {detail['message']}") from exc
        raise
    except Exception as exc:
        if hasattr(exc, "body") and isinstance(exc.body, dict):
            detail = exc.body.get("detail", {})
            if isinstance(detail, dict) and "message" in detail:
                raise RuntimeError(f"ElevenLabs speech synthesis error: {detail['message']}") from exc
        raise


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
    """Translates text into Japanese and Hindi with resilient fallback."""
    def _translate(lang, tag):
        try:
            return GoogleTranslator(source="auto", target=lang).translate(text)
        except Exception:
            try:
                import re
                res = MyMemoryTranslator(source="en-US", target=tag).translate(text)
                return re.sub(r"<[^>]+>", "", res).strip()
            except Exception as exc:
                raise RuntimeError(f"Translation to {lang} failed: {exc}") from exc

    ja_text = _translate("ja", "ja-JP")
    hi_text = _translate("hi", "hi-IN")
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
