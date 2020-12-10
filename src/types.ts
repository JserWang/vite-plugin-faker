export interface Options {
  /**
   * basic path
   */
  basePath: string;
  /**
   * whether to generate mock file
   */
  mockFile?: boolean;
  /**
   * judge request parameters
   */
  validParamter?: boolean;
  /**
   * monitor file changes
   */
  watchFile?: boolean;
  /**
   * rules for parsing class names
   */
  includes?: RegExp | RegExp[];
  /**
   * exclusion rules for parsing class names
   */
  excludes?: RegExp | RegExp[];
}

export interface MockData<T> {
  /**
   * http status code
   */
  httpCode?: number;
  /**
   * delay time
   */
  timeout?: number;
  /**
   * response body
   */
  response: T;
}
