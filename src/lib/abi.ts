import type { Abi, AbiFunction } from 'viem';

export type ParsedFunctionItem = {
  key: string;
  signature: string;
  item: AbiFunction;
};

const buildSignature = (item: AbiFunction) => {
  const inputTypes = item.inputs.map((input) => input.type).join(', ');
  return `${item.name}(${inputTypes})`;
};

export const parseAbiInput = (input: string): Abi => {
  const parsed = JSON.parse(input) as Abi;

  if (!Array.isArray(parsed)) {
    throw new Error('ABI input must be a JSON array.');
  }

  return parsed;
};

export const getAbiFunctions = (abi: Abi): ParsedFunctionItem[] => {
  return abi
    .filter((item): item is AbiFunction => item.type === 'function')
    .map((item, index) => ({
      key: `${item.name}-${index}`,
      signature: buildSignature(item),
      item,
    }));
};

export const groupFunctions = (functions: ParsedFunctionItem[]) => {
  return {
    read: functions.filter(
      ({ item }) =>
        item.stateMutability === 'view' || item.stateMutability === 'pure',
    ),
    write: functions.filter(
      ({ item }) =>
        item.stateMutability === 'nonpayable' ||
        item.stateMutability === 'payable',
    ),
  };
};
