import type { RepoMetadata, SubmissionDetails } from './types';

function htmlToMarkdown(html: string): string {
  if (!html) return '_Not available._';
  let text = html
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<sup>(.*?)<\/sup>/gi, '^$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''))
    .join('\n')
    .trim();
}

const LANGUAGE_FENCE_MAP: Record<string, string> = {
  'c++': 'cpp',
  cpp: 'cpp',
  java: 'java',
  python: 'python',
  python3: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  'c#': 'csharp',
  c: 'c',
  go: 'go',
  golang: 'go',
  kotlin: 'kotlin',
  swift: 'swift',
  rust: 'rust',
  ruby: 'ruby',
  scala: 'scala',
  php: 'php'
};

export function fenceLanguage(language: string): string {
  return LANGUAGE_FENCE_MAP[language.toLowerCase()] ?? language.toLowerCase();
}

export function generateReadme(submission: SubmissionDetails): string {
  const fence = fenceLanguage(submission.language);
  const submissionDate = new Date(submission.submissionTimeISO).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return `# ${submission.problemName}

**Difficulty:** ${submission.difficulty}
**Language:** ${submission.language}
**Runtime:** ${submission.runtime}${submission.runtimePercentile ? ` (beats ${submission.runtimePercentile})` : ''}
**Memory:** ${submission.memory}${submission.memoryPercentile ? ` (beats ${submission.memoryPercentile})` : ''}
**Submission Date:** ${submissionDate}
**Problem URL:** [${submission.problemUrl}](${submission.problemUrl})

---

## Problem Statement

${htmlToMarkdown(submission.problemStatementHtml)}

---

## Examples

${htmlToMarkdown(submission.examplesHtml)}

---

## Constraints

${htmlToMarkdown(submission.constraintsHtml)}

---

## My Solution

\`\`\`${fence}
${submission.code}
\`\`\`
`;
}

export function generateMetadata(meta: RepoMetadata): string {
  return JSON.stringify(meta, null, 2) + '\n';
}

export function slugifyFolderName(questionId: string, problemName: string): string {
  const cleanName = problemName.trim().replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '');
  return `${questionId}_${cleanName}`;
}
