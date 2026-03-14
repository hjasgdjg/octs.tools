import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_ABI, DEFAULT_CONTRACT_ADDRESS } from '../config';

export type RecentContractSession = {
  id: string;
  contractAddress: string;
  abiInput: string;
  savedAt: string;
};

export type ExecutionHistoryItem = {
  id: string;
  createdAt: string;
  chainId: number | null;
  contractAddress: string;
  functionSignature: string;
  mode: 'read' | 'simulate' | 'write';
  argsSnapshot: Record<string, string>;
  nativeValue?: string;
  result?: string;
  error?: string;
  transactionHash?: string;
  receipt?: string;
};

export type ThemeMode = 'light' | 'dark';

type SessionState = {
  contractAddress: string;
  abiInput: string;
  selectedFunctionKey: string | null;
  customRpcUrl: string;
  theme: ThemeMode;
  recentSessions: RecentContractSession[];
  executionHistory: ExecutionHistoryItem[];
  setContractAddress: (value: string) => void;
  setAbiInput: (value: string) => void;
  setSelectedFunctionKey: (value: string | null) => void;
  setCustomRpcUrl: (value: string) => void;
  setTheme: (value: ThemeMode) => void;
  toggleTheme: () => void;
  resetSession: () => void;
  saveCurrentSession: () => void;
  loadRecentSession: (sessionId: string) => void;
  appendExecutionHistory: (item: ExecutionHistoryItem) => void;
};

const MAX_RECENT_SESSIONS = 10;
const MAX_EXECUTION_HISTORY = 20;

const initialSessionState = {
  contractAddress: DEFAULT_CONTRACT_ADDRESS,
  abiInput: DEFAULT_ABI,
  selectedFunctionKey: null,
  customRpcUrl: '',
  theme: 'light' as ThemeMode,
  recentSessions: [] as RecentContractSession[],
  executionHistory: [] as ExecutionHistoryItem[],
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      ...initialSessionState,
      setContractAddress: (value) => set({ contractAddress: value }),
      setAbiInput: (value) => set({ abiInput: value }),
      setSelectedFunctionKey: (value) => set({ selectedFunctionKey: value }),
      setCustomRpcUrl: (value) => set({ customRpcUrl: value }),
      setTheme: (value) => set({ theme: value }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      resetSession: () => {
        const currentTheme = get().theme;
        useSessionStore.persist.clearStorage();
        set({
          ...initialSessionState,
          theme: currentTheme,
        });
      },
      saveCurrentSession: () => {
        const { contractAddress, abiInput, recentSessions } = get();

        const normalizedAddress = contractAddress.trim();
        const normalizedAbi = abiInput.trim();

        if (!normalizedAddress || !normalizedAbi) {
          return;
        }

        const nextItem: RecentContractSession = {
          id: `${Date.now()}`,
          contractAddress: normalizedAddress,
          abiInput: normalizedAbi,
          savedAt: new Date().toISOString(),
        };

        const dedupedSessions = recentSessions.filter(
          (item) =>
            !(
              item.contractAddress === nextItem.contractAddress &&
              item.abiInput === nextItem.abiInput
            ),
        );

        set({
          recentSessions: [nextItem, ...dedupedSessions].slice(
            0,
            MAX_RECENT_SESSIONS,
          ),
        });
      },
      loadRecentSession: (sessionId) => {
        const target = get().recentSessions.find((item) => item.id === sessionId);

        if (!target) {
          return;
        }

        set({
          contractAddress: target.contractAddress,
          abiInput: target.abiInput,
          selectedFunctionKey: null,
        });
      },
      appendExecutionHistory: (item) =>
        set((state) => ({
          executionHistory: [item, ...state.executionHistory].slice(
            0,
            MAX_EXECUTION_HISTORY,
          ),
        })),
    }),
    {
      name: 'octs-tools-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        contractAddress: state.contractAddress,
        abiInput: state.abiInput,
        customRpcUrl: state.customRpcUrl,
        theme: state.theme,
        recentSessions: state.recentSessions,
        executionHistory: state.executionHistory,
      }),
    },
  ),
);
