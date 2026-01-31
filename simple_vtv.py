import gradio as gr
import assemblyai as aai
from translate import Translator
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs
import uuid
from pathlib import Path
import tempfile
import os
from concurrent.futures import ThreadPoolExecutor
# Import utilities for custom colors
from gradio.themes.utils import colors 

# --- API KEYS AND CONFIGURATION ---
# NOTE: Using environment variables is best practice for production!
ASSEMBLYAI_KEY = "53943ab29c08425e21dc240"
ELEVENLABS_KEY = "ac81e47504a2cea72745cb44b8da857f823882081f8"
# 🎤 VOICE ID
ELEVENLABS_VOICE_ID = "gO8Kb3hHPEPElVxVHDwT" 

# Initialize ElevenLabs client globally (or once per session)
ELEVENLABS_CLIENT = ElevenLabs(api_key=ELEVENLABS_KEY)

# --- Concurrent TTS Execution (Functions remain the same) ---

def text_to_speech_concurrent(text):
    """
    Converts the translated text into speech using the globally initialized ElevenLabs client.
    This function is designed to be called concurrently.
    """
    
    # ElevenLabs conversion API call
    response = ELEVENLABS_CLIENT.text_to_speech.convert(
        voice_id=ELEVENLABS_VOICE_ID,
        # Setting latency to 1 for faster generation, though it might affect quality slightly
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
    
    # Save the file to a temporary directory
    temp_dir = tempfile.gettempdir()
    save_file_path = Path(temp_dir) / f"{uuid.uuid4()}.mp3"
    
    # Writing the audio stream to a file
    with open(save_file_path, "wb") as f:
        # Optimized: Write response chunks directly
        for chunk in response:
            if chunk:
                f.write(chunk)
    
    print(f"Saved TTS file to: {save_file_path}")
    return str(save_file_path)

# --- Core Logic Functions (Functions remain the same) ---

def audio_transcription(audio_file):
    """Initializes AssemblyAI and transcribes the audio file."""
    aai.settings.api_key = ASSEMBLYAI_KEY
    transcriber = aai.Transcriber()
    # Using 'v2_high_accuracy' model can be slower but more accurate. 
    # For speed, we stick to the default unless high accuracy is strictly needed.
    transcription = transcriber.transcribe(audio_file) 
    return transcription


def text_translation(text):
    """
    Translates the text into Japanese and Hindi using the 'translate' library.
    """
    translator_ja = Translator(from_lang="en", to_lang="ja")
    ja_text = translator_ja.translate(text)
    
    translator_hi = Translator(from_lang="en", to_lang="hi")
    hi_text = translator_hi.translate(text)
    
    return ja_text, hi_text


def voice_to_voice(audio_file):
    """
    Main function using ThreadPoolExecutor for concurrent TTS processing.
    This drastically improves speed by parallelizing the network calls to ElevenLabs.
    """
    if not audio_file:
        raise gr.Error("No audio file received. Please record or upload an audio clip.")
        
    print(f"Processing audio file: {audio_file}")

    try:
        # 1. Transcribe audio (Sequential)
        transcription_response = audio_transcription(audio_file)

        if transcription_response.status == aai.TranscriptStatus.error:
            raise gr.Error(f"Transcription failed: {transcription_response.error}")
        else:
            text = transcription_response.text
            if not text:
                raise gr.Error("Transcription returned empty text. Please record a clearer clip.")
        
        # 2. Translate text (Sequential)
        ja_translation, hi_translation = text_translation(text)
        
        # 3. Text to speech (Parallel Execution)
        # Use ThreadPoolExecutor to run both TTS calls simultaneously
        with ThreadPoolExecutor(max_workers=2) as executor:
            future_ja = executor.submit(text_to_speech_concurrent, ja_translation)
            future_hi = executor.submit(text_to_speech_concurrent, hi_translation)
            
            # Wait for results
            ja_audio_path = future_ja.result()
            hi_audio_path = future_hi.result()

        # Return paths as pathlib.Path objects and the original text
        return text, Path(ja_audio_path), Path(hi_audio_path)

    except Exception as e:
        raise gr.Error(f"An error occurred during processing: {e}")


# --- GRADIO INTERFACE SETUP ---

# Define the outputs 
original_text = gr.Textbox(label="▶️ Transcribed Text (English)", interactive=False)
ja_audio = gr.Audio(label="🇯🇵 Japanese (日本語) Translation", elem_id="ja-audio")
hi_audio = gr.Audio(label="🇮🇳 Hindi (हिंदी) Translation", elem_id="hi-audio")

# CUSTOM COLORFUL THEME
colorful_theme = gr.themes.Monochrome(
    primary_hue=colors.blue,  
    secondary_hue=colors.orange, 
    font=[gr.themes.GoogleFont("Inter"), "sans-serif"],
).set(
    body_background_fill_dark="rgb(30, 30, 40)", 
    button_primary_background_fill_dark="rgb(37, 99, 235)", 
    button_primary_border_color_dark="rgb(37, 99, 235)",
    slider_color_dark="rgb(37, 99, 235)",
    
)

# Custom CSS for the main title to increase font size and change family
custom_css = """
/* The outer container set by elem_id="main-title" */
#main-title {
    /* Set the overall font color for the entire title area to gold */
    color: #FFD700 !important; 
}

/* Container for the new custom heading structure */
#main-title #custom-heading-container {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    margin-bottom: 1rem;
}

/* Styling for 'Tolk' */
#main-title #tolk-word {
    font-size: 6rem !important; /* Massive size for 'Tolk' */
    font-family: 'Georgia', serif;
    line-height: 1; /* Prevent excessive line height/spacing */
    font-weight: 900;
}

/* Styling for 'Multi-Language Translater' */
#main-title #rest-of-title {
    font-size: 2.5rem !important; /* Smaller size for the rest */
    font-family: 'Inter', sans-serif; /* Back to original font */
    font-weight: 700;
}
"""

# 1. Update the title for the browser tab, and include CSS
with gr.Blocks(theme=colorful_theme, title="Tolk Multi-Language Translater", css=custom_css) as demo: 
    gr.Markdown(
        # 2. Update the main heading using HTML for individual styling
        f"""
        <div id='custom-heading-container'>
            <span id='tolk-word'>🗣️ Tolk</span> 
            <span id='rest-of-title'>Multi-Language Translater 🌍</span>
        </div>
        Record an English phrase and hear the translated speech in your cloned voice in **Japanese and Hindi**.
        """,
        elem_id="main-title" # Added elem_id for custom CSS targeting
    )
    
    with gr.Row():
        # INPUT COLUMN
        with gr.Column(scale=1):
            gr.Markdown("### 🎤 Step 1: Record or Upload Your Voice (English)")
            audio_input = gr.Audio(
                sources=["microphone", "upload"],
                type="filepath",
                format="wav", 
                label="Source Audio Clip",
                elem_id="audio-input"
            )
            process_button = gr.Button("🚀 Translate & Synthesize (Optimized Speed)", variant="primary")

        # OUTPUT COLUMN
        with gr.Column(scale=2):
            gr.Markdown("### 📝 Step 2: Transcription & Translation Results")
            original_text.render()
            gr.Markdown("---")
            gr.Markdown("### 🎧 Step 3: Listen to the Translated Audio")
            
            # Use a two-column grid for the two remaining outputs
            with gr.Row():
                with gr.Column():
                    ja_audio.render()
                with gr.Column():
                    hi_audio.render()

    # Define the button action
    process_button.click(
        fn=voice_to_voice,
        inputs=[audio_input],
        outputs=[original_text, ja_audio, hi_audio]
    )
    

if __name__ == "__main__":
    # LAUNCH CONFIGURATION
    demo.launch(width="100%", height=900)
