import type { OptionsSync } from 'lilconfig'
import { lilconfig } from 'lilconfig'
import { pathToFileURL } from 'url'
import yaml from 'yaml'
import { resolve } from 'path'

function interopRequireDefault(obj: any) {
  return obj && obj.__esModule ? obj : { default: obj }
}

function createContext(ctx: Record<string, string> = {}) {
  const context = { cwd: process.cwd(), env: process.env.NODE_ENV, ...ctx }

  if (!context.env) {
    process.env.NODE_ENV = 'development'
  }

  return context
}

async function importDefault(filepath: string) {
  const module = await import(pathToFileURL(filepath).href)
  return module.default
}

async function typescriptLoader(filePath: string) {
  let registerer

  try {
    registerer = (await import('ts-node')).register({
      moduleTypes: { '**/*.cts': 'cjs' },
    })

    return importDefault(filePath)
  } catch (err: any) {
    if (err.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        `'ts-node' is required for the TypeScript configuration files. Make sure it is installed\nError: ${err.message}`
      )
    }

    throw err
  } finally {
    registerer?.enabled(false)
  }
}

function yamlLoader(filePath: string, content: string) {
  return yaml.parse(content)
}

const createOptions = (options: OptionsSync = {}) => {
  const moduleName = 'postcss'

  return {
    ...options,
    searchPlaces: [
      ...(options.searchPlaces ?? []),
      'package.json',
      `.${moduleName}rc`,
      `.${moduleName}rc.json`,
      `.${moduleName}rc.yaml`,
      `.${moduleName}rc.yml`,
      `.${moduleName}rc.ts`,
      `.${moduleName}rc.cts`,
      `.${moduleName}rc.js`,
      `.${moduleName}rc.cjs`,
      `.${moduleName}rc.mjs`,
      `${moduleName}.config.ts`,
      `${moduleName}.config.cts`,
      `${moduleName}.config.js`,
      `${moduleName}.config.cjs`,
      `${moduleName}.config.mjs`,
    ],
    loaders: {
      ...options.loaders,
      '.yaml': yamlLoader,
      '.yml': yamlLoader,
      '.js': importDefault,
      '.cjs': importDefault,
      '.mjs': importDefault,
      '.ts': typescriptLoader,
      '.cts': typescriptLoader,
    },
  }
}

export async function loadConfig(root?: string, options?: OptionsSync) {
  const ctx = createContext()
  const path = root ? resolve(root) : process.cwd()

  try {
    const result = await lilconfig('postcss', createOptions(options)).search(
      path
    )
    let config = interopRequireDefault(result?.config).default || {}

    if (typeof config === 'function') {
      config = config(ctx)
    } else {
      config = { ...config, ...ctx }
    }

    return config
  } catch (error) {
    throw new Error(`No PostCSS Config found in: ${path}`)
  }
}
