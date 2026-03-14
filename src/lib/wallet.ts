import { http, createConfig } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

import { DEFAULT_CHAIN_ID } from '../config';

const chains = [bsc, bscTestnet] as const;

const defaultChain =
  chains.find((chain) => chain.id === DEFAULT_CHAIN_ID) ?? bsc;

export const walletConfig = createConfig({
  chains,
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
});

export { chains, defaultChain };
