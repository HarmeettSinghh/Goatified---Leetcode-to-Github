# 🐐 Goatified — LeetCode to GitHub

[![GitHub license](https://img.shields.io/github/license/HarmeettSinghh/Goatified---Leetcode-to-Github)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/HarmeettSinghh/Goatified---Leetcode-to-Github)](https://github.com/HarmeettSinghh/Goatified---Leetcode-to-Github/issues)
[![GitHub stars](https://img.shields.io/github/stars/HarmeettSinghh/Goatified---Leetcode-to-Github)](https://github.com/HarmeettSinghh/Goatified---Leetcode-to-Github/stargazers)

Save your **Accepted** LeetCode solutions to a GitHub repository with one click — directly from your browser. 

Goatified watches for accepted solutions on both **LeetCode.com** and **LeetCode.cn** and lets you commit them instantly. Nothing is ever uploaded automatically; you are always in complete control.

---

## Features

- **LeetCode & LeetCode CN Support**: Automatically detects when a submission status is "Accepted" or "通过".
- **Dynamic Floating UI**: A floating "Save to GitHub" button appears overlays on accepted solutions.
- **Interactive Preview Modal**: Review details (difficulty, language, runtime, memory, code) and select the target repository before committing.
- **Duplicate Detection**: Automatically checks the destination repository for existing files for that problem and prompts you to **Cancel** or **Force Update**.
- **Clean Folder Structure**: Organizes folders dynamically in the form `{QuestionNumber}_{ProblemName}` (e.g., `1_TwoSum/`).
- **Formatted Outputs**: Commits a detailed `README.md` (containing problem statement, example cases, constraints, and your solution code) along with a `metadata.json` sidecar.
- **Togglable Repository Creation**: Select from existing repositories or toggle the helper to create a brand new repo directly inside the extension popup.
- **Non-Intrusive Layout**: Content script styles are strictly scoped to avoid leaking CSS overrides into LeetCode's page layout.
- **Secure Token Storage**: Persists credentials locally using `chrome.storage.local`—tokens never leave your browser except to query the official GitHub API.

---

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Bundler**: Vite 5 + `@crxjs/vite-plugin` (Manifest V3, hot-reload friendly)
- **Styling**: Tailwind CSS (scoped to prevent global layout resets)
- **APIs**: GitHub REST API (Contents API for file commits), LeetCode GraphQL / Submission APIs

---

## Project Structure

```
goatified/
├─ manifest.json                 # MV3 manifest configuration
├─ vite.config.ts                # Vite config using CRXJS
├─ tailwind.config.js            # Scoped Tailwind settings
├─ public/icons/                 # Extension icons
├─ src/
│  ├─ background/
│  │  └─ serviceWorker.ts        # Service worker routing storage & GitHub API requests
│  ├─ content/
│  │  ├─ main.tsx                # Entry point injecting React into LeetCode
│  │  ├─ App.tsx                 # MutationObserver looking for accepted status
│  │  ├─ content.css             # Scoped styles for overlay modal
│  │  └─ components/
│  │     ├─ FloatingButton.tsx   # Save overlay button
│  │     ├─ PreviewModal.tsx     # Details verification & repository chooser
│  │     └─ Toast.tsx            # Floating success/error notifications
│  ├─ popup/
│  │  ├─ index.html              # Popup viewport
│  │  ├─ Popup.tsx               # Settings, PAT verification, & repo selector UI
│  │  └─ main.tsx                # Popup React mount
│  └─ lib/
│     ├─ types.ts                # App contracts & messaging types
│     ├─ storage.ts              # chrome.storage.local wrapper
│     ├─ github.ts               # GitHub API client (commits, verification, repos)
│     ├─ leetcodeDetector.ts     # LeetCode GraphQL scrapers
│     └─ messaging.ts            # Typed chrome.runtime messaging helper
```

---

## Setup & Installation

### 1. Install Dependencies
Clone the repository and run:
```bash
npm install
```

### 2. Build the Extension
Build the production-ready package:
```bash
npm run build
```
This compiles the TypeScript files and places the output into the `dist/` directory.

### 3. Load into Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the **`dist/`** folder inside your project directory (`goatified/dist`).

---

## Configuration

### GitHub Token Setup

To commit files to your repositories, the extension requires a GitHub Personal Access Token (PAT):

#### A. Fine-Grained Personal Access Token (Recommended)
1. Go to your GitHub [Tokens Settings](https://github.com/settings/tokens?type=beta).
2. Click **Generate new token**.
3. Under **Repository access**, select **All repositories** (or **Only select repositories** and add your tracker repo).
4. Under **Permissions** -> **Repository permissions** -> **Contents**, set the dropdown to **Read and write**.
5. Generate the token, copy it, and paste it into the Goatified popup.

#### B. Classic Personal Access Token
1. Go to your GitHub [Classic Tokens Settings](https://github.com/settings/tokens).
2. Click **Generate new token (classic)**.
3. Select the **`repo`** scope checkbox (grants full write access to repositories).
4. Generate the token, copy it, and paste it into the Goatified popup.

---

## How to Use

1. Click on the Goatified extension 🐐 in your toolbar.
2. Paste your GitHub token and click **Connect GitHub**.
3. Select your target repository from the dropdown menu (e.g. `LeetcodeRevisionTracker`).
4. Go to LeetCode and solve any problem.
5. Upon submitting and receiving an **Accepted** (or **通过**) result, click the floating **Save to GitHub** button that overlays on your screen.
6. Verify your code and click **Save to GitHub** in the modal.
7. Click the **View on GitHub** button in the success toast to inspect your commit!

---

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

## License

This project is licensed under the [MIT License](LICENSE).
