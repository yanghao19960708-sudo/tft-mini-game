export const TYPE_NAME = { 
    fire:'火系', water:'水系', grass:'草系', electric:'电系', 
    ghost:'幽灵', dragon:'龙系', fighting:'格斗', ice:'冰系', normal:'普通',
    tank:'坦克', assassin:'刺客', fighter:'战士', marksman:'射手', mage:'法师', support:'辅助'
};

export const TYPE_ICON = {
    fire:'🔥', water:'💧', grass:'🌿', electric:'⚡', 
    ghost:'👻', dragon:'🐉', fighting:'👊', ice:'❄️', normal:'⚪',
    tank:'🛡', assassin:'🗡', fighter:'⚔', marksman:'🏹', mage:'✨', support:'💫'
};

export const SYN_TIERS = {
    fire: [2, 4, 6], water: [2, 4, 6], grass: [2, 4], electric: [2, 4],
    ghost: [2, 4, 6], dragon: [2, 3, 4], fighting: [2, 4], ice: [2], normal: [2],
    tank: [2, 4, 6], assassin: [2, 4], fighter: [2, 4, 6], marksman: [2, 4], mage: [2, 4, 6], support: [2]
};

export const BASE_ITEMS = { 
    sword: { id:'sword', icon:'🗡', name:'大剑', stats:{atk:15}, desc:'+15 攻击力', type:'base' },
    bow:   { id:'bow',   icon:'🏹', name:'反曲弓', stats:{as:0.15}, desc:'+15% 攻速', type:'base' },
    rod:   { id:'rod',   icon:'🪄', name:'灵气法杖', stats:{ap:15}, desc:'+15 法强', type:'base' },
    tear:  { id:'tear',  icon:'💧', name:'女神之泪', stats:{startMana:15}, desc:'+15 初始法力', type:'base' },
    armor: { id:'armor', icon:'🛡', name:'锁子甲', stats:{armor:20}, desc:'+20 护甲', type:'base' },
    cloak: { id:'cloak', icon:'🧥', name:'女神斗篷', stats:{mr:20}, desc:'+20 魔抗', type:'base' },
    belt:  { id:'belt',  icon:'🎀', name:'巨人腰带', stats:{hp:150}, desc:'+150 生命', type:'base' },
    glove: { id:'glove', icon:'🧤', name:'暴风大剑', stats:{crit:0.2}, desc:'+20% 暴击', type:'base' },
    spat:  { id:'spat',  icon:'✨', name:'金铲铲', stats:{}, desc:'神秘饰品', type:'base' }
};

export const RECIPES = {
    'sword_sword': { icon:'⚔️', name:'无尽之刃', stats:{atk:30, crit:0.3}, desc:'+30攻 +30%暴击' },
    'sword_bow':   { icon:'🌪', name:'巨人杀手', stats:{atk:25, as:0.15}, desc:'+25攻 +15%攻速' },
    'sword_rod':   { icon:'💀', name:'死亡之帽', stats:{atk:20, ap:25}, desc:'+20攻 +25法强' },
    'sword_tear':  { icon:'⚡', name:'破败王者', stats:{atk:25, startMana:15}, desc:'攻击回蓝' },
    'sword_armor': { icon:'🔱', name:'泰坦的决心', stats:{atk:15, armor:20}, desc:'平A堆攻击' },
    'sword_belt':  { icon:'🩸', name:'饮血剑', stats:{atk:25, hp:150}, desc:'伤害25%吸血' },
    'sword_glove': { icon:'🌟', name:'无尽暴击', stats:{atk:20, crit:0.4}, desc:'必暴击' },
    'bow_bow':     { icon:'🏹', name:'迅捷之刃', stats:{as:0.5}, desc:'+50%攻速' },
    'bow_rod':     { icon:'⚙️', name:'卢登的回响', stats:{as:0.15, ap:25}, desc:'技能溅射' },
    'bow_tear':    { icon:'🎭', name:'静谧', stats:{as:0.2, startMana:15}, desc:'攻击回蓝' },
    'bow_armor':   { icon:'⏳', name:'青龙刀', stats:{as:0.15, armor:20}, desc:'平A强化' },
    'rod_rod':     { icon:'📕', name:'拉巴顿的死亡之帽', stats:{ap:75}, desc:'+75法强' },
    'rod_tear':    { icon:'🌀', name:'宇宙脉冲', stats:{ap:25, startMana:15}, desc:'技能伤害+' },
    'rod_armor':   { icon:'⚜️', name:'幽梦之灵', stats:{ap:15, armor:20}, desc:'反伤护盾' },
    'tear_tear':   { icon:'🔋', name:'蓝霸符', stats:{startMana:30}, desc:'初始满蓝' },
    'armor_armor': { icon:'🛡', name:'石像鬼石板甲', stats:{armor:50}, desc:'+50护甲' },
    'armor_cloak': { icon:'⚔️', name:'凝魂挽歌', stats:{armor:25, mr:25}, desc:'减伤光环' },
    'cloak_cloak': { icon:'☁️', name:'女神之拥', stats:{mr:50}, desc:'+50魔抗' },
    'belt_belt':   { icon:'⛓', name:'狂徒铠甲', stats:{hp:300}, desc:'+300生命' },
    'belt_tear':   { icon:'🔮', name:'振奋盔甲', stats:{hp:150, startMana:15}, desc:'团队回蓝' },
    'glove_glove': { icon:'⚡', name:'狂战之力', stats:{crit:0.5, as:0.2}, desc:'狂暴攻击' },
    'glove_rod':   { icon:'🌌', name:'卢登的烈焰', stats:{ap:30, crit:0.2}, desc:'法术暴击' }
};

// ==========================================
// 重新定义二次元机能风角色池 (A.I.M.S 异化程序)
// ==========================================
export const CHAMP_POOL = [
    // ---------- 1费单位：底层的侦测/守卫协议 ----------
    { bId:'p001', c:1, t:'fire',     cls:'mage',     skill:'微熔粒子流', evos:[{n:'「火花」Prototype',h:550,a:38,i:'4'}, {n:'「炽光」Advanced',h:990,a:68,i:'5'}, {n:'「炽燃」解构者-MK3',h:1780,a:122,i:'6'}] },
    { bId:'p002', c:1, t:'water',    cls:'tank',     skill:'液态高压冲击', evos:[{n:'「激流」Security',h:680,a:28,i:'7'}, {n:'「潮汐」HeavyArmor',h:1224,a:50,i:'8'}, {n:'「沧海」要塞内核',h:2200,a:90,i:'9'}] },
    { bId:'p003', c:1, t:'grass',    cls:'mage',     skill:'生态基因采样', evos:[{n:'「萌芽」Collector',h:580,a:34,i:'1'}, {n:'「常青」Defender',h:1044,a:61,i:'2'}, {n:'「森罗」天幕母核',h:1880,a:110,i:'3'}] },
    { bId:'p004', c:1, t:'electric', cls:'marksman', skill:'脉冲电压瞬爆', evos:[{n:'高压「闪灵-01」',h:420,a:42,i:'172'}, {n:'超频「雷击-05」',h:756,a:76,i:'25'}, {n:'歼灭「鸣神终端」',h:1360,a:137,i:'26'}] },
    { bId:'p005', c:1, t:'ghost',    cls:'assassin', skill:'乱码幽匿入侵', evos:[{n:'「匿影」幽灵协议',h:480,a:50,i:'92'}, {n:'「噬魂」虚空逻辑',h:864,a:90,i:'93'}, {n:'「灾变」乱码天灾',h:1555,a:162,i:'94'}] },
    { bId:'p006', c:1, t:'dragon',   cls:'fighter',  skill:'时空重力坍缩', evos:[{n:'极维「幼龙」型',h:620,a:46,i:'147'}, {n:'溯流「翼龙」型',h:1116,a:82,i:'148'}, {n:'裂空「不灭神裔」',h:2010,a:148,i:'149'}] },

    // ---------- 2费单位：中枢执行/肃清程序 ----------
    { bId:'p013', c:2, t:'fire',     cls:'mage',     skill:'焚竭热能重踏', evos:[{n:'「灼烈」近接机兵',h:620,a:48,i:'255'}, {n:'「修罗」拳击核心',h:1116,a:86,i:'256'}, {n:'「寂灭」狂想业火',h:2010,a:155,i:'257'}] },
    { bId:'p014', c:2, t:'water',    cls:'marksman', skill:'湍流追踪飞弹', evos:[{n:'「深潜」侦察子机',h:580,a:55,i:'258'}, {n:'「漩涡」风暴重炮',h:1044,a:99,i:'259'}, {n:'「海神」深海主脑',h:1880,a:178,i:'260'}] },
    { bId:'p015', c:2, t:'grass',    cls:'tank',     skill:'高频叶脉裁决', evos:[{n:'「迅叶」猎杀芯片',h:720,a:42,i:'252'}, {n:'「风刃」死神协议',h:1296,a:76,i:'253'}, {n:'「世界树」守护矩阵',h:2333,a:137,i:'254'}] },
    { bId:'p017', c:2, t:'ghost',    cls:'assassin', skill:'精神脑波篡改', evos:[{n:'全息「诡音」人偶',h:520,a:62,i:'200'}, {n:'中枢「梦魇」巫女',h:936,a:112,i:'429'}, {n:'「不思议天灾」M',h:1685,a:201,i:'429'}] },
    { bId:'p022', c:2, t:'normal',   cls:'tank',     skill:'防御堆栈加固', evos:[{n:'稳定型「圆盾」',h:780,a:42,i:'113'}, {n:'稳态「防壁」中枢',h:1404,a:76,i:'113'}, {n:'「真理之门」守护者',h:2528,a:137,i:'242'}] },

    // ---------- 3费单位：高熵强袭回路 ----------
    { bId:'p025', c:3, t:'grass',    cls:'marksman', skill:'暴风孢子侵蚀', evos:[{n:'机能「毒刺-X」',h:600,a:75,i:'43'}, {n:'强袭「寄生」形态',h:1080,a:135,i:'44'}, {n:'「剧毒天幕」孢子天灾',h:1944,a:243,i:'45'}] },
    { bId:'p026', c:3, t:'electric', cls:'assassin', skill:'高危逻辑自爆', evos:[{n:'浮游「雷管」子机',h:560,a:78,i:'100'}, {n:'不稳定「电核」',h:1008,a:140,i:'101'}, {n:'「脉冲超新星」Alpha',h:1814,a:252,i:'101'}] },
    { bId:'p028', c:3, t:'water',    cls:'mage',     skill:'全息星轨爆发', evos:[{n:'微光「星核」信标',h:600,a:80,i:'120'}, {n:'天体「引力」偏振',h:1080,a:144,i:'121'}, {n:'「极星演化」终焉视界',h:1944,a:259,i:'121'}] },

    // ---------- 4费单位：高阶天灾/传奇解构者 ----------
    { bId:'p033', c:4, t:'ghost',    cls:'assassin', skill:'绝对零点斩击', evos:[{n:'灾厄「孤狼」型',h:850,a:120,i:'359'}, {n:'虚空「暗刃」型',h:1530,a:216,i:'359'}, {n:'「深渊宣告者」Ω-01',h:2754,a:389,i:'359'}] },
    { bId:'p034', c:4, t:'electric', cls:'marksman', skill:'天罚终焉雷击', evos:[{n:'高脉冲「荒兽」',h:900,a:115,i:'243'}, {n:'雷鸣「惩戒矩阵」',h:1620,a:207,i:'243'}, {n:'「神威」万雷天引终端',h:2916,a:373,i:'243'}] },
    { bId:'p035', c:4, t:'fire',     cls:'fighter',  skill:'灭世熔岩冲击', evos:[{n:'红莲「审判官」',h:1100,a:100,i:'244'}, {n:'「地核坍缩」重机',h:1980,a:180,i:'244'}, {n:'「寂灭圣裁」迦楼罗',h:3564,a:324,i:'244'}] },

    // ---------- 5费单位：不可直视的世界级禁忌代码 ----------
    { bId:'p037', c:5, t:'ghost',    cls:'mage',     skill:'精神天灾湮灭', evos:[{n:'神谕进化体「M-00」',h:1200,a:160,i:'150'}, {n:'至高「天意解码主脑」',h:2160,a:288,i:'150'}, {n:'「克苏鲁视界」神外之神',h:3888,a:518,i:'150'}] },
    { bId:'p038', c:5, t:'dragon',   cls:'fighter',  skill:'极维次元撕裂', evos:[{n:'古龙协议「空壳」',h:1400,a:140,i:'384'}, {n:'裂空「裁决界龙」',h:2520,a:252,i:'384'}, {n:'「破碎时空」终极裂空座',h:4536,a:454,i:'384'}] }
];

// 后续生成的 🧬超频· 与 🌌神化· 前缀保持自动扩展
CHAMP_POOL.forEach(c => {
    let last = c.evos[2];
    c.evos.push({ n:'🧬超频·'+last.n, h:Math.floor(last.h*1.8), a:Math.floor(last.a*1.8), i:last.i });
    c.evos.push({ n:'🌌神化·'+last.n, h:Math.floor(last.h*3.5), a:Math.floor(last.a*3.5), i:last.i });
});

export const SHOP_ODDS = {
    1: [100,  0,  0,  0,  0],
    2: [ 50, 30, 10, 10,  0], // 2级就有 30% 概率出 2费卡
    3: [ 40, 30, 20, 20,  0], // 3级就有 20% 概率出 3费卡
    4: [ 20, 30, 20, 20, 10], // 4级开始出 4费紫卡
    5: [ 15, 25, 25, 20, 15], // 5级开始出 5费金卡
    6: [ 10, 20, 20, 30, 20],
    7: [  5, 15, 20, 30, 30],
    8: [  5, 10, 15, 30, 40],
    9: [  0,  0, 10, 40, 50]
};
export const XP_TABLE = [0, 0, 2, 6, 10, 20, 36, 56, 80, 999];
export const SHOP_POOL_SIZE = { 1:29, 2:22, 3:18, 4:12, 5:10 };