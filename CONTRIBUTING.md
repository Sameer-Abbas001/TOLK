# Contributing to TOLK 🌐

Thank you for your interest in contributing to **TOLK**! We welcome contributions from developers, designers, translators, and AI enthusiasts of all skill levels.

---

## 📋 Code of Conduct

Please be respectful, constructive, and courteous in all interactions. We strive to create an inclusive and welcoming environment for everyone.

---

## 🛠️ How to Contribute

### 1. Reporting Bugs
- Check the [Issues](../../issues) tab to see if the bug has already been reported.
- If not, create a new issue using our **Bug Report** template.
- Include detailed reproduction steps, error logs, and your OS/browser/Python version.

### 2. Suggesting Enhancements
- Open a feature request under [Issues](../../issues) detailing the feature, use case, and potential implementation approach.

### 3. Submitting Code Changes

1. **Fork the Repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/TOLK.git
   cd TOLK
   ```
3. **Create a new branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Set up local development**:
   ```bash
   # Backend virtual environment
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   pip install -r requirements.txt

   # Frontend development
   cd frontend
   npm install
   npm run dev
   ```
5. **Make your changes and test thoroughly**.
6. **Commit your changes** with clear, descriptive messages:
   ```bash
   git commit -m "feat: add support for Italian voice cloning model"
   ```
7. **Push to your branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request** against the `main` branch.

---

## 📐 Coding Guidelines

- **Python**: Follow PEP 8 style guidelines. Ensure type hints and descriptive docstrings are used where appropriate.
- **Frontend (React)**:
  - Functional components with React Hooks.
  - Keep styling modular, accessible, and responsive.
  - Run `npm run lint` and `npm run build` before submitting PRs.

---

## 💬 Questions or Feedback?

Feel free to open a GitHub Discussion or submit an issue. We appreciate your contributions!
