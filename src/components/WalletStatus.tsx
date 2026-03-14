import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';

export const WalletStatus = () => {
  const { address, chain, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { chains, switchChain, isPending: isSwitching } = useSwitchChain();

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
      <div className="grid gap-3 sm:grid-cols-2">
        <StatusItem
          label="Connection"
          value={isConnected ? 'Connected' : 'Disconnected'}
        />
        <StatusItem
          label="Connector"
          value={connector?.name ?? 'Injected wallet'}
        />
        <StatusItem
          label="Address"
          value={address ?? 'Not connected'}
          monospace
        />
        <StatusItem
          label="Chain"
          value={chain ? `${chain.name} (${chain.id})` : 'No active chain'}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {isConnected ? (
          <button
            type="button"
            className="rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        ) : (
          connectors.map((walletConnector) => (
            <button
              key={walletConnector.uid}
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
              onClick={() => connect({ connector: walletConnector })}
              disabled={isPending}
            >
              {isPending ? 'Connecting...' : `Connect ${walletConnector.name}`}
            </button>
          ))
        )}
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          Switch Chain
        </div>
        <div className="flex flex-wrap gap-2">
          {chains.map((supportedChain) => (
            <button
              key={supportedChain.id}
              type="button"
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                chain?.id === supportedChain.id
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500'
              }`}
              onClick={() => switchChain({ chainId: supportedChain.id })}
              disabled={!isConnected || isSwitching}
            >
              {supportedChain.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

type StatusItemProps = {
  label: string;
  value: string;
  monospace?: boolean;
};

const StatusItem = ({ label, value, monospace = false }: StatusItemProps) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div
        className={`mt-1 text-sm text-slate-800 dark:text-slate-100 ${
          monospace ? 'break-all font-mono' : ''
        }`}
      >
        {value}
      </div>
    </div>
  );
};
