import ts from 'typescript';
import { getFilesFromPathByRule, getSourceFiles, resolvePath } from '.';
import { ROOT, TS_CONFIG_NAME } from '../constants';
import { TsConfigResolver } from '../resolver/config';

export const getTargetNodesByKind = (
  sourceFiles: readonly ts.SourceFile[],
  kind: ts.SyntaxKind
): ts.Node[] => {
  let result = new Array<ts.Node>();
  sourceFiles.forEach((sourceFile) => {
    if (sourceFile.isDeclarationFile) {
      return;
    }
    sourceFile.forEachChild((node: ts.Node) => {
      if (node.kind === kind) {
        result.push(node);
      }
    });
  });
  return result;
};

const getCompilerOptions = () => {
  const configResolver = new TsConfigResolver(resolvePath(ROOT, TS_CONFIG_NAME));
  return configResolver.getCompilerOptions();
};

export const getBindingResult = (path: string) => {
  const resolvedPath = resolvePath(process.cwd(), 'playground', 'apis', path);
  const files = getFilesFromPathByRule('**/*.ts', resolvedPath);
  return getSourceFiles(files, getCompilerOptions());
};
