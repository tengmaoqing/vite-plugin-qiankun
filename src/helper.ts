export type QiankunProps = {
  container?: HTMLElement;
  [x: string]: any;
};

export type QiankunLifeCycle = {
  bootstrap: () => void | Promise<void>;
  mount: (props: QiankunProps) => void | Promise<void>;
  unmount: (props: QiankunProps) => void | Promise<void>;
};

export const qiankunWindow: Window = window.proxy || window;

export const renderWithQiankun = (qiankunLifeCycle: QiankunLifeCycle) => {
  if (window.proxy?.__POWERED_BY_QIANKUN__) {
    window.proxy.vitemount((props: any) => qiankunLifeCycle.mount(props));
    window.proxy.viteunmount((props: any) => qiankunLifeCycle.unmount(props));
    window.proxy.vitebootstrap(() => qiankunLifeCycle.bootstrap());
  }
};

export default renderWithQiankun
