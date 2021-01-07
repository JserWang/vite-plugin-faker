<h1 align="center">vite-plugin-faker</h1>

[English](./README.md) | 简体中文

## ✨ 特性

- 📦 开箱即用的离线 Mock 工具
- 😛 通过接口定义返回值 Interface 自动生成 Mock 数据
- 📄 支持生成 Mock 文件，用于二次编辑
- 🔥 支持热更新，仅更新变更部分

## 📦 安装

```bash
yarn add -D vite-plugin-faker
```

```bash
npm install vite-plugin-faker --save-dev
```

## 🔨 示例

在 `vite.config.ts` 中添加配置

```typescript
import { vitePluginFaker } from 'vite-plugin-faker';
import type { UserConfig } from 'vite';


export default {
  plugins: {
    vitePluginFaker({
      basePath: 'src/apis',
      includes: [/^.*Service/],
      watchFile: true,
      mockFile: true,
    });
  }
} as UserConfig;
```

注意：若需要使用插件生成 Mock 数据，请保持与 playground 中的[Request](https://github.com/vue-toys/vite-plugin-faker/blob/main/playground/utils/Request.ts)结构一致，或满足以下两点即可：

- GET 或 POST 接受一个泛型表示返回值，方法第一个参数为 url
- GET 或 POST 调用一个通用请求方法，该通用请求方法的第二个参数为通用后端返回体类型

## ⚙️ 配置项

- `basePath`：要解析的根目录，以项目目录为根目录

- `includes`：要解析的类名规则，可以设置一个正则表达式或者一个正则表达式数组

- `excludes` 与 `includes` 互斥，表示不要解析的类型规则，一般用不到

- `watchFile`：是否监听文件变更，当为 true 时，文件发生变化时会自动更新 mock 数据

- `mockFile`：是否生成 mock 文件，通常用于需要特殊返回值时设为 true

## 📛 Mock.json 额外字段

你可以在生成的 mock.json 来定制化你的请求

```json
{
  // 接口响应时间
  "timeout": 200,
  // 接口相应Http状态码
  "httpCode": 401
}
```

## 📁 工作流

![工作流](./workflow-zh_CN.png)
