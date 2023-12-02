import type { Plugin, ResolvedConfig } from 'vite'
import { merge } from 'lodash-es'
import { loadConfig } from './loadConfig.js'
import { createPropListMatcher } from './propList.js'
import { kebabCase } from 'change-case'
import colors from 'colors'

export interface StylePxToVwOptions {
  /**
   * 需要转换的单位，默认为"px"
   */
  unitToConvert: string
  /**
   * 设计稿的视口宽度
   * 支持传入函数，函数的参数为当前处理的文件路径
   */
  viewportWidth: number | ((filePath: string) => number)
  /**
   * 设计稿的视口高度
   */
  viewportHeight?: number
  /**
   * 单位转换后保留的精度
   */
  unitPrecision: number
  /**
   * 希望使用的视口单位
   */
  viewportUnit: string
  /**
   * 字体使用的视口单位
   */
  fontViewportUnit: string
  /**
   * 能转化为vw的属性列表
   * 传入特定的CSS属性
   * 可以传入通配符"*"去匹配所有属性，例如：['*']
   * 在属性的前或后添加"*",可以匹配特定的属性. (例如['position'] 会匹配 background-position-y)
   * 在特定属性前加 "!"，将不转换该属性的单位 . 例如: ['*', '!letter-spacing']，将不转换letter-spacing
   * "!" 和 ""可以组合使用， 例如: ['', '!font*']，将不转换font-size以及font-weight等属性
   */
  propList: string[]
  /**
   * 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
   */
  minPixelValue: number
  /**
   * 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
   * 如果值是一个正则表达式，那么匹配这个正则的文件会被忽略
   * 如果传入的值是一个数组，那么数组里的值必须为正则
   */
  exclude?: RegExp | RegExp[]
  /**
   * 如果设置了include，那将只有匹配到的文件才会被转换
   * 如果值是一个正则表达式，将包含匹配的文件，否则将排除该文件
   * 如果传入的值是一个数组，那么数组里的值必须为正则
   */
  include?: RegExp | RegExp[]
}

const DEFAULT_OPTIONS: StylePxToVwOptions = {
  unitToConvert: 'px',
  viewportWidth: 750,
  unitPrecision: 5,
  viewportUnit: 'vw',
  fontViewportUnit: 'vw',
  propList: ['*'],
  minPixelValue: 1,
}

const VUE_TEMPLATE_REG = /<template>([\s\S]+)<\/template>/gi

const PROP_WITH_PX_REG = /([a-zA-Z-]+):\s*\'{0,1}(\d+)\px(?:\s(\d+)px)*\'{0,1}/g

const POSTCSS_PX_TO_VW_PLUGINS = [
  'postcss-px-to-viewport',
  'postcss-px-to-viewport-8-plugin',
]

function toFixed(number: number, precision: number) {
  const multiplier = Math.pow(10, precision + 1)
  const wholeNumber = Math.floor(number * multiplier)
  return (Math.round(wholeNumber / 10) * 10) / multiplier
}

// eslint-disable-next-line max-params
function createPxReplacer(
  viewportSize: number,
  minPixelValue: number,
  unitPrecision: number,
  viewportUnit: any
) {
  return function ($0: any, $1: any) {
    if (!$1) return
    const pixels = parseFloat($1)
    if (pixels <= minPixelValue) return
    return toFixed((pixels / viewportSize) * 100, unitPrecision) + viewportUnit
  }
}

function validatePluginSequence(config: ResolvedConfig) {
  const stylePxToVwPluginIndex = config.plugins.findIndex(
    ({ name }) => name === 'vite-plugin-style-px-to-vw'
  )
  const vuePluginIndex = config.plugins.findIndex(
    ({ name }) => name === 'vite:vue'
  )

  if (vuePluginIndex > 0 && vuePluginIndex < stylePxToVwPluginIndex) {
    config.logger.warn(
      colors.yellow(
        colors.bold(
          '(!) The vite-plugin-style-px-to-vw must be used before @vitejs/plugin-vue'
        )
      )
    )
  }
}

export function stylePxToVw(customOptions?: StylePxToVwOptions): Plugin {
  return {
    name: 'vite-plugin-style-px-to-vw',
    configResolved: (config) => {
      validatePluginSequence(config)
    },
    transform: async (code, id) => {
      let options = merge({}, DEFAULT_OPTIONS)
      const postcssConfig = await loadConfig()

      POSTCSS_PX_TO_VW_PLUGINS.forEach((pluginName) => {
        if (postcssConfig.plugins[pluginName]) {
          options = merge(options, postcssConfig.plugins[pluginName])
        }
      })

      options = merge(options, customOptions)

      const isInclude = Array.isArray(options.include)
        ? options.include.some((i: RegExp) => i.test(id))
        : options.include
          ? options.include.test(id)
          : true

      const isExclude = Array.isArray(options.exclude)
        ? options.exclude.some((e: RegExp) => e.test(id))
        : options.exclude?.test(id)

      if (/.vue$/.test(id) && isInclude && !isExclude) {
        const vueTemplateCode = code.match(VUE_TEMPLATE_REG)?.[0]

        if (vueTemplateCode) {
          const viewportWidth =
            typeof options.viewportWidth === 'function'
              ? options.viewportWidth(id)
              : options.viewportWidth
          const replacer = createPxReplacer(
            viewportWidth,
            options.minPixelValue,
            options.unitPrecision,
            options.viewportUnit
          )
          const satisfyPropList = createPropListMatcher(options.propList)
          const newVueTemplateCode = vueTemplateCode.replace(
            PROP_WITH_PX_REG,
            ($0, $1) => {
              const normalized = kebabCase($1)

              if (!satisfyPropList(normalized)) {
                return $0
              }

              return $0.replace(/(\d+)px/g, replacer)
            }
          )
          const newCode = code.replace(vueTemplateCode, newVueTemplateCode)

          return {
            code: newCode,
          }
        }
      }
    },
  }
}

export default stylePxToVw
