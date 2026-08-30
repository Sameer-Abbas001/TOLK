import os
import sys
import time
import subprocess
import webbrowser
import urllib.request
import threading
from pathlib import Path
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Paths
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"
DIST_DIR = FRONTEND_DIR / "dist"

def print_banner():
    print(r"""
  ===================================================================
     🗣️  TOLK - NEXT-GEN MULTI-LANGUAGE VOICE TRANSLATOR AI  🌍
  ===================================================================
  * AssemblyAI Neural Transcription
  * Polyglot Real-Time Multi-Language Translation
  * ElevenLabs High-Fidelity Voice Cloning Synthesis
  * Ultra-Dynamic React UI with Live Canvas Audio Visualizer
  ===================================================================
    """)

def ensure_frontend_built():
    """Build the frontend if dist is missing or package.json exists."""
    if not (DIST_DIR / "index.html").exists():
        print("📦 Building ultra-dynamic React frontend...")
        if FRONTEND_DIR.exists():
            if not (FRONTEND_DIR / "node_modules").exists():
                print("⏳ Installing frontend dependencies (npm install)...")
                subprocess.run("npm install", shell=True, cwd=str(FRONTEND_DIR), check=False)
            print("⚡ Generating production optimized assets (npm run build)...")
            subprocess.run("npm run build", shell=True, cwd=str(FRONTEND_DIR), check=False)
        else:
            print("⚠️ Frontend directory not found. Proceeding with API server only.")

def open_browser_when_ready(url, max_attempts=40, interval=0.3):
    """Waits for server to respond and then opens the browser automatically."""
    print(f"🚀 Waiting for TOLK server to be ready on {url}...")
    for _ in range(max_attempts):
        try:
            with urllib.request.urlopen(f"{url}/api/health", timeout=1) as response:
                if response.status == 200:
                    print(f"✨ Server is ready! Automatically opening your browser: {url}")
                    webbrowser.open(url)
                    return
        except Exception:
            time.sleep(interval)
    print(f"🔗 Ready! If browser didn't open automatically, please open: {url}")
    webbrowser.open(url)

def find_available_port(host="127.0.0.1", start_port=5000):
    import socket
    port = start_port
    while port < start_port + 100:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind((host, port))
                return port
        except OSError:
            port += 1
    return start_port

def main():
    print_banner()
    os.chdir(str(BASE_DIR))
    
    # 1. Build frontend if needed
    ensure_frontend_built()

    # Find free port
    host = "127.0.0.1"
    port = find_available_port(host, 5000)
    target_url = f"http://{host}:{port}"

    # 2. Start background thread to auto-open browser
    threading.Thread(target=open_browser_when_ready, args=(target_url,), daemon=True).start()

    # 3. Start uvicorn server
    print(f"🌐 Launching TOLK FastAPI server on {target_url}...")
    import uvicorn
    from server import app
    uvicorn.run(app, host=host, port=port, log_level="info")

if __name__ == "__main__":
    main()

