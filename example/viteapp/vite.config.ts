import { UserConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import qiankun from "../../dist";
import path from 'path'

// useDevMode 开启时与热更新插件冲突
const useDevMode = true

// https://vitejs.dev/config/
const baseConfig:UserConfig = {
  plugins: [
    ...(
      useDevMode ? [] : [
        reactRefresh()
      ]
    ),
    qiankun('viteapp', {
      useDevMode
    })
  ],
  server: {
    fsServe: {
      root: path.join(process.cwd(), '../../')
    },
    port: 7106,
    cors: true,
  },
}


export default ({ mode }: any) => {
  baseConfig.base = 'http://127.0.0.1:7106/';
  if (mode === 'development') {
    baseConfig.base = '/';
  }
  return baseConfig;
};