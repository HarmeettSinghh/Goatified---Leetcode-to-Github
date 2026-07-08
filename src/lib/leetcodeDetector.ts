import type { Difficulty, SubmissionDetails } from './types';

const GRAPHQL_ENDPOINT = `${window.location.origin}/graphql/`;

function getCsrfToken(): string {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrftoken': getCsrfToken()
    },
    body: JSON.stringify({ query, variables })
  });
  if (!res.ok) throw new Error('LeetCode GraphQL request failed.');
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? 'LeetCode GraphQL error.');
  return json.data as T;
}

function titleSlugFromUrl(): string {
  const match = window.location.pathname.match(/\/problems\/([^/]+)/);
  return match ? match[1] : '';
}

interface QuestionData {
  question: {
    questionFrontendId: string;
    title: string;
    difficulty: Difficulty;
    content: string;
  };
}

const QUESTION_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionFrontendId
      title
      difficulty
      content
    }
  }
`;

interface SubmissionDetailData {
  submissionDetails: {
    code: string;
    lang: { name: string };
    runtime: string;
    memory: string;
    runtimePercentile: number | null;
    memoryPercentile: number | null;
    timestamp: string;
  };
}

const SUBMISSION_DETAIL_QUERY = `
  query submissionDetails($submissionId: Int!) {
    submissionDetails(submissionId: $submissionId) {
      code
      lang { name }
      runtime
      memory
      runtimePercentile
      memoryPercentile
      timestamp
    }
  }
`;

function extractExamplesAndConstraints(contentHtml: string): {
  problemStatement: string;
  examples: string;
  constraints: string;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(contentHtml, 'text/html');

  const constraintsHeader = Array.from(doc.querySelectorAll('strong, p')).find((el) =>
    /constraints:/i.test(el.textContent ?? '')
  );

  let constraintsHtml = '';
  let statementHtml = contentHtml;

  if (constraintsHeader) {
    const nodesAfter: string[] = [];
    let node: Element | null = constraintsHeader.parentElement ?? constraintsHeader;
    let current: Element | null = node.nextElementSibling;
    while (current) {
      nodesAfter.push(current.outerHTML);
      current = current.nextElementSibling;
    }
    constraintsHtml = nodesAfter.join('');
    statementHtml = doc.body.innerHTML;
  }

  const examplesMatches = Array.from(doc.querySelectorAll('pre')).map((el) => el.outerHTML);
  const examplesHtml = examplesMatches.join('<br/>');

  return {
    problemStatement: statementHtml,
    examples: examplesHtml,
    constraints: constraintsHtml
  };
}

export async function getLatestSubmissionId(): Promise<number | null> {
  const titleSlug = titleSlugFromUrl();
  if (!titleSlug) return null;

  const origin = window.location.origin;
  const res = await fetch(
    `${origin}/submissions/detail/latest/?slug=${encodeURIComponent(titleSlug)}`,
    { credentials: 'include' }
  ).catch(() => null);
  
  if (res && res.ok) {
    try {
      const data = await res.json();
      if (data && data.submissionId) {
        return Number(data.submissionId);
      }
    } catch {
      // ignore, fall back to DOM
    }
  }

  const idFromDom = document.querySelector('[data-submission-id]')?.getAttribute('data-submission-id');
  if (idFromDom) return Number(idFromDom);

  const match = window.location.href.match(/submissions\/(\d+)/);
  if (match) return Number(match[1]);

  return null;
}

export async function buildSubmissionDetails(
  problemName: string,
  submissionId: number | null
): Promise<SubmissionDetails> {
  const titleSlug = titleSlugFromUrl();

  const { question } = await graphql<QuestionData>(QUESTION_QUERY, { titleSlug });
  const { problemStatement, examples, constraints } = extractExamplesAndConstraints(question.content);

  let code = '';
  let language = 'plaintext';
  let runtime = 'N/A';
  let memory = 'N/A';
  let runtimePercentile: string | undefined;
  let memoryPercentile: string | undefined;
  let submissionTimeISO = new Date().toISOString();

  if (submissionId) {
    try {
      const { submissionDetails } = await graphql<SubmissionDetailData>(SUBMISSION_DETAIL_QUERY, {
        submissionId
      });
      code = submissionDetails.code;
      language = submissionDetails.lang.name;
      runtime = submissionDetails.runtime;
      memory = submissionDetails.memory;
      runtimePercentile = submissionDetails.runtimePercentile
        ? `${submissionDetails.runtimePercentile.toFixed(2)}%`
        : undefined;
      memoryPercentile = submissionDetails.memoryPercentile
        ? `${submissionDetails.memoryPercentile.toFixed(2)}%`
        : undefined;
      submissionTimeISO = new Date(Number(submissionDetails.timestamp) * 1000).toISOString();
    } catch {
      // fall through to DOM scraping
    }
  }

  if (!code) {
    const editorLines = document.querySelectorAll('.view-line');
    if (editorLines.length > 0) {
      code = Array.from(editorLines)
        .map((line) => line.textContent ?? '')
        .join('\n');
    }
  }

  return {
    titleSlug,
    problemName: problemName || question.title,
    questionId: question.questionFrontendId,
    difficulty: question.difficulty,
    language,
    runtime,
    runtimePercentile,
    memory,
    memoryPercentile,
    submissionTimeISO,
    problemUrl: `${window.location.origin}/problems/${titleSlug}/`,
    code,
    problemStatementHtml: problemStatement,
    examplesHtml: examples,
    constraintsHtml: constraints
  };
}
