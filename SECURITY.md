# Security Policy 🔒

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| < 2.0   | :x:                |

---

## 🛡️ Reporting a Vulnerability

Security is paramount for projects handling voice data and external API credentials.

If you discover a security vulnerability in TOLK, please **do not create a public issue**. Instead, follow responsible disclosure practices:

1. **Email the maintainers directly** or use [GitHub Private Vulnerability Reporting](https://github.com).
2. Include a detailed description of the vulnerability, steps to reproduce, and a proof of concept if available.
3. We will acknowledge receipt of your report within 48 hours and work with you to remediate the issue promptly before public disclosure.

---

## ⚠️ API Key & Audio Safety

- **Never commit your `.env` file** or hardcode API keys in any tracked git files.
- The built-in `.gitignore` automatically prevents `.env`, `tolk_audio_cache`, and temporary `.mp3`/`.wav` recordings from being committed to version control.
- In-memory and temporary audio processing files are removed automatically upon completion.
