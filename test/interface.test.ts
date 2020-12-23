import ts from 'typescript';
import { serializeInterface } from '../src/compiler/interface';
import { ROOT, TS_CONFIG_NAME } from '../src/constants';
import { TsConfigResolver } from '../src/resolver/config';
import { getSourceFiles, resolvePath } from '../src/utils';

const configResolver = new TsConfigResolver(resolvePath(ROOT, TS_CONFIG_NAME));

const getTargetNodeByKind = (
  sourceFiles: readonly ts.SourceFile[],
  kind: ts.SyntaxKind
): ts.Node | null => {
  let result = null;
  sourceFiles.forEach((sourceFile) => {
    if (sourceFile.isDeclarationFile) {
      return;
    }
    sourceFile.forEachChild((node: ts.Node) => {
      if (node.kind === kind) {
        result = node;
      }
    });
  });
  return result;
};

const testSerializeInterface = (filePath: string, expected: Record<string, any>) => {
  const { sourceFiles, checker } = getSourceFiles([filePath], configResolver.getCompilerOptions());
  const node = getTargetNodeByKind(sourceFiles, ts.SyntaxKind.InterfaceDeclaration);

  if (node) {
    const result = serializeInterface(node as ts.InterfaceDeclaration, checker);
    expect(result).toEqual(expected);
  }
};

test('serialize basic interface', () => {
  const filePath = resolvePath(process.cwd(), 'playground', 'apis', 'models', 'basic.ts');
  const expected = {
    name: 'MBasic',
    generics: [],
    properties: { name: 'string', age: 'number' },
  };

  testSerializeInterface(filePath, expected);
});

test('serialize interface with extends', () => {
  const filePath = resolvePath(process.cwd(), 'playground', 'apis', 'models', 'extend.ts');
  const expected = {
    name: 'MSquare',
    generics: [],
    extends: ['MShape'],
    properties: { color: 'string', sideLength: 'number' },
  };

  testSerializeInterface(filePath, expected);
});

test('serialize interface with generic', () => {
  const filePath = resolvePath(process.cwd(), 'playground', 'apis', 'models', 'generic.ts');
  const expected = {
    name: 'MCustomResponse',
    generics: ['T'],
    properties: { code: 'number', msg: 'string', data: 'T' },
  };

  testSerializeInterface(filePath, expected);
});

test('serialize interface with typeReference', () => {
  const filePath = resolvePath(process.cwd(), 'playground', 'apis', 'models', 'reference.ts');
  const expected = {
    name: 'MParent',
    generics: [],
    properties: {
      children: [
        {
          name: 'MChild',
          generics: [],
          properties: { name: 'string', age: 'number' },
        },
      ],
    },
  };

  testSerializeInterface(filePath, expected);
});
