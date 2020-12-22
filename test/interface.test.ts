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

test('serialize normal interface', () => {
  const filePath = resolvePath(process.cwd(), 'playground', 'apis', 'models', 'user.ts');
  const { sourceFiles, checker } = getSourceFiles([filePath], configResolver.getCompilerOptions());
  const node = getTargetNodeByKind(sourceFiles, ts.SyntaxKind.InterfaceDeclaration);
  if (node) {
    const result = serializeInterface(node as ts.InterfaceDeclaration, checker);
    expect(result).toEqual({
      name: 'MUser',
      generics: [],
      properties: { name: 'string', age: 'number' },
    });
  }
});
