import ts from 'typescript';
import { serializeInterface } from '../../src/compiler/interface';
import { INDEXABLE_TYPE } from '../../src/constants';
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
      properties: [
        { key: 'name', kind: ts.SyntaxKind.StringKeyword, value: 'string' },
        { key: 'age', kind: ts.SyntaxKind.NumberKeyword, value: 'number' },
        { key: INDEXABLE_TYPE, kind: ts.SyntaxKind.AnyKeyword, value: 'any' },
      ],
    };

    testSerializeInterface(interfaces, checker, 'MBasic', expected);
  });

  test('interface with extends', () => {
    const expected = {
      name: 'MSquare',
      extends: ['MShape'],
      properties: [
        { key: 'color', kind: ts.SyntaxKind.StringKeyword, value: 'string' },
        { key: 'sideLength', kind: ts.SyntaxKind.NumberKeyword, value: 'number' },
      ],
    };

    testSerializeInterface(interfaces, checker, 'MSquare', expected);
  });

  test('interface with generic', () => {
    const expected = {
      name: 'MCustomResponse',
      generics: ['T'],
      properties: [
        { key: 'code', kind: ts.SyntaxKind.NumberKeyword, value: 'number' },
        { key: 'msg', kind: ts.SyntaxKind.StringKeyword, value: 'string' },
        { key: 'data', kind: ts.SyntaxKind.TypeReference, value: 'T' },
      ],
    };

    testSerializeInterface(interfaces, checker, 'MCustomResponse', expected);
  });

  test('PropertySignature.type is typeReference', () => {
    const expected = {
      name: 'MParent',
      properties: [
        {
          key: 'child',
          kind: ts.SyntaxKind.TypeReference,
          value: {
            name: 'MChild',
            properties: [
              { key: 'name', kind: ts.SyntaxKind.StringKeyword, value: 'string' },
              { key: 'age', kind: ts.SyntaxKind.NumberKeyword, value: 'number' },
            ],
          },
        },
      ],
    };

    testSerializeInterface(interfaces, checker, 'MParent', expected);
  });

  test('PropertySignature.type is ArrayType', () => {
    const expected = {
      name: 'MArrayType',
      properties: [
        { key: 'stringArr', kind: ts.SyntaxKind.ArrayType, value: 'string' },
        { key: 'numberArr', kind: ts.SyntaxKind.ArrayType, value: 'number' },
        {
          key: 'children',
          kind: ts.SyntaxKind.ArrayType,
          value: {
            name: 'MChild',
            properties: [
              { key: 'name', kind: ts.SyntaxKind.StringKeyword, value: 'string' },
              { key: 'age', kind: ts.SyntaxKind.NumberKeyword, value: 'number' },
            ],
          },
        },
      ],
    };

    testSerializeInterface(interfaces, checker, 'MArrayType', expected);
  });

  test('PropertySignature.type is undefined', () => {
    const expected = {
      name: 'MEmpty',
      properties: [{ key: '' }],
    };

    testSerializeInterface(interfaces, checker, 'MEmpty', expected);
  });

  test('PropertySignature.type is LiteralType', () => {
    const expected = {
      name: 'MLiteralType',
      properties: [
        { key: 'name', kind: ts.SyntaxKind.LiteralType, value: 'JserWang' },
        { key: 'age', kind: ts.SyntaxKind.LiteralType, value: 18 },
      ],
    };

    testSerializeInterface(interfaces, checker, 'MLiteralType', expected);
  });

  test('string Indexable Types', () => {
    const expected = {
      name: 'MStringArray',
      properties: [{ key: INDEXABLE_TYPE, kind: ts.SyntaxKind.StringKeyword, value: 'string' }],
    };
    testSerializeInterface(interfaces, checker, 'MStringArray', expected);
  });

  test('number Indexable Types', () => {
    const expected = {
      name: 'MNumberArray',
      properties: [{ key: INDEXABLE_TYPE, kind: ts.SyntaxKind.NumberKeyword, value: 'number' }],
    };
    testSerializeInterface(interfaces, checker, 'MNumberArray', expected);
  });

  test('type Indexable Types', () => {
    const expected = {
      name: 'MTypeArray',
      properties: [
        {
          key: INDEXABLE_TYPE,
          kind: ts.SyntaxKind.TypeReference,
          value: {
            name: 'MBasic',
            properties: [
              { key: 'name', kind: ts.SyntaxKind.StringKeyword, value: 'string' },
              { key: 'age', kind: ts.SyntaxKind.NumberKeyword, value: 'number' },
              { key: INDEXABLE_TYPE, kind: ts.SyntaxKind.AnyKeyword, value: 'any' },
            ],
          },
        },
      ],
    };
    testSerializeInterface(interfaces, checker, 'MTypeArray', expected);
  });

  test('generic Indexable Types', () => {
    const expected = {
      name: 'MGenericArray',
      generics: ['T'],
      properties: [{ key: INDEXABLE_TYPE, kind: ts.SyntaxKind.TypeReference, value: 'T' }],
    };
    testSerializeInterface(interfaces, checker, 'MGenericArray', expected);
  });
});
