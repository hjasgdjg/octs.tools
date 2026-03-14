import type { AbiParameter } from 'viem';

const splitArrayType = (type: string) => {
  const match = type.match(/^(.*)\[(\d*)\]$/);
  if (!match) {
    return null;
  }

  return {
    itemType: match[1],
    length: match[2] || null,
  };
};

const buildTupleTemplateObject = (
  components: readonly AbiParameter[] | undefined,
): Record<string, unknown> => {
  if (!components?.length) {
    return {};
  }

  return components.reduce<Record<string, unknown>>((accumulator, component, index) => {
    const key = component.name || `field${index}`;
    accumulator[key] = getExampleValue(component);
    return accumulator;
  }, {});
};

export const isComplexParameter = (parameter: AbiParameter) => {
  return parameter.type.includes('[') || parameter.type === 'tuple';
};

export const getParameterComponents = (
  parameter: AbiParameter,
): readonly AbiParameter[] | undefined => {
  if ('components' in parameter) {
    return parameter.components;
  }

  return undefined;
};

export const getExampleValue = (parameter: AbiParameter): unknown => {
  const arrayType = splitArrayType(parameter.type);

  if (arrayType) {
    return [
      getExampleValue({
        ...parameter,
        type: arrayType.itemType,
      }),
    ];
  }

  if (parameter.type === 'tuple') {
    return buildTupleTemplateObject(getParameterComponents(parameter));
  }

  if (parameter.type === 'address') {
    return '0x0000000000000000000000000000000000000000';
  }

  if (parameter.type === 'bool') {
    return true;
  }

  if (parameter.type === 'string') {
    return 'value';
  }

  if (parameter.type.startsWith('bytes')) {
    return '0x';
  }

  return '0';
};

export const getParameterTemplate = (parameter: AbiParameter) => {
  if (!isComplexParameter(parameter)) {
    return null;
  }

  return JSON.stringify(getExampleValue(parameter), null, 2);
};

export const getParameterHint = (parameter: AbiParameter) => {
  const arrayType = splitArrayType(parameter.type);

  if (arrayType) {
    return `JSON array of ${arrayType.itemType} values`;
  }

  if (parameter.type === 'tuple') {
    const components = getParameterComponents(parameter);
    const fields = components?.map((component) => component.name || component.type);
    return `JSON object with fields: ${fields?.join(', ') || 'tuple fields'}`;
  }

  return '';
};
