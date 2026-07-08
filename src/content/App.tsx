import { useCallback, useEffect, useRef, useState } from 'react';
import FloatingButton from './components/FloatingButton';
import PreviewModal from './components/PreviewModal';
import ToastStack, { type ToastItem } from './components/Toast';
import { getLatestSubmissionId, buildSubmissionDetails } from '../lib/leetcodeDetector';
import { getSettings, onSettingsChanged } from '../lib/storage';
import type { ExtensionSettings, SubmissionDetails } from '../lib/types';

function extractProblemName(): string {
  const titleEl =
    document.querySelector('[data-cy="question-title"]') ??
    document.querySelector('a[href^="/problems/"] > div') ??
    document.querySelector('.css-v3d350');
  const raw = titleEl?.textContent?.trim() ?? document.title.split(' - ')[0];
  return raw.replace(/^\d+\.\s*/, '');
}

function isAcceptedResultVisible(): boolean {
  const candidates = Array.from(
    document.querySelectorAll('span, div')
  ).filter((el) => el.children.length === 0);
  return candidates.some((el) => {
    const text = el.textContent?.trim();
    return text === 'Accepted' || text === '通过';
  });
}

export default function App() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const lastSeenAccepted = useRef(false);

  useEffect(() => {
    getSettings().then(setSettings);
    return onSettingsChanged(setSettings);
  }, []);

  useEffect(() => {
    if (!settings?.autoDetect) return;

    const observer = new MutationObserver(() => {
      const accepted = isAcceptedResultVisible();
      if (accepted && !lastSeenAccepted.current) {
        lastSeenAccepted.current = true;
        setVisible(true);
      }
      if (!accepted) {
        lastSeenAccepted.current = false;
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [settings?.autoDetect]);

  const pushToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);

  const handleOpenModal = useCallback(async () => {
    setLoadingSubmission(true);
    try {
      const problemName = extractProblemName();
      const submissionId = await getLatestSubmissionId();
      const details = await buildSubmissionDetails(problemName, submissionId);
      setSubmission(details);
      setModalOpen(true);
    } catch (err) {
      pushToast({
        variant: 'error',
        title: 'Could not read submission',
        message: err instanceof Error ? err.message : 'Unknown error while reading the submission.'
      });
    } finally {
      setLoadingSubmission(false);
    }
  }, [pushToast]);

  if (!settings) return null;

  return (
    <>
      {visible && !modalOpen && (
        <FloatingButton loading={loadingSubmission} onClick={handleOpenModal} onDismiss={() => setVisible(false)} />
      )}
      {modalOpen && submission && (
        <PreviewModal
          submission={submission}
          settings={settings}
          onClose={() => setModalOpen(false)}
          onToast={pushToast}
        />
      )}
      <ToastStack toasts={toasts} />
    </>
  );
}
