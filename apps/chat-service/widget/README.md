# ChatService Widget

可嵌入的聊天组件 (React + Web Components)

## 使用方式

### 1. 作为 React 组件使用

```tsx
import { ChatWidget } from 'chat-service-widget';

function App() {
  return (
    <ChatWidget 
      apiUrl="http://localhost:3000"
      widgetTitle="在线客服"
      primaryColor="#1890ff"
    />
  );
}
```

### 2. 嵌入到任何网站

```html
<!-- 引入构建后的脚本 -->
<script src="chat-widget.js"></script>
<script>
  ChatWidget.init({
    apiUrl: 'http://localhost:3000',
    widgetTitle: '在线客服',
    primaryColor: '#1890ff'
  });
</script>
```

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```
