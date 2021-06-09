declare interface Window {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __POWERED_BY_QIANKUN__: boolean;
  purehtml: any;
  proxy: any;
}

declare interface PageParams {
  pageNo: number;
  pageSize: number;
}

declare interface Paginabale<T> extends PageParams {
  pageTotal: number;
  content: T[];
}
