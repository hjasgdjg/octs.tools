import { useMemo } from 'react';

import { createPublicClient, http } from 'viem';
import { useChainId } from 'wagmi';

import { chains, defaultChain } from './wallet';
import { useSessionStore } from '../store/session';

const getDefaultRpcUrl = (chainId: number) => {
  const targetChain =
    chains.find((chain) => chain.id === chainId) ?? defaultChain;

  return targetChain.rpcUrls.default.http[0];
};

export const useEffectivePublicClient = () => {
  const activeChainId = useChainId();
  const customRpcUrl = useSessionStore((state) => state.customRpcUrl).trim();

  const chain =
    chains.find((item) => item.id === activeChainId) ?? defaultChain;
  const rpcUrl = customRpcUrl || getDefaultRpcUrl(chain.id);

  const client = useMemo(
    () =>
      createPublicClient({
        chain,
        transport: http(rpcUrl),
      }),
    [chain, rpcUrl],
  );

  return {
    client,
    chain,
    rpcUrl,
    isCustomRpc: Boolean(customRpcUrl),
  };
};
