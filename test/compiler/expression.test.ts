import ts from 'typescript';
import { getClassMethods } from '../../src/compiler/class';
import { serializeExpression } from '../../src/compiler/expression';
import { getMethodEntry, MethodEntry } from '../../src/compiler/method';
import { getIdentifierText, isRequestExpression } from '../../src/utils';
import { getBindingResult, getTargetNodesByKind } from '../../src/utils/testUtils';

const getTargetClass = (
  nodes: ts.ClassDeclaration[],
  nodeName: string
): ts.ClassDeclaration | null => {
  const targetNodes = nodes.filter((node) => getIdentifierText(node.name) === nodeName);
  return targetNodes.length > 0 ? targetNodes[0] : null;
};

const getTargetMethod = (methods: MethodEntry[], name: string) => {
  const targetNodes = methods.filter((method) => method.name === name);
  return targetNodes.length > 0 ? targetNodes[0] : null;
};

describe('expressions', () => {
  let entries = new Array<MethodEntry>();
  let checker: ts.TypeChecker;

  beforeAll(() => {
    const bindingResult = getBindingResult('services');
    checker = bindingResult.checker;
    const classes = getTargetNodesByKind(
      bindingResult.sourceFiles,
      ts.SyntaxKind.ClassDeclaration
    ) as ts.ClassDeclaration[];
    const node = getTargetClass(classes, 'PlayGroundService');
    if (node) {
      const methods = getClassMethods(node);
      entries = methods.map((method) => getMethodEntry(method));
    }
  });

  test('isRequestExpression', () => {
    const normalMethod = getTargetMethod(entries, 'normal');
    normalMethod && expect(isRequestExpression(normalMethod.expressions[0])).toBe(true);
    const nowMethod = getTargetMethod(entries, 'now');
    nowMethod && expect(isRequestExpression(nowMethod.expressions[0])).toBe(false);
  });

  test('serialize normal', () => {
    const method = getTargetMethod(entries, 'normal');
    if (method) {
      const expected = {
        url: '/api/normal',
        responseBody: {
          code: 'number',
          msg: 'string',
          data: {
            string: 'string',
            number: 'number',
            stringArray: 'string[]',
            numberArray: 'number[]',
            interface: {
              leaf: {
                string: 'string',
                number: 'number',
                stringArray: 'string[]',
                numberArray: 'number[]',
              },
            },
            interfaceArray: [
              {
                leaf: {
                  string: 'string',
                  number: 'number',
                  stringArray: 'string[]',
                  numberArray: 'number[]',
                },
              },
            ],
          },
        },
      };

      expect(serializeExpression(method.expressions[0], checker)).toEqual(expected);
    }
  });

  test('serialize array', () => {
    const method = getTargetMethod(entries, 'array');
    if (method) {
      const expected = {
        url: '/api/array',
        responseBody: {
          code: 'number',
          msg: 'string',
          data: [
            {
              string: 'string',
              number: 'number',
              stringArray: 'string[]',
              numberArray: 'number[]',
              interface: {
                leaf: {
                  string: 'string',
                  number: 'number',
                  stringArray: 'string[]',
                  numberArray: 'number[]',
                },
              },
              interfaceArray: [
                {
                  leaf: {
                    string: 'string',
                    number: 'number',
                    stringArray: 'string[]',
                    numberArray: 'number[]',
                  },
                },
              ],
            },
          ],
        },
      };

      expect(serializeExpression(method.expressions[0], checker)).toEqual(expected);
    }
  });

  test('serialize void', () => {
    const method = getTargetMethod(entries, 'void');
    if (method) {
      const expected = {
        url: '/api/void',
        responseBody: {
          code: 'number',
          msg: 'string',
          data: {
            string: 'string',
            number: 'number',
            stringArray: 'string[]',
            numberArray: 'number[]',
            interface: {
              leaf: {
                string: 'string',
                number: 'number',
                stringArray: 'string[]',
                numberArray: 'number[]',
              },
            },
            interfaceArray: [
              {
                leaf: {
                  string: 'string',
                  number: 'number',
                  stringArray: 'string[]',
                  numberArray: 'number[]',
                },
              },
            ],
          },
        },
      };

      expect(serializeExpression(method.expressions[0], checker)).toEqual(expected);
    }
  });

  test('serialize useString', () => {
    const method = getTargetMethod(entries, 'useString');
    if (method) {
      const expected = {
        url: '/user/string',
        responseBody: {
          code: 'number',
          msg: 'string',
          data: {
            string: 'string',
            number: 'number',
            stringArray: 'string[]',
            numberArray: 'number[]',
            interface: {
              leaf: {
                string: 'string',
                number: 'number',
                stringArray: 'string[]',
                numberArray: 'number[]',
              },
            },
            interfaceArray: [
              {
                leaf: {
                  string: 'string',
                  number: 'number',
                  stringArray: 'string[]',
                  numberArray: 'number[]',
                },
              },
            ],
          },
        },
      };

      expect(serializeExpression(method.expressions[0], checker)).toEqual(expected);
    }
  });

  test('serialize withIf', () => {
    const method = getTargetMethod(entries, 'withIf');
    if (method) {
      const expected = [
        {
          url: '/api/withIf',
          responseBody: {
            code: 'number',
            msg: 'string',
            data: {
              string: 'string',
              number: 'number',
              stringArray: 'string[]',
              numberArray: 'number[]',
              interface: {
                leaf: {
                  string: 'string',
                  number: 'number',
                  stringArray: 'string[]',
                  numberArray: 'number[]',
                },
              },
              interfaceArray: [
                {
                  leaf: {
                    string: 'string',
                    number: 'number',
                    stringArray: 'string[]',
                    numberArray: 'number[]',
                  },
                },
              ],
            },
          },
        },
        {
          url: '/api/withIfElseIf',
          responseBody: {
            code: 'number',
            msg: 'string',
            data: {
              string: 'string',
              number: 'number',
              stringArray: 'string[]',
              numberArray: 'number[]',
              interface: {
                leaf: {
                  string: 'string',
                  number: 'number',
                  stringArray: 'string[]',
                  numberArray: 'number[]',
                },
              },
              interfaceArray: [
                {
                  leaf: {
                    string: 'string',
                    number: 'number',
                    stringArray: 'string[]',
                    numberArray: 'number[]',
                  },
                },
              ],
            },
          },
        },
        {
          url: '/api/withIfElse',
          responseBody: {
            code: 'number',
            msg: 'string',
            data: {
              string: 'string',
              number: 'number',
              stringArray: 'string[]',
              numberArray: 'number[]',
              interface: {
                leaf: {
                  string: 'string',
                  number: 'number',
                  stringArray: 'string[]',
                  numberArray: 'number[]',
                },
              },
              interfaceArray: [
                {
                  leaf: {
                    string: 'string',
                    number: 'number',
                    stringArray: 'string[]',
                    numberArray: 'number[]',
                  },
                },
              ],
            },
          },
        },
      ];

      expect(method.expressions.map((item) => serializeExpression(item, checker))).toEqual(
        expected
      );
    }
  });
});
