import cheerio, { CheerioAPI } from 'cheerio';
import { PluginOption } from 'vite';

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
`;

const replaceSomeScript = ($: CheerioAPI, findStr: string, replaceStr: string = '') => {
  $('script').each((i, el) => {
    if ($(el).html()?.includes(findStr)) {
      $(el).html(replaceStr);
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

type PluginFn = (qiankunName: string, microOption: MicroOption) => PluginOption;

export type MicroOption = {
  useDevMode: boolean
}

const htmlPlugin: PluginFn = (qiankunName, microOption) => {
  let isProduction: boolean;
  return {
    name: 'qiankun-html-transform',
    configResolved(config) {
      isProduction = config.command === 'build' || config.isProduction;
    },

    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {

          if (isProduction || !microOption.useDevMode) {
            next();
            return;
          }
          const end = res.end.bind(res);
          res.end = (...args: any[]) => {
            let [htmlStr, ...rest] = args;
            if (typeof htmlStr === 'string') {
              const $ = cheerio.load(htmlStr);
              $('script[src=/@vite/client]').remove();
              htmlStr = $.html();
              console.log(htmlStr)
            }
            end(htmlStr, ...rest)
          }
          next()
        })
      }
    },
    transformIndexHtml(html: string) {
      const $ = cheerio.load(html);
      const moduleTags = $('script[type=module]');
      if (!moduleTags || !moduleTags.length) {
        return;
      }
      moduleTags.each((i, moduleTag) => {
        const script$ = $(moduleTag)
        const moduleSrc = script$.attr('src');
        let appendBase = ''
        if (microOption.useDevMode && !isProduction) {
          appendBase = `(window.proxy ? (window.proxy.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ + '..') : '') + `
        }
        script$.removeAttr('src');
        script$.removeAttr('type');
        script$.html(`import(${appendBase}'${moduleSrc}').finally(() => {
          ${createImportFinallyResolve(qiankunName)}
        })`);
        return;
      });

      $('body').append(`<script>${createQiankunHelper(qiankunName)}</script>`);
      const output = $.html();
      return output;
    },
  };
};

export default htmlPlugin;
