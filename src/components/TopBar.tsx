import { APP_NAME, REPOSITORY_URL } from '../config';
import { useSessionStore } from '../store/session';
import { useDisconnect } from 'wagmi';

export const TopBar = () => {
  const theme = useSessionStore((state) => state.theme);
  const toggleTheme = useSessionStore((state) => state.toggleTheme);
  const resetSession = useSessionStore((state) => state.resetSession);
  const { disconnect } = useDisconnect();

  const handleClear = () => {
    disconnect();
    resetSession();
  };

  return (
    <header className="mb-4 flex flex-col items-start justify-between gap-3 border-b border-slate-200 pb-4 sm:mb-5 sm:flex-row sm:items-center sm:gap-4 dark:border-slate-800">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
          EVM Contract Console
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">{APP_NAME}</h1>
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:border-rose-500 hover:text-rose-900 dark:border-rose-900/60 dark:bg-slate-900 dark:text-rose-300 dark:hover:border-rose-700 dark:hover:text-rose-200"
          onClick={() => handleClear()}
        >
          <ClearMark />
          <span>Clear</span>
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
          onClick={() => toggleTheme()}
        >
          <ThemeMark theme={theme} />
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        <a
          href={REPOSITORY_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
        >
          <GitHubMark />
          <span>GitHub</span>
        </a>
        <div className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
          Frontend Only
        </div>
      </div>
    </header>
  );
};

const ClearMark = () => {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M9 3a1 1 0 0 0-1 1v1H4a1 1 0 1 0 0 2h.78l1.08 12.12A2 2 0 0 0 7.85 21h8.3a2 2 0 0 0 1.99-1.88L19.22 7H20a1 1 0 1 0 0-2h-4V4a1 1 0 0 0-1-1H9Zm5 2h-4V5h4V5Zm-7.21 2h10.42l-1 11.04H7.79L6.79 7Zm2.71 2a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm5 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z" />
    </svg>
  );
};

const ThemeMark = ({ theme }: { theme: 'light' | 'dark' }) => {
  return theme === 'light' ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M21 12.79A9 9 0 0 1 11.21 3c0-.34.02-.67.06-1A1 1 0 0 0 9.8 1.06 11 11 0 1 0 22.94 14.2a1 1 0 0 0-1.15-1.47c-.32.04-.65.06-.79.06Z" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 1a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1ZM12 20a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1ZM4.22 5.64a1 1 0 0 1 1.42 0l1.41 1.41a1 1 0 0 1-1.41 1.42L4.22 7.05a1 1 0 0 1 0-1.41ZM16.95 18.36a1 1 0 0 1 1.41 0l1.42 1.42a1 1 0 1 1-1.42 1.41l-1.41-1.41a1 1 0 0 1 0-1.42ZM1 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H2a1 1 0 0 1-1-1ZM20 11h2a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2ZM5.64 19.78a1 1 0 0 1 0-1.41l1.41-1.42a1 1 0 1 1 1.42 1.42l-1.42 1.41a1 1 0 0 1-1.41 0ZM18.36 7.05a1 1 0 0 1 0-1.41l1.42-1.42a1 1 0 0 1 1.41 1.42l-1.41 1.41a1 1 0 0 1-1.42 0Z" />
    </svg>
  );
};

const GitHubMark = () => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.426 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.605-3.37-1.343-3.37-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.004.071 1.532 1.033 1.532 1.033.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.481A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z" />
    </svg>
  );
};
