# TOLK — single-project Vercel deployment

This version deploys the React/Vite frontend and FastAPI backend in **one Vercel project**. The browser calls `/api/...` on the same domain, and FastAPI serves the built frontend.

## Before deploying

1. Rotate/revoke any AssemblyAI or ElevenLabs keys that were ever committed to GitHub. The previous source contained hardcoded credentials; deleting them from the latest file does not invalidate old keys.
2. Do not upload `.env`. This archive excludes it. Keep real credentials in Vercel Environment Variables only.
3. Commit this updated project to a clean GitHub repository. Do not commit `.git`, `node_modules`, `dist`, `__pycache__`, or `.env`.

## Vercel project settings

Create a **new Vercel project** from the updated repository (for example, `tolk-fullstack`). Do not use the old `tolk-frontend` project configuration because that project was rooted at `frontend`.

- Git repository: your updated TOLK repository
- Root Directory: `./` (repository root, not `frontend`)
- Framework: FastAPI (Vercel should detect the root `server.py` FastAPI app)
- Build Command: `npm run build` (defined in `vercel.json`)
- Output Directory: leave blank
- Install Command: leave automatic/default

The root `server.py` exports the FastAPI object named `app`, which Vercel recognizes as the Python application entrypoint. `vercel.json` runs the Vite build before deployment and sets a 300-second function duration.

## Environment variables

In Vercel → Project → Settings → Environment Variables, add:

| Name | Value |
|---|---|
| `ASSEMBLYAI_KEY` | A newly generated AssemblyAI API secret |
| `ELEVENLABS_KEY` | A newly generated ElevenLabs secret key (starts with `sk_`) |
| `ELEVENLABS_VOICE_ID` | Your permitted ElevenLabs voice ID |

Apply to Production and Preview as required, save, then redeploy. Never use `VITE_` for private credentials.

## Important Vercel limits for this project

Vercel Function request and response payloads have a 4.5 MB limit. This build therefore:
- Limits uploaded audio to 4 MB in the UI and backend.
- Returns generated audio as inline data URLs so it does not depend on a temporary file being available to a later serverless invocation.
- Caps combined inline audio in one response to approximately 3 MB. If generated audio exceeds the cap, the translation text is still returned but the affected audio result will contain an explanatory `audioError`.

For audio files larger than 4 MB, long recordings, or heavier/longer jobs, use a persistent object-storage upload flow or deploy FastAPI on a persistent container host instead. Vercel's temporary filesystem is not durable storage.

## Local development

The existing `run.py` still starts FastAPI on port 5000. `frontend/vite.config.js` proxies `/api` requests to `http://127.0.0.1:5000`, so local development continues to use the same relative API paths as production.

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cd frontend
npm install
cd ..
python run.py
```

## Smoke tests after deployment

Open these URLs on the same Vercel domain:

- `/api/health` — should return JSON with `"status": "online"`.
- `/api/languages` — should return the supported language list.
- `/` — should load the TOLK frontend.

Then test a short audio clip below 4 MB and one or two target languages first.

## What this deployment does not guarantee

The build configuration and code are prepared for Vercel's FastAPI runtime, but a successful deployment cannot be guaranteed until Vercel installs the dependencies and the new API credentials are configured. Provider quotas, unsupported voice IDs, provider outages, and function limits can still cause runtime errors.
