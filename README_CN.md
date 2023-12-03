# vite-plugin-style-px-to-vw

> 一个用于将行内样式中的像素单位转换为视口单位的vite插件。

[![Build Status](https://github.com/Chersquwn/vite-plugin-style-px-to-vw/actions/workflows/release.yml/badge.svg)](https://github.com/Chersquwn/vite-plugin-style-px-to-vw/actions?query=workflow%3Arelease+branch%3Amain) [![NPM version](https://img.shields.io/npm/v/vite-plugin-style-px-to-vw.svg)](https://www.npmjs.com/package/vite-plugin-style-px-to-vw)

[English](README.md) | 中文

## 开始

### 安装

你可以使用 `pnpm`, `yarn` or `npm` 来安装该插件。

`pnpm`

```bash
pnpm add -D vite-plugin-style-px-to-vw
```

`yarn`

```bash
yarn add -D vite-plugin-style-px-to-vw
```

`npm`

```bash
npm install -D vite-plugin-style-px-to-vw
```

### 使用

你必须在`@vitejs/plugin-vue`之前使用`vite-plugin-style-px-to-vw`插件才能正确转换。

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import stylePxToVw from 'vite-plugin-style-px-to-vw'

export default defineConfig({
  plugins: [stylePxToVw(), vue()],
})
```

你也可以给插件传递配置参数来覆盖默认配置。

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import stylePxToVw from 'vite-plugin-style-px-to-vw'

export default defineConfig({
  plugins: [
    stylePxToVw({
      unitToConvert: 'px',
      viewportWidth: 750,
      unitPrecision: 5,
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      propList: ['*'],
      minPixelValue: 1,
    }), 
    vue()
  ],
})
```

### 配置

插件使用了跟 `postcss-px-to-viewport-8-plugin` 和 `postcss-px-to-viewport` 相同的配置，完全兼容。

插件会自动读取适用于 [postcss-load-config](https://github.com/postcss/postcss-load-config) 的配置文件，比如 `postcss.config.js`。

```ts
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-px-to-viewport-8-plugin': {
      unitToConvert: 'px',
      viewportWidth: 750,
      unitPrecision: 5,
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      propList: ['*'],
      minPixelValue: 1,
    },
  },
}
```

#### unitToConvert

- 类型: `string`
- 默认: `px`

需要转换的单位，默认为"px"。

#### viewportWidth

- 类型: `number | ((filePath: string) => number)`
- 默认: `750`

设计稿的视口宽度。持传入函数，函数的参数为当前处理的文件路径。

#### viewportHeight

- 类型: `number`
- 可选的

设计稿的视口高度。

#### unitPrecision

- 类型: `number`
- 默认: `5`

单位转换后保留的精度。

#### viewportUnit

- 类型: `string`
- 默认: `vw`

希望使用的视口单位。

#### fontViewportUnit

- 类型: `string`
- 默认: `vw`

字体使用的视口单位。

#### propList

- 类型: `string[]`
- 默认: `['*']`

能转化为vw的属性列表。可以传入特定的CSS属性，可以传入通配符"\*"去匹配所有属性，例如：`['*']`，在属性的前或后添加"\*",可以匹配特定的属性. (例如`['position']` 会匹配 `background-position-y`)。在特定属性前加 "!"，将不转换该属性的单位 . 例如: `['*', '!letter-spacing']`，将不转换`letter-spacing`。"!" 和 ""可以组合使用， 例如: `['', '!font*']`，将不转换`font-size`以及`font-weight`等属性。

#### minPixelValue

- 类型: `number`
- 默认: `1`

设置最小的转换数值，如果为1的话，只有大于1的值会被转换。

#### exclude

- 类型: `Regexp`
- 可选的

忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件。

#### include

- 类型: `Regexp`
- 可选的

如果设置了include，那将只有匹配到的文件才会被转换。