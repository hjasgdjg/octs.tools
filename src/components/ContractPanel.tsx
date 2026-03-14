import { useMemo, useState } from 'react';

import { getAbiFunctions, groupFunctions, parseAbiInput } from '../lib/abi';
import { useSessionStore } from '../store/session';
import { Panel } from './Panel';

export const ContractPanel = () => {
  const [functionSearch, setFunctionSearch] = useState('');
  const contractAddress = useSessionStore((state) => state.contractAddress);
  const abiInput = useSessionStore((state) => state.abiInput);
  const selectedFunctionKey = useSessionStore((state) => state.selectedFunctionKey);
  const recentSessions = useSessionStore((state) => state.recentSessions);
  const setContractAddress = useSessionStore((state) => state.setContractAddress);
  const setAbiInput = useSessionStore((state) => state.setAbiInput);
  const setSelectedFunctionKey = useSessionStore((state) => state.setSelectedFunctionKey);
  const saveCurrentSession = useSessionStore((state) => state.saveCurrentSession);
  const loadRecentSession = useSessionStore((state) => state.loadRecentSession);

  const parsedState = useMemo(() => {
    try {
      const abi = parseAbiInput(abiInput);
      const functions = getAbiFunctions(abi);
      const normalizedSearch = functionSearch.trim().toLowerCase();
      const filteredFunctions = normalizedSearch
        ? functions.filter(({ signature }) =>
            signature.toLowerCase().includes(normalizedSearch),
          )
        : functions;
      const grouped = groupFunctions(filteredFunctions);
      return {
        status: 'success' as const,
        abi,
        functions: filteredFunctions,
        grouped,
      };
    } catch (error) {
      return {
        status: 'error' as const,
        message: error instanceof Error ? error.message : 'Invalid ABI input.',
      };
    }
  }, [abiInput, functionSearch]);

  return (
    <Panel
      title="Contract"
      subtitle="Address, ABI input, and parsed function inventory."
      actions={
        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
          onClick={() => saveCurrentSession()}
        >
          Save Session
        </button>
      }
    >
      <div className="flex h-full min-h-0 flex-col gap-4">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Contract Address
          </label>
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
            placeholder="0x..."
            value={contractAddress}
            onChange={(event) => setContractAddress(event.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            ABI JSON
          </label>
          <textarea
            className="h-40 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-mono text-sm outline-none transition focus:border-slate-500 sm:h-52 lg:h-64 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
            value={abiInput}
            onChange={(event) => setAbiInput(event.target.value)}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Function Search
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
              placeholder="claim, ownerOf, balanceOf..."
              value={functionSearch}
              onChange={(event) => setFunctionSearch(event.target.value)}
            />
          </div>
          <div className="min-h-0 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Recent Sessions
            </div>
            <div className="max-h-28 overflow-auto p-2">
              <div className="space-y-2">
                {recentSessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:border-slate-400 hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                    onClick={() => loadRecentSession(session.id)}
                  >
                    <div className="truncate font-mono text-xs text-slate-800 dark:text-slate-100">
                      {session.contractAddress}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {new Date(session.savedAt).toLocaleString()}
                    </div>
                  </button>
                ))}
                {recentSessions.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    No saved sessions yet.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {parsedState.status === 'error' ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            {parsedState.message}
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 auto-rows-fr gap-4 xl:grid-cols-2">
            <FunctionGroup
              title="Read"
              items={parsedState.grouped.read}
              selectedFunctionKey={selectedFunctionKey}
              onSelect={setSelectedFunctionKey}
            />
            <FunctionGroup
              title="Write"
              items={parsedState.grouped.write}
              selectedFunctionKey={selectedFunctionKey}
              onSelect={setSelectedFunctionKey}
            />
          </div>
        )}
      </div>
    </Panel>
  );
};

type FunctionGroupProps = {
  title: string;
  items: Array<{ key: string; signature: string }>;
  selectedFunctionKey: string | null;
  onSelect: (value: string) => void;
};

const FunctionGroup = ({
  title,
  items,
  selectedFunctionKey,
  onSelect,
}: FunctionGroupProps) => {
  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800 dark:text-slate-400">
        {title}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-2">
        <div className="space-y-2">
          {items.map((item) => {
            const selected = selectedFunctionKey === item.key;

            return (
              <button
                key={item.key}
                type="button"
                className={`w-full rounded-lg border px-3 py-2 text-left font-mono text-xs transition ${
                  selected
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900'
                }`}
                onClick={() => onSelect(item.key)}
              >
                {item.signature}
              </button>
            );
          })}
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              No functions found in this category.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
