const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { initDatabase, dbPath } = require('./database/init');
const { initUserDatabase } = require('./database/user-init');
const { getDatabase } = require('./database/db');
const DeepSeekService = require('./services/deepseekService');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const historyRoutes = require('./routes/history');
const referralRoutes = require('./routes/referral');
const { authenticateToken } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5004;

// 中间件
app.use(cors({
  origin: ['http://localhost:3013', 'http://127.0.0.1:3013', 'http://localhost:3011', 'http://127.0.0.1:3011', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3015', 'http://127.0.0.1:3015', 'http://localhost:3009', 'http://127.0.0.1:3009', 'http://localhost:3006', 'http://127.0.0.1:3006'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(bodyParser.json({ charset: 'utf-8' }));
app.use(bodyParser.urlencoded({ extended: true, charset: 'utf-8' }));

// 访问记录中间件
app.use((req, res, next) => {
  // 只记录页面访问，不记录API调用和静态资源
  if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.includes('.')) {
    const db = getDatabase();

    // 获取用户信息（如果已登录）
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
        userId = decoded.id;
      } catch (error) {
        // 忽略JWT错误，继续记录访问
      }
    }

    // 生成简单的session ID
    const sessionId = req.ip + '_' + Date.now();

    db.run(
      `INSERT INTO access_logs (ip_address, user_agent, page_url, referrer, user_id, session_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent'),
        req.originalUrl,
        req.get('Referer'),
        userId,
        sessionId
      ],
      function(err) {
        if (err) {
          console.error('记录访问日志失败:', err);
        }
      }
    );
  }
  next();
});

// 初始化数据库
initDatabase();
initUserDatabase();

// 创建DeepSeek服务实例
const deepSeekService = new DeepSeekService();

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/referral', referralRoutes);

// 获取所有提示词类型
app.get('/api/prompts', (req, res) => {
  const db = getDatabase();

  db.all("SELECT * FROM prompts ORDER BY id", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 根据类型获取提示词
app.get('/api/prompts/:type', (req, res) => {
  const db = getDatabase();

  db.get("SELECT * FROM prompts WHERE type = ?", [req.params.type], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: '未找到该类型的提示词' });
      return;
    }
    res.json(row);
  });

});

// 生成选题
app.post('/api/generate', authenticateToken, async (req, res) => {
  const { type, industry } = req.body;

  if (!type || !industry) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  const db = getDatabase();

  // 获取对应类型的提示词
  db.get("SELECT content FROM prompts WHERE type = ?", [type], async (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
          return;
    }

    if (!row) {
      res.status(404).json({ error: '未找到该类型的提示词' });
          return;
    }

    try {
      // 调用DeepSeek API生成选题
      const result = await deepSeekService.generateTopics(row.content, industry);

      if (result.success) {
        // 保存生成历史到原有表
        db.run(
          "INSERT INTO generation_history (prompt_type, industry, generated_topics) VALUES (?, ?, ?)",
          [type, industry, JSON.stringify(result.topics)],
          function(err) {
            if (err) {
              console.error('保存历史记录失败:', err);
            }
          }
        );

        // 保存到用户使用记录表
        const { getUserDatabase } = require('./database/user-db');
        const userDb = getUserDatabase();
        const userId = req.user?.id || null;
        const guestId = req.user?.guest_id || null;

        if (userId || guestId) {
          userDb.run(
            `INSERT INTO usage_records (user_id, guest_id, feature_type, content_type, input_data, output_data, usage_type, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userId,
              guestId,
              'topic',
              type,
              JSON.stringify({ industry, type }),
              JSON.stringify({ topics: result.topics }),
              'free', // 默认为免费使用
              req.ip || req.connection.remoteAddress,
              req.get('User-Agent')
            ],
            function(userErr) {
              if (userErr) {
                console.error('保存用户使用记录失败:', userErr);
              }
            }
          );
        }

        res.json({
          success: true,
          topics: result.topics,
          industry: industry,
          type: type
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '生成选题时发生错误'
      });
    }

    });
});

// === 钩子生成相关接口 ===

// 获取所有钩子提示词类型
app.get('/api/hooks', (req, res) => {
  const db = getDatabase();

  db.all("SELECT * FROM hook_prompts ORDER BY id", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });

});

// 根据类型获取钩子提示词
app.get('/api/hooks/:type', (req, res) => {
  const db = getDatabase();

  db.get("SELECT * FROM hook_prompts WHERE type = ?", [req.params.type], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: '未找到该类型的钩子提示词' });
      return;
    }
    res.json(row);
  });

});

// 生成钩子文案
app.post('/api/generate-hooks', async (req, res) => {
  const { type, topic } = req.body;

  if (!type || !topic) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  const db = getDatabase();

  // 获取对应类型的钩子提示词
  db.get("SELECT content FROM hook_prompts WHERE type = ?", [type], async (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
          return;
    }

    if (!row) {
      res.status(404).json({ error: '未找到该类型的钩子提示词' });
          return;
    }

    try {
      // 调用DeepSeek API生成钩子
      const fullPrompt = `${row.content}\n\n现在请为"${topic}"这个选题生成10条钩子：`;
      const result = await deepSeekService.generateHooks(fullPrompt, topic);

      if (result.success) {
        // 保存生成历史
        db.run(
          "INSERT INTO hook_generation_history (hook_type, topic, generated_hooks) VALUES (?, ?, ?)",
          [type, topic, JSON.stringify(result.hooks)],
          function(err) {
            if (err) {
              console.error('保存钩子历史记录失败:', err);
            }
          }
        );

        res.json({
          success: true,
          hooks: result.hooks,
          topic: topic,
          type: type
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '生成钩子时发生错误'
      });
    }

    });
});

// 生成选题
app.post('/api/generate-topics', async (req, res) => {
  const { industry, count = 20 } = req.body;

  if (!industry) {
    return res.status(400).json({ error: '缺少必要参数：行业' });
  }

  try {
    // 构建选题生成提示词
    const prompt = `请为"${industry}"行业生成${count}个热门选题。要求：
1. 选题要有吸引力和话题性
2. 符合当前市场趋势
3. 能够引起目标用户的兴趣
4. 适合短视频内容创作
5. 每个选题控制在15字以内

请只返回选题列表，每行一个选题：`;

    const result = await deepSeekService.generateTopics(prompt, industry);

    if (result.success) {
      res.json({
        success: true,
        topics: result.topics,
        industry: industry,
        count: result.topics.length
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '生成选题时发生错误'
    });
  }
});

// 管理员接口 - 更新钩子提示词
app.put('/api/admin/hooks/:type', (req, res) => {
  const { content } = req.body;

  const db = getDatabase();

  db.run(
    "UPDATE hook_prompts SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE type = ?",
    [content, req.params.type],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, message: '钩子提示词更新成功' });
    }
  );

});

// 管理员接口 - 获取钩子生成历史
app.get('/api/admin/hook-history', (req, res) => {
  const db = getDatabase();

  db.all(
    "SELECT * FROM hook_generation_history ORDER BY created_at DESC LIMIT 100",
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );

});

// 管理员接口 - 更新提示词
app.put('/api/admin/prompts/:type', (req, res) => {
  console.log('DEBUG: 管理员更新提示词请求', req.params.type, req.body);
  const { content } = req.body;

  const db = getDatabase();

  db.run(
    "UPDATE prompts SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE type = ?",
    [content, req.params.type],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, message: '提示词更新成功' });
    }
  );

});

// 管理员接口 - 获取生成历史
app.get('/api/admin/history', (req, res) => {
  const db = getDatabase();

  db.all(
    "SELECT * FROM generation_history ORDER BY created_at DESC LIMIT 100",
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );

});

// === 分镜脚本生成相关接口 ===

// 获取所有分镜脚本提示词类型
app.get('/api/storyboards', (req, res) => {
  const db = getDatabase();

  db.all("SELECT * FROM storyboard_prompts ORDER BY id", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });

});

// 获取所有爆款二创提示词
app.get('/api/explosive-recreation', (req, res) => {
  const db = getDatabase();

  db.all("SELECT * FROM explosive_recreation_prompts ORDER BY id", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });

});

// 根据类型获取分镜脚本提示词
app.get('/api/storyboards/:type', (req, res) => {
  const db = getDatabase();

  db.get("SELECT * FROM storyboard_prompts WHERE type = ?", [req.params.type], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: '未找到该类型的分镜脚本提示词' });
      return;
    }
    res.json(row);
  });

});

// 生成分镜脚本
app.post('/api/generate-storyboard', async (req, res) => {
  const { type, content } = req.body;

  if (!type || !content) {
    return res.status(400).json({ error: '请提供脚本类型和文案内容' });
  }

  const db = getDatabase();

  // 获取对应类型的分镜脚本提示词
  db.get("SELECT content FROM storyboard_prompts WHERE type = ?", [type], async (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!row) {
      res.status(404).json({ error: '未找到该类型的分镜脚本提示词' });
      return;
    }

    try {
      // 构建完整的提示词
      const fullPrompt = `${row.content}

文案内容：${content}

请根据以上文案生成详细的分镜脚本：`;

      // 调用DeepSeek API生成分镜脚本（使用带重试机制的方法）
      const result = await deepSeekService.generateTopics(fullPrompt, '');

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: result.error
        });
        return;
      }

      // 将生成的内容合并为完整的分镜脚本
      const generatedStoryboard = result.raw_content || result.topics.join('\n\n');

      // 保存生成历史
      db.run(
        "INSERT INTO storyboard_generation_history (storyboard_type, input_content, generated_storyboard) VALUES (?, ?, ?)",
        [type, content, generatedStoryboard],
        function(err) {
          if (err) {
            console.error('保存分镜脚本历史记录失败:', err);
          }
        }
      );

      res.json({
        success: true,
        storyboard: generatedStoryboard,
        type: type
      });

    } catch (error) {
      console.error('分镜脚本生成失败:', error);
      res.status(500).json({
        success: false,
        error: '分镜脚本生成失败，请稍后重试'
      });
    }
  });
});

// 流式生成分镜脚本 - SSE接口
app.post('/api/generate-storyboard-stream', async (req, res) => {
  const { type, content } = req.body;

  if (!type || !content) {
    return res.status(400).json({ error: '请提供脚本类型和文案内容' });
  }

  // 确保内容是UTF-8格式
  const encodedContent = Buffer.from(content, 'utf8').toString('utf8');
  console.log('原始内容:', content);
  console.log('编码后内容:', encodedContent);

  try {
    const db = getDatabase();

    // 获取对应类型的分镜脚本提示词
    db.get("SELECT content FROM storyboard_prompts WHERE type = ?", [type], async (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (!row) {
        res.status(404).json({ error: '未找到该类型的分镜脚本提示词' });
        return;
      }

      try {
        // 设置SSE响应头
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control'
        });

        // 构建完整的提示词 - 明确要求表格格式输出
        const fullPrompt = `${row.content}

文案内容：${encodedContent}

**重要要求：请务必以Markdown表格格式输出分镜脚本，表格包含以下列：**
- 镜头号：第1镜、第2镜等
- 场景描述：环境和场景设定
- 镜头类型/运镜：特写、中景、远景、推拉摇移等
- 画面内容/动作：具体的画面描述和人物动作
- 台词/音效：对白内容和音效描述
- 时间（秒）：每个镜头的建议时长

示例格式：
| 镜头号 | 场景描述 | 镜头类型/运镜 | 画面内容/动作 | 台词/音效 | 时间（秒） |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 第1镜 | 室内，厨房 | 特写，缓慢推近 | 手正在磨咖啡豆 | 轻柔的晨间音乐 | 3 |

请根据以上文案生成详细的分镜脚本表格：`;

        console.log('发送给DeepSeek的完整提示词:');
        console.log('=' .repeat(50));
        console.log(fullPrompt);
        console.log('=' .repeat(50));

        let fullContent = '';

        // 使用专门的分镜脚本流式生成方法
        await deepSeekService.generateStoryboardStream(
          fullPrompt,
          // onChunk 回调
          (chunk, complete) => {
            fullContent = complete;
            res.write(`data: ${JSON.stringify({
              type: 'chunk',
              content: chunk
            })}\n\n`);
          },
          // onComplete 回调
          (complete) => {
            fullContent = complete;
            console.log('分镜脚本生成完成，内容长度:', fullContent.length);
            console.log('生成的完整内容:');
            console.log('~'.repeat(50));
            console.log(fullContent);
            console.log('~'.repeat(50));

            // 保存到数据库
            db.run(
              "INSERT INTO storyboard_generation_history (storyboard_type, input_content, generated_storyboard) VALUES (?, ?, ?)",
              [type, content, fullContent],
              function(err) {
                if (err) {
                  console.error('保存分镜脚本历史记录失败:', err);
                } else {
                  console.log('分镜脚本历史记录保存成功');
                }
              }
            );

            // 发送完成信号
            res.write(`data: ${JSON.stringify({
              type: 'complete',
              content: fullContent
            })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
          },
          // onError 回调
          (error) => {
            console.error('分镜脚本生成失败:', error);
            res.write(`data: ${JSON.stringify({
              type: 'error',
              error: '分镜脚本生成失败，请稍后重试。错误详情：' + error.message
            })}\n\n`);
            res.end();
          }
        );

      } catch (error) {
        console.error('分镜脚本生成失败:', error);
        res.write(`data: ${JSON.stringify({
          type: 'error',
          error: '分镜脚本生成失败，请稍后重试'
        })}\n\n`);
        res.end();
      }
    });

  } catch (error) {
    console.error('数据库错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 管理员接口 - 更新分镜脚本提示词
app.put('/api/admin/storyboards/:type', (req, res) => {
  console.log('DEBUG: 管理员更新分镜脚本提示词请求', req.params.type, req.body);
  const { content } = req.body;

  const db = getDatabase();

  db.run(
    "UPDATE storyboard_prompts SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE type = ?",
    [content, req.params.type],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, message: '分镜脚本提示词更新成功' });
    }
  );

});

// 管理员接口 - 获取分镜脚本生成历史
app.get('/api/admin/storyboard-history', (req, res) => {
  const db = getDatabase();

  db.all(
    "SELECT * FROM storyboard_generation_history ORDER BY created_at DESC LIMIT 100",
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );

});

// === 文案生成相关接口 ===

// 获取所有文案提示词类型
app.get('/api/contents', (req, res) => {
  const db = getDatabase();

  db.all("SELECT * FROM content_prompts ORDER BY id", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });

});

// 根据类型获取文案提示词
app.get('/api/contents/:type', (req, res) => {
  const db = getDatabase();

  db.get("SELECT * FROM content_prompts WHERE type = ?", [req.params.type], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: '未找到该类型的文案提示词' });
      return;
    }
    res.json(row);
  });

});

// 生成文案
app.post('/api/generate-content', async (req, res) => {
  const { type, topic, hook } = req.body;

  if (!type || !topic || !hook) {
    res.status(400).json({ error: '请提供文案类型、选题和钩子' });
    return;
  }

  try {
    const db = getDatabase();

    // 获取对应类型的提示词
    db.get("SELECT content FROM content_prompts WHERE type = ?", [type], async (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
              return;
      }
      if (!row) {
        res.status(404).json({ error: '未找到该类型的文案提示词' });
              return;
      }

      try {
        // 构建完整的提示词
        const fullPrompt = `${row.content}

选题：${topic}
钩子：${hook}

请基于以上选题和钩子生成文案：`;

        // 调用DeepSeek API生成文案
        const generatedContent = await deepSeekService.generateContent(fullPrompt);

        // 保存生成历史
        db.run(
          "INSERT INTO content_generation_history (content_type, topic, hook, generated_content) VALUES (?, ?, ?, ?)",
          [type, topic, hook, JSON.stringify(generatedContent)]
        );

        res.json({
          success: true,
          content: generatedContent
        });

      } catch (error) {
        console.error('文案生成失败:', error);
        res.status(500).json({ error: '文案生成失败，请稍后重试' });
      }

        });

  } catch (error) {
    console.error('数据库错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 流式生成文案
app.post('/api/generate-content-stream', async (req, res) => {
  const { type, topic, hook } = req.body;

  if (!type || !topic || !hook) {
    res.status(400).json({ error: '请提供文案类型、选题和钩子' });
    return;
  }

  try {
    const db = getDatabase();

    // 获取对应类型的提示词
    db.get("SELECT content FROM content_prompts WHERE type = ?", [type], async (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
              return;
      }
      if (!row) {
        res.status(404).json({ error: '未找到该类型的文案提示词' });
              return;
      }

      try {
        // 构建完整的提示词
        const fullPrompt = `${row.content}

选题：${topic}
钩子：${hook}

请基于以上选题和钩子生成文案：`;

        // 设置SSE头
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        });

        // 调用DeepSeek流式API
        await deepSeekService.generateContentStream(
          fullPrompt,
          // onChunk - 每次收到内容块时调用
          (chunk, fullContent) => {
            res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
          },
          // onComplete - 生成完成时调用
          (fullContent) => {
            // 保存生成历史
            db.run(
              "INSERT INTO content_generation_history (content_type, topic, hook, generated_content) VALUES (?, ?, ?, ?)",
              [type, topic, hook, JSON.stringify(fullContent)]
            );

            res.write(`data: ${JSON.stringify({ type: 'complete', content: fullContent })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
                    },
          // onError - 出错时调用
          (error) => {
            console.error('流式文案生成失败:', error);
            res.write(`data: ${JSON.stringify({ type: 'error', error: '文案生成失败，请稍后重试' })}\n\n`);
            res.end();
                    }
        );

      } catch (error) {
        console.error('文案生成失败:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', error: '文案生成失败，请稍后重试' })}\n\n`);
        res.end();
            }
    });

  } catch (error) {
    console.error('数据库错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 管理员接口 - 更新文案提示词
app.put('/api/admin/contents/:type', (req, res) => {
  console.log('DEBUG: 管理员更新文案提示词请求', req.params.type, req.body);
  const { content } = req.body;

  const db = getDatabase();

  db.run(
    "UPDATE content_prompts SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE type = ?",
    [content, req.params.type],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, message: '文案提示词更新成功' });
    }
  );

});

// 管理员接口 - 获取文案生成历史
app.get('/api/admin/content-history', (req, res) => {
  const db = getDatabase();

  db.all(
    "SELECT * FROM content_generation_history ORDER BY created_at DESC LIMIT 100",
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );

});

// 管理员接口 - 获取爆款文案二创设置
app.get('/api/admin/explosive-recreation', (req, res) => {
  const db = getDatabase();

  db.get(
    "SELECT * FROM explosive_recreation_prompts LIMIT 1",
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // 如果没有找到记录，创建默认提示词
      if (!row) {
        const defaultPrompt = "请基于以下原始文案进行二次创作，要求：\n1. 保持核心观点不变\n2. 改变表达方式和语言风格\n3. 增加创新元素\n4. 确保内容原创性\n\n原始文案：{originalContent}\n\n请生成一篇具有创新性的二创文案：";

        db.run(
          "INSERT INTO explosive_recreation_prompts (prompt) VALUES (?)",
          [defaultPrompt],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            res.json({
              id: this.lastID,
              prompt: defaultPrompt,
              updated_at: new Date().toISOString()
            });
          }
        );
      } else {
        res.json(row);
      }
    }
  );
});

// 管理员接口 - 更新爆款文案二创设置
app.put('/api/admin/explosive-recreation', (req, res) => {
  const { prompt } = req.body;
  const db = getDatabase();

  if (!prompt) {
    res.status(400).json({ error: '提示词不能为空' });
    return;
  }

  // 先检查是否存在记录
  db.get(
    "SELECT id FROM explosive_recreation_prompts LIMIT 1",
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (row) {
        // 更新现有记录
        db.run(
          "UPDATE explosive_recreation_prompts SET prompt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [prompt, row.id],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ success: true, message: '设置更新成功' });
          }
        );
      } else {
        // 插入新记录
        db.run(
          "INSERT INTO explosive_recreation_prompts (prompt) VALUES (?)",
          [prompt],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ success: true, message: '设置保存成功' });
          }
        );
      }
    }
  );
});

// 管理员接口 - 获取爆款文案二创历史
app.get('/api/admin/explosive-recreation/history', (req, res) => {
  const db = getDatabase();

  db.all(
    "SELECT * FROM explosive_recreation_history ORDER BY created_at DESC LIMIT 100",
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// 爆款文案二创API
app.post('/api/explosive-recreation', async (req, res) => {
  try {
    const { originalContent, recreationType, targetPlatforms, creativityLevel } = req.body;

    if (!originalContent) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数：原始文案'
      });
    }

    const db = getDatabase();

    // 获取二创提示词（从爆款文案二创专用表中获取）
    db.get("SELECT * FROM explosive_recreation_prompts LIMIT 1", async (err, promptRow) => {
      let basePrompt = '';

      if (err || !promptRow) {
        // 使用默认提示词
        basePrompt = `你是一个专业的内容创作专家，擅长进行文案二次创作。请根据提供的原始文案，按照指定的要求进行改写，保持核心思想不变，但要有创新和改进。

要求：
1. 保持原文案的核心价值和主要信息点
2. 根据二创类型调整表达方式
3. 确保内容符合目标平台特色
4. 语言要生动有趣，具有吸引力
5. 字数控制在合理范围内

原始文案：
{originalContent}

二创类型：{recreationType}
目标平台：{targetPlatforms}
创意程度：{creativityLevel}/5

请开始二创：`;
      } else {
        basePrompt = promptRow.prompt;
      }

      // 构建最终提示词
      let finalPrompt = basePrompt;

      // 如果提示词包含变量占位符，则替换
      if (basePrompt.includes('{originalContent}')) {
        finalPrompt = finalPrompt.replace('{originalContent}', originalContent);
      }
      if (basePrompt.includes('{recreationType}')) {
        finalPrompt = finalPrompt.replace('{recreationType}', getRecreationTypeDescription(recreationType));
      }
      if (basePrompt.includes('{targetPlatforms}')) {
        const platformsString = targetPlatforms && Array.isArray(targetPlatforms) && targetPlatforms.length > 0
          ? targetPlatforms.join(', ')
          : '未指定';
        finalPrompt = finalPrompt.replace('{targetPlatforms}', platformsString);
      }
      if (basePrompt.includes('{creativityLevel}')) {
        finalPrompt = finalPrompt.replace('{creativityLevel}', creativityLevel);
      }

      // 如果没有使用变量占位符，直接在提示词后追加原始文案
      if (!basePrompt.includes('{originalContent}')) {
        finalPrompt += '\n\n原始文案：\n' + originalContent;
      }

      const prompt = finalPrompt;

      try {
        // 设置流式响应头
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');

        let fullContent = '';

        // 调用DeepSeek API流式生成二创内容
        await deepSeekService.generateContentStream(
          prompt,
          // onChunk: 每收到一块内容时的回调
          (chunk, accumulated) => {
            fullContent = accumulated;
            // 发送流式数据到前端
            res.write(`data: ${JSON.stringify({
              type: 'chunk',
              content: chunk,
              accumulated: accumulated
            })}\n\n`);
          },
          // onComplete: 生成完成时的回调
          (finalResult) => {
            fullContent = finalResult;

            // 保存到历史记录
            const recreatedContent = finalResult.trim();
            db.run(
              "INSERT INTO explosive_recreation_history (original_content, recreated_content, recreation_type, target_platforms, creativity_level) VALUES (?, ?, ?, ?, ?)",
              [originalContent, recreatedContent, recreationType, JSON.stringify(targetPlatforms), creativityLevel],
              function(err) {
                if (err) {
                  console.error('保存爆款文案二创历史记录失败:', err);
                }
              }
            );

            // 发送完成信号
            res.write(`data: ${JSON.stringify({
              type: 'complete',
              content: finalResult
            })}\n\n`);
            res.end();
          },
          // onError: 出错时的回调
          (error) => {
            console.error('DeepSeek流式API调用失败:', error);
            res.write(`data: ${JSON.stringify({
              type: 'error',
              error: 'AI服务暂时不可用，请稍后重试'
            })}\n\n`);
            res.end();
          }
        );

      } catch (apiError) {
        console.error('DeepSeek API调用失败:', apiError);
        res.write(`data: ${JSON.stringify({
          type: 'error',
          error: 'AI服务暂时不可用，请稍后重试'
        })}\n\n`);
        res.end();
      }
    });

  } catch (error) {
    console.error('爆款文案二创失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
});

// 获取二创类型描述的辅助函数
function getRecreationTypeDescription(type) {
  const descriptions = {
    'style_change': '风格转换 - 保持内容核心，改变表达风格',
    'angle_shift': '角度转换 - 从不同角度重新阐述同一主题',
    'platform_adapt': '平台适配 - 针对不同平台特点进行改写',
    'tone_adjust': '语调调整 - 调整语言风格和情感色彩',
    'structure_reorg': '结构重组 - 重新组织内容结构和逻辑'
  };
  return descriptions[type] || type;
}

// 获取二创相关的提示词设置API
app.get('/api/explosive-recreation/settings', (req, res) => {
  const db = getDatabase();

  db.get("SELECT * FROM prompts WHERE type = 'explosive_recreation'", (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // 如果没有找到，返回默认设置
    if (!row) {
      res.json({
        type: 'explosive_recreation',
        name: '爆款文案二创',
        content: `你是一个专业的内容创作专家，擅长进行文案二次创作。请根据提供的原始文案，按照指定的要求进行改写，保持核心思想不变，但要有创新和改进。

要求：
1. 保持原文案的核心价值和主要信息点
2. 根据二创类型调整表达方式
3. 确保内容符合目标平台特色
4. 语言要生动有趣，具有吸引力
5. 字数控制在合理范围内

原始文案：
{originalContent}

二创类型：{recreationType}
目标平台：{targetPlatforms}
创意程度：{creativityLevel}/5

请开始二创：`,
        description: '用于爆款文案二次创作的提示词模板'
      });
    } else {
      res.json(row);
    }
  });
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    status: 'healthy'
  };

  try {
    // 检查数据库连接
    const db = getDatabase();
    db.get("SELECT 1", (err) => {
      if (err) {
        healthCheck.status = 'unhealthy';
        healthCheck.database = 'disconnected';
        return res.status(503).json(healthCheck);
      }

      healthCheck.database = 'connected';
      res.status(200).json(healthCheck);
    });
  } catch (error) {
    healthCheck.status = 'unhealthy';
    healthCheck.database = 'error';
    healthCheck.error = error.message;
    res.status(503).json(healthCheck);
  }
});

// 详细状态端点
app.get('/api/status', (req, res) => {
  const status = {
    service: 'ContentGenerator',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: Date.now(),
    database: 'unknown',
    ai_service: 'unknown'
  };

  try {
    // 检查数据库
    const db = getDatabase();
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
      status.database = err ? 'error' : 'connected';
      status.users_count = row ? row.count : 0;

      // 检查AI服务配置
      status.ai_service = process.env.DEEPSEEK_API_KEY ? 'configured' : 'not_configured';

      res.json(status);
    });
  } catch (error) {
    status.database = 'error';
    status.error = error.message;
    res.json(status);
  }
});

// 流式选题生成API
app.post('/api/generate-stream', async (req, res) => {
  const { type, industry } = req.body;

  if (!type || !industry) {
    return res.status(400).json({ error: '请提供选题类型和行业' });
  }

  try {
    const db = getDatabase();

    db.get("SELECT content FROM prompts WHERE type = ?", [type], async (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (!row) {
        res.status(404).json({ error: '未找到该类型的提示词' });
        return;
      }

      // 设置SSE响应头
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      const fullPrompt = `${row.content}\n\n行业：${industry}`;

      try {
        const { spawn } = require('child_process');
        const worker = spawn('node', ['worker-stream-api.js', fullPrompt], {
          cwd: __dirname,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let fullContent = '';

        worker.stdout.on('data', (data) => {
          const output = data.toString().trim();
          if (output) {
            try {
              const parsed = JSON.parse(output);
              if (parsed.success) {
                if (!parsed.complete) {
                  fullContent += parsed.content;
                  res.write(`data: ${JSON.stringify({
                    type: 'chunk',
                    content: parsed.content
                  })}\n\n`);
                } else {
                  fullContent = parsed.content;
                  res.write(`data: ${JSON.stringify({
                    type: 'complete',
                    content: fullContent
                  })}\n\n`);
                  res.write('data: [DONE]\n\n');
                  res.end();
                }
              } else {
                res.write(`data: ${JSON.stringify({
                  type: 'error',
                  error: parsed.error
                })}\n\n`);
                res.write('data: [DONE]\n\n');
                res.end();
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        });

        worker.on('close', (code) => {
          if (code !== 0) {
            res.write(`data: ${JSON.stringify({
              type: 'error',
              error: '生成失败'
            })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
          }
        });

      } catch (error) {
        res.write(`data: ${JSON.stringify({
          type: 'error',
          error: error.message
        })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 流式钩子生成API
app.post('/api/generate-hooks-stream', async (req, res) => {
  const { type, topic } = req.body;

  if (!type || !topic) {
    return res.status(400).json({ error: '请提供钩子类型和选题' });
  }

  try {
    const db = getDatabase();

    db.get("SELECT content FROM hook_prompts WHERE type = ?", [type], async (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (!row) {
        res.status(404).json({ error: '未找到该类型的钩子提示词' });
        return;
      }

      // 设置SSE响应头
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      const fullPrompt = `${row.content}\n\n选题：${topic}`;

      try {
        const { spawn } = require('child_process');
        const worker = spawn('node', ['worker-stream-api.js', fullPrompt], {
          cwd: __dirname,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let fullContent = '';

        worker.stdout.on('data', (data) => {
          const output = data.toString().trim();
          if (output) {
            try {
              const parsed = JSON.parse(output);
              if (parsed.success) {
                if (!parsed.complete) {
                  fullContent += parsed.content;
                  res.write(`data: ${JSON.stringify({
                    type: 'chunk',
                    content: parsed.content
                  })}\n\n`);
                } else {
                  fullContent = parsed.content;
                  res.write(`data: ${JSON.stringify({
                    type: 'complete',
                    content: fullContent
                  })}\n\n`);
                  res.write('data: [DONE]\n\n');
                  res.end();
                }
              } else {
                res.write(`data: ${JSON.stringify({
                  type: 'error',
                  error: parsed.error
                })}\n\n`);
                res.write('data: [DONE]\n\n');
                res.end();
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        });

        worker.on('close', (code) => {
          if (code !== 0) {
            res.write(`data: ${JSON.stringify({
              type: 'error',
              error: '生成失败'
            })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
          }
        });

      } catch (error) {
        res.write(`data: ${JSON.stringify({
          type: 'error',
          error: error.message
        })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 管理员登录API
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: '用户名和密码不能为空'
    });
  }

  const db = getDatabase();

  try {
    // 查找管理员账户
    const admin = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM admins WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: '管理员账户不存在'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '密码错误'
      });
    }

    // 生成简单的session token（在生产环境中应该使用JWT）
    const jwt = require('jsonwebtoken');
    const adminToken = jwt.sign(
      {
        adminId: admin.id,
        username: admin.username,
        isAdmin: true
      },
      process.env.JWT_SECRET || 'admin-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        adminId: admin.id,
        username: admin.username,
        email: admin.email,
        token: adminToken,
        isAdmin: true
      }
    });

  } catch (error) {
    console.error('管理员登录失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
});

// 验证管理员权限的中间件
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: '缺少认证令牌'
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

    // 检查邮箱是否为管理员邮箱
    const adminEmails = ['ok47584@126.com', '2918707003@qq.com'];
    if (!adminEmails.includes(decoded.email)) {
      return res.status(403).json({
        success: false,
        error: '权限不足，需要管理员权限'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: '无效的认证令牌'
    });
  }
};

// 管理员用户管理API接口
// 获取用户列表
app.get('/api/admin/users', verifyAdminToken, (req, res) => {
  const db = getDatabase();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  // 获取用户总数
  db.get("SELECT COUNT(*) as total FROM users", (err, countResult) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: '获取用户总数失败'
      });
    }

    // 获取用户列表
    db.all(
      `SELECT id, email, created_at, referral_code,
              free_usage_count, monthly_usage_limit as free_usage_limit, paid_usage_count
       FROM users
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
      (err, users) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: '获取用户列表失败'
          });
        }

        res.json({
          success: true,
          data: {
            users: users,
            total: countResult.total
          }
        });
      }
    );
  });
});

// 获取用户统计信息
app.get('/api/admin/user-statistics', verifyAdminToken, (req, res) => {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];

  Promise.all([
    // 总用户数
    new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as total FROM users", (err, result) => {
        if (err) reject(err);
        else resolve(result.total);
      });
    }),
    // 今日新注册用户
    new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as total FROM users WHERE DATE(created_at) = ?", [today], (err, result) => {
        if (err) reject(err);
        else resolve(result.total);
      });
    }),
    // 总生成记录数（代替活跃用户数）
    new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as total
        FROM generation_history
        WHERE DATE(created_at) >= DATE('now', '-7 days')
      `, (err, result) => {
        if (err) reject(err);
        else resolve(result.total);
      });
    })
  ]).then(([totalUsers, todayNewUsers, recentGenerations]) => {
    res.json({
      success: true,
      data: {
        totalUsers,
        todayNewUsers,
        activeUsers: recentGenerations  // 使用最近7天的生成记录数代替活跃用户数
      }
    });
  }).catch(error => {
    res.status(500).json({
      success: false,
      error: '获取用户统计失败'
    });
  });
});

// 更新用户使用限制
app.put('/api/admin/users/:userId/limits', verifyAdminToken, (req, res) => {
  const db = getDatabase();
  const userId = req.params.userId;
  const { freeUsageLimit, freeUsageCount, paidUsageCount } = req.body;

  db.run(
    `UPDATE users
     SET monthly_usage_limit = ?, free_usage_count = ?, paid_usage_count = ?
     WHERE id = ?`,
    [freeUsageLimit, freeUsageCount, paidUsageCount, userId],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: '更新用户使用限制失败'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      res.json({
        success: true,
        message: '用户使用限制更新成功'
      });
    }
  );
});

// 获取用户使用历史
app.get('/api/admin/users/:userId/history', verifyAdminToken, (req, res) => {
  const db = getDatabase();
  const userId = req.params.userId;

  // 先尝试从generation_history表获取历史，然后从usage_records表获取
  db.all(
    `SELECT
       prompt_type as feature_type,
       created_at,
       "generation" as source,
       "success" as status
     FROM generation_history
     WHERE user_id = ?
     UNION ALL
     SELECT
       feature_type,
       created_at,
       "usage" as source,
       "success" as status
     FROM usage_records
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId, userId],
    (err, history) => {
      if (err) {
        console.error('获取用户历史失败:', err);
        return res.status(500).json({
          success: false,
          error: '获取用户历史失败: ' + err.message
        });
      }

      // 如果没有历史记录，返回空数组而不是错误
      res.json({
        success: true,
        data: history || []
      });
    }
  );
});

// 获取访问统计
app.get('/api/admin/access-statistics', verifyAdminToken, (req, res) => {
  const db = getDatabase();

  // 并行执行多个统计查询
  const queries = [
    // 今日访问量
    new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM access_logs WHERE DATE(created_at) = DATE('now')`,
        (err, result) => {
          if (err) reject(err);
          else resolve({ type: 'today', count: result.count });
        }
      );
    }),

    // 本周访问量
    new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM access_logs WHERE DATE(created_at) >= DATE('now', '-7 days')`,
        (err, result) => {
          if (err) reject(err);
          else resolve({ type: 'week', count: result.count });
        }
      );
    }),

    // 本月访问量
    new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM access_logs WHERE DATE(created_at) >= DATE('now', 'start of month')`,
        (err, result) => {
          if (err) reject(err);
          else resolve({ type: 'month', count: result.count });
        }
      );
    }),

    // 总访问量
    new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM access_logs`,
        (err, result) => {
          if (err) reject(err);
          else resolve({ type: 'total', count: result.count });
        }
      );
    }),

    // 今日独立访客
    new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(DISTINCT ip_address) as count FROM access_logs WHERE DATE(created_at) = DATE('now')`,
        (err, result) => {
          if (err) reject(err);
          else resolve({ type: 'unique_today', count: result.count });
        }
      );
    }),

    // 本周独立访客
    new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(DISTINCT ip_address) as count FROM access_logs WHERE DATE(created_at) >= DATE('now', '-7 days')`,
        (err, result) => {
          if (err) reject(err);
          else resolve({ type: 'unique_week', count: result.count });
        }
      );
    }),

    // 最近7天每日访问量趋势
    new Promise((resolve, reject) => {
      db.all(
        `SELECT DATE(created_at) as date, COUNT(*) as count
         FROM access_logs
         WHERE DATE(created_at) >= DATE('now', '-7 days')
         GROUP BY DATE(created_at)
         ORDER BY date`,
        (err, result) => {
          if (err) reject(err);
          else resolve({ type: 'daily_trend', data: result });
        }
      );
    }),

    // 热门页面访问
    new Promise((resolve, reject) => {
      db.all(
        `SELECT page_url, COUNT(*) as count
         FROM access_logs
         WHERE page_url != '/'
         GROUP BY page_url
         ORDER BY count DESC
         LIMIT 10`,
        (err, result) => {
          if (err) reject(err);
          else {
            // 页面名称映射
            const pageNameMap = {
              '/': '首页',
              '/admin': '管理后台',
              '/admin/dashboard': '管理面板',
              '/admin/users': '用户管理',
              '/admin/statistics': '统计报表',
              '/content-generator': '内容生成',
              '/content-generator/hooks': '钩子生成',
              '/content-generator/scripts': '脚本生成',
              '/user-center': '用户中心',
              '/api/auth/login': 'API-登录',
              '/api/admin/users': 'API-用户管理',
              '/api/content/generate': 'API-内容生成',
              '/api/auth/register': 'API-注册'
            };

            // 添加页面名称
            const enhancedResult = result.map(item => ({
              page_url: item.page_url,
              page_name: pageNameMap[item.page_url] || item.page_url,
              count: item.count
            }));

            resolve({ type: 'popular_pages', data: enhancedResult });
          }
        }
      );
    })
  ];

  Promise.all(queries)
    .then(results => {
      const statistics = {};
      results.forEach(result => {
        if (result.data) {
          statistics[result.type] = result.data;
        } else {
          statistics[result.type] = result.count;
        }
      });

      res.json({
        success: true,
        data: statistics
      });
    })
    .catch(error => {
      console.error('获取访问统计失败:', error);
      res.status(500).json({
        success: false,
        error: '获取访问统计失败'
      });
    });
});

// 静态文件服务
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 处理SPA路由 - 放在最后，让API路由优先匹配
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${port}`);
});