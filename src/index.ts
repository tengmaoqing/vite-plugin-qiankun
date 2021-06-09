import { JSDOM } from 'jsdom';
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
    global['${qiankunName}'] = {
      bootstrap,
      mount,
      unmount,
    };
  })(window);
`;

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
      const dom = new JSDOM(html);
      const docEl = dom.window.document;
      const moduleTags = docEl.querySelectorAll('[type=module]');
      if (!moduleTags || !moduleTags.length) {
        return;
      }
      moduleTags.forEach((moduleTag) => {
        const moduleSrc = (moduleTag as HTMLScriptElement).src;
        if (isProduction) {
          moduleTag.removeAttribute('src');
          moduleTag.innerHTML = `import('${moduleSrc}')`;
          return;
        }
      });

      const helperScript = docEl.createElement('script');
      helperScript.innerHTML = createQiankunHelper(qiankunName);
      docEl.body.appendChild(helperScript);
      const output = docEl.documentElement.outerHTML;
      return output;
    },
  };
};

export default htmlPlugin;
