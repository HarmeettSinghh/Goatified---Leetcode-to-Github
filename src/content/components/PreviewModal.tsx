import { useEffect, useMemo, useState } from 'react';
import type { ExtensionSettings, GitHubRepo, SubmissionDetails, UploadStage } from '../../lib/types';
import { sendMessage } from '../../lib/messaging';
import type { ToastItem } from './Toast';
import { fenceLanguage } from '../../lib/readmeGenerator';

interface PreviewModalProps {
  submission: SubmissionDetails;
  settings: ExtensionSettings;
  onClose: () => void;
  onToast: (toast: Omit<ToastItem, 'id'>) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-500/10',
  Medium: 'text-amber-400 bg-amber-500/10',
  Hard: 'text-rose-400 bg-rose-500/10'
};

export default function PreviewModal({ submission, settings, onClose, onToast }: PreviewModalProps) {
  const [stage, setStage] = useState<UploadStage>('idle');

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(settings.selectedRepo);
  const [duplicate, setDuplicate] = useState(false);
  const [awaitingDuplicateDecision, setAwaitingDuplicateDecision] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reposLoading, setReposLoading] = useState(false);

  const dark = settings.darkMode;

  useEffect(() => {
    if (!settings.githubToken) return;
    setReposLoading(true);
    sendMessage<GitHubRepo[]>({ type: 'LIST_REPOS' })
      .then((data) => setRepos(data))
      .catch((err) => setError(err.message))
      .finally(() => setReposLoading(false));
  }, [settings.githubToken]);

  const codePreview = useMemo(() => submission.code.slice(0, 4000), [submission.code]);

  async function handleRepoChange(fullName: string) {
    setSelectedRepo(fullName);
    await sendMessage({ type: 'SET_SETTINGS', payload: { selectedRepo: fullName } });
  }

  async function runPipeline(forceUpdate: boolean) {
    if (!settings.githubToken) {
      setError('Connect your GitHub account in the extension popup first.');
      return;
    }
    if (!selectedRepo) {
      setError('Select a repository first.');
      return;
    }

    setError(null);
    try {
      if (!forceUpdate) {
        setStage('checking-duplicate');
        const dup = await sendMessage<{ exists: boolean }>({
          type: 'CHECK_DUPLICATE',
          payload: { repoFullName: selectedRepo, problemName: submission.problemName, questionId: submission.questionId }
        });
        if (dup.exists) {
          setDuplicate(true);
          setAwaitingDuplicateDecision(true);
          setStage('idle');
          return;
        }
      }

      setStage('uploading');
      const result = await sendMessage<{ success: boolean; commitSha: string; repoUrl: string }>({
        type: 'UPLOAD_SOLUTION',
        payload: { submission, forceUpdate: forceUpdate || duplicate }
      });

      setStage('success');
      onToast({
        variant: 'success',
        title: 'Saved to GitHub 🐐',
        message: `${submission.problemName} was committed successfully.`,
        actionLabel: 'View on GitHub',
        onAction: () => window.open(result.repoUrl, '_blank')
      });
      setTimeout(onClose, 800);
    } catch (err) {
      setStage('error');
      const message = err instanceof Error ? err.message : 'Unknown error.';
      setError(message);
      onToast({ variant: 'error', title: 'Upload failed', message });
    }
  }

  const isBusy = stage === 'checking-duplicate' || stage === 'uploading';

  const stageLabel: Record<UploadStage, string> = {
    idle: 'Save to GitHub',
    'checking-duplicate': 'Checking for duplicates…',

    uploading: 'Uploading to GitHub…',
    success: 'Saved!',
    error: 'Retry'
  };

  return (
    <div className="fixed inset-0 z-[999998] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div
        className={`w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl animate-pop-in flex flex-col ${
          dark ? 'bg-neutral-900 text-neutral-100' : 'bg-white text-neutral-900'
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            dark ? 'border-neutral-800' : 'border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐐</span>
            <div>
              <h2 className="font-bold text-lg leading-tight">{submission.problemName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    DIFFICULTY_COLORS[submission.difficulty] ?? ''
                  }`}
                >
                  {submission.difficulty}
                </span>
                <span className="text-xs opacity-60">{submission.language}</span>
                <span className="text-xs opacity-60">·</span>
                <span className="text-xs opacity-60">{submission.runtime}</span>
                <span className="text-xs opacity-60">·</span>
                <span className="text-xs opacity-60">{submission.memory}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
              dark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'
            }`}
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
          {!settings.githubToken && (
            <div className="rounded-lg bg-amber-500/10 text-amber-400 text-sm px-4 py-3">
              You're not connected to GitHub yet. Open the Goatified popup to add a Personal Access Token.
            </div>
          )}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide opacity-60">Repository</label>
            <select
              value={selectedRepo ?? ''}
              disabled={reposLoading || !settings.githubToken}
              onChange={(e) => handleRepoChange(e.target.value)}
              className={`mt-1 w-full rounded-lg px-3 py-2 text-sm border outline-none focus:ring-2 focus:ring-goat-500 ${
                dark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-50 border-neutral-300'
              }`}
            >
              <option value="" disabled>
                {reposLoading ? 'Loading repositories…' : 'Select a repository'}
              </option>
              {repos.map((repo) => (
                <option key={repo.id} value={repo.full_name}>
                  {repo.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide opacity-60">Solution preview</label>
            <pre
              className={`mt-1 rounded-lg p-3 text-xs overflow-x-auto max-h-52 border ${
                dark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <code>{`\`\`\`${fenceLanguage(submission.language)}\n${codePreview}${
                submission.code.length > 4000 ? '\n…' : ''
              }\n\`\`\``}</code>
            </pre>
          </div>



          {error && <div className="rounded-lg bg-rose-500/10 text-rose-400 text-sm px-4 py-3">{error}</div>}

          {awaitingDuplicateDecision && (
            <div className="rounded-lg bg-amber-500/10 text-amber-400 text-sm px-4 py-3 space-y-3">
              <p>This problem already exists in the repository.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAwaitingDuplicateDecision(false);
                    setDuplicate(false);
                  }}
                  className="px-3 py-1.5 rounded-md bg-neutral-700/40 text-neutral-200 text-xs font-semibold hover:bg-neutral-700/70"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setAwaitingDuplicateDecision(false);
                    runPipeline(true);
                  }}
                  className="px-3 py-1.5 rounded-md bg-amber-500 text-neutral-900 text-xs font-semibold hover:bg-amber-400"
                >
                  Force Update
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${
            dark ? 'border-neutral-800' : 'border-neutral-200'
          }`}
        >
          <button
            onClick={onClose}
            disabled={isBusy}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              dark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-600'
            }`}
          >
            Close
          </button>
          <button
            onClick={() => runPipeline(false)}
            disabled={isBusy || awaitingDuplicateDecision || stage === 'success'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-br from-goat-500 to-goat-700 text-white text-sm font-semibold shadow-goat hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-wait"
          >
            {isBusy && <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
            {stage === 'success' ? '✅ Saved' : <>📤 {stageLabel[stage]}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
