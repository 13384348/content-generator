const https = require('https');
const { URL } = require('url');
require('dotenv').config();

// 独立的API调用工作进程，不受Express服务器环境影响
function makeApiCall() {
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
        temperature: 0.8
    };

    const postData = Buffer.from(JSON.stringify(requestData), 'utf8');
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
            'User-Agent': 'Node.js/' + process.version
        },
        timeout: 45000
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
                    console.log(JSON.stringify({ success: true, data: parsedData }));
                } else {
                    console.log(JSON.stringify({ success: false, error: `HTTP ${res.statusCode}: ${responseData}` }));
                }
            } catch (error) {
                console.log(JSON.stringify({ success: false, error: `解析响应失败: ${error.message}` }));
            }
            process.exit(0);
        });
    });

    req.on('error', (error) => {
        console.log(JSON.stringify({ success: false, error: error.message }));
        process.exit(1);
    });

    req.on('timeout', () => {
        req.destroy();
        console.log(JSON.stringify({ success: false, error: '请求超时' }));
        process.exit(1);
    });

    req.write(postData);
    req.end();
}

makeApiCall();