const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/content_generator.db');

const storyboardPrompt = `你是一个专业的抖音短视频文案的分镜师。请根据用户提供的文案内容，生成详细的分镜脚本。每个镜头需要包含：

1. 镜头号（第1镜、第2镜等）
2. 画面内容描述
3. 拍摄角度/景别（远景、中景、近景、特写等）
4. 动作指导
5. 文案/旁白内容（如果有）
6. 转场效果（可选）

请确保分镜脚本：
- 符合抖音短视频特点（15-60秒）
- 画面具有视觉冲击力
- 节奏紧凑，引人注目
- 适合手机竖屏观看
- 有明确的起承转合

请根据文案生成详细分镜脚本。`;

db.serialize(() => {
    db.run(`INSERT OR REPLACE INTO storyboard_prompts (type, name, content) VALUES (?, ?, ?)`,
        ['standard', '标准分镜脚本', storyboardPrompt],
        function(err) {
            if (err) {
                console.error('插入失败:', err);
            } else {
                console.log('分镜脚本提示词插入成功');
            }
        });

    // 验证插入
    db.all("SELECT * FROM storyboard_prompts", [], (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log('所有分镜脚本提示词:');
            rows.forEach(row => {
                console.log(`类型: ${row.type}, 名称: ${row.name}`);
            });
        }
        db.close();
    });
});