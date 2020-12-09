import faker from 'faker';
import ts from 'typescript';
import type { Options } from '../types';
import { getFilesFromPathByRule, isMatched, joinPath, resolvePath } from './utils/tool';
import {
  getCompilerOptions,
  getDeclarations,
  getIdentifierText,
  getRealValueFromDeclaration,
  getSourceFiles,
  text2String,
} from './utils/type';

const root = process.cwd();

const TS_CONFIG_NAME = 'tsconfig.json';

export default (opts: Options) => {
  const targetPath = joinPath(root, opts.basePath);
  const files = getFilesFromPathByRule('**/*.ts', targetPath);
  const compilerOptions = getCompilerOptions(resolvePath(root, TS_CONFIG_NAME));
  const { sourceFiles, checker } = getSourceFiles(files, compilerOptions);
  const result: Record<string, any> = {};

  /**
   * generate the mock value with node type
   * @param node
   */
  const genMockValue = (node: ts.Node) => {
    switch (node.kind) {
      case ts.SyntaxKind.StringKeyword:
        return faker.random.word();
      case ts.SyntaxKind.NumberKeyword:
        return faker.random.number();
      case ts.SyntaxKind.TypeReference:
        return walk(node);
      case ts.SyntaxKind.ArrayType:
        return [walk(node)];
      default:
        return false;
    }
  };

  /**
   * serialize interface
   * @param node
   */
  const serializeInterface = (node: ts.InterfaceDeclaration) => {
    let serialized: Record<string, any> = {};

    // for extends case
    if (node.heritageClauses) {
      node.heritageClauses[0].types.forEach((item) => {
        serialized = {
          ...walk(item),
          ...serialized,
        };
      });
    }

    // process the properties that come with the interface
    node.members.forEach((typeElement) => {
      let key = '';
      if (ts.isPropertySignature(typeElement)) {
        if (ts.isIdentifier(typeElement.name)) {
          key = getIdentifierText(typeElement.name);
        }
        if (typeElement.type) {
          serialized[key] = genMockValue(typeElement.type);
        }
      }
    });

    return serialized;
  };

  /**
   * walk ast tree
   * @param node
   */
  const walk = (node: ts.Node): any => {
    if (ts.isClassDeclaration(node)) {
      if (!node.name) {
        return;
      }
      const className = getIdentifierText(node.name);
      // only process files that meet the inclusion rules and the exclusion rules
      if (!isMatched(className, opts.includes) && isMatched(className, opts.excludes)) {
        return;
      }
      // each property in the class
      node.members.forEach(walk);
    } else if (ts.isMethodDeclaration(node)) {
      // method body
      node.body?.forEachChild(walk);
    } else if (ts.isExpressionStatement(node) || ts.isReturnStatement(node)) {
      node.expression && walk(node.expression);
    } else if (ts.isCallExpression(node)) {
      // only processing starts with `Request.`
      if (node.getText().startsWith('Request.')) {
        // the Request first param is `url`
        const key = walk(node.arguments[0]);
        if (node.typeArguments) {
          // process the result
          result[key] = walk(node.typeArguments[0]);
        }
      }
    } else if (ts.isPropertyAccessExpression(node)) {
      // assign value via `this.api.xxx`
      const symbol = checker.getSymbolAtLocation(node);
      if (symbol) {
        return getRealValueFromDeclaration(symbol.valueDeclaration);
      }
    } else if (ts.isStringLiteral(node)) {
      // assign value via string, such as `/user/info`
      return text2String(node);
    } else if (ts.isArrayTypeNode(node)) {
      // array directly takes the actual type
      return walk(node.elementType);
    } else if (ts.isIfStatement(node)) {
      walk(node.thenStatement);
      if (node.elseStatement) {
        walk(node.elseStatement);
      }
    } else if (ts.isBlock(node)) {
      node.statements.forEach(walk);
    } else if (ts.isTypeReferenceNode(node)) {
      const decls = getDeclarations(node, checker);
      return walk(decls[0]);
    } else if (ts.isInterfaceDeclaration(node)) {
      return serializeInterface(node);
    } else if (ts.isExpressionWithTypeArguments(node)) {
      const decls = getDeclarations(node, checker);
      return walk(decls[0]);
    } else if (node.kind === ts.SyntaxKind.StringKeyword) {
      return genMockValue(node);
    } else if (node.kind === ts.SyntaxKind.NumberKeyword) {
      return genMockValue(node);
    }
  };

  sourceFiles.forEach((sourceFile) => {
    // ignore `*.d.ts` files
    if (!sourceFile.isDeclarationFile) {
      ts.forEachChild(sourceFile, walk);
    }
  });

  return result;
};
