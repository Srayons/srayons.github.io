// WebSocket客户端测试脚本
// 用于测试WebSocket服务器功能

const WebSocket = require('ws');

console.log('正在连接到WebSocket服务器...');
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function open() {
  console.log('已连接到服务器');
  
  // 发送一条测试消息
  const testMessage = JSON.stringify({
    username: 'TestClient',
    text: 'Hello from test client!',
    timestamp: new Date().toLocaleTimeString()
  });
  
  ws.send(testMessage);
});

ws.on('message', function message(data) {
  console.log('收到消息:', data.toString());
});

ws.on('close', function close() {
  console.log('连接已关闭');
});

ws.on('error', function error(err) {
  console.error('WebSocket错误:', err);
});
