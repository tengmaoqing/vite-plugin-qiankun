#### 简介

> vite-plugin-qiankun: 帮助应用快速接入乾坤的vite插件

- 保留vite构建es模块的优势
- 不影响已有的vite配置

#### 快速开始

###### 1、在 `vite.config.ts` 中安装插件
```typescript
// vite.config.ts

import qiankun from '@tencent/vite-plugin-qiankun';

export default {
  plugins: [qiankun('myMicroAppName')],
  // 生产环境需要指定域名作为base
  base: 'http://xxx.com'
}
```
###### 2、在入口文件里面写入乾坤的生命周期配置

```typescript
// main.ts
import { renderWithQiankun, qiankunWindow } from '@tencent/vite-plugin-qiankun/helper';

// some code
renderWithQiankun({
  mount(props) {
    console.log('mount');
    render(props);
  },
  bootstrap() {
    console.log('bootstrap');
  },
  unmount(props: any) {
    console.log('unmount');
    const { container } = props;
    const mountRoot = container?.querySelector('#root');
    ReactDOM.unmountComponentAtNode(
      mountRoot || document.querySelector('#root'),
    );
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}
```

###### 3、其它使用注意点 `qiankunWindow`

因为es模块加载与`qiankun`的实现方式有些冲突，所以使用本插件实现的`qiankun`微应用里面没有js沙盒。所以在需要设置window上的属性时，尽量显示的操作js沙盒，否则可能会对其它子应用产生副作用。qiankun沙盒使用方式
```typescript
import { qiankunWindow } from '@tencent/vite-plugin-qiankun/helper';

qiankunWindow.customxxx = 'ssss'

if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('我正在作为子应用运行')
}

```

#### 例子

```
npm run example:install
npm run example:start
```

#### todo 

- 支持vite开发环境

