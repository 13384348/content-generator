# 运营内容生成工具

基于DEEPSEEK API的运营选题生成工具，支持8种不同类型的爆款选题生成。

## 功能特点

- **8种选题类型**：头牌选题、怀旧选题、对立选题、最差选题、荷尔蒙选题、猎奇选题、圈人群选题、成本选题
- **一键生成**：输入行业即可生成10条爆款选题
- **一键复制**：每条选题都支持一键复制到剪贴板
- **管理后台**：支持提示词自定义修改和生成历史查看

## 项目结构

```
content-generator/
├── backend/           # 后端API服务
│   ├── database/      # 数据库初始化
│   ├── services/      # DEEPSEEK API服务
│   └── server.js      # 主服务器文件
├── frontend/          # Vue 3前端
│   └── src/
│       ├── views/     # 页面组件
│       └── main.js    # 入口文件
└── package.json       # 项目配置
```

## 安装和运行

### 1. 安装依赖

```bash
npm run install-deps
```

### 2. 配置环境变量

复制 `backend/.env.example` 为 `backend/.env`，并填入你的DEEPSEEK API密钥：

```
DEEPSEEK_API_KEY=你的API密钥
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
PORT=3001
ADMIN_PASSWORD=admin123
```

### 3. 启动服务

```bash
npm run dev
```

服务将在以下地址启动：
- 前端：http://localhost:3000
- 后端：http://localhost:3001

## 使用说明

### 用户界面
1. 选择选题类型（8种类型之一）
2. 输入相关行业（如：汽车、医美、教育等）
3. 点击"一键生成选题"
4. 查看生成的10条选题，点击"复制"按钮复制单条选题

### 管理后台
访问 `/admin` 页面，使用密码 `admin123` 登录：
- 查看和编辑各类型的提示词
- 查看生成历史记录
- 查看使用统计

## API接口

### 生成选题
```
POST /api/generate
{
  "type": "headline",  // 选题类型
  "industry": "汽车"   // 行业
}
```

### 获取提示词
```
GET /api/prompts
GET /api/prompts/:type
```

### 管理员接口
```
PUT /api/admin/prompts/:type  // 更新提示词
GET /api/admin/history        // 获取历史记录
```

## 技术栈

- **前端**：Vue 3 + Element Plus + Vite
- **后端**：Node.js + Express
- **数据库**：SQLite
- **AI API**：DEEPSEEK

## 8种选题类型说明

1. **头牌选题**：围绕"最贵、最牛、明星"等元素
2. **怀旧选题**：围绕"20年前、古代、小时候"等元素
3. **对立选题**：围绕"穷vs富、南vs北、男vs女"等对比
4. **最差选题**：围绕"贬值最快、最难用、差评最多"等
5. **荷尔蒙选题**：围绕"相亲、异性、性吸引力"等元素
6. **猎奇选题**：围绕"脑回路有病、内幕操作"等元素
7. **圈人群选题**：围绕"星座、MBTI、特定人群"等
8. **成本选题**：围绕"省钱、偷懒、花小钱办大事"等