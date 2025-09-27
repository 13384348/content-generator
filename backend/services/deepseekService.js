const axios = require('axios');
const https = require('https');
const { URL } = require('url');
require('dotenv').config();

// 创建https代理配置 - 加强配置提高连接稳定性
const httpsAgent = new https.Agent({
  keepAlive: true,
  timeout: 15000, // 15秒连接超时
  keepAliveMsecs: 60000, // 保持连接60秒
  maxSockets: 3, // 减少并发连接数
  maxFreeSockets: 2,
  freeSocketTimeout: 30000,
  // 启用TCP保活
  socketActiveTTL: 120000
});

class DeepSeekService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
  }

  // 网络诊断方法
  async diagnoseConnection() {
    console.log('开始网络诊断...');
    console.log(`API URL: ${this.apiUrl}`);
    console.log(`API Key存在: ${!!this.apiKey}`);

    try {
      const { URL } = require('url');
      const url = new URL(this.apiUrl);
      console.log(`主机: ${url.hostname}`);
      console.log(`端口: ${url.port || 443}`);

      // 简单连通性测试
      return new Promise((resolve) => {
        const req = https.request({
          hostname: url.hostname,
          port: 443,
          path: '/',
          method: 'HEAD',
          timeout: 5000
        }, (res) => {
          console.log(`连通性测试: ${res.statusCode} ${res.statusMessage}`);
          resolve(true);
        });

        req.on('error', (error) => {
          console.log(`连通性测试失败: ${error.message}`);
          resolve(false);
        });

        req.on('timeout', () => {
          console.log('连通性测试超时');
          resolve(false);
        });

        req.end();
      });
    } catch (error) {
      console.log(`诊断过程出错: ${error.message}`);
      return false;
    }
  }

  // 直接进行API调用，不使用子进程，避免Windows兼容性问题
  async makeDirectApiCall(prompt, timeout = 30000) {
    const requestData = {
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.8
    };

    return this.makeNativeHttpsRequest(requestData, timeout);
  }

  // 使用原生HTTPS模块的更稳定请求方法
  async makeNativeHttpsRequest(data, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.apiUrl);
      const postData = JSON.stringify(data);

      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: timeout
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            if (res.statusCode === 200) {
              resolve(parsedData);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
            }
          } catch (error) {
            reject(new Error(`解析响应失败: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('请求超时'));
      });

      req.write(postData);
      req.end();
    });
  }

  async generateTopics(prompt, industry, maxRetries = 5) {
    // 如果industry为空，说明是分镜脚本生成，直接使用prompt
    const fullPrompt = industry ? `${prompt}\n\n现在请为"${industry}"行业生成10条选题：` : prompt;

    // 在第一次尝试前进行网络诊断
    if (!industry) { // 只对分镜脚本进行诊断
      await this.diagnoseConnection();
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`DeepSeek API调用尝试 ${attempt}/${maxRetries}`);
        console.log(`完整提示词长度: ${fullPrompt.length}`);
        console.log(`行业参数: ${industry || '无行业(分镜脚本)'}`);

        const requestData = {
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content: fullPrompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.8,
          top_p: 0.9
        };

        let response;
        const currentTimeout = 25000 + (attempt - 1) * 15000; // 递增超时: 25s, 40s, 55s (提高超时时间)

        // 使用直接API调用，避免Windows子进程兼容性问题
        console.log(`使用直接API调用，超时设置: ${currentTimeout}ms`);
        try {
          const directResult = await this.makeDirectApiCall(fullPrompt, currentTimeout);
          response = { data: directResult };
          console.log(`直接API调用成功，响应choices长度: ${directResult.choices?.length}`);
        } catch (directError) {
          console.log(`直接API调用失败: ${directError.message}`);
          throw directError;
        }

        const content = response.data.choices[0].message.content;
        console.log(`提取的内容长度: ${content.length}`);
        console.log(`内容前100字符: ${content.substring(0, 100)}...`);

        // 如果industry为空，说明是分镜脚本，返回原始内容
        if (!industry) {
          console.log(`DeepSeek API调用成功，生成分镜脚本内容`);
          return {
            success: true,
            topics: [],
            raw_content: content
          };
        }

        // 否则解析为选题列表
        const topics = this.parseTopics(content);

        console.log(`DeepSeek API调用成功，生成 ${topics.length} 条选题`);
        return {
          success: true,
          topics: topics,
          raw_content: content
        };

      } catch (error) {
        console.error(`DeepSeek API第${attempt}次调用失败:`, error.message);

        // 如果这是最后一次尝试，返回错误或模拟响应
        if (attempt === maxRetries) {
          console.error(`所有${maxRetries}次重试尝试均失败`);


          return {
            success: false,
            error: `网络连接持续不稳定，已重试${maxRetries}次均失败。请检查网络连接或稍后再试。详细错误：${error.message}`,
            topics: []
          };
        }

        // 等待后重试（递增等待时间）
        const waitTime = attempt * 3000; // 3s, 6s, 9s, 12s
        console.log(`等待 ${waitTime}ms 后进行第${attempt + 1}次重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  parseTopics(content) {
    // 使用正则表达式提取编号的选题
    const lines = content.split('\n');
    const topics = [];

    lines.forEach(line => {
      // 匹配数字开头的行
      const match = line.match(/^\s*(\d+)[\.、\s]+(.+)$/);
      if (match && match[2].trim()) {
        // 清理Markdown格式标记
        let cleanTopic = this.cleanMarkdown(match[2].trim());
        topics.push(cleanTopic);
      }
    });

    // 如果没有找到编号的选题，尝试其他格式
    if (topics.length === 0) {
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('根据') && !trimmed.startsWith('以下') && trimmed.length > 5) {
          // 清理Markdown格式标记
          let cleanTopic = this.cleanMarkdown(trimmed);
          topics.push(cleanTopic);
        }
      });
    }

    return topics.slice(0, 10); // 确保只返回10条
  }

  // 专门用于生成钩子的方法
  async generateHooks(fullPrompt, topic, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`DeepSeek钩子生成API调用尝试 ${attempt}/${maxRetries}`);
        console.log(`完整提示词长度: ${fullPrompt.length}`);
        console.log(`关联选题: ${topic}`);

        const requestData = {
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content: fullPrompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.8,
          top_p: 0.9
        };

        let response;
        const currentTimeout = 25000 + (attempt - 1) * 15000; // 递增超时: 25s, 40s, 55s (提高超时时间)

        // 使用直接API调用，避免Windows子进程兼容性问题
        console.log(`使用直接钩子生成API调用，超时设置: ${currentTimeout}ms`);
        try {
          const directResult = await this.makeDirectApiCall(fullPrompt, currentTimeout);
          response = { data: directResult };
          console.log(`直接钩子生成API调用成功，响应choices长度: ${directResult.choices?.length}`);
        } catch (directError) {
          console.log(`直接钩子生成API调用失败: ${directError.message}`);
          throw directError;
        }

        const content = response.data.choices[0].message.content;
        console.log(`提取的钩子内容长度: ${content.length}`);
        console.log(`钩子内容前100字符: ${content.substring(0, 100)}...`);

        // 解析为钩子列表
        const hooks = this.parseTopics(content);

        console.log(`DeepSeek钩子生成API调用成功，生成 ${hooks.length} 条钩子`);
        return {
          success: true,
          hooks: hooks,
          raw_content: content,
          topic: topic
        };

      } catch (error) {
        console.error(`DeepSeek钩子生成API第${attempt}次调用失败:`, error.message);

        // 如果这是最后一次尝试，返回错误
        if (attempt === maxRetries) {
          console.error(`钩子生成所有${maxRetries}次重试尝试均失败`);

          return {
            success: false,
            error: `钩子生成网络连接持续不稳定，已重试${maxRetries}次均失败。请检查网络连接或稍后再试。详细错误：${error.message}`,
            hooks: []
          };
        }

        // 等待后重试（递增等待时间）
        const waitTime = attempt * 3000; // 3s, 6s, 9s, 12s
        console.log(`等待 ${waitTime}ms 后进行钩子生成第${attempt + 1}次重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  async generateContent(fullPrompt, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`DeepSeek文案生成API调用尝试 ${attempt}/${maxRetries}`);
        console.log(`完整提示词长度: ${fullPrompt.length}`);

        let response;
        const currentTimeout = 30000 + (attempt - 1) * 20000; // 递增超时: 30s, 50s, 70s

        // 使用直接API调用，避免Windows子进程兼容性问题
        console.log(`使用直接文案生成API调用，超时设置: ${currentTimeout}ms`);
        try {
          const directResult = await this.makeDirectApiCall(fullPrompt, currentTimeout);
          response = { data: directResult };
          console.log(`直接文案生成API调用成功，响应choices长度: ${directResult.choices?.length}`);
        } catch (directError) {
          console.log(`直接文案生成API调用失败: ${directError.message}`);
          throw directError;
        }

        const content = response.data.choices[0].message.content;
        console.log(`提取的文案内容长度: ${content.length}`);
        console.log(`文案内容前100字符: ${content.substring(0, 100)}...`);

        console.log(`DeepSeek文案生成API调用成功`);
        return content;

      } catch (error) {
        console.error(`DeepSeek文案生成API第${attempt}次调用失败:`, error.message);

        // 如果这是最后一次尝试，抛出错误
        if (attempt === maxRetries) {
          console.error(`文案生成所有${maxRetries}次重试尝试均失败`);
          throw error;
        }

        // 等待后重试（递增等待时间）
        const waitTime = attempt * 3000; // 3s, 6s
        console.log(`等待 ${waitTime}ms 后进行文案生成第${attempt + 1}次重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // 流式生成内容
  async generateContentStream(fullPrompt, onChunk, onComplete, onError) {
    try {
      const response = await axios.post(this.apiUrl, {
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: fullPrompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.8,
        top_p: 0.9,
        stream: true
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        responseType: 'stream',
        timeout: 60000
      });

      let buffer = '';
      let fullContent = '';

      response.data.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 保留最后一个不完整的行

        for (const line of lines) {
          if (line.trim()) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data.trim() === '[DONE]') {
                onComplete(fullContent);
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullContent += content;
                  onChunk(content, fullContent);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      });

      response.data.on('end', () => {
        onComplete(fullContent);
      });

      response.data.on('error', (error) => {
        onError(error);
      });

    } catch (error) {
      console.error('DeepSeek流式API调用失败:', error.response?.data || error.message);
      onError(error);
    }
  }

  // 专门用于分镜脚本的流式生成，增加token数和优化参数
  async generateStoryboardStream(fullPrompt, onChunk, onComplete, onError) {
    try {
      const response = await axios.post(this.apiUrl, {
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: fullPrompt
          }
        ],
        max_tokens: 4000, // 增加到4000个token
        temperature: 0.9, // 稍微提高创造性，加快生成
        top_p: 0.95, // 提高top_p加快生成速度
        stream: true,
        frequency_penalty: 0.1, // 减少重复，提高效率
        presence_penalty: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        responseType: 'stream',
        timeout: 90000 // 90秒超时
      });

      let buffer = '';
      let fullContent = '';

      response.data.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 保留最后一个不完整的行

        for (const line of lines) {
          if (line.trim()) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data.trim() === '[DONE]') {
                // 清理和格式化最终内容
                const cleanedContent = this.cleanStoryboardContent(fullContent);
                onComplete(cleanedContent);
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullContent += content;
                  onChunk(content, fullContent);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      });

      response.data.on('end', () => {
        const cleanedContent = this.cleanStoryboardContent(fullContent);
        onComplete(cleanedContent);
      });

      response.data.on('error', (error) => {
        onError(error);
      });

    } catch (error) {
      console.error('DeepSeek分镜脚本流式API调用失败:', error.response?.data || error.message);
      onError(error);
    }
  }

  // 清理分镜脚本内容，优化格式和表格显示
  cleanStoryboardContent(content) {
    return content
      // 清理Markdown格式标记
      .replace(/\*\*([^*]+)\*\*/g, '$1')     // 移除粗体 **text**
      .replace(/\*([^*]+)\*/g, '$1')         // 移除斜体 *text*
      .replace(/`([^`]+)`/g, '$1')           // 移除代码标记 `text`
      .replace(/~~([^~]+)~~/g, '$1')         // 移除删除线 ~~text~~
      .replace(/#{1,6}\s*/g, '')             // 移除标题标记
      // 优化表格格式
      .replace(/\|\s*-+\s*\|/g, '|---|')     // 标准化表格分隔符
      .replace(/\s*\|\s*/g, ' | ')           // 标准化表格列分隔符
      // 清理多余空行
      .replace(/\n{3,}/g, '\n\n')           // 最多保留两个换行符
      .trim();
  }

  // 备选选题生成器
  getFallbackTopics(industry) {
    const fallbackTopics = [
      `${industry}行业最新趋势解析`,
      `${industry}从业者必知的5个技巧`,
      `${industry}市场现状与未来发展`,
      `${industry}行业常见误区盘点`,
      `如何选择靠谱的${industry}服务商`,
      `${industry}行业新手入门指南`,
      `${industry}成本控制的关键要点`,
      `${industry}质量标准对比分析`,
      `${industry}消费者权益保护指南`,
      `${industry}未来十年发展预测`
    ];

    return fallbackTopics;
  }

  cleanMarkdown(text) {
    // 清理各种Markdown格式标记
    return text
      .replace(/\*\*(.+?)\*\*/g, '$1')     // 移除粗体标记 **text**
      .replace(/\*(.+?)\*/g, '$1')         // 移除斜体标记 *text*
      .replace(/\*/g, '')                  // 移除所有剩余的星号
      .replace(/`(.+?)`/g, '$1')           // 移除代码标记 `text`
      .replace(/~~(.+?)~~/g, '$1')         // 移除删除线标记 ~~text~~
      .replace(/#{1,6}\s*/g, '')           // 移除标题标记 # ## ###
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')  // 移除链接标记 [text](url)
      .replace(/^\s*[-*+]\s*/gm, '')       // 移除列表标记
      .replace(/^\s*\d+\.\s*/gm, '')       // 移除数字列表标记
      .replace(/\(.*?\)/g, '')             // 移除括号内容（如：句式2变体）
      .replace(/（.*?）/g, '')             // 移除中文括号内容
      .replace(/【.*?】/g, '')             // 移除中文方括号内容
      .replace(/\[.*?\]/g, '')             // 移除方括号内容
      .replace(/\s+/g, ' ')                // 合并多个空格
      .trim();
  }
}

module.exports = DeepSeekService;