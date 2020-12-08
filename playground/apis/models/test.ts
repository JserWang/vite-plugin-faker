interface MBase {
  string: string;
  number: number;
  stringArray: string[];
  numberArray: number[];
}

interface MChild {
  leaf: MBase;
}

export interface MResult extends MBase {
  interface: MChild;
  interfaceArray: MChild[];
}
