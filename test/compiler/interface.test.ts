import ts from 'typescript';
import { serializeInterface } from '../../src/compiler/interface';
import { ROOT, TS_CONFIG_NAME } from '../../src/constants';
import { TsConfigResolver } from '../../src/resolver/config';
import {
  getFilesFromPathByRule,
  getIdentifierText,
  getSourceFiles,
  resolvePath,
} from '../../src/utils';

const getTargetNodeByKind = (
  sourceFiles: readonly ts.SourceFile[],
  nodeName: string
): ts.Node | null => {
  let result = null;
  sourceFiles.forEach((sourceFile) => {
    if (sourceFile.isDeclarationFile) {
      return;
    }
    sourceFile.forEachChild((node: ts.Node) => {
      if (ts.isInterfaceDeclaration(node) && getIdentifierText(node.name) === nodeName) {
        result = node;
      }
    });
  });
  return result;
};

const testSerializeInterface = (
  sourceFiles: readonly ts.SourceFile[],
  checker: ts.TypeChecker,
  nodeName: string,
  expected: Record<string, any>
) => {
  const node = getTargetNodeByKind(sourceFiles, nodeName);

  if (node) {
    const result = serializeInterface(node as ts.InterfaceDeclaration, checker);
    expect(result).toEqual(expected);
  }
};

describe('serialize interface', () => {
  let sourceFiles: readonly ts.SourceFile[];
  let checker: ts.TypeChecker;
  beforeAll(() => {
    const configResolver = new TsConfigResolver(resolvePath(ROOT, TS_CONFIG_NAME));
    const interfacePath = resolvePath(process.cwd(), 'playground', 'apis', 'models');
    const files = getFilesFromPathByRule('**/*.ts', interfacePath);
    const bindingResult = getSourceFiles(files, configResolver.getCompilerOptions());
    sourceFiles = bindingResult.sourceFiles;
    checker = bindingResult.checker;
  });

  test('basic interface', () => {
    const expected = {
      name: 'MBasic',
      properties: { name: 'string', age: 'number' },
    };

    testSerializeInterface(sourceFiles, checker, 'MBasic', expected);
  });

  test('interface with extends', () => {
    const expected = {
      name: 'MSquare',
      extends: ['MShape'],
      properties: { color: 'string', sideLength: 'number' },
    };

    testSerializeInterface(sourceFiles, checker, 'MSquare', expected);
  });

  test('interface with generic', () => {
    const expected = {
      name: 'MCustomResponse',
      generics: ['T'],
      properties: { code: 'number', msg: 'string', data: 'T' },
    };

    testSerializeInterface(sourceFiles, checker, 'MCustomResponse', expected);
  });

  test('interface with typeReference', () => {
    const expected = {
      name: 'MParent',
      properties: {
        children: [
          {
            name: 'MChild',
            properties: { name: 'string', age: 'number' },
          },
        ],
      },
    };

    testSerializeInterface(sourceFiles, checker, 'MParent', expected);
  });

  test('PropertySignature.type is undefined', () => {
    const expected = {
      name: 'MEmpty',
      properties: { '': '' },
    };

    testSerializeInterface(sourceFiles, checker, 'MEmpty', expected);
  });

  test('PropertySignature.type is MLiteralType', () => {
    const expected = {
      name: 'MLiteralType',
      properties: { name: 'JserWang' },
    };

    testSerializeInterface(sourceFiles, checker, 'MLiteralType', expected);
  });
});
