interface MChild {
  name: string;
  age: number;
}

interface MParent {
  children: MChild[];
}
