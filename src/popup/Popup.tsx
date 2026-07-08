import { useEffect, useState } from 'react';
import { sendMessage } from '../lib/messaging';
import type { ExtensionSettings, GitHubRepo, GitHubUser } from '../lib/types';

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create repository.');
    } finally {
      setLoading(null);
    }
  }



  if (!settings) {
    return (
      <div className="p-6 flex items-center justify-center text-neutral-400 text-sm bg-neutral-900 h-40">
        Loading…
      </div>
    );
  }

  const dark = settings.darkMode;

  return (
    <div className={dark ? 'bg-neutral-950 text-neutral-100' : 'bg-white text-neutral-900'}>
      <header className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/60">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐐</span>
          <div>
            <h1 className="font-bold text-base leading-none">Goatified</h1>
            <p className="text-[11px] opacity-60 mt-0.5">LeetCode → GitHub</p>
          </div>
        </div>
        <button
          onClick={() => updateSettings({ darkMode: !dark })}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-800/60 text-sm"
          title="Toggle dark mode"
        >
          {dark ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="px-5 py-4 space-y-5">
        {error && <div className="rounded-lg bg-rose-500/10 text-rose-400 text-xs px-3 py-2">{error}</div>}

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">GitHub</h2>
          {settings.githubUser ? (
            <div className="flex items-center justify-between rounded-lg bg-neutral-800/50 px-3 py-2">
              <div className="flex items-center gap-2">
                <img src={settings.githubUser.avatar_url} className="h-7 w-7 rounded-full" alt="" />
                <span className="text-sm font-medium">{settings.githubUser.login}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="password"
                placeholder="GitHub Personal Access Token"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm bg-neutral-800/60 border border-neutral-700 outline-none focus:ring-2 focus:ring-goat-500"
              />
              <button
                onClick={handleLogin}
                disabled={loading === 'login' || !tokenInput.trim()}
                className="w-full rounded-lg bg-gradient-to-br from-goat-500 to-goat-700 text-white text-sm font-semibold py-2 disabled:opacity-60"
              >
                {loading === 'login' ? 'Verifying…' : 'Connect GitHub'}
              </button>
              <p className="text-[11px] opacity-50">
                Needs a token with <code>repo</code> scope. Create one at github.com/settings/tokens.
              </p>
            </div>
          )}
        </section>

        {settings.githubUser && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">Repository</h2>
            <select
              value={settings.selectedRepo ?? ''}
              onChange={(e) => updateSettings({ selectedRepo: e.target.value })}
              className="w-full rounded-lg px-3 py-2 text-sm bg-neutral-800/60 border border-neutral-700 outline-none focus:ring-2 focus:ring-goat-500"
            >
              <option value="" disabled>
                {loading === 'repos' ? 'Loading…' : 'Select a repository'}
              </option>
              {repos.map((repo) => (
                <option key={repo.id} value={repo.full_name}>
                  {repo.full_name}
                </option>
              ))}
            </select>
            {showCreateForm ? (
              <div className="flex gap-2 mt-2">
                <input
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  placeholder="New repo name"
                  className="flex-1 rounded-lg px-3 py-2 text-sm bg-neutral-800/60 border border-neutral-700 outline-none focus:ring-2 focus:ring-goat-500"
                />
                <button
                  onClick={handleCreateRepo}
                  disabled={loading === 'create-repo'}
                  className="rounded-lg px-3 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 disabled:opacity-60"
                >
                  {loading === 'create-repo' ? '…' : 'Create'}
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-2 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-2 text-xs font-medium text-goat-600 hover:text-goat-500 flex items-center gap-1"
              >
                + Create new repository
              </button>
            )}
          </section>
        )}


        <section className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Auto-detect Accepted</p>
            <p className="text-[11px] opacity-50">Show the floating button automatically.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoDetect}
              onChange={(e) => updateSettings({ autoDetect: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-neutral-700 rounded-full peer peer-checked:bg-goat-600 transition-colors" />
            <div className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
          </label>
        </section>

        <p className="text-[11px] text-center opacity-40 pt-2">
          Goatified never uploads automatically — only when you press Save.
        </p>
      </main>
    </div>
  );
}
