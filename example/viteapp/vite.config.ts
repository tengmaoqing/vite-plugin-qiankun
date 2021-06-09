import { UserConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import qiankun from "../../dist";
import path from 'path'

// https://vitejs.dev/config/
const baseConfig:UserConfig = {
  plugins: [reactRefresh(), qiankun('viteapp')],
  server: {
    fsServe: {
      root: path.join(process.cwd(), '../../')
    }
  },
}


export default ({ mode }: any) => {
  baseConfig.base = 'http://127.0.0.1:7106/';
  if (mode === 'development') {
    baseConfig.base = '/';
  }
  return baseConfig;
};