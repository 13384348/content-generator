# 🚀 服务器部署检查清单

## 📋 部署前检查 (Pre-Deployment)

### 1. 数据一致性验证
- [ ] **前后端数据类型匹配**
  ```bash
  # 检查钩子类型
  curl http://localhost:5003/api/hooks | jq '.[].type'
  # 对比前端 hookTypes 定义

  # 检查选题类型
  curl http://localhost:5003/api/prompts | jq '.[].type'
  # 对比前端 topicTypes 定义

  # 检查文案类型
  curl http://localhost:5003/api/contents | jq '.[].type'
  # 对比前端 contentTypes 定义
  ```

- [ ] **数据库初始化验证**
  ```bash
  # 检查必要数据表是否有数据
  sqlite3 backend/database/content_generator.db "SELECT COUNT(*) FROM prompts;"
  sqlite3 backend/database/content_generator.db "SELECT COUNT(*) FROM hook_prompts;"
  sqlite3 backend/database/content_generator.db "SELECT COUNT(*) FROM content_prompts;"
  ```

### 2. 本地生产环境测试
- [ ] **前端生产构建测试**
  ```bash
  cd frontend
  npm run build
  # 检查构建是否成功，无错误警告
  ```

- [ ] **后端生产模式测试**
  ```bash
  cd backend
  NODE_ENV=production PORT=5004 npm start
  # 验证生产环境配置是否正确
  ```

- [ ] **完整API功能测试**
  ```bash
  # 测试选题生成
  curl -X POST http://localhost:5004/api/generate-topics \
    -H "Content-Type: application/json" \
    -d '{"type":"headline","industry":"科技"}'

  # 测试钩子生成
  curl -X POST http://localhost:5004/api/generate-hooks \
    -H "Content-Type: application/json" \
    -d '{"type":"target_audience","topic":"如何学会编程"}'

  # 测试文案生成
  curl -X POST http://localhost:5004/api/generate-content-stream \
    -H "Content-Type: application/json" \
    -d '{"type":"story","topic":"学编程","hook":"程序员的第一行代码"}'
  ```

### 3. 代码质量检查
- [ ] **JSON序列化安全检查**
  - 确保所有 `JSON.stringify()` 处理大文本时的安全性
  - 检查特殊字符转义处理
  - 验证流式传输的JSON格式正确性

- [ ] **前端错误处理**
  - 检查所有API调用的错误处理
  - 确保loading状态正确管理
  - 验证用户友好的错误提示

## 🔄 部署流程 (Deployment)

### 1. 服务器环境准备
- [ ] **清理旧代码**
  ```bash
  ssh user@server "cd /opt && mv content-generator content-generator-backup-$(date +%Y%m%d_%H%M%S)"
  ```

- [ ] **克隆最新代码**
  ```bash
  ssh user@server "cd /opt && git clone https://github.com/username/content-generator.git"
  ```

### 2. 依赖安装与构建
- [ ] **后端依赖安装**
  ```bash
  ssh user@server "cd /opt/content-generator/backend && npm install"
  ```

- [ ] **前端依赖安装与构建**
  ```bash
  ssh user@server "cd /opt/content-generator/frontend && npm install && npm run build"
  ```

### 3. 环境配置
- [ ] **生产环境变量配置**
  ```bash
  # 检查 .env 文件是否正确配置
  ssh user@server "cd /opt/content-generator/backend && ls -la .env"
  ```

- [ ] **数据库初始化**
  ```bash
  # 确保数据库文件存在且有数据
  ssh user@server "cd /opt/content-generator/backend && node -e \"require('./database/init').initDatabase()\""
  ```

## ✅ 部署后验证 (Post-Deployment)

### 1. 服务健康检查
- [ ] **服务启动验证**
  ```bash
  ssh user@server "curl -f http://localhost:5004/api/health"
  ```

- [ ] **前端页面验证**
  ```bash
  curl -I http://server-ip:5004/
  # 应返回 200 状态码
  ```

### 2. 功能完整性测试
- [ ] **完整流程测试**
  1. 访问网站首页
  2. 生成选题
  3. 生成钩子
  4. 生成文案
  5. 生成分镜

- [ ] **API接口测试**
  ```bash
  # 在服务器上测试关键API
  ssh user@server "curl -s http://localhost:5004/api/prompts | jq length"
  ssh user@server "curl -s http://localhost:5004/api/hooks | jq length"
  ssh user@server "curl -s http://localhost:5004/api/contents | jq length"
  ```

### 3. 错误监控
- [ ] **日志检查**
  ```bash
  ssh user@server "tail -f /opt/content-generator/backend/app.log"
  ```

- [ ] **性能监控**
  ```bash
  ssh user@server "ps aux | grep node"
  ssh user@server "netstat -tulpn | grep :5004"
  ```

## 🚨 常见问题排查

### 钩子生成404错误
**检查步骤：**
1. 验证前端 hookTypes 与后端数据库 hook_prompts 表类型匹配
2. 检查API路径 `/api/generate-hooks` 是否正确
3. 确认钩子提示词数据是否存在

### 文案生成JSON格式错误
**检查步骤：**
1. 检查流式响应JSON对象大小
2. 验证特殊字符转义处理
3. 确认前端JSON解析逻辑正确

### 静态文件404错误
**检查步骤：**
1. 确认前端已正确构建到 `dist` 目录
2. 检查服务器静态文件中间件配置
3. 验证文件路径和权限

## 📝 部署成功标准

- [ ] 网站可正常访问
- [ ] 四步骤工作流完整可用
- [ ] 无控制台错误
- [ ] API响应正常
- [ ] 数据持久化正常

---

**维护者**: Claude Code Assistant
**更新时间**: 2025-09-27
**版本**: v1.0