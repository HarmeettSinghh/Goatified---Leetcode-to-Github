import { getSettings, setSettings, clearSettings } from '../lib/storage';
import {
  verifyToken,
  listRepositories,
  createRepository,
  checkFileExists,
  uploadSolutionFiles
} from '../lib/github';
import { generateReadme, generateMetadata, slugifyFolderName } from '../lib/readmeGenerator';
import type { RuntimeMessage } from '../lib/types';

type SendResponse = (response: { ok: boolean; data?: unknown; error?: string }) => void;

async function handleMessage(message: RuntimeMessage): Promise<unknown> {
  switch (message.type) {
    case 'GET_SETTINGS': {
      return getSettings();
    }

    case 'SET_SETTINGS': {
      return setSettings(message.payload);
    }

    case 'GITHUB_LOGIN': {
      // Personal Access Token flow: the popup collects the token, this verifies
      // it against the GitHub API and persists it only if valid.
      const user = await verifyToken(message.payload.token);
      await setSettings({ githubToken: message.payload.token, githubUser: user });
      return user;
    }

    case 'GITHUB_LOGOUT': {
      await clearSettings();
      return { success: true };
    }

    case 'LIST_REPOS': {
      const settings = await getSettings();
      if (!settings.githubToken) throw new Error('Not authenticated with GitHub.');
      return listRepositories(settings.githubToken);
    }

    case 'CREATE_REPO': {
      const settings = await getSettings();
      if (!settings.githubToken) throw new Error('Not authenticated with GitHub.');
      const repo = await createRepository(settings.githubToken, message.payload.name);
      await setSettings({ selectedRepo: repo.full_name });
      return repo;
    }

    case 'CHECK_DUPLICATE': {
      const settings = await getSettings();
      if (!settings.githubToken) throw new Error('Not authenticated with GitHub.');
      const folder = `${slugifyFolderName(message.payload.questionId, message.payload.problemName)}/README.md`;
      const result = await checkFileExists(settings.githubToken, message.payload.repoFullName, folder);
      return result;
    }



    case 'UPLOAD_SOLUTION': {
      const settings = await getSettings();
      if (!settings.githubToken) throw new Error('Not authenticated with GitHub.');
      if (!settings.selectedRepo) throw new Error('No repository selected.');

      const { submission, forceUpdate } = message.payload;
      const folderPath = slugifyFolderName(submission.questionId, submission.problemName);
      const readmeContent = generateReadme(submission);
      const metadataContent = generateMetadata({
        problemName: submission.problemName,
        difficulty: submission.difficulty,
        language: submission.language,
        runtime: submission.runtime,
        memory: submission.memory,
        submissionTime: submission.submissionTimeISO,
        problemUrl: submission.problemUrl,
        repository: settings.selectedRepo,
        commitSha: ''
      });

      const result = await uploadSolutionFiles({
        token: settings.githubToken,
        repoFullName: settings.selectedRepo,
        folderPath,
        readmeContent,
        metadataContent,
        forceUpdate,
        commitMessage: `Add solution: ${submission.problemName}`
      });

      const repoUrl = `https://github.com/${settings.selectedRepo}/tree/main/${encodeURIComponent(
        folderPath
      )}`;

      return { success: true, commitSha: result.commitSha, repoUrl };
    }

    default:
      throw new Error(`Unhandled message type: ${(message as { type: string }).type}`);
  }
}

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse: SendResponse) => {
  handleMessage(message)
    .then((data) => sendResponse({ ok: true, data }))
    .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
  return true; // keep the message channel open for the async response
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Goatified] Extension installed.');
});
