// test for basic
interface MBasic {
  name: string;
  age: number;
}

// test for extends
interface MShape {
  color: string;
}
interface MSquare extends MShape {
  sideLength: number;
}

// test for typeReference
interface MChild {
  name: string;
  age: number;
}
interface MParent {
  children: MChild[];
}

// test for generic
interface MCustomResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// test for PropertySignature.type is undefined
interface MEmpty {
  empty;
}

// test for MLiteralType
interface MLiteralType {
  name: 'JserWang';
}
