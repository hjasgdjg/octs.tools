import { useEffect, useMemo, useState } from 'react';

import { useAccount, useWalletClient } from 'wagmi';
import type { AbiParameter } from 'viem';
import { isAddress, parseEther } from 'viem';

import { parseArgumentValue, stringifyExecutionValue } from '../lib/args';
import { getAbiFunctions, parseAbiInput } from '../lib/abi';
import {
  getParameterHint,
  getParameterTemplate,
  isComplexParameter,
} from '../lib/abi-input';
import { useEffectivePublicClient } from '../lib/public-client';
import { useSessionStore } from '../store/session';
import { Panel } from './Panel';

export const ExecutionPanel = () => {
  const { isConnected } = useAccount();
  const { client: publicClient } = useEffectivePublicClient();
  const { data: walletClient } = useWalletClient();
  const contractAddress = useSessionStore((state) => state.contractAddress);
  const abiInput = useSessionStore((state) => state.abiInput);
  const selectedFunctionKey = useSessionStore((state) => state.selectedFunctionKey);
  const executionHistory = useSessionStore((state) => state.executionHistory);
  const appendExecutionHistory = useSessionStore(
    (state) => state.appendExecutionHistory,
  );
  const [argValues, setArgValues] = useState<Record<string, string>>({});
  const [nativeValue, setNativeValue] = useState('0');
  const [readResult, setReadResult] = useState<string>('');
  const [readError, setReadError] = useState<string>('');
  const [isExecutingRead, setIsExecutingRead] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string>('');
  const [simulationError, setSimulationError] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [transactionReceipt, setTransactionReceipt] = useState('');
  const [writeError, setWriteError] = useState('');
  const [isWriting, setIsWriting] = useState(false);

  const selectedFunction = useMemo(() => {
    try {
      const abi = parseAbiInput(abiInput);
      const functions = getAbiFunctions(abi);
      return functions.find((item) => item.key === selectedFunctionKey) ?? null;
    } catch {
      return null;
    }
  }, [abiInput, selectedFunctionKey]);

  useEffect(() => {
    setArgValues({});
    setNativeValue('0');
    setReadResult('');
    setReadError('');
    setSimulationResult('');
    setSimulationError('');
    setTransactionHash('');
    setTransactionReceipt('');
    setWriteError('');
  }, [selectedFunctionKey]);

  const isReadFunction =
    selectedFunction?.item.stateMutability === 'view' ||
    selectedFunction?.item.stateMutability === 'pure';
  const isWriteFunction =
    selectedFunction?.item.stateMutability === 'nonpayable' ||
    selectedFunction?.item.stateMutability === 'payable';
  const isPayableFunction = selectedFunction?.item.stateMutability === 'payable';

  const buildExecutionArgs = () => {
    if (!selectedFunction) {
      throw new Error('No function selected.');
    }

    return selectedFunction.item.inputs.map((input, index) =>
      parseArgumentValue(input, argValues[String(index)] ?? ''),
    );
  };

  const buildNativeValue = () => {
    if (!isPayableFunction) {
      return undefined;
    }

    const trimmedValue = nativeValue.trim();

    if (!trimmedValue || trimmedValue === '0') {
      return undefined;
    }

    return parseEther(trimmedValue);
  };

  const handleRead = async () => {
    if (!selectedFunction || !isReadFunction) {
      return;
    }

    if (!publicClient) {
      setReadError('Public client is not ready.');
      return;
    }

    if (!isAddress(contractAddress)) {
      setReadError('A valid contract address is required.');
      return;
    }

    try {
      setIsExecutingRead(true);
      setReadError('');
      setReadResult('');

      const parsedArgs = buildExecutionArgs();

      const result = await publicClient.readContract({
        address: contractAddress,
        abi: [selectedFunction.item],
        functionName: selectedFunction.item.name,
        args: parsedArgs,
      });

      const resultText = stringifyExecutionValue(result);
      setReadResult(resultText);
      appendExecutionHistory({
        id: `${Date.now()}-read`,
        createdAt: new Date().toISOString(),
        chainId: publicClient.chain?.id ?? null,
        contractAddress,
        functionSignature: selectedFunction.signature,
        mode: 'read',
        argsSnapshot: argValues,
        result: resultText,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Read execution failed.';
      setReadError(message);
      appendExecutionHistory({
        id: `${Date.now()}-read-error`,
        createdAt: new Date().toISOString(),
        chainId: publicClient.chain?.id ?? null,
        contractAddress,
        functionSignature: selectedFunction.signature,
        mode: 'read',
        argsSnapshot: argValues,
        error: message,
      });
    } finally {
      setIsExecutingRead(false);
    }
  };

  const handleSimulate = async () => {
    if (!selectedFunction || !isWriteFunction) {
      return;
    }

    if (!publicClient) {
      setSimulationError('Public client is not ready.');
      return;
    }

    if (!walletClient?.account) {
      setSimulationError('A connected wallet account is required.');
      return;
    }

    if (!isAddress(contractAddress)) {
      setSimulationError('A valid contract address is required.');
      return;
    }

    try {
      setIsSimulating(true);
      setSimulationError('');
      setSimulationResult('');

      const args = buildExecutionArgs();
      const value = buildNativeValue();

      const result = await publicClient.simulateContract({
        account: walletClient.account,
        address: contractAddress,
        abi: [selectedFunction.item],
        functionName: selectedFunction.item.name,
        args,
        value,
      });

      const resultText = stringifyExecutionValue({
        request: {
          chainId: result.request.chain?.id ?? null,
          to: result.request.address,
          data: 'data' in result.request ? result.request.data : null,
          value:
            typeof result.request.value === 'bigint'
              ? result.request.value.toString()
              : null,
        },
        result: result.result,
      });

      setSimulationResult(resultText);
      appendExecutionHistory({
        id: `${Date.now()}-simulate`,
        createdAt: new Date().toISOString(),
        chainId: publicClient.chain?.id ?? null,
        contractAddress,
        functionSignature: selectedFunction.signature,
        mode: 'simulate',
        argsSnapshot: argValues,
        nativeValue: nativeValue.trim(),
        result: resultText,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Simulation failed.';
      setSimulationError(message);
      appendExecutionHistory({
        id: `${Date.now()}-simulate-error`,
        createdAt: new Date().toISOString(),
        chainId: publicClient.chain?.id ?? null,
        contractAddress,
        functionSignature: selectedFunction.signature,
        mode: 'simulate',
        argsSnapshot: argValues,
        nativeValue: nativeValue.trim(),
        error: message,
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleWrite = async () => {
    if (!selectedFunction || !isWriteFunction) {
      return;
    }

    if (!publicClient) {
      setWriteError('Public client is not ready.');
      return;
    }

    if (!walletClient?.account) {
      setWriteError('A connected wallet account is required.');
      return;
    }

    if (!isAddress(contractAddress)) {
      setWriteError('A valid contract address is required.');
      return;
    }

    try {
      setIsWriting(true);
      setWriteError('');
      setTransactionHash('');
      setTransactionReceipt('');

      const args = buildExecutionArgs();
      const value = buildNativeValue();

      const simulation = await publicClient.simulateContract({
        account: walletClient.account,
        address: contractAddress,
        abi: [selectedFunction.item],
        functionName: selectedFunction.item.name,
        args,
        value,
      });

      const simulationText = stringifyExecutionValue({
        request: {
          chainId: simulation.request.chain?.id ?? null,
          to: simulation.request.address,
          data: 'data' in simulation.request ? simulation.request.data : null,
          value:
            typeof simulation.request.value === 'bigint'
              ? simulation.request.value.toString()
              : null,
        },
        result: simulation.result,
      });
      setSimulationResult(simulationText);

      const hash = await walletClient.writeContract(simulation.request);
      setTransactionHash(hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      const receiptText = stringifyExecutionValue({
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice.toString(),
        status: receipt.status,
      });

      setTransactionReceipt(receiptText);
      appendExecutionHistory({
        id: `${Date.now()}-write`,
        createdAt: new Date().toISOString(),
        chainId: publicClient.chain?.id ?? null,
        contractAddress,
        functionSignature: selectedFunction.signature,
        mode: 'write',
        argsSnapshot: argValues,
        nativeValue: nativeValue.trim(),
        result: simulationText,
        transactionHash: hash,
        receipt: receiptText,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Write failed.';
      setWriteError(message);
      appendExecutionHistory({
        id: `${Date.now()}-write-error`,
        createdAt: new Date().toISOString(),
        chainId: publicClient.chain?.id ?? null,
        contractAddress,
        functionSignature: selectedFunction.signature,
        mode: 'write',
        argsSnapshot: argValues,
        nativeValue: nativeValue.trim(),
        error: message,
      });
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <Panel
      title="Execution"
      subtitle="Argument preparation, simulation, transaction state, and raw output."
    >
      <div className="grid h-full min-h-0 gap-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Selected Function
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-3 font-mono text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
            {selectedFunction?.signature ?? 'No function selected.'}
          </div>
        </div>

        <div className="grid min-h-0 gap-4 xl:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Arguments
            </div>
            <div className="mt-3 space-y-3">
              {selectedFunction?.item.inputs.length ? (
                selectedFunction.item.inputs.map((input, index) => (
                  <ArgumentField
                    key={`${input.name}-${index}`}
                    index={index}
                    parameter={input}
                    parameterName={input.name || `arg${index}`}
                    value={argValues[String(index)] ?? ''}
                    onChange={(value) =>
                      setArgValues((current) => ({
                        ...current,
                        [String(index)]: value,
                      }))
                    }
                  />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  This function does not require arguments.
                </div>
              )}

              {isPayableFunction ? (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Native Value · ETH / BNB
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
                    placeholder="0"
                    value={nativeValue}
                    onChange={(event) => setNativeValue(event.target.value)}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Execution Actions
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 dark:disabled:border-slate-700 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
                disabled={!selectedFunction || !isReadFunction || isExecutingRead}
                onClick={() => {
                  void handleRead();
                }}
              >
                {isExecutingRead ? 'Reading...' : 'Run Read'}
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-500 dark:disabled:text-slate-500"
                disabled={!selectedFunction || !isWriteFunction || isSimulating}
                onClick={() => {
                  void handleSimulate();
                }}
              >
                {isSimulating ? 'Simulating...' : 'Simulate'}
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-500 dark:disabled:text-slate-500"
                disabled={
                  !selectedFunction || !isWriteFunction || !isConnected || isWriting
                }
                onClick={() => {
                  void handleWrite();
                }}
              >
                {isWriting ? 'Writing...' : 'Write'}
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Read, simulate, and write now share the same argument source. Write
              execution requires a connected injected wallet.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Result
            </div>
            <pre className="mt-3 min-h-28 overflow-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-mono text-xs text-slate-800 sm:min-h-40 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
              {readResult || 'No read result yet.'}
            </pre>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Transaction State
            </div>
            <div className="mt-3 space-y-3">
              <ExecutionOutputBlock
                title="Simulation"
                content={simulationResult || 'No simulation output yet.'}
              />
              <ExecutionOutputBlock
                title="Transaction Hash"
                content={transactionHash || 'No transaction submitted yet.'}
                monospace
              />
              <ExecutionOutputBlock
                title="Receipt"
                content={transactionReceipt || 'No receipt yet.'}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Execution History
          </div>
          <div className="mt-3 max-h-72 space-y-3 overflow-auto">
            {executionHistory.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-mono text-xs text-slate-800 dark:text-slate-100">
                    {item.functionSignature}
                  </div>
                  <div className="rounded-full border border-slate-300 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                    {item.mode}
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  {new Date(item.createdAt).toLocaleString()} · Chain{' '}
                  {item.chainId ?? 'unknown'}
                </div>
                <div className="mt-2 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                  {item.contractAddress}
                </div>
                {item.transactionHash ? (
                  <div className="mt-2 break-all font-mono text-[11px] text-slate-700 dark:text-slate-200">
                    {item.transactionHash}
                  </div>
                ) : null}
                {item.error ? (
                  <div className="mt-2 text-xs text-rose-700 dark:text-rose-300">{item.error}</div>
                ) : null}
              </div>
            ))}
            {executionHistory.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                No execution history yet.
              </div>
            ) : null}
          </div>
        </div>

        {readError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            {readError}
          </div>
        ) : null}

        {simulationError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            {simulationError}
          </div>
        ) : null}

        {writeError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            {writeError}
          </div>
        ) : null}
      </div>
    </Panel>
  );
};

type ExecutionOutputBlockProps = {
  title: string;
  content: string;
  monospace?: boolean;
};

const ExecutionOutputBlock = ({
  title,
  content,
  monospace = false,
}: ExecutionOutputBlockProps) => {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {title}
      </div>
      <pre
        className={`min-h-20 overflow-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 ${
          monospace ? 'font-mono' : 'font-mono'
        }`}
      >
        {content}
      </pre>
    </div>
  );
};

const PlaceholderBlock = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {title}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
};

type ArgumentFieldProps = {
  index: number;
  parameter: AbiParameter;
  parameterName: string;
  value: string;
  onChange: (value: string) => void;
};

const ArgumentField = ({
  index,
  parameter,
  parameterName,
  value,
  onChange,
}: ArgumentFieldProps) => {
  const structuredInput = isComplexParameter(parameter);
  const placeholder = getArgumentPlaceholder(parameter.type, index);

  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {parameterName} · {parameter.type}
      </label>
      {structuredInput ? (
        <ComplexArgumentField
          parameter={parameter}
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
};

const getArgumentPlaceholder = (type: string, index: number) => {
  if (type === 'address') {
    return '0x...';
  }

  if (type === 'bool') {
    return 'true';
  }

  if (type === 'string') {
    return `value-${index}`;
  }

  if (type.startsWith('bytes')) {
    return '0x';
  }

  return '0';
};

type ComplexArgumentFieldProps = {
  parameter: AbiParameter;
  value: string;
  onChange: (value: string) => void;
};

const ComplexArgumentField = ({
  parameter,
  value,
  onChange,
}: ComplexArgumentFieldProps) => {
  const template = getParameterTemplate(parameter);
  const hint = getParameterHint(parameter);
  const componentsText =
    'components' in parameter && parameter.components?.length
      ? parameter.components
          .map((component, index) => `${component.name || `field${index}`}:${component.type}`)
          .join(', ')
      : '';

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        <div>{hint}</div>
        {componentsText ? <div className="mt-1 font-mono">{componentsText}</div> : null}
      </div>
      <textarea
        className="h-32 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-mono text-sm outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
        placeholder={template ?? ''}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {template ? (
        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
          onClick={() => onChange(template)}
        >
          Insert Template
        </button>
      ) : null}
    </div>
  );
};
