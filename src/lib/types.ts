export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface SubmissionDetails {
  titleSlug: string;
  problemName: string;
  questionId: string;
  difficulty: Difficulty;
  language: string;
  runtime: string;
  runtimePercentile?: string;
  memory: string;
  memoryPercentile?: string;
  submissionTimeISO: string;
  problemUrl: string;
  code: string;
  problemStatementHtml: string;
  examplesHtml: string;
  constraintsHtml: string;
}


export interface RepoMetadata {
  problemName: string;
  difficulty: Difficulty;
  language: string;
  runtime: string;
  memory: string;
  submissionTime: string;
  problemUrl: string;
  repository: string;
  commitSha: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
}

export interface ExtensionSettings {
  githubToken: string | null;
  githubUser: GitHubUser | null;
  selectedRepo: string | null; // full_name, e.g. "user/DSA-Progress"
  darkMode: boolean;
  autoDetect: boolean;
}

export type UploadStage =
  | 'idle'
  | 'checking-duplicate'
  | 'uploading'
  | 'success'
  | 'error';

export interface UploadResult {
  success: boolean;
  commitSha?: string;
  repoUrl?: string;
  error?: string;
}

export type RuntimeMessage =
  | { type: 'ACCEPTED_SUBMISSION_DETECTED'; payload: { titleSlug: string; problemName: string } }
  | { type: 'GET_SETTINGS' }
  | { type: 'SET_SETTINGS'; payload: Partial<ExtensionSettings> }
  | { type: 'GITHUB_LOGIN'; payload: { token: string } }
  | { type: 'GITHUB_LOGOUT' }
  | { type: 'LIST_REPOS' }
  | { type: 'CREATE_REPO'; payload: { name: string } }
  | { type: 'CHECK_DUPLICATE'; payload: { repoFullName: string; problemName: string; questionId: string } }
  | {
      type: 'UPLOAD_SOLUTION';
      payload: { submission: SubmissionDetails; forceUpdate: boolean };
    };
