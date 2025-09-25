const https = require('https');
const { URL } = require('url');
require('dotenv').config();

// 独立的流式API调用工作进程
function makeStreamApiCall() {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    const prompt = process.argv[2];

    const requestData = {
        model: "deepseek-chat",
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        max_tokens: 1500,
        temperature: 0.8,
        top_p: 0.9,
        stream: true
    };

    const postData = JSON.stringify(requestData);
    const url = new URL(apiUrl);

    const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Content-Length': Buffer.byteLength(postData),
            'Accept': 'text/event-stream'
        },
        timeout: 30000
    };

    const req = https.request(options, (res) => {
        let buffer = '';
        let fullContent = '';

        res.on('data', (chunk) => {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop(); // 保留最后一个不完整的行

            for (const line of lines) {
                if (line.trim()) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data.trim() === '[DONE]') {
                            // 输出最终完整内容并结束
                            console.log(JSON.stringify({
                                type: 'complete',
                                success: true,
                                fullContent: fullContent
                            }));
                            process.exit(0);
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                fullContent += content;
                                // 输出流式内容块
                                console.log(JSON.stringify({
                                    type: 'chunk',
                                    content: content,
                                    fullContent: fullContent
                                }));
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }
        });

        res.on('end', () => {
            console.log(JSON.stringify({
                type: 'complete',
                success: true,
                fullContent: fullContent
            }));
            process.exit(0);
        });

        res.on('error', (error) => {
            console.log(JSON.stringify({
                type: 'error',
                success: false,
                error: error.message
            }));
            process.exit(1);
        });
    });

    req.on('error', (error) => {
        console.log(JSON.stringify({
            type: 'error',
            success: false,
            error: error.message
        }));
        process.exit(1);
    });

    req.on('timeout', () => {
        req.destroy();
        console.log(JSON.stringify({
            type: 'error',
            success: false,
            error: '请求超时'
        }));
        process.exit(1);
    });

    req.write(postData);
    req.end();
}

makeStreamApiCall();