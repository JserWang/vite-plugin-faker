import ts from 'typescript';

const mergeExpressions = (
  target1: ts.Expression | ts.Expression[],
  target2: ts.Expression | ts.Expression[]
): ts.Expression[] => {
  let result = [] as ts.Expression[];
  Array.isArray(target1) ? (result = result.concat(target1)) : result.push(target1);
  Array.isArray(target2) ? (result = result.concat(target2)) : result.push(target2);
  return result;
};

const processIfStatement = (statement: ts.IfStatement) => {
  let expressions = [] as ts.Expression[];

  if (ts.isBlock(statement.thenStatement)) {
    expressions = mergeExpressions(expressions, processBlock(statement.thenStatement));
  }

  if (statement.elseStatement) {
    if (ts.isIfStatement(statement.elseStatement)) {
      // 处理 else if
      expressions = mergeExpressions(expressions, processIfStatement(statement.elseStatement));
    } else if (ts.isBlock(statement.elseStatement)) {
      expressions = mergeExpressions(expressions, processBlock(statement.elseStatement));
    }
  }
  return expressions;
};

const processStatement = (statement: ts.Statement): ts.Expression | ts.Expression[] => {
  if (ts.isIfStatement(statement)) {
    return processIfStatement(statement);
  } else if (ts.isExpressionStatement(statement) || ts.isReturnStatement(statement)) {
    return statement.expression ? statement.expression : [];
  }
  return [];
};

const processBlock = (block: ts.Block): ts.Expression[] => {
  let expressions = [] as ts.Expression[];
  block?.statements.forEach((statement) => {
    expressions = mergeExpressions(expressions, processStatement(statement));
  });
  return expressions;
};

export default (node: ts.MethodDeclaration): ts.Expression[] => {
  if (node.body) {
    return processBlock(node.body);
  }
  return [];
};
