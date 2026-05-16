const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 创建HTTP服务器来提供静态文件
const server = http.createServer((req, res) => {
  let filePath;
  
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'index.html');
  } else {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    }
  });
});

// 创建WebSocket服务器
const wss = new WebSocket.Server({ server });

// 存储连接的客户端
const clients = new Set();

wss.on('connection', (ws, req) => {
  console.log('新客户端连接:', req.socket.remoteAddress);
  
  // 将新客户端添加到集合中
  clients.add(ws);
  
  // 发送欢迎消息
  ws.send(JSON.stringify({
    username: '系统',
    text: '您已成功连接到聊天室！',
    timestamp: new Date().toLocaleTimeString()
  }));

  // 处理收到的消息
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      // 广播消息给所有其他客户端
      clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
      
      console.log('消息来自 ' + message.username + ': ' + message.text);
    } catch (error) {
      console.error('解析消息时出错:', error);
    }
  });

  // 处理连接关闭
  ws.on('close', () => {
    console.log('客户端断开连接');
    clients.delete(ws);
  });

  // 处理错误
  ws.on('error', (error) => {
    console.error('WebSocket错误:', error);
    clients.delete(ws);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log('WebSocket聊天室服务器运行在端口 ' + PORT);
  console.log('请在浏览器中访问 http://localhost:' + PORT);
});
