import cheerio from 'cheerio';
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

type PluginFn = (qiankunName: string) => PluginOption;

const htmlPlugin: PluginFn = (qiankunName: string) => {
  let isProduction: boolean;
  let devWBase: string;
  return {
    // enforce: 'post',
    name: 'qiankun-html-transform',
    configResolved(config) {
      isProduction = config.command === 'build' || config.isProduction;
      devWBase = `http://127.0.0.1:${config.server.port || 3000}${config.base}`;
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
        if (isProduction) {
          script$.removeAttr('src');
          script$.removeAttr('type');
          script$.html(`import('${moduleSrc}').finally(() => {
            ${createImportFinallyResolve(qiankunName)}
          })`);
          return;
        }
      });

      $('body').append(`<script>${createQiankunHelper(qiankunName)}</script>`);
      const output = $.html();
      return output;
    },
  };
};

export default htmlPlugin;
