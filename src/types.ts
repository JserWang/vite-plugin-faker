export interface Options {
  /**
   * 基础解析路径
   */
  basePath: string;
  /**
   * 是否生成 mock 文件
   */
  mockFile?: boolean;
  /**
   * 是否监听文件变化
   */
  watchFile?: boolean;
  /**
   * 解析 class 名字的规则
   */
  includes?: RegExp | RegExp[];
  /**
   * 解析 class 名字的排除规则
   */
  excludes?: RegExp | RegExp[];
}
