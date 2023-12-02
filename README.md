# vite-plugin-style-px-to-vw

> A plugin for vite that transforms pixel units in style to viewport units.

English | [中文](README_CN.md) 

## Getting Started

### Installation

You can use `pnpm`, `yarn` or `npm` to install the plugin.

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

### Usage

You must use `vite-plugin-style-px-to-vw` before` @vitejs/plugin-vue` for the plugin to transform correctly.

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import stylePxToVw from 'vite-plugin-style-px-to-vw'

export default defineConfig({
  plugins: [stylePxToVw(), vue()],
})
```

You can pass configuration parameters to the plugin.

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

### Configuration

The plugin uses the same configuration as `postcss-px-to-viewport-8-plugin` and `postcss-px-to-viewport`.

The plugin will automatically read the config file refer to [postcss-load-config](https://github.com/postcss/postcss-load-config), such as `postcss.config.js`.

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

- Type: `string`
- Default: `px`

Units that need to be converted.

#### viewportWidth

- Type: `number | ((filePath: string) => number)`
- Default: `750`

Viewport width of design draft. Support passing in a function, with function parameters being the current file path being processed.

#### viewportHeight

- Type: `number`
- Optional

Viewport height of design draft.

#### unitPrecision

- Type: `number`
- Default: `5`

Precision retained after unit conversion.

#### viewportUnit

- Type: `string`
- Default: `vw`

Desired viewport units to use.

#### fontViewportUnit

- Type: `string`
- Default: `vw`

Viewport units used for fonts.

#### propList

- Type: `string[]`
- Default: `['*']`

List of attributes that can be converted. You can pass in specific CSS properties or the wildcard character "\*" to match all attributes, for example: `['*']`. Adding an "\*" before or after an attribute can match specific attributes (For example, `['position']` will match `background-position-y`). Adding "!" before a specific attribute will not convert the unit of that attribute, for example: `['*','!letter-spacing']`, `letter-spacing` will not be converted. "!" and "\*" can be used in combination, for example: `['*', '!font*']`, which will not convert properties such as `font-size` and `font-weight`.

#### minPixelValue

- Type: `number`
- Default: `1`

Set the minimum conversion value. If it is 1, only values greater than 1 will be converted.

#### exclude

- Type: `Regexp`
- Optional

Ignore files in certain folders or specific files.

#### include

- Type: `Regexp`
- Optional

If include is set, only the matching files will be converted.

## License

This project is licensed under the [MIT License](LICENSE).