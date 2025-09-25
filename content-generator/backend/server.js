const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { initDatabase, dbPath } = require('./database/init');
const DeepSeekService = require('./services/deepseekService');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// 中间件
app.use(cors({
  origin: ['http://localhost:3011', 'http://127.0.0.1:3011', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(bodyParser.json({ charset: 'utf-8' }));
app.use(bodyParser.urlencoded({ extended: true, charset: 'utf-8' }));

// 初始化数据库
initDatabase();

// 创建DeepSeek服务实例
const deepSeekService = new DeepSeekService();

// 获取所有提示词类型
app.get('/api/prompts', (req, res) => {
  const db = new sqlite3.Database(dbPath);

  db.all("SELECT * FROM prompts ORDER BY id", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });

  db.close();
});

// 根据类型获取提示词
app.get('/api/prompts/:type', (req, res) => {
  const db = new sqlite3.Database(dbPath);

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

  db.close();
});

// 生成选题
app.post('/api/generate', async (req, res) => {
  const { type, industry } = req.body;

  if (!type || !industry) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  const db = new sqlite3.Database(dbPath);

  // 获取对应类型的提示词
  db.get("SELECT content FROM prompts WHERE type = ?", [type], async (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      db.close();
      return;
    }

    if (!row) {
      res.status(404).json({ error: '未找到该类型的提示词' });
      db.close();
      return;
    }

    try {
      // 调用DeepSeek API生成选题
      const result = await deepSeekService.generateTopics(row.content, industry);

      if (result.success) {
        // 保存生成历史
        db.run(
          "INSERT INTO generation_history (prompt_type, industry, generated_topics) VALUES (?, ?, ?)",
          [type, industry, JSON.stringify(result.topics)],
          function(err) {
            if (err) {
              console.error('保存历史记录失败:', err);
            }
          }
        );

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

    db.close();
  });
});

// === 钩子生成相关接口 ===

// 获取所有钩子提示词类型
app.get('/api/hooks', (req, res) => {
  const db = new sqlite3.Database(dbPath);

  db.all("SELECT * FROM hook_prompts ORDER BY id", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });

  db.close();
});

// 根据类型获取钩子提示词
app.get('/api/hooks/:type', (req, res) => {
  const db = new sqlite3.Database(dbPath);

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

  db.close();
});

// 生成钩子文案
app.post('/api/generate-hooks', async (req, res) => {
  const { type, topic } = req.body;

  if (!type || !topic) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  const db = new sqlite3.Database(dbPath);

  // 获取对应类型的钩子提示词
  db.get("SELECT content FROM hook_prompts WHERE type = ?", [type], async (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      db.close();
      return;
    }

    if (!row) {
      res.status(404).json({ error: '未找到该类型的钩子提示词' });
      db.close();
      return;
    }

    try {
      // 调用DeepSeek API生成钩子
      const fullPrompt = `${row.content}\n\n现在请为"${topic}"这个选题生成10条钩子：`;
      const result = await deepSeekService.generateTopics(fullPrompt, '');

      if (result.success) {
        // 保存生成历史
        db.run(
          "INSERT INTO hook_generation_history (hook_type, topic, generated_hooks) VALUES (?, ?, ?)",
          [type, topic, JSON.stringify(result.topics)],
          function(err) {
            if (err) {
              console.error('保存钩子历史记录失败:', err);
            }
          }
        );

        res.json({
          success: true,
          hooks: result.topics,
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

    db.close();
  });
});

// 管理员接口 - 更新钩子提示词
app.put('/api/admin/hooks/:type', (req, res) => {
  const { content } = req.body;

  const db = new sqlite3.Database(dbPath);

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

  db.close();
});

// 管理员接口 - 获取钩子生成历史
app.get('/api/admin/hook-history', (req, res) => {
  const db = new sqlite3.Database(dbPath);

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

  db.close();
});

// 管理员接口 - 更新提示词
app.put('/api/admin/prompts/:type', (req, res) => {
  console.log('DEBUG: 管理员更新提示词请求', req.params.type, req.body);
  const { content } = req.body;

  const db = new sqlite3.Database(dbPath);

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

  db.close();
});

// 管理员接口 - 获取生成历史
app.get('/api/admin/history', (req, res) => {
  const db = new sqlite3.Database(dbPath);

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

  db.close();
});

// === 文案生成相关接口 ===

// 获取所有文案提示词类型
app.get('/api/contents', (req, res) => {
  const db = new sqlite3.Database(dbPath);

  db.all("SELECT * FROM content_prompts ORDER BY id", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });

  db.close();
});

// 根据类型获取文案提示词
app.get('/api/contents/:type', (req, res) => {
  const db = new sqlite3.Database(dbPath);

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

  db.close();
});

// 生成文案
app.post('/api/generate-content', async (req, res) => {
  const { type, topic, hook } = req.body;

  if (!type || !topic || !hook) {
    res.status(400).json({ error: '请提供文案类型、选题和钩子' });
    return;
  }

  try {
    const db = new sqlite3.Database(dbPath);

    // 获取对应类型的提示词
    db.get("SELECT content FROM content_prompts WHERE type = ?", [type], async (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        db.close();
        return;
      }
      if (!row) {
        res.status(404).json({ error: '未找到该类型的文案提示词' });
        db.close();
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

      db.close();
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
    const db = new sqlite3.Database(dbPath);

    // 获取对应类型的提示词
    db.get("SELECT content FROM content_prompts WHERE type = ?", [type], async (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        db.close();
        return;
      }
      if (!row) {
        res.status(404).json({ error: '未找到该类型的文案提示词' });
        db.close();
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
            res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk, fullContent })}\n\n`);
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
            db.close();
          },
          // onError - 出错时调用
          (error) => {
            console.error('流式文案生成失败:', error);
            res.write(`data: ${JSON.stringify({ type: 'error', error: '文案生成失败，请稍后重试' })}\n\n`);
            res.end();
            db.close();
          }
        );

      } catch (error) {
        console.error('文案生成失败:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', error: '文案生成失败，请稍后重试' })}\n\n`);
        res.end();
        db.close();
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

  const db = new sqlite3.Database(dbPath);

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

  db.close();
});

// 管理员接口 - 获取文案生成历史
app.get('/api/admin/content-history', (req, res) => {
  const db = new sqlite3.Database(dbPath);

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

  db.close();
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});