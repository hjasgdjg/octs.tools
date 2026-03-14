import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { useSessionStore } from '../store/session';

export const AppShell = ({ children }: PropsWithChildren) => {
  const theme = useSessionStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5">
        {children}
      </div>
    </div>
  );
};
