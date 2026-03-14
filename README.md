# octs.tools

octs.tools is a frontend-only EVM contract interaction console for technical users.

It is designed to stay protocol-agnostic and backend-independent. If a contract is deployed, the ABI is available, and the caller knows the required arguments, octs.tools should be enough to execute read calls, simulate writes, and submit transactions directly from an injected wallet.

## Principles

- frontend-only
- no backend services
- no protocol-specific shortcuts
- English-only repository
- technical-user-first
- reusable for any EVM-compatible workflow

## Current Features

- injected wallet connection
- chain switching
- custom RPC override for read, simulate, and receipt polling
- contract address input
- ABI JSON input and validation
- function parsing and grouping by mutability
- function search
- dynamic argument rendering
- read execution for `view` and `pure`
- write simulation for `nonpayable` and `payable`
- transaction submission from the connected wallet
- payable native value input
- local recent sessions
- local execution history
- structured guidance for array and tuple inputs

## Stack

- React
- Vite
- TypeScript
- viem
- wagmi
- Tailwind CSS
- zustand

## Wallet Model

octs.tools currently uses injected EVM wallets only.

Examples:

- MetaMask
- Rabby
- OKX Wallet
- Binance Wallet
- other browser wallets that expose an injected provider

There is no WalletConnect or third-party project ID requirement in the current implementation.

## Local Development

### Requirements

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Start the dev server

```bash
npm run dev
```

### Production build

```bash
npm run build
```

## Usage

1. Connect an injected wallet.
2. Select the target chain.
3. Optionally set a custom RPC endpoint.
4. Paste the contract address.
5. Paste the ABI JSON.
6. Search or select a function.
7. Fill the arguments.
8. Run one of the execution modes:

- `Run Read`
- `Simulate`
- `Write`

## Complex Input Rules

Scalar types use direct text inputs.

Structured types use JSON input:

- arrays expect a JSON array
- tuples expect a JSON object
- tuple arrays expect a JSON array of objects

The UI provides inline hints and a template insertion action for complex inputs.

## Persistence

octs.tools stores recent sessions and execution history in browser-local storage.

That means:

- no server-side persistence
- no cross-device sync
- clearing browser storage will remove saved history

## Scope

octs.tools is intentionally narrow.

It does not include:

- explorer integrations
- event indexing
- beginner tutorials
- protocol-specific recovery flows
- backend signing
- account abstraction

## Project Status

The current version is a functional first release candidate for direct contract interaction.

The most likely next iterations are:

- improved overloaded function handling
- richer argument validation
- execution replay from history
- additional bundle optimization
