import { useEffect, useState } from 'react';
import { sendMessage } from '../lib/messaging';
import type { ExtensionSettings, GitHubRepo, GitHubUser } from '../lib/types';
import { 
  GitFork, 
  Folder, 
  AlertCircle, 
  Moon, 
  Sun, 
  LogOut, 
  Plus, 
  X, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Popup() {
  const [settings, setSettingsState] = useState<ExtensionSettings | null>(null);
  const [tokenInput, setTokenInput] = useState('');

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [newRepoName, setNewRepoName] = useState('DSA-Progress');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState<'login' | 'repos' | 'create-repo' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    sendMessage<ExtensionSettings>({ type: 'GET_SETTINGS' }).then((s) => {
      setSettingsState(s);
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings?.darkMode ?? true);
  }, [settings?.darkMode]);

  useEffect(() => {
    if (settings?.githubToken) refreshRepos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.githubToken]);

  async function updateSettings(partial: Partial<ExtensionSettings>) {
    const next = await sendMessage<ExtensionSettings>({ type: 'SET_SETTINGS', payload: partial });
    setSettingsState(next);
  }

  async function refreshRepos() {
    setLoading('repos');
    try {
      const data = await sendMessage<GitHubRepo[]>({ type: 'LIST_REPOS' });
      setRepos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories.');
    } finally {
      setLoading(null);
    }
  }

  async function handleLogin() {
    if (!tokenInput.trim()) return;
    setLoading('login');
    setError(null);
    try {
      const user = await sendMessage<GitHubUser>({ type: 'GITHUB_LOGIN', payload: { token: tokenInput.trim() } });
      const next = await sendMessage<ExtensionSettings>({ type: 'GET_SETTINGS' });
      setSettingsState(next);
      setTokenInput('');
      void user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(null);
    }
  }

  async function handleLogout() {
    await sendMessage({ type: 'GITHUB_LOGOUT' });
    const next = await sendMessage<ExtensionSettings>({ type: 'GET_SETTINGS' });
    setSettingsState(next);
    setRepos([]);
  }

  async function handleCreateRepo() {
    if (!newRepoName.trim()) return;
    setLoading('create-repo');
    setError(null);
    try {
      await sendMessage({ type: 'CREATE_REPO', payload: { name: newRepoName.trim() } });
      const next = await sendMessage<ExtensionSettings>({ type: 'GET_SETTINGS' });
      setSettingsState(next);
      await refreshRepos();
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create repository.');
    } finally {
      setLoading(null);
    }
  }

  if (!settings) {
    return (
      <div className="w-[360px] p-6 flex items-center justify-center text-pop-secondary text-sm bg-pop-bg h-40 font-sans border border-pop-border/10 rounded-[8px]">
        <span className="h-4 w-4 rounded-full border-2 border-pop-primary/40 border-t-pop-primary animate-spin mr-2" />
        Loading settings…
      </div>
    );
  }

  const dark = settings.darkMode;
  const version = '1.0.0';

  return (
    <div className={`w-[360px] font-sans antialiased bg-pop-bg text-pop-text selection:bg-pop-primary/30 selection:text-pop-text ${dark ? 'dark' : ''}`}>
      {/* Header */}
      <header className="flex items-start justify-between px-6 py-5 border-b border-pop-border/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base tracking-wider text-pop-text uppercase">GOATIFIED</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pop-surface border border-pop-border/10 text-pop-muted">
              v{version}
            </span>
          </div>
          <p className="text-xs text-pop-secondary mt-1">Archive your coding journey.</p>
        </div>
        <button
          onClick={() => updateSettings({ darkMode: !dark })}
          className="h-8 w-8 rounded-[8px] flex items-center justify-center bg-pop-surface border border-pop-border/10 text-pop-secondary hover:text-pop-text hover:bg-pop-border/20 transition-all duration-150 ease-in-out"
          title={dark ? 'Light Mode' : 'Dark Mode'}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      {/* Main content */}
      <main className="px-6 py-5 space-y-6">
        {error && (
          <div className="flex items-start gap-2 rounded-[8px] bg-red-500/10 border border-red-500/10 text-red-400 text-xs p-3">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-normal">{error}</p>
          </div>
        )}

        {/* GitHub Connection */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-pop-secondary">GitHub Account</h2>
            {settings.githubUser && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-medium tracking-wider uppercase bg-pop-success/10 text-pop-success border border-pop-success/15">
                Connected
              </span>
            )}
          </div>

          {settings.githubUser ? (
            <div className="flex items-center justify-between rounded-[8px] bg-pop-surface border border-pop-border/5 p-3 hover:bg-pop-surface/70 transition-all duration-150 ease-in-out">
              <div className="flex items-center gap-2.5">
                <img 
                  src={settings.githubUser.avatar_url} 
                  className="h-7 w-7 rounded-full border border-pop-border/10" 
                  alt="" 
                />
                <span className="text-xs font-medium text-pop-text">{settings.githubUser.login}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-300 transition-colors duration-150"
              >
                <LogOut className="h-3.5 w-3.5" />
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Personal Access Token"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full rounded-[8px] pl-3 pr-3 py-2 text-xs bg-pop-surface border border-pop-border/10 placeholder:text-pop-muted text-pop-text outline-none focus:border-pop-primary/40 focus:ring-1 focus:ring-pop-primary/40 transition-all duration-150 ease-in-out font-sans"
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={loading === 'login' || !tokenInput.trim()}
                className="w-full rounded-[8px] bg-pop-primary hover:bg-pop-hover text-pop-text text-xs font-semibold py-2.5 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-1.5"
              >
                {loading === 'login' ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Connecting…
                  </>
                ) : (
                  <>
                    <Github className="h-4 w-4" />
                    Connect GitHub
                  </>
                )}
              </button>
              <p className="text-[11px] text-pop-muted leading-relaxed">
                Requires a token with <code className="text-pop-secondary bg-pop-surface px-1.5 py-0.5 rounded border border-pop-border/10 font-mono text-[10px]">repo</code> scope. Create one in{' '}
                <a 
                  href="https://github.com/settings/tokens" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-pop-primary hover:underline inline-flex items-center gap-0.5"
                >
                  GitHub Settings
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>.
              </p>
            </div>
          )}
        </section>

        {/* Repository & Folder Group */}
        {settings.githubUser && (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-pop-secondary">Information</h2>
            
            <div className="rounded-[8px] bg-pop-surface border border-pop-border/5 p-4 space-y-4">
              {/* Repository Select */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-pop-secondary uppercase tracking-wider">
                  <GitFork className="h-3.5 w-3.5 text-pop-muted" />
                  Repository
                </label>
                <select
                  value={settings.selectedRepo ?? ''}
                  onChange={(e) => updateSettings({ selectedRepo: e.target.value })}
                  className="w-full rounded-[8px] px-3 py-2 text-xs bg-pop-bg border border-pop-border/10 outline-none focus:border-pop-primary/40 focus:ring-1 focus:ring-pop-primary/40 text-pop-text transition-all duration-150 ease-in-out cursor-pointer"
                >
                  <option value="" disabled>
                    {loading === 'repos' ? 'Loading repos…' : 'Select a repository'}
                  </option>
                  {repos.map((repo) => (
                    <option key={repo.id} value={repo.full_name}>
                      {repo.full_name}
                    </option>
                  ))}
                </select>

                {showCreateForm ? (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-pop-border/5">
                    <input
                      value={newRepoName}
                      onChange={(e) => setNewRepoName(e.target.value)}
                      placeholder="New repo name"
                      className="flex-1 rounded-[8px] px-3 py-1.5 text-xs bg-pop-bg border border-pop-border/10 outline-none focus:border-pop-primary/40 text-pop-text transition-all duration-150 ease-in-out"
                    />
                    <button
                      onClick={handleCreateRepo}
                      disabled={loading === 'create-repo'}
                      className="rounded-[8px] px-3 py-1.5 text-xs font-semibold bg-pop-primary hover:bg-pop-hover text-pop-text disabled:opacity-60 transition-all duration-150"
                    >
                      {loading === 'create-repo' ? 'Creating…' : 'Create'}
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-3 py-1.5 text-xs font-semibold bg-pop-bg hover:bg-pop-border/10 rounded-[8px] text-pop-secondary hover:text-pop-text transition-all duration-150"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="text-xs font-medium text-pop-primary hover:text-pop-hover transition-colors duration-150 flex items-center gap-1 pt-1"
                  >
                    <Plus className="h-3 w-3" />
                    Create new repository
                  </button>
                )}
              </div>

              {/* Folder Path Info */}
              <div className="space-y-1.5 pt-3 border-t border-pop-border/5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-pop-secondary uppercase tracking-wider">
                  <Folder className="h-3.5 w-3.5 text-pop-muted" />
                  Target Folder
                </label>
                <div className="text-xs text-pop-muted font-mono bg-pop-bg/50 border border-pop-border/5 rounded-[8px] px-2.5 py-2.5 flex items-center justify-between">
                  <span>{`{id}_{name}`}</span>
                  <span className="text-[9px] tracking-wider uppercase font-sans text-pop-muted bg-pop-border/10 px-1.5 py-0.5 rounded border border-pop-border/5">
                    Auto-generated
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Center message info card */}
        <div className="rounded-[8px] bg-pop-surface/50 border border-pop-border/5 p-4 text-center space-y-2 hover:bg-pop-surface/75 transition-all duration-150 ease-in-out">
          <CheckCircle2 className="h-5 w-5 text-pop-primary mx-auto opacity-90" />
          <p className="text-xs font-medium text-pop-text">
            Ready for your next Accepted solution.
          </p>
          <p className="text-[11px] text-pop-secondary leading-relaxed max-w-[280px] mx-auto">
            Complete a problem on LeetCode and Goatified will detect it automatically.
          </p>
        </div>

        {/* Settings / Auto-Detect */}
        <section className="flex items-center justify-between rounded-[8px] bg-pop-surface border border-pop-border/5 p-3.5 hover:bg-pop-surface/70 transition-all duration-150 ease-in-out">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-pop-text">Auto-detect Accepted</p>
            <p className="text-[11px] text-pop-muted">Show Save button after submission.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoDetect}
              onChange={(e) => updateSettings({ autoDetect: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-pop-bg border border-pop-border/10 rounded-full peer peer-checked:bg-pop-primary peer-checked:border-transparent transition-all duration-150 ease-in-out" />
            <div className="absolute left-0.5 top-0.5 h-4 w-4 bg-white rounded-full border border-pop-border/10 transition-transform duration-150 ease-in-out peer-checked:translate-x-4 peer-checked:bg-pop-text" />
          </label>
        </section>

        {/* Footer info text */}
        <p className="text-[10px] text-center text-pop-muted tracking-wide leading-relaxed">
          Goatified never uploads automatically — only when you click <strong className="text-pop-secondary font-semibold">Save to GitHub</strong>.
        </p>
      </main>
    </div>
  );
}
