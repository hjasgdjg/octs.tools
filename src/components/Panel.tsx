import type { PropsWithChildren, ReactNode } from 'react';

type PanelProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}>;

export const Panel = ({ title, subtitle, actions, children }: PanelProps) => {
  return (
    <section className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
      <header className="flex flex-col items-start justify-between gap-3 border-b border-slate-200 px-3 py-3 sm:flex-row sm:items-start sm:gap-4 sm:px-4 sm:py-4 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        {actions}
      </header>
      <div className="min-h-0 flex-1 p-3 sm:p-4">{children}</div>
    </section>
  );
};
