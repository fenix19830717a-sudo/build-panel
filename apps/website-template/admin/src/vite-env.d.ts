/// <reference types="vite/client" />

declare module 'antd' {
  import * as Antd from 'antd/lib';
  export = Antd;
  export as namespace Antd;
}

declare module 'antd/locale/zh_CN' {
  const zhCN: any;
  export default zhCN;
}

declare module 'antd/es/color-picker' {
  export * from 'antd/lib/color-picker';
  export { default } from 'antd/lib/color-picker';
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.less' {
  const content: { [className: string]: string };
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
