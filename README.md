# Goatified---Leetcode-to-Github
# 🐐 Goatified

> A Chrome Extension that lets you manually save your accepted LeetCode solutions to GitHub with a single click.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Chrome Extension](https://img.shields.io/badge/Chrome-Manifest%20V3-green)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📖 About

Goatified is a Chrome Extension built for developers who want to maintain a clean and organized archive of their LeetCode solutions on GitHub.

Unlike tools that automatically push every accepted submission, Goatified gives you complete control by allowing you to manually save only the solutions you want.

Each saved problem is organized into its own folder containing a well-structured `README.md` and supporting metadata, making your repository useful for revision, interview preparation, and portfolio building.

---

## ✨ Features

- 🚀 Detects accepted LeetCode submissions
- 📤 Manual **Save to GitHub** button
- 📁 Creates a separate folder for every problem
- 📄 Generates a well-formatted `README.md`
- 📋 Stores problem metadata
- 🔍 Prevents duplicate uploads
- 🌙 Clean and modern interface
- ⚡ Lightweight and fast
- 🔒 Uses your own GitHub Personal Access Token

---

## 📂 Repository Structure

```
DSA-Progress/

├── Two Sum/
│   ├── README.md
│   └── metadata.json
│
├── Valid Parentheses/
│   ├── README.md
│   └── metadata.json
│
└── Merge Strings Alternately/
    ├── README.md
    └── metadata.json
```

---

## 📄 Generated README

Each problem folder contains a `README.md` including:

- Problem Name
- Difficulty
- Programming Language
- Runtime
- Memory Usage
- Problem Statement
- Examples
- Constraints
- Your Submitted Solution
- Submission Date
- Original LeetCode Link

---

## 🖼️ Screenshots

### Extension Popup

> *(Add screenshot here)*

### Save to GitHub Button

> *(Add screenshot here)*

### Generated Repository

> *(Add screenshot here)*

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
- Vite

### Browser APIs

- Chrome Extensions Manifest V3
- Chrome Storage API
- Content Scripts
- Background Service Worker

### APIs

- GitHub REST API

---

## ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/Goatified.git
```

Install dependencies

```bash
npm install
```

Build the project

```bash
npm run build
```

Open Chrome and navigate to

```
chrome://extensions
```

- Enable **Developer Mode**
- Click **Load unpacked**
- Select the generated `dist` folder

---

## 🔑 GitHub Setup

Create a **Fine-grained Personal Access Token** with the following permission:

| Repository Permission | Access |
|----------------------|--------|
| Contents | Read & Write |

Paste the generated token into Goatified and connect your GitHub account.

---

## 🚀 How to Use

1. Open any LeetCode problem.
2. Solve the problem.
3. Submit your solution.
4. Wait for the **Accepted** verdict.
5. Click the **📤 Save to GitHub** button.
6. Your solution will be uploaded to your configured GitHub repository.

---

## 🤝 Contributing

Contributions are welcome!

If you'd like to improve Goatified:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Harmeet Singh**

B.Tech Computer Science & Engineering

GitHub: https://github.com/YOUR_USERNAME

---

⭐ If you like Goatified, consider giving the repository a star!
