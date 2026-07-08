# Contributing to Goatified

First off, thank you for considering contributing to Goatified! It is people like you who make the open-source community such an amazing place to learn, inspire, and create.

Please read through these guidelines to understand how you can best participate in the development of this project.

## How Can I Contribute?

### Reporting Bugs
If you find a bug while using the extension:
1. Check the existing Issues to make sure it hasn't already been reported.
2. If it's a new issue, open a new **Bug Report** using the template.
3. Be as detailed as possible, including:
   - Steps to reproduce the bug.
   - Your environment details (Chrome version, OS).
   - Any relevant logs from the Chrome Extension background service worker or LeetCode console.

### Requesting Features
Have an idea for a feature or improvements?
1. Check existing feature requests.
2. If it's new, open a new **Feature Request** using the template.
3. Describe the use-case clearly and explain why it would be beneficial to most users.

### Submitting Pull Requests
If you want to contribute code to fix a bug or implement a feature:
1. Fork the repository.
2. Clone your fork locally.
3. Create a branch for your changes:
   ```bash
   git checkout -b feature/my-amazing-feature
   ```
4. Install dependencies and verify everything runs:
   ```bash
   npm install
   npm run dev
   ```
5. Implement your changes. Make sure your code compiles and adheres to TypeScript guidelines.
6. Verify the build is clean:
   ```bash
   npm run build
   ```
7. Commit your changes with descriptive commit messages.
8. Push your branch to GitHub and open a Pull Request against the main branch of `HarmeettSinghh/Goatified---Leetcode-to-Github`.
9. Complete the checklist in the PR template.

## Code Style & Standards
- **TypeScript**: The project is written in TypeScript. Ensure correct typing and avoid using `any` where possible.
- **Tailwind CSS**: The content script modal and popup styled elements use Tailwind. Be mindful not to import Tailwind's base reset styles into the content script (it would break LeetCode's layout).
- **Clean Code**: Remove unused imports, variables, and debug logs before committing.

## License
By contributing to Goatified, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
