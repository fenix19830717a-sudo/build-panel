import type { CSSProperties } from 'react';

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

export interface ChatWidgetProps {
  apiUrl?: string;
  widgetTitle?: string;
  primaryColor?: string;
}
