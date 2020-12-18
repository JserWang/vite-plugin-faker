import ts from 'typescript';

export class TsConfigResolver {
  private path: string;
  private compilerOptions: ts.CompilerOptions;

  constructor(path: string) {
    this.path = path;
    const config = this.getConfig();
    this.compilerOptions = this.getCompilerOptionsFromConfig(config);
  }

  getCompilerOptions() {
    return this.compilerOptions;
  }

  getConfig() {
    return ts.readConfigFile(this.path, ts.sys.readFile).config;
  }

  getCompilerOptionsFromConfig(config: { compilerOptions: any }) {
    return ts.convertCompilerOptionsFromJson(config.compilerOptions, './').options;
  }
}
