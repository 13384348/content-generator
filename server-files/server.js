const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5004;

// 启用CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://8.154.36.16', 'http://mengtaiqi168.com'],
  credentials: true
}));

// 解析JSON
app.use(express.json());

// 静态文件服务 - 提供前端文件
app.use(express.static(path.join(__dirname, 'dist')));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 用户相关API（简化版）
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: '登录成功',
    user: { id: 1, username: 'test' }
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: '注册成功',
    user: { id: 1, username: 'test' }
  });
});

// 内容生成API（模拟）
app.post('/api/content/generate', (req, res) => {
  const { type, input } = req.body;

  // 模拟生成内容
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        type,
        input,
        output: `这是由AI生成的${type}内容，基于输入: ${input}`,
        timestamp: new Date().toISOString()
      }
    });
  }, 2000); // 模拟2秒生成时间
});

// 历史记录API
app.get('/api/history', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: '示例内容1',
        type: '内容生成',
        created_at: new Date().toISOString()
      }
    ]
  });
});

// 推荐奖励API
app.get('/api/referral/info', (req, res) => {
  res.json({
    success: true,
    data: {
      referralCode: 'ABC123',
      rewards: 0,
      referredCount: 0
    }
  });
});

// 分镜脚本类型API
app.get('/api/storyboards', (req, res) => {
  res.json([
    { type: 'short-video', name: '短视频脚本' },
    { type: 'commercial', name: '广告脚本' },
    { type: 'explanation', name: '解说视频脚本' },
    { type: 'interview', name: '访谈脚本' },
    { type: 'documentary', name: '纪录片脚本' },
    { type: 'tutorial', name: '教学视频脚本' }
  ]);
});

// 分镜脚本生成API
app.post('/api/generate-storyboard-stream', (req, res) => {
  const { type, content } = req.body;

  // 设置SSE响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // 模拟生成分镜脚本
  const generateStoryboard = () => {
    const storyboardContent = `| 镜头号 | 景别 | 机位运动 | 画面描述 | 台词/解说 | 时长 |
|--------|------|----------|----------|----------|------|
| 第1镜 | 特写 | 静止 | 产品特写，突出细节 | 这就是你一直在寻找的解决方案 | 3s |
| 第2镜 | 中景 | 推进 | 使用场景展示 | 简单易用，效果显著 | 4s |
| 第3镜 | 全景 | 摇摆 | 全貌展示 | 立即行动，改变从现在开始 | 3s |
| 第4镜 | 特写 | 静止 | 强调关键信息 | 不要再等待了 | 2s |`;

    const chunks = storyboardContent.split('');
    let index = 0;

    const sendChunk = () => {
      if (index < chunks.length) {
        const chunk = chunks.slice(index, index + 5).join('');
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
        index += 5;
        setTimeout(sendChunk, 100);
      } else {
        res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    };

    setTimeout(sendChunk, 500);
  };

  generateStoryboard();
});

// 内容生成相关API
app.get('/api/topics', (req, res) => {
  const { industry } = req.query;
  res.json([
    { value: 'trend-analysis', label: '行业趋势分析' },
    { value: 'case-study', label: '成功案例分享' },
    { value: 'tips-guide', label: '实用技巧指南' },
    { value: 'problem-solution', label: '痛点解决方案' },
    { value: 'market-insight', label: '市场洞察' }
  ]);
});

// 钩子选项API（用于内容生成步骤）
app.get('/api/hooks-options', (req, res) => {
  const { topicType } = req.query;
  res.json([
    { value: 'question', label: '疑问式钩子' },
    { value: 'story', label: '故事式钩子' },
    { value: 'data', label: '数据式钩子' },
    { value: 'controversy', label: '争议式钩子' },
    { value: 'benefit', label: '利益式钩子' }
  ]);
});

app.get('/api/content-types', (req, res) => {
  res.json([
    { value: 'social-media', label: '社交媒体文案' },
    { value: 'blog-post', label: '博客文章' },
    { value: 'product-description', label: '产品描述' },
    { value: 'marketing-copy', label: '营销文案' },
    { value: 'video-script', label: '视频脚本' }
  ]);
});

// 生成主题API
app.post('/api/generate-topics', (req, res) => {
  const { industry, topicType } = req.body;

  setTimeout(() => {
    res.json({
      success: true,
      data: [
        `${industry}行业的最新发展趋势`,
        `如何在${industry}领域脱颖而出`,
        `${industry}从业者必知的5个要点`,
        `${industry}市场分析与未来展望`,
        `${industry}成功案例深度解析`
      ]
    });
  }, 1500);
});

// 生成钩子API
app.post('/api/generate-hooks', (req, res) => {
  const { topic, hookType } = req.body;

  setTimeout(() => {
    res.json({
      success: true,
      data: [
        `你知道为什么${topic}这么重要吗？`,
        `关于${topic}，有一个秘密很少人知道`,
        `如果你还不了解${topic}，你就out了`,
        `${topic}的真相，可能和你想的不一样`,
        `3分钟了解${topic}的全部要点`
      ]
    });
  }, 1200);
});

// 生成内容API (改进版，支持流式响应)
app.post('/api/generate-content-stream', (req, res) => {
  const { contentType, topic, hook, industry } = req.body;

  // 设置SSE响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // 模拟生成内容
  const generateContent = () => {
    const content = `【${hook}】

在${industry}行业中，${topic}已经成为了一个不可忽视的重要话题。

💡 核心观点：
• 深入理解行业发展趋势
• 把握市场机遇与挑战
• 制定有效的应对策略
• 实现可持续发展目标

🔥 实践建议：
1. 持续关注行业动态
2. 积极学习新技能新知识
3. 建立专业人脉网络
4. 勇于创新和尝试

💪 行动起来：
如果你也想在${industry}领域获得成功，现在就开始行动吧！关注我，获取更多专业内容和实用建议。

#${industry} #${topic} #专业分享`;

    const chunks = content.split('');
    let index = 0;

    const sendChunk = () => {
      if (index < chunks.length) {
        const chunk = chunks.slice(index, index + 8).join('');
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
        index += 8;
        setTimeout(sendChunk, 80);
      } else {
        res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    };

    setTimeout(sendChunk, 500);
  };

  generateContent();
});

// 管理后台API - 提示词管理
app.get('/api/prompts', (req, res) => {
  res.json([
    {
      type: 'headline',
      name: '头牌选题',
      content: '请为{industry}行业生成具有头牌效应的选题，要求具有话题性和争议性，能够快速吸引目标用户注意力。'
    },
    {
      type: 'nostalgia',
      name: '怀旧选题',
      content: '请为{industry}行业生成怀旧类选题，要求能够唤起用户的情感共鸣和回忆。'
    },
    {
      type: 'opposite',
      name: '对立选题',
      content: '请为{industry}行业生成对立观点的选题，要求具有争议性和讨论价值。'
    },
    {
      type: 'worst',
      name: '最差选题',
      content: '请为{industry}行业生成"最差/最坏"类型的选题，通过负面角度引起关注。'
    },
    {
      type: 'hormone',
      name: '荷尔蒙选题',
      content: '请为{industry}行业生成具有情感刺激的选题，能够激发用户的情绪反应。'
    },
    {
      type: 'curious',
      name: '猎奇选题',
      content: '请为{industry}行业生成猎奇类选题，要求新颖有趣，能够满足用户的好奇心。'
    },
    {
      type: 'target',
      name: '圈人群选题',
      content: '请为{industry}行业生成精准圈定目标人群的选题，要求能够准确触达特定用户群体。'
    },
    {
      type: 'cost',
      name: '成本选题',
      content: '请为{industry}行业生成关于成本、价格、性价比的选题，要求实用性强。'
    }
  ]);
});

app.get('/api/hooks', (req, res) => {
  res.json([
    {
      type: 'target_audience',
      name: '圈定人群',
      content: '针对{topic}主题，生成圈定特定人群的钩子文案。'
    },
    {
      type: 'direct_question',
      name: '直接提问',
      content: '针对{topic}主题，生成直接提问式的钩子文案。'
    },
    {
      type: 'self_denial',
      name: '自我否定',
      content: '针对{topic}主题，生成自我否定式的钩子文案。'
    },
    {
      type: 'counter_cognition',
      name: '反认知',
      content: '针对{topic}主题，生成反认知的钩子文案。'
    },
    {
      type: 'high_value',
      name: '高价值展示',
      content: '针对{topic}主题，生成高价值展示的钩子文案。'
    }
  ]);
});

app.get('/api/contents', (req, res) => {
  res.json([
    {
      type: 'story',
      name: '讲故事类文案',
      content: '基于{topic}和{hook}，生成讲故事类的文案内容。'
    },
    {
      type: 'resonance',
      name: '共鸣型段子类文案',
      content: '基于{topic}和{hook}，生成能引起共鸣的段子类文案。'
    },
    {
      type: 'knowledge',
      name: '教知识类文案',
      content: '基于{topic}和{hook}，生成教授知识的文案内容。'
    },
    {
      type: 'process',
      name: '晒过程类文案',
      content: '基于{topic}和{hook}，生成展示过程的文案内容。'
    }
  ]);
});

app.get('/api/admin/history', (req, res) => {
  res.json([
    {
      id: 1,
      industry: '科技行业',
      prompt_type: 'headline',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      industry: '教育行业',
      prompt_type: 'nostalgia',
      created_at: new Date().toISOString()
    }
  ]);
});

app.get('/api/admin/hook-history', (req, res) => {
  res.json([
    {
      id: 1,
      topic: '人工智能如何改变我们的生活',
      hook_type: 'direct_question',
      created_at: new Date().toISOString()
    }
  ]);
});

app.get('/api/admin/content-history', (req, res) => {
  res.json([
    {
      id: 1,
      topic: '人工智能发展趋势',
      content_type: 'story',
      created_at: new Date().toISOString()
    }
  ]);
});

app.get('/api/admin/storyboard-history', (req, res) => {
  res.json([
    {
      id: 1,
      input_content: '短视频制作技巧分享',
      storyboard_type: 'short_video',
      created_at: new Date().toISOString()
    }
  ]);
});

app.get('/api/explosive-recreation/settings', (req, res) => {
  res.json({
    content: '请对以下原始文案进行二次创作：{originalContent}\n\n要求：\n1. 保持原文核心观点\n2. 根据{recreationType}调整表达方式\n3. 适配{targetPlatforms}平台特点\n4. 创意程度：{creativityLevel}'
  });
});

app.get('/api/admin/explosive-recreation/history', (req, res) => {
  res.json([
    {
      id: 1,
      original_content: '这是一篇关于产品推广的文案',
      recreation_type: 'style_change',
      created_at: new Date().toISOString()
    }
  ]);
});

// 保存提示词的PUT端点
app.put('/api/admin/prompts/:type', (req, res) => {
  const { type } = req.params;
  const { content } = req.body;

  // 这里应该保存到数据库，现在只是模拟
  res.json({
    success: true,
    message: `${type}类型的提示词已保存`
  });
});

app.put('/api/admin/hooks/:type', (req, res) => {
  const { type } = req.params;
  const { content } = req.body;

  res.json({
    success: true,
    message: `${type}类型的钩子提示词已保存`
  });
});

app.put('/api/admin/contents/:type', (req, res) => {
  const { type } = req.params;
  const { content } = req.body;

  res.json({
    success: true,
    message: `${type}类型的文案提示词已保存`
  });
});

app.put('/api/admin/storyboards/:type', (req, res) => {
  const { type } = req.params;
  const { content } = req.body;

  res.json({
    success: true,
    message: `${type}类型的分镜脚本提示词已保存`
  });
});

app.put('/api/admin/explosive-recreation', (req, res) => {
  const { prompt } = req.body;

  res.json({
    success: true,
    message: '爆款文案二创提示词已保存'
  });
});

// 爆款二创API
app.post('/api/explosive-recreation', (req, res) => {
  const { originalContent, recreationType, targetPlatforms, creativityLevel } = req.body;

  // 设置SSE响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // 模拟生成爆款二创内容
  const generateRecreation = () => {
    const recreationContent = `🔥 【重磅发现】你绝对想不到的真相！

原文案经过AI智能二创后：

📍 核心观点升级：
• 基于${recreationType || '智能改写'}策略
• 针对${targetPlatforms || '全平台'}优化
• 创意等级：${creativityLevel || '标准'}

🎯 二创亮点：
✨ 保持原文核心价值
✨ 增强传播感染力
✨ 优化用户体验
✨ 提升转化效果

💡 改写内容：
${originalContent}经过专业AI二创处理，现在更具吸引力和传播力！

📲 立即行动，抢占流量红利！
#爆款文案 #二创内容 #AI生成`;

    const chunks = recreationContent.split('');
    let index = 0;

    const sendChunk = () => {
      if (index < chunks.length) {
        const chunk = chunks.slice(index, index + 6).join('');
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
        index += 6;
        setTimeout(sendChunk, 90);
      } else {
        res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    };

    setTimeout(sendChunk, 500);
  };

  generateRecreation();
});

// 所有其他路由都返回前端应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
});