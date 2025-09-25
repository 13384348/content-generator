const axios = require('axios');
const https = require('https');
require('dotenv').config();

// Test both approaches to compare with working curl command
async function testDeepSeekAPI() {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

    console.log('API Key exists:', !!apiKey);
    console.log('API URL:', apiUrl);

    const testData = {
        model: "deepseek-chat",
        messages: [
            {
                role: "user",
                content: "简单测试，请回复：测试成功"
            }
        ],
        max_tokens: 50,
        temperature: 0.1
    };

    console.log('\n=== Testing with Axios (same as deepseekService.js) ===');
    try {
        const response = await axios.post(apiUrl, testData, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        console.log('Axios成功:', response.data.choices[0].message.content);
    } catch (error) {
        console.log('Axios失败:', error.message);
        console.log('错误代码:', error.code);
        console.log('错误详情:', error.response?.status, error.response?.statusText);
    }

    console.log('\n=== Testing with native HTTPS (matching curl exactly) ===');
    return new Promise((resolve) => {
        const postData = JSON.stringify(testData);
        const { URL } = require('url');
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
            timeout: 10000
        };

        console.log('请求选项:', options);

        const req = https.request(options, (res) => {
            console.log('响应状态:', res.statusCode, res.statusMessage);
            console.log('响应头:', res.headers);

            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                console.log('原始响应:', responseData);
                try {
                    const parsedData = JSON.parse(responseData);
                    console.log('HTTPS成功:', parsedData.choices[0].message.content);
                } catch (error) {
                    console.log('解析响应失败:', error.message);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.log('HTTPS错误:', error.message);
            console.log('错误代码:', error.code);
            resolve();
        });

        req.on('timeout', () => {
            console.log('HTTPS超时');
            req.destroy();
            resolve();
        });

        console.log('发送数据:', postData);
        req.write(postData);
        req.end();
    });
}

testDeepSeekAPI();