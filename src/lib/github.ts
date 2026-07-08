import type { GitHubRepo, GitHubUser } from './types';

const GITHUB_API = 'https://api.github.com';

export class GitHubApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

export async function verifyToken(token: string): Promise<GitHubUser> {
  const res = await fetch(`${GITHUB_API}/user`, { headers: authHeaders(token) });
  if (!res.ok) {
    throw new GitHubApiError('Invalid GitHub token. Please check your Personal Access Token.', res.status);
  }
  const scopes = res.headers.get('x-oauth-scopes');
  if (scopes) {
    const scopeList = scopes.split(',').map((s) => s.trim());
    if (!scopeList.includes('repo')) {
      throw new GitHubApiError('Your GitHub token is missing the required "repo" scope.', 403);
    }
  }
  const data = await res.json();
  return { login: data.login, avatar_url: data.avatar_url, name: data.name };
}

export async function listRepositories(token: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `${GITHUB_API}/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator`,
      { headers: authHeaders(token) }
    );
    if (!res.ok) throw new GitHubApiError('Failed to list repositories.', res.status);
    const data: GitHubRepo[] = await res.json();
    repos.push(...data);
    if (data.length < 100) break;
    page += 1;
    if (page > 10) break;
  }
  return repos;
}

export async function createRepository(token: string, name: string): Promise<GitHubRepo> {
  const res = await fetch(`${GITHUB_API}/user/repos`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      description: 'My DSA / LeetCode progress, tracked by Goatified.',
      private: false,
      auto_init: true
    })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new GitHubApiError(body.message ?? 'Failed to create repository.', res.status);
  }
  return res.json();
}

export interface FileCheckResult {
  exists: boolean;
  sha?: string;
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

export async function checkFileExists(
  token: string,
  repoFullName: string,
  path: string
): Promise<FileCheckResult> {
  const res = await fetch(`${GITHUB_API}/repos/${repoFullName}/contents/${encodePath(path)}`, {
    headers: authHeaders(token)
  });
  if (res.status === 404) return { exists: false };
  if (!res.ok) throw new GitHubApiError('Failed to check file existence.', res.status);
  const data = await res.json();
  return { exists: true, sha: data.sha };
}

function toBase64Utf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

async function putFile(
  token: string,
  repoFullName: string,
  path: string,
  content: string,
  message: string,
  existingSha?: string
): Promise<{ commitSha: string }> {
  const res = await fetch(`${GITHUB_API}/repos/${repoFullName}/contents/${encodePath(path)}`, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: toBase64Utf8(content),
      sha: existingSha
    })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new GitHubApiError(body.message ?? `Failed to write ${path}.`, res.status);
  }
  const data = await res.json();
  return { commitSha: data.commit?.sha ?? '' };
}

export interface UploadFilesParams {
  token: string;
  repoFullName: string;
  folderPath: string;
  readmeContent: string;
  metadataContent: string;
  forceUpdate: boolean;
  commitMessage: string;
}

export async function uploadSolutionFiles(params: UploadFilesParams): Promise<{ commitSha: string }> {
  const { token, repoFullName, folderPath, readmeContent, metadataContent, forceUpdate, commitMessage } = params;

  const readmePath = `${folderPath}/README.md`;
  const metadataPath = `${folderPath}/metadata.json`;

  let readmeSha: string | undefined;
  let metadataSha: string | undefined;

  if (forceUpdate) {
    const [readmeCheck, metadataCheck] = await Promise.all([
      checkFileExists(token, repoFullName, readmePath),
      checkFileExists(token, repoFullName, metadataPath)
    ]);
    readmeSha = readmeCheck.sha;
    metadataSha = metadataCheck.sha;
  }

  await putFile(token, repoFullName, readmePath, readmeContent, commitMessage, readmeSha);
  const finalResult = await putFile(
    token,
    repoFullName,
    metadataPath,
    metadataContent,
    `${commitMessage} (metadata)`,
    metadataSha
  );

  return finalResult;
}
