import faker from 'faker';
import { ExpressionEntry } from '../compile/expression';
import { MockData } from '../types';
import { toString } from '../utils/type';

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

export default (entry: ExpressionEntry[]): MockData[] =>
  entry.map((item) => ({
    url: item.url,
    response: getValueFromObject(item.responseBody),
  }));
