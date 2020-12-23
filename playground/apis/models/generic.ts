interface MCustomResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}
