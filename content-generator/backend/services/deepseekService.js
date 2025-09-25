const axios = require('axios');
require('dotenv').config();

class DeepSeekService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
  }

  async generateTopics(prompt, industry) {
    try {
      const fullPrompt = `${prompt}\n\n现在请为"${industry}"行业生成10条选题：`;

      const response = await axios.post(this.apiUrl, {
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: fullPrompt
          }
        ],
        max_tokens: 1500, // 减少token数量提升速度
        temperature: 0.8, // 稍微提高创造性
        top_p: 0.9 // 添加top_p参数优化生成质量
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json; charset=utf-8'
        },
        timeout: 30000 // 设置30秒超时
      });

      const content = response.data.choices[0].message.content;

      // 解析返回的内容，提取选题
      const topics = this.parseTopics(content);

      return {
        success: true,
        topics: topics,
        raw_content: content
      };
    } catch (error) {
      console.error('DeepSeek API调用失败:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        topics: []
      };
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

  async generateContent(fullPrompt) {
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
        top_p: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json; charset=utf-8'
        },
        timeout: 30000
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API调用失败:', error.response?.data || error.message);
      throw error;
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
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'text/event-stream'
        },
        responseType: 'stream'
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