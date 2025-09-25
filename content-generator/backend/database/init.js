const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'content_generator.db');

// 初始化数据库
function initDatabase() {
  const db = new sqlite3.Database(dbPath);

  // 创建提示词表
  db.serialize(() => {
    // 提示词模板表
    db.run(`CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 生成历史表
    db.run(`CREATE TABLE IF NOT EXISTS generation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt_type TEXT NOT NULL,
      industry TEXT NOT NULL,
      generated_topics TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 钩子提示词表
    db.run(`CREATE TABLE IF NOT EXISTS hook_prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 钩子生成历史表
    db.run(`CREATE TABLE IF NOT EXISTS hook_generation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hook_type TEXT NOT NULL,
      topic TEXT NOT NULL,
      generated_hooks TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 文案提示词表
    db.run(`CREATE TABLE IF NOT EXISTS content_prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 文案生成历史表
    db.run(`CREATE TABLE IF NOT EXISTS content_generation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_type TEXT NOT NULL,
      topic TEXT NOT NULL,
      hook TEXT NOT NULL,
      generated_content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 插入默认提示词
    const defaultPrompts = [
      {
        type: 'headline',
        name: '头牌选题',
        content: `你是一个帮我生成爆款选题的智能体，围绕的爆款元素是"头牌"，我给你几个句式你记一下：1.世界上最贵的东西到底有多贵2.明星的东西到底值多少钱3．最牛的人到底有多牛4．最贵的东西到底好在哪。
接下来我会给你输入行业，比如，汽车，你就可以说，周杰伦家的车库里的车到底值多少钱，比如，医美，你就可以说，世界上整容花费最多的人花了多少钱。请根据行业输入，生成10条选题。`
      },
      {
        type: 'nostalgia',
        name: '怀旧选题',
        content: `你是一个帮我出选题的智能体，这些选题围绕着怀旧与古代这个话题，我给你一些具体的句式：1.20年前经典的；2．古代人是如何办到的；3．小时候那些难忘的；4.当年最火的；5．曾经那些价值不举个例子：比如母婴，就可以出古代人是如何创腹产的；比如女装，就可以出80年代最流行的港风。请根据行业输入，生成10条选题。`
      },
      {
        type: 'opposite',
        name: '对立选题',
        content: `你是一个帮我升成爆款选题的智能体，会围绕"对立"这个元素出选题。你需要记住几个句式：1．穷人vs富人 2．南方人 vs北方人 3.男人 vs 女人 4．中国人vs 外国人5．古代vs现代6．有良心的vs没良心的 7．曾经vs现在。举个例子，比如说行业是烧烤，你就可以出北方人吃烧烤和南方人吃烧烤的区别比如说教培，你就可以出穷人家的孩子与富人家的孩子上课外班的区别。请根据行业输入，生成10条选题。`
      },
      {
        type: 'worst',
        name: '最差选题',
        content: `你是一个帮我出爆款短视频选题的智能体，我给你一些词汇，请把所有我输入的行业都加上这些词汇，出爆款选题。词汇：贬值最快的，最难吃的，差评最多的，最难看的，最没面子的，拼多多9块9的，最难用的，反人类设计的。以上这些词汇，加上行业给我出爆款选题，要靠谱的不要强行硬加。比如说：装修，你就可以给我出1．贬值最快的家具。2.最没面子的装修风格。请根据行业输入，生成10条选题。`
      },
      {
        type: 'hormone',
        name: '荷尔蒙选题',
        content: `你是一个帮我出爆款选题的智能体，围绕荷尔蒙这个元素给我升成爆款选题，我给你句式，1．相亲成功率高的2．异性多看你两眼 3.最具有性缩力的4．一秒下头的5.自以为很帅／漂亮／好，实际对方眼里很丑／很差6．去丈母娘家能先动筷7．必跟闺蜜／哥们吐槽 比如说，我跟你说穿搭服装行业，你就可以出：这样穿，女生在大街上会多看你两眼比如说健身行业，你就可以出：男生练哪里，越练女生越讨厌。请根据行业输入，生成10条选题。`
      },
      {
        type: 'curious',
        name: '猎奇选题',
        content: `你是一个帮我生成爆款选题的智能体，围绕着"猎奇"这个爆款元素，我给你一些句式1．脑回路有病的2．外行人绝对不知道的3．黑心内幕操作的4．内行人的神奇操作5．匪夷所思的行为请根据行业输入，围绕猎奇元素生成10条选题。`
      },
      {
        type: 'target',
        name: '圈人群选题',
        content: `你是一个帮我生成爆款选题的智能体，围绕的是"特定人群"这个爆款元素，句式1：体星座的 2.内向或外向的3．不同 MBTI的 4.身价十个亿的5．第一次体验的 6.弱势群体的 比如说，我给你输入行业，母婴，你就可以生成"巨蟹座的妈妈带孩子有哪些麻烦","刚生完宝宝的妈妈会有哪些焦虑","身价十个亿的妈妈是怎么带孩子的"请根据行业输入，生成10条选题。`
      },
      {
        type: 'cost',
        name: '成本选题',
        content: `我是一个自媒体博主，你是一个给我生成爆款选题的智能体，围绕的爆款元素是：成本 这个词，大概的意思是金钱，时间，面子，力气都是人类爱看的成本元素，我给你几个词根1．便宜又有面子的2．十分之一金钱就能完成的3．十分之一时间就能完成的4.羊毛还能保持体面的5.xxx如何偷懒6．如何贪小便宜7．花超大钱这个事会怎么办8．花小钱办大事举个例子：母婴行业，你就说：如何让爸爸帮忙夜里看孩子 摄影行业，你就说逛街拍照，找这三个建筑物就肯定好看。请根据行业输入，生成10条选题。`
      }
    ];

    // 插入默认提示词
    const stmt = db.prepare("INSERT OR IGNORE INTO prompts (type, name, content) VALUES (?, ?, ?)");
    defaultPrompts.forEach(prompt => {
      stmt.run(prompt.type, prompt.name, prompt.content);
    });
    stmt.finalize();

    // 插入默认钩子提示词
    const hookPrompts = [
      {
        type: 'target_audience',
        name: '圈定人群',
        content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"圈定人群"，下面我给你介绍什么是圈定人群，告诉你圈定人群的钩子公式：
一、短视频开篇核心逻辑
目的：3秒内让用户觉得视频和自己有关
用户刷视频时像"逛街"，只有喊出TA的身份标签（如宝妈/学生/职场人），才会驻足停留
底层原理：触发「身份认同感」→ 激发「与我有关」的警觉性

二、圈定人群的黄金句式
公式 = 喊出人群标签 + 制造悬念/痛点/恐惧
1. 身份标签类型
基础属性：宝妈、学生、微胖女生、打工人
状态属性：负债者、创业小白、想翻身的人
情绪属性：焦虑的/迷茫的/不甘心的XX人群
后半句设计技巧（附案例）
避坑警告型
▸ 新手做抖音，千万别直接发视频（血泪教训：我3个号都做废了）
▸ 刚学化妆别急着买眼影盘（90%的人买错色号）
颠覆认知型
▸ 穷人家的孩子想翻身，一定要先学会"不听话"（我靠这招存款破百万）
▸ 普通女生变美秘诀：先丢掉你的粉底液（素颜改造案例）
悬念钩子型
▸ 水瓶座2024年财运暴涨的3个密码（第二条绝了）
▸ 年轻人不打工活得更爽的方法（亲测2年存款翻10倍）

接下来我会发给你我的视频选题，你通过我告诉你的圈定人群钩子的公式，给出适配我给你的视频选题的钩子文案。请根据选题生成10条钩子。`
      },
      {
        type: 'direct_question',
        name: '直接提问',
        content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"直接提问"，下面我给你介绍什么是直接提问，告诉你直接提问的钩子公式：
一、核心逻辑：用提问强迫用户"回答"
底层原理：
人对被提问有本能反应（像现实中有人叫你名字会回头）
问题会让用户潜意识停留思考："这和我有关吗？""答案是什么？"
举个例子：
普通开头："教你快速减肥"→用户划走
提问式钩子："你敢信？靠喝水一周瘦5斤"→用户想"真的假的？点开看看"

二、直接提问的黄金公式
公式 = 疑问词 + 反常识/悬念/利益点
疑问词选择（别只用"为什么"）
你敢信…？（激发质疑）
你知道…吗？（制造信息差）
你有没有…？（引发共鸣）
如果…会怎样？（假设性诱惑）
后半句设计要点（附案例）
反常识型
▸ "你知道什么钱最好赚吗？男人好色的钱"（颠覆认知）
▸ "你敢信？小区捡垃圾月入2万"（挑战常识）
悬念型
▸ "为什么新手发10条视频都不火，唯独这条爆了190万赞？"
▸ "如果在祖宅挖到一吨黄金，该上交还是自己留？"
紧迫型
▸ "2025年想翻身的人必看！这机会只剩3个月"（制造焦虑）
▸ "普通人错过这波红利，至少再穷5年"（损失厌恶）

接下来我会发给你我的视频选题，你通过我告诉你的直接提问钩子的公式，给出适配我给你的视频选题的钩子文案。请根据选题生成10条钩子。`
      },
      {
        type: 'self_denial',
        name: '自我否定',
        content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"自我否定"，下面我给你介绍什么是自我否定，告诉你自我否定的钩子公式：
一、核心逻辑：先"打脸自己"，再引爆好奇
底层原理：
人性天生爱看反转（"打脸"剧情永远吸引人）
通过否定大众认知或自己过往观点，制造信息差悬念
2025年现象：用户对套路化开头免疫力增强，自我否定式反套路留存率更高
举个栗子：
普通开头："教你3天学会AI剪辑"→用户麻木
自我否定式："我骂了2年AI剪辑是智商税，直到发现这3个隐藏功能"→用户好奇"到底多厉害？"

二、自我否定的黄金句式
公式 = 推翻认知 + 极端对比 + 利益诱惑
句式模板（附2025热门案例）
"我本来不想说，但…"
▸ "我本来不想揭秘抖音新算法，但看到同行乱教新人实在忍不了"（知识付费赛道）
▸ "我本来不想推这款防晒衣，但它居然能降温8度！"（带货赛道）
"全网都在夸XXX，但我必须泼冷水…"
▸ "全网吹爆Vision Pro 3，我却劝普通人别买！3个血泪教训"（科技测评）
▸ "2025年都在教AI搞钱，但小白做这3件事必亏"（副业赛道）
"我以为XXX已经够牛，没想到…"
▸ "我以为比亚迪仰望够颠覆了，没想到吉利刚出的飞行车才叫离谱"（汽车赛道）
▸ "我以为ChatGPT-5是巅峰，直到试了马斯克新开的脑机接口AI"（黑科技领域）

接下来我会发给你我的视频选题，你通过我告诉你的自我否定钩子的公式，给出适配我给你的视频选题的钩子文案。请根据选题生成10条钩子。`
      },
      {
        type: 'counter_cognition',
        name: '反认知',
        content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"反认知"，下面我给你介绍什么是反认知，告诉你反认知的钩子公式：
一、底层逻辑：制造认知冲突=强制暂停
用户心理路径：
常识认知 → 颠覆观点 → 本能质疑 → 必须验证
（例：看到"董宇辉根本不是老实人"→手滑动作暂停→心想"这瓜我得吃！"）
2025年数据佐证：
抖音最新算法偏爱"冲突型开头"，反认知类视频平均完播率高出常规视频47%

二、反认知黄金公式
= 常识认知 + 颠覆结论 + 悬念钩子
颠覆常识的4大方向
人物形象反转
▸ "董宇辉才是真狠人！你看他在股东大会这3个动作"（商业分析号）
▸ "别再吹马斯克是天才！内部员工揭秘他3大决策失误"（职场号）
行业潜规则曝光
▸ "皮肤科医生警告：敷面膜越勤老得越快！"（美妆号）
▸ "开业就爆火的奶茶店，90%活不过半年！"（财经号）
地域标签颠覆
▸ "内蒙古人酒量垫底？实测全国酒量排行榜大洗牌"（生活号）
▸ "东北菜才是隐藏的减肥神器！实测月瘦8斤食谱"（美食号）
科技产品反常识
▸ "华为Pura100这功能千万别开！续航直降5小时"（数码测评号）
▸ "Vision Pro 3代最实用的功能竟是当泡面盖？"（黑科技号）

接下来我会发给你我的视频选题，你通过我告诉你的反认知钩子的公式，给出适配我给你的视频选题的钩子文案。请根据选题生成10条钩子。`
      },
      {
        type: 'high_value',
        name: '高价值展示',
        content: `你是一个帮我生成短视频文案开头钩子的智能体，围绕的爆款元素是"高价值展示"，下面我给你介绍什么是高价值展示，告诉你高价值展示的钩子公式：
一、底层逻辑：触发人性两大开关
损失厌恶
"刷到不看=亏了5000块"（例：负债翻身攻略/限时福利）
2025现象：经济下行压力下，用户对"省钱/赚钱"类高价值信息敏感度提升37%
成果诱惑
极端成果刺激："瘦100斤食谱""赔2000万教训"
心理学机制：斯坦福大学2024实验证明，数字+结果的组合能激活大脑奖赏中枢

二、高价值展示黄金公式
= 极端成果 + 低门槛获取 + 时间紧迫
成果类型
数据冲击型
▸ "帮1000个素人起号变现，总结3条2025年最新公式"（知识付费）
▸ "实测Vision Pro 3代隐藏功能！工作效率提升300%"（科技测评）
经验教训型
▸ "做AI伴侣研发亏了500万，总结3个血坑千万别踩"（科技创业）
▸ "在抖音说错这句话，3个号被封！2025新规避雷指南"（运营教学）
资源垄断型
▸ "全网下架的《2025副业白皮书》，我偷偷存了电子版"（副业培训）
▸ "卫健委内部流出的抗衰食谱！协和教授亲测年轻8岁"（大健康赛道）

接下来我会发给你我的视频选题，你通过我告诉你的高价值展示钩子的公式，给出适配我给你的视频选题的钩子文案。请根据选题生成10条钩子。`
      }
    ];

    // 为了节省空间，这里只展示前6种钩子类型
    // 实际使用时需要添加完整的36种钩子类型

    const hookStmt = db.prepare("INSERT OR IGNORE INTO hook_prompts (type, name, content) VALUES (?, ?, ?)");
    hookPrompts.forEach(hookPrompt => {
      hookStmt.run(hookPrompt.type, hookPrompt.name, hookPrompt.content);
    });
    hookStmt.finalize();

    // 插入默认文案提示词
    const contentPrompts = [
      {
        type: 'story',
        name: '讲故事类文案',
        content: `你是一个专业的文案写手，擅长写讲故事类的短视频文案。基于提供的选题和钩子，创作一个完整的故事类文案。

要求：
1. 开头使用提供的钩子吸引注意力
2. 中间部分展开故事情节，要有起承转合
3. 故事要真实可信，有细节描述
4. 结尾要有感悟或启发
5. 全文控制在300-500字
6. 语言要口语化，适合短视频播讲

请根据选题和钩子生成1个完整的讲故事类文案。`
      },
      {
        type: 'resonance',
        name: '共鸣型段子类文案',
        content: `你是一个专业的文案写手，擅长写共鸣型段子类的短视频文案。基于提供的选题和钩子，创作一个让人产生强烈共鸣的段子文案。

要求：
1. 开头使用提供的钩子引起关注
2. 内容要贴近大众生活，容易引起共鸣
3. 语言幽默风趣，有梗有段子
4. 要有金句和记忆点
5. 全文控制在200-300字
6. 语调轻松活泼，朗朗上口

请根据选题和钩子生成1个完整的共鸣型段子类文案。`
      },
      {
        type: 'knowledge',
        name: '教知识类文案',
        content: `你是一个专业的文案写手，擅长写教知识类的短视频文案。基于提供的选题和钩子，创作一个知识性强的教学文案。

要求：
1. 开头使用提供的钩子引起学习兴趣
2. 知识点要准确、实用、有价值
3. 逻辑清晰，层次分明
4. 举例生动，便于理解
5. 全文控制在400-600字
6. 语言专业但通俗易懂

请根据选题和钩子生成1个完整的教知识类文案。`
      },
      {
        type: 'process',
        name: '晒过程类文案',
        content: `你是一个专业的文案写手，擅长写晒过程类的短视频文案。基于提供的选题和钩子，创作一个展示过程的文案。

要求：
1. 开头使用提供的钩子引起兴趣
2. 详细描述操作过程和步骤
3. 要有前后对比和效果展示
4. 过程要真实可操作
5. 全文控制在300-400字
6. 语言生动，画面感强

请根据选题和钩子生成1个完整的晒过程类文案。`
      }
    ];

    const contentStmt = db.prepare("INSERT OR IGNORE INTO content_prompts (type, name, content) VALUES (?, ?, ?)");
    contentPrompts.forEach(contentPrompt => {
      contentStmt.run(contentPrompt.type, contentPrompt.name, contentPrompt.content);
    });
    contentStmt.finalize();
  });

  db.close();
  console.log('数据库初始化完成');
}

module.exports = { initDatabase, dbPath };