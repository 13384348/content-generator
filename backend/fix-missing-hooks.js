const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'content_generator.db');

// 前端定义的36种钩子类型
const frontendHooks = [
  'target_audience', 'direct_question', 'self_denial', 'counter_cognition',
  'high_value', 'hit_pain_point', 'loss_aversion', 'contrast_opposition',
  'celebrity_trend', 'warning_pitfall', 'emotional_resonance', 'curiosity_gap',
  'social_proof', 'urgency_scarcity', 'story_narrative', 'data_shock',
  'before_after', 'insider_secret', 'step_by_step', 'mistake_warning',
  'trend_analysis', 'personal_experience', 'expert_opinion', 'challenge_assumption',
  'solution_reveal', 'behind_scenes', 'transformation_story', 'competitive_analysis',
  'resource_sharing', 'myth_busting', 'timeline_review', 'future_prediction',
  'cost_benefit', 'quick_win', 'deep_dive', 'community_voice'
];

// 需要添加的钩子类型（缺失的）
const missingHooks = [
  {
    type: 'emotional_resonance',
    name: '情感共鸣',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"情感共鸣"，通过触动用户内心情感，建立深层次连接。

核心逻辑：利用共同的情感体验和生活经历，让用户产生强烈的代入感和情感共鸣。

黄金公式：情感触发点 + 共同经历 + 情感放大

请根据选题生成10条情感共鸣类钩子。`
  },
  {
    type: 'curiosity_gap',
    name: '好奇缺口',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"好奇缺口"，制造信息缺口，激发用户强烈好奇心。

核心逻辑：故意隐瞒部分关键信息，让用户产生强烈的求知欲望。

黄金公式：引起兴趣 + 信息缺口 + 悬念制造

请根据选题生成10条好奇缺口类钩子。`
  },
  {
    type: 'social_proof',
    name: '社会认同',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"社会认同"，展示他人行为或选择，利用从众心理。

核心逻辑：通过展示他人的成功案例、选择或行为，让用户产生跟随的冲动。

黄金公式：他人成功 + 数据支撑 + 从众暗示

请根据选题生成10条社会认同类钩子。`
  },
  {
    type: 'urgency_scarcity',
    name: '紧迫稀缺',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"紧迫稀缺"，营造紧迫感和稀缺性，促进即时行动。

核心逻辑：利用稀缺性和时间紧迫感，激发用户立即采取行动的冲动。

黄金公式：时间限制 + 数量稀缺 + 机会错过

请根据选题生成10条紧迫稀缺类钩子。`
  },
  {
    type: 'story_narrative',
    name: '故事叙述',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"故事叙述"，通过生动故事情节，增强内容吸引力和记忆点。

核心逻辑：用故事化的开头吸引用户，让用户想要了解完整的故事发展。

黄金公式：故事开头 + 冲突设置 + 悬念引导

请根据选题生成10条故事叙述类钩子。`
  },
  {
    type: 'data_shock',
    name: '数据震撼',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"数据震撼"，用惊人数据或统计结果，增强说服力。

核心逻辑：用具有冲击力的数据和统计信息震撼用户，建立权威性。

黄金公式：惊人数据 + 对比反差 + 权威来源

请根据选题生成10条数据震撼类钩子。`
  },
  {
    type: 'before_after',
    name: '前后对比',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"前后对比"，展示改变前后的巨大差异，突出效果。

核心逻辑：通过强烈的前后对比，展示转变的效果和价值。

黄金公式：原始状态 + 改变过程 + 最终效果

请根据选题生成10条前后对比类钩子。`
  },
  {
    type: 'insider_secret',
    name: '内幕揭秘',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"内幕揭秘"，分享独家信息或内幕，满足用户探秘欲。

核心逻辑：披露一般人不知道的内幕信息，满足用户的好奇心。

黄金公式：独家信息 + 权威来源 + 秘密披露

请根据选题生成10条内幕揭秘类钩子。`
  },
  {
    type: 'step_by_step',
    name: '步骤指导',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"步骤指导"，提供具体操作步骤，增加实用性和可执行性。

核心逻辑：承诺提供清晰的操作步骤，让用户感觉可以立即行动。

黄金公式：明确目标 + 步骤预告 + 可执行性

请根据选题生成10条步骤指导类钩子。`
  },
  {
    type: 'mistake_warning',
    name: '错误警示',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"错误警示"，指出常见错误，帮助用户避免踩坑。

核心逻辑：警告用户可能犯的错误，提供避坑指南。

黄金公式：常见错误 + 后果描述 + 避免方法

请根据选题生成10条错误警示类钩子。`
  },
  {
    type: 'trend_analysis',
    name: '趋势分析',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"趋势分析"，分析行业趋势或未来发展，展现前瞻性。

核心逻辑：展示对未来趋势的洞察和预判，建立专业权威性。

黄金公式：趋势判断 + 数据支撑 + 未来预测

请根据选题生成10条趋势分析类钩子。`
  },
  {
    type: 'personal_experience',
    name: '个人经历',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"个人经历"，分享真实个人体验，增强可信度和亲近感。

核心逻辑：用个人的真实经历增加内容的可信度和情感连接。

黄金公式：个人经历 + 情感表达 + 经验分享

请根据选题生成10条个人经历类钩子。`
  },
  {
    type: 'expert_opinion',
    name: '专家观点',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"专家观点"，引用权威专家意见，提升内容专业性。

核心逻辑：借用专家的权威性和专业性，增强内容的说服力。

黄金公式：专家身份 + 权威观点 + 专业支撑

请根据选题生成10条专家观点类钩子。`
  },
  {
    type: 'challenge_assumption',
    name: '挑战假设',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"挑战假设"，质疑固有观念，引发用户深度思考。

核心逻辑：挑战用户的固有认知和假设，引发认知冲突。

黄金公式：常见观念 + 质疑挑战 + 新视角

请根据选题生成10条挑战假设类钩子。`
  },
  {
    type: 'solution_reveal',
    name: '解决方案',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"解决方案"，直接提供问题解决方案，满足用户需求。

核心逻辑：承诺为用户提供具体可行的解决方案。

黄金公式：问题识别 + 解决方案 + 效果保证

请根据选题生成10条解决方案类钩子。`
  },
  {
    type: 'behind_scenes',
    name: '幕后揭秘',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"幕后揭秘"，展示背后的过程或真相，增加透明度。

核心逻辑：揭示表面现象背后的真实过程或原因。

黄金公式：表面现象 + 幕后真相 + 揭秘过程

请根据选题生成10条幕后揭秘类钩子。`
  },
  {
    type: 'transformation_story',
    name: '转变故事',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"转变故事"，讲述成长或改变的故事，激发用户共鸣。

核心逻辑：通过转变和成长的故事激励用户，产生情感共鸣。

黄金公式：起始状态 + 转变过程 + 最终成果

请根据选题生成10条转变故事类钩子。`
  },
  {
    type: 'competitive_analysis',
    name: '竞品对比',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"竞品对比"，分析竞争对手优劣，帮助用户做出选择。

核心逻辑：通过客观对比分析，帮助用户做出更好的选择。

黄金公式：产品对比 + 优劣分析 + 选择建议

请根据选题生成10条竞品对比类钩子。`
  },
  {
    type: 'resource_sharing',
    name: '资源分享',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"资源分享"，提供有价值的资源或工具，增加实用性。

核心逻辑：承诺分享有价值的资源、工具或信息。

黄金公式：资源价值 + 获取方式 + 实用性展示

请根据选题生成10条资源分享类钩子。`
  },
  {
    type: 'myth_busting',
    name: '辟谣澄清',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"辟谣澄清"，澄清误解或谣言，建立正确认知。

核心逻辑：纠正错误信息，建立正确的认知。

黄金公式：错误观念 + 真相澄清 + 证据支撑

请根据选题生成10条辟谣澄清类钩子。`
  },
  {
    type: 'timeline_review',
    name: '时间回顾',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"时间回顾"，回顾历史或发展过程，提供全面视角。

核心逻辑：通过时间维度的回顾，提供完整的发展脉络。

黄金公式：时间节点 + 发展过程 + 现状对比

请根据选题生成10条时间回顾类钩子。`
  },
  {
    type: 'future_prediction',
    name: '未来预测',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"未来预测"，预测未来发展或变化，展现洞察力。

核心逻辑：基于当前趋势和数据，对未来进行合理预测。

黄金公式：现状分析 + 趋势判断 + 未来预测

请根据选题生成10条未来预测类钩子。`
  },
  {
    type: 'cost_benefit',
    name: '成本收益',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"成本收益"，分析投入产出比，帮助用户理性决策。

核心逻辑：帮助用户分析成本和收益，做出明智决策。

黄金公式：成本分析 + 收益计算 + 决策建议

请根据选题生成10条成本收益类钩子。`
  },
  {
    type: 'quick_win',
    name: '速效技巧',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"速效技巧"，提供立即见效的方法或技巧。

核心逻辑：承诺提供可以立即见效的简单方法。

黄金公式：即时效果 + 简单方法 + 快速见效

请根据选题生成10条速效技巧类钩子。`
  },
  {
    type: 'deep_dive',
    name: '深度剖析',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"深度剖析"，深入分析复杂问题，提供专业见解。

核心逻辑：承诺提供深层次的专业分析和见解。

黄金公式：复杂问题 + 深度分析 + 专业见解

请根据选题生成10条深度剖析类钩子。`
  },
  {
    type: 'community_voice',
    name: '社群声音',
    content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"社群声音"，汇集用户或社群意见，增强集体认同感。

核心逻辑：展示社群或用户的集体意见和声音。

黄金公式：社群观点 + 集体意见 + 代表性声音

请根据选题生成10条社群声音类钩子。`
  }
];

const db = new sqlite3.Database(dbPath);

console.log('开始检查并添加缺失的钩子类型...');

// 先获取现有的钩子类型
db.all("SELECT type FROM hook_prompts", (err, rows) => {
  if (err) {
    console.error('查询现有钩子类型失败:', err);
    return;
  }

  const existingTypes = rows.map(row => row.type);
  console.log('现有钩子类型数量:', existingTypes.length);
  console.log('前端需要的钩子类型数量:', frontendHooks.length);

  const missing = missingHooks.filter(hook => !existingTypes.includes(hook.type));
  console.log('需要添加的钩子类型数量:', missing.length);

  if (missing.length === 0) {
    console.log('所有钩子类型都已存在！');
    db.close();
    return;
  }

  // 添加缺失的钩子类型
  const stmt = db.prepare("INSERT OR IGNORE INTO hook_prompts (type, name, content) VALUES (?, ?, ?)");

  missing.forEach((hook, index) => {
    stmt.run(hook.type, hook.name, hook.content, (err) => {
      if (err) {
        console.error(`添加钩子类型 ${hook.type} 失败:`, err);
      } else {
        console.log(`✓ 已添加钩子类型: ${hook.type} - ${hook.name}`);
      }

      if (index === missing.length - 1) {
        stmt.finalize();
        console.log('所有缺失的钩子类型已添加完成！');
        db.close();
      }
    });
  });
});