const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'content_generator.db');
const db = new sqlite3.Database(dbPath);

console.log('检查数据库中的所有钩子类型...');

db.all('SELECT type, name FROM hook_prompts ORDER BY type', (err, rows) => {
  if (err) {
    console.error('查询失败:', err);
    return;
  }

  console.log('所有钩子类型:');
  rows.forEach((row, index) => {
    console.log(`${index + 1}. ${row.type} - ${row.name}`);
  });

  console.log(`\n总数: ${rows.length}`);

  // 前端定义的36种类型
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

  const dbTypes = rows.map(row => row.type);
  const extraTypes = dbTypes.filter(type => !frontendHooks.includes(type));

  console.log('\n前端需要的类型数量:', frontendHooks.length);
  console.log('数据库中多余的类型数量:', extraTypes.length);

  if (extraTypes.length > 0) {
    console.log('\n数据库中多余的类型:');
    extraTypes.forEach((type, index) => {
      const row = rows.find(r => r.type === type);
      console.log(`${index + 1}. ${type} - ${row.name}`);
    });
  }

  db.close();
});