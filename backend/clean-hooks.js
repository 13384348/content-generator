const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'content_generator.db');
const db = new sqlite3.Database(dbPath);

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

console.log('开始清理数据库中多余的钩子类型...');
console.log('前端需要的类型数量:', frontendHooks.length);

// 先查看当前所有类型
db.all('SELECT type, name FROM hook_prompts ORDER BY type', (err, rows) => {
  if (err) {
    console.error('查询失败:', err);
    return;
  }

  console.log('当前数据库中的类型数量:', rows.length);

  const dbTypes = rows.map(row => row.type);
  const extraTypes = dbTypes.filter(type => !frontendHooks.includes(type));

  console.log('需要删除的多余类型数量:', extraTypes.length);

  if (extraTypes.length === 0) {
    console.log('数据库中没有多余的类型！');
    db.close();
    return;
  }

  console.log('\n准备删除的类型:');
  extraTypes.forEach((type, index) => {
    const row = rows.find(r => r.type === type);
    console.log(`${index + 1}. ${type} - ${row.name}`);
  });

  // 删除多余的类型
  const placeholders = extraTypes.map(() => '?').join(',');
  const deleteQuery = `DELETE FROM hook_prompts WHERE type IN (${placeholders})`;

  db.run(deleteQuery, extraTypes, function(err) {
    if (err) {
      console.error('删除失败:', err);
    } else {
      console.log(`\n✅ 成功删除 ${this.changes} 个多余的钩子类型`);

      // 验证结果
      db.all('SELECT COUNT(*) as count FROM hook_prompts', (err, rows) => {
        if (err) {
          console.error('验证查询失败:', err);
        } else {
          console.log(`✅ 当前数据库中剩余钩子类型数量: ${rows[0].count}`);
        }
        db.close();
      });
    }
  });
});