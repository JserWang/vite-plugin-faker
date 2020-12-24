import ts from 'typescript';
import { serializeInterface } from '../../src/compiler/interface';
import { getIdentifierText } from '../../src/utils';
import { getBindingResult, getTargetNodesByKind } from '../../src/utils/testUtils';

const getTargetNodeByName = (
  nodes: ts.InterfaceDeclaration[],
  nodeName: string
): ts.InterfaceDeclaration | null => {
  const targetNodes = nodes.filter((node) => getIdentifierText(node.name) === nodeName);
  return targetNodes.length > 0 ? targetNodes[0] : null;
};

const testSerializeInterface = (
  nodes: ts.InterfaceDeclaration[],
  checker: ts.TypeChecker,
  nodeName: string,
  expected: Record<string, any>
) => {
  const node = getTargetNodeByName(nodes, nodeName);

  if (node) {
    const result = serializeInterface(node, checker);
    expect(result).toEqual(expected);
  }
};

describe('serialize interface', () => {
  let interfaces: ts.InterfaceDeclaration[];
  let checker: ts.TypeChecker;
  beforeAll(() => {
    const bindingResult = getBindingResult('models');
    interfaces = getTargetNodesByKind(
      bindingResult.sourceFiles,
      ts.SyntaxKind.InterfaceDeclaration
    ) as ts.InterfaceDeclaration[];
    checker = bindingResult.checker;
  });

  test('basic interface', () => {
    const expected = {
      name: 'MBasic',
      properties: { name: 'string', age: 'number' },
    };

    testSerializeInterface(interfaces, checker, 'MBasic', expected);
  });

  test('interface with extends', () => {
    const expected = {
      name: 'MSquare',
      extends: ['MShape'],
      properties: { color: 'string', sideLength: 'number' },
    };

    testSerializeInterface(interfaces, checker, 'MSquare', expected);
  });

  test('interface with generic', () => {
    const expected = {
      name: 'MCustomResponse',
      generics: ['T'],
      properties: { code: 'number', msg: 'string', data: 'T' },
    };

    testSerializeInterface(interfaces, checker, 'MCustomResponse', expected);
  });

  test('PropertySignature.type is typeReference', () => {
    const expected = {
      name: 'MParent',
      properties: {
        child: {
          name: 'MChild',
          properties: { name: 'string', age: 'number' },
        },
      },
    };

    testSerializeInterface(interfaces, checker, 'MParent', expected);
  });

  test('PropertySignature.type is ArrayType', () => {
    const expected = {
      name: 'MArrayType',
      properties: {
        stringArr: 'string[]',
        numberArr: 'number[]',
        children: [
          {
            name: 'MChild',
            properties: { name: 'string', age: 'number' },
          },
        ],
      },
    };

    testSerializeInterface(interfaces, checker, 'MArrayType', expected);
  });

  test('PropertySignature.type is undefined', () => {
    const expected = {
      name: 'MEmpty',
      properties: { '': '' },
    };

    testSerializeInterface(interfaces, checker, 'MEmpty', expected);
  });

  test('PropertySignature.type is LiteralType', () => {
    const expected = {
      name: 'MLiteralType',
      properties: { name: 'JserWang', age: 18 },
    };

    testSerializeInterface(interfaces, checker, 'MLiteralType', expected);
  });
});
