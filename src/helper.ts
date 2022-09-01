type QiankunAdditionalProps = Record<string, any>

export type QiankunProps<T = QiankunAdditionalProps> = {
  container?: HTMLElement;
} & T;

export type QiankunLifeCycle = {
  bootstrap: () => void | Promise<void>;
  mount: <T = QiankunAdditionalProps>(props: QiankunProps<T>) => void | Promise<void>;
  unmount: <T = QiankunAdditionalProps>(props: QiankunProps<T>) => void | Promise<void>;
  update: <T = QiankunAdditionalProps>(props: QiankunProps<T>) => void | Promise<void>;
};

export interface QiankunWindow {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __POWERED_BY_QIANKUN__?: boolean;
  [x: string]: any
}

export const qiankunWindow: QiankunWindow = typeof window !== 'undefined' ? (window.proxy || window) : {}

export const renderWithQiankun = (qiankunLifeCycle: QiankunLifeCycle) => {
  // 函数只有一次执行机会，需要把生命周期赋值给全局
  if (qiankunWindow?.__POWERED_BY_QIANKUN__) {
    if (!window.moudleQiankunAppLifeCycles) {
      window.moudleQiankunAppLifeCycles = {}
    }
    if (qiankunWindow.qiankunName) {
      window.moudleQiankunAppLifeCycles[qiankunWindow.qiankunName] = qiankunLifeCycle
    }
  }
}

export default renderWithQiankun
