import { Panel } from './Panel';
import { WalletStatus } from './WalletStatus';
import { useEffectivePublicClient } from '../lib/public-client';
import { useSessionStore } from '../store/session';

export const SessionPanel = () => {
  const customRpcUrl = useSessionStore((state) => state.customRpcUrl);
  const setCustomRpcUrl = useSessionStore((state) => state.setCustomRpcUrl);
  const { rpcUrl, isCustomRpc, chain } = useEffectivePublicClient();

  return (
    <Panel title="Session" subtitle="Wallet, chain, RPC, and local workspace state.">
      <div className="space-y-4">
        <WalletStatus />
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Custom RPC
          </label>
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
            placeholder="https://bsc-dataseed.binance.org"
            value={customRpcUrl}
            onChange={(event) => setCustomRpcUrl(event.target.value)}
          />
          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Effective RPC
            </div>
            <div className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-200">
              {rpcUrl}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {isCustomRpc ? 'Custom RPC active' : `Default RPC for ${chain.name}`}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
};
