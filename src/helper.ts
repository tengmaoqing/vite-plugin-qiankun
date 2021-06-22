export type QiankunProps = {
  container?: HTMLElement;
  [x: string]: any;
};

export type QiankunLifeCycle = {
  bootstrap: () => void | Promise<void>;
  mount: (props: QiankunProps) => void | Promise<void>;
  unmount: (props: QiankunProps) => void | Promise<void>;
};

export type QiankunWindow = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __POWERED_BY_QIANKUN__?: boolean;
  [x: string]: any
}

export const qiankunWindow: QiankunWindow = window.proxy || window;

export const renderWithQiankun = (qiankunLifeCycle: QiankunLifeCycle) => {
  if (qiankunWindow?.__POWERED_BY_QIANKUN__) {
    qiankunWindow.vitemount((props: any) => qiankunLifeCycle.mount(props));
    qiankunWindow.viteunmount((props: any) => qiankunLifeCycle.unmount(props));
    qiankunWindow.vitebootstrap(() => qiankunLifeCycle.bootstrap());
  }
};

export default renderWithQiankun
