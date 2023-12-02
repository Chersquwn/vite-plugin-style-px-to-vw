import { defineConfig } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import { dts } from 'rollup-plugin-dts'
import { builtinModules } from 'node:module'
import { readFileSync } from 'node:fs'

const { dependencies, peerDependencies } = JSON.parse(
  readFileSync('./package.json', 'utf8')
)

const external = [
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
  ...Object.keys(dependencies),
  ...Object.keys(peerDependencies),
]

export default defineConfig([
  {
    input: './src/index.ts',
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].cjs',
        format: 'cjs',
      },
      {
        dir: 'dist',
        entryFileNames: '[name].mjs',
        format: 'esm',
      },
    ],
    plugins: [nodeResolve({ preferBuiltins: true }), commonjs(), esbuild()],
    external,
  },
  {
    input: './src/index.ts',
    output: [
      {
        dir: 'dist',
        entryFileNames: 'index.d.ts',
        format: 'esm',
      },
    ],
    plugins: [dts()],
    external,
  },
])
