import cheerio, { CheerioAPI, Element } from 'cheerio'
import { PluginOption } from 'vite'
import type { ResolvedConfig } from 'vite'
import MagicString from 'magic-string'

export interface AssetsRule {
  match: RegExp
}

export const DefaultRules: AssetsRule[] = [
  {
    match: /(?:src=)(?:"|'|`)(.*).(png|jpe?g|svg|ico)(?:"|'|`)/ig
  }
]

const createQiankunHelper = (qiankunName: string) => `
  const createDeffer = (hookName) => {
    const d = new Promise((resolve, reject) => {
      window.proxy && (window.proxy[\`vite\${hookName}\`] = resolve)
    })
    return props => d.then(fn => fn(props));
  }
  const bootstrap = createDeffer('bootstrap');
  const mount = createDeffer('mount');
  const unmount = createDeffer('unmount');

  ;(global => {
    global.qiankunName = '${qiankunName}';
    global['${qiankunName}'] = {
      bootstrap,
      mount,
      unmount,
    };
  })(window);
`

// eslint-disable-next-line no-unused-vars
const replaceSomeScript = ($: CheerioAPI, findStr: string, replaceStr: string = '') => {
  $('script').each((i, el) => {
    if ($(el).html()?.includes(findStr)) {
      $(el).html(replaceStr)
    }
  })
}

const createImportFinallyResolve = (qiankunName: string) => {
  return `
    const qiankunLifeCycle = window.moudleQiankunAppLifeCycles && window.moudleQiankunAppLifeCycles['${qiankunName}'];
    if (qiankunLifeCycle) {
      window.proxy.vitemount((props) => qiankunLifeCycle.mount(props));
      window.proxy.viteunmount((props) => qiankunLifeCycle.unmount(props));
      window.proxy.vitebootstrap(() => qiankunLifeCycle.bootstrap());
    }
  `
}

export type MicroOption = {
  useDevMode: boolean
  rules?: AssetsRule[]
}
type PluginFn = (qiankunName: string, microOption: MicroOption) => PluginOption;

const htmlPlugin: PluginFn = (qiankunName, microOption) => {
  let isProduction: boolean

  const {
    rules = DefaultRules
  } = microOption

  let config: ResolvedConfig

  async function transform (code: string, id: string) {
    const s = new MagicString(code)

    let match

    for (const rule of rules) {
      rule.match.lastIndex = 0
      // eslint-disable-next-line no-cond-assign
      while ((match = rule.match.exec(code))) {
        const start = code.indexOf(match[1])
        const end = start + match[1].length
        const url = match[1]
        if (!url || !microOption.useDevMode) { continue }
        const appendBase = `http://127.0.0.1:${config.server.port}/`
        const emptyUrl = url.startsWith('/') ? url.substring(1) : url

        const newUrl = `${appendBase}${emptyUrl}`

        s.overwrite(start, end, newUrl)
      }
    }

    return {
      code: s.toString(),
      map: config.build.sourcemap ? s.generateMap({ hires: true }) : null
    }
  }

  const module2DynamicImport = ($: CheerioAPI, scriptTag: Element) => {
    if (!scriptTag) {
      return
    }
    const script$ = $(scriptTag)
    const moduleSrc = script$.attr('src')
    let appendBase = ''
    if (microOption.useDevMode && !isProduction) {
      appendBase = '(window.proxy ? (window.proxy.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ + \'..\') : \'\') + '
    }
    script$.removeAttr('src')
    script$.removeAttr('type')
    script$.html(`import(${appendBase}'${moduleSrc}')`)
    return script$
  }

  return {
    name: 'qiankun-html-transform',
    enforce: 'pre',
    configResolved (_config) {
      config = _config
      isProduction = _config.command === 'build' || _config.isProduction
    },

    configureServer (_server) {
      return () => {
        _server.middlewares.use((req, res, next) => {
          if (isProduction || !microOption.useDevMode) {
            next()
            return
          }
          const end = res.end.bind(res)
          res.end = (...args: any[]) => {
            let [htmlStr, ...rest] = args
            if (typeof htmlStr === 'string') {
              const $ = cheerio.load(htmlStr)
              module2DynamicImport($, $('script[src=/@vite/client]').get(0))
              htmlStr = $.html()
            }
            end(htmlStr, ...rest)
          }
          next()
        })
      }
    },
    async transform (code, id) {
      return await transform(code, id)
    },
    transformIndexHtml: {
      enforce: 'pre',
      async transform (html: string, ctx) {
        const _html = (await transform(html, ctx.filename))?.code
        const $ = cheerio.load(_html)
        const moduleTags = $('script[type=module]')
        if (!moduleTags || !moduleTags.length) {
          return
        }
        const len = moduleTags.length
        moduleTags.each((i, moduleTag) => {
          const script$ = module2DynamicImport($, moduleTag)
          if (len - 1 === i) {
            script$?.html(`${script$.html()}.finally(() => {
              ${createImportFinallyResolve(qiankunName)}
            })`)
          }
        })

        $('body').append(`<script>${createQiankunHelper(qiankunName)}</script>`)
        const output = $.html()
        return output
      }
    }
  }
}

export default htmlPlugin
