import type { RuntimeMessage } from './types';

export function sendMessage<TResponse = unknown>(message: RuntimeMessage): Promise<TResponse> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: { ok: boolean; data?: TResponse; error?: string }) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response) {
        reject(new Error('No response from background service worker.'));
        return;
      }
      if (!response.ok) {
        reject(new Error(response.error ?? 'Unknown error.'));
        return;
      }
      resolve(response.data as TResponse);
    });
  });
}
