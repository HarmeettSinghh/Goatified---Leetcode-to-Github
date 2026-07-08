import type { ExtensionSettings } from './types';

const DEFAULT_SETTINGS: ExtensionSettings = {
  githubToken: null,
  githubUser: null,
  selectedRepo: null,
  darkMode: true,
  autoDetect: true
};

const SETTINGS_KEY = 'goatified_settings';

export async function getSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(result[SETTINGS_KEY] ?? {}) };
}

export async function setSettings(partial: Partial<ExtensionSettings>): Promise<ExtensionSettings> {
  const current = await getSettings();
  const next = { ...current, ...partial };
  await chrome.storage.local.set({ [SETTINGS_KEY]: next });
  return next;
}

export async function clearSettings(): Promise<void> {
  await chrome.storage.local.remove(SETTINGS_KEY);
}

export function onSettingsChanged(callback: (settings: ExtensionSettings) => void): () => void {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
    if (areaName !== 'local') return;
    if (changes[SETTINGS_KEY]) {
      callback({ ...DEFAULT_SETTINGS, ...changes[SETTINGS_KEY].newValue });
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
