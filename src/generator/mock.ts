import faker from 'faker';
import { ExpressionEntry } from '../compiler/expression';
import { MockData } from '../types';
import { toString } from '../utils';

const getValueFromObject = (obj: Record<string, any>): Record<string, any> => {
  let result = {} as Record<string, any>;
  if (!Array.isArray(obj)) {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'object') {
        result[key] = getValueFromObject(obj[key]);
      } else {
        result[key] = generateBasicTypeValue(obj[key]);
      }
    });
  } else {
    return [getValueFromObject(obj[0])];
  }
  return result;
};

const generateBasicTypeValue = (valueType: string): string | number | string[] | number[] => {
  switch (valueType) {
    case 'string':
      return faker.random.word();
    case 'string[]':
      return [faker.random.word()];
    case 'number':
      return faker.random.number();
    case 'number[]':
      return [faker.random.number()];
    default:
      return toString(valueType);
  }
};

const isDifferent = (key: string, array: string[]) => array.indexOf(key) !== -1;

export const generateMockData = (
  entry: ExpressionEntry[],
  originDataMap: Map<string, MockData>,
  differences: string[]
): MockData[] => {
  return entry.map(({ url, responseBody }) => {
    // When there is no change, take the original value directly
    if (differences.length > 0 && !isDifferent(url, differences)) {
      return originDataMap.get(url) as MockData;
    } else {
      return {
        url,
        response: getValueFromObject(responseBody),
      };
    }
  });
};
