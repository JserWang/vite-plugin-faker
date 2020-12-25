// test for basic
interface MBasic {
  name: string;
  age: number;
  [propName: string]: any;
}

// test for extends
interface MShape {
  color: string;
}
interface MSquare extends MShape {
  sideLength: number;
}

// test for generic
interface MCustomResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// test for PropertySignature.type is typeReference
interface MChild {
  name: string;
  age: number;
}
interface MParent {
  child: MChild;
}

// test for PropertySignature.type is ArrayType
interface MArrayType {
  stringArr: string[];
  numberArr: number[];
  children: MChild[];
}

// test for PropertySignature.type is undefined
interface MEmpty {
  empty;
}

// test for PropertySignature.type is LiteralType
interface MLiteralType {
  name: 'JserWang';
  age: 18;
}

// test for Indexable Types
interface MStringArray {
  [index: number]: string;
}
interface MNumberArray {
  [index: number]: number;
}
interface MTypeArray {
  [index: string]: MBasic;
}
interface MGenericArray<T> {
  [index: number]: T;
}
