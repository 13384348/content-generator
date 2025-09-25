# Multi-stage build for production
FROM node:18-alpine as frontend-builder

# 前端构建阶段
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# 生产阶段
FROM node:18-alpine as production

# 安装必要的系统包
RUN apk add --no-cache postgresql-client

# 创建应用目录
WORKDIR /app

# 复制后端代码
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 复制应用代码
COPY backend/ ./

# 从frontend-builder复制构建的前端文件
COPY --from=frontend-builder /app/frontend/dist ./public

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 创建必要的目录
RUN mkdir -p /app/logs /app/uploads && \
    chown -R nodejs:nodejs /app

# 切换到非root用户
USER nodejs

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http');http.get('http://localhost:'+process.env.PORT+'/api/health',r=>process.exit(r.statusCode===200?0:1))"

# 暴露端口
EXPOSE 5004

# 启动应用
CMD ["npm", "start"]