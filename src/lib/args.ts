import type { AbiParameter } from 'viem';

const INT_PATTERN = /^u?int(\d+)?$/;

const splitArrayType = (type: string) => {
  const match = type.match(/^(.*)\[(\d*)\]$/);
  if (!match) {
    return null;
  }

  return {
    itemType: match[1],
  };
};

const getTupleComponents = (
  parameter: AbiParameter,
): readonly AbiParameter[] | undefined => {
  if ('components' in parameter) {
    return parameter.components;
  }

  return undefined;
};

const parseInteger = (raw: string) => {
  const value = raw.trim();

  if (!value) {
    throw new Error('Integer input cannot be empty.');
  }

  return BigInt(value);
};

const parseBoolean = (raw: string) => {
  const value = raw.trim().toLowerCase();

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error('Boolean input must be either true or false.');
};

const parseTupleObject = (
  raw: string,
  components: readonly AbiParameter[] | undefined,
): unknown[] => {
  const parsed = JSON.parse(raw);

  if (!components?.length) {
    return parsed;
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Tuple input must be a JSON object.');
  }

  return components.map((component, index) => {
    const key = component.name || String(index);

    if (!(key in parsed)) {
      throw new Error(`Missing tuple field: ${key}`);
    }

    return parseArgumentValue(component, JSON.stringify(parsed[key]));
  });
};

const parseArray = (
  raw: string,
  parameter: AbiParameter,
  itemType: string,
): unknown[] => {
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error('Array input must be a JSON array.');
  }

  return parsed.map((item) =>
    parseArgumentValue(
      {
        ...parameter,
        type: itemType,
      },
      JSON.stringify(item),
    ),
  );
};

export const parseArgumentValue = (
  parameter: AbiParameter,
  raw: string,
): unknown => {
  const arrayType = splitArrayType(parameter.type);

  if (arrayType) {
    return parseArray(raw, parameter, arrayType.itemType);
  }

  if (INT_PATTERN.test(parameter.type)) {
    return parseInteger(raw);
  }

  if (parameter.type === 'bool') {
    return parseBoolean(raw);
  }

  if (parameter.type === 'tuple') {
    return parseTupleObject(raw, getTupleComponents(parameter));
  }

  if (parameter.type === 'string') {
    return raw;
  }

  return raw.trim();
};

export const stringifyExecutionValue = (value: unknown) => {
  return JSON.stringify(
    value,
    (_, currentValue) =>
      typeof currentValue === 'bigint' ? currentValue.toString() : currentValue,
    2,
  );
};
