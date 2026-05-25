import { CHAMP_POOL, SHOP_ODDS, XP_TABLE, BASE_ITEMS, RECIPES, SYN_TIERS } from './data.js';
import { GAME, initPool } from './state.js';
import { initBoard, updateUI, showBigMsg, showMergeFX } from './ui.js';

// 将 XP_TABLE 挂载到全局供 ui.js 读取
window.XP_TABLE_REF = XP_TABLE;

let combatTimer = null;
let combatTickCount = 0;

function pickFromPool(cost) {
    let pool = CHAMP_POOL.filter(c => c.c === cost && GAME.pool[c.bId] > 0);
    if(pool.length === 0) {
        pool = CHAMP_POOL.filter(c => GAME.pool[c.bId] > 0);
        if(pool.length === 0) return null;
    }
    let total = pool.reduce((s,c)=>s+GAME.pool[c.bId], 0);
    let r = Math.random() * total;
    for(let c of pool) {
        r -= GAME.pool[c.bId];
        if(r <= 0) return c;
    }
    return pool[0];
}

function rollShop(payCost) {
    if(payCost) {
        if(GAME.gold < 2 || GAME.inCombat) return;
        GAME.gold -= 2;
    }
    GAME.shop = [];
    let odds = SHOP_ODDS[Math.min(9, GAME.level)];
    for(let i=0; i<5; i++) {
        let r = Math.random() * 100;
        let cost = 1, acc = 0;
        for(let j=0; j<5; j++) {
            acc += odds[j];
            if(r <= acc) { cost = j+1; break; }
        }
        let pick = pickFromPool(cost);
        GAME.shop.push(pick);
    }
    GAME.shopLocked = false;
    updateUI();
}

function toggleShopLock() {
    if(GAME.inCombat) return;
    GAME.shopLocked = !GAME.shopLocked;
    updateUI();
}

function buyChampion(idx) {
    if(GAME.inCombat) return;
    let t = GAME.shop[idx];
    if(!t || GAME.gold < t.c) return;
    
    let sameUnits = [];
    GAME.board.forEach((c,i) => { if(c && c.bId === t.bId && c.star === 0) sameUnits.push({l:'board',i}); });
    GAME.bench.forEach((c,i) => { if(c && c.bId === t.bId && c.star === 0) sameUnits.push({l:'bench',i}); });
    let willMerge = sameUnits.length >= 2;

    let bIdx = GAME.bench.findIndex(x => x === null);
    let boardIdx = GAME.board.findIndex(x => x === null);
    let canAutoDeploy = !willMerge && boardIdx !== -1 && GAME.board.filter(c => c).length < GAME.level;
    if(bIdx === -1 && !willMerge && !canAutoDeploy) {
        showBigMsg('备战席已满', '拖拽出售或上阵角色', 900);
        return;
    }

    GAME.gold -= t.c;
    if(GAME.pool[t.bId] !== undefined) GAME.pool[t.bId]--;
    GAME.shop[idx] = null;

    let evo = t.evos[0];
    let unit = {
        bId: t.bId, template: t, star: 0,
        name: evo.n, img: evo.i, hp: evo.h, maxHp: evo.h, atk: evo.a,
        mana: 0, maxMana: 100, items: [], totalCost: t.c, itemBonus: {}
    };

    if(canAutoDeploy) {
        GAME.board[boardIdx] = unit;
    } else if(willMerge) {
        if(bIdx !== -1) GAME.bench[bIdx] = unit;
        else GAME.bench.push(unit);
    } else {
        GAME.bench[bIdx] = unit;
    }

    checkMerge(t.bId);
    while(GAME.bench.length > 9) {
        let idx2 = GAME.bench.lastIndexOf(null);
        if(idx2 >= 9) GAME.bench.splice(idx2, 1);
        else break;
    }
    updateUI();
}

function checkMerge(bId) {
    let starLevel = 0;
    while(starLevel < 4) {
        let found = [];
        GAME.board.forEach((c,i) => { if(c && c.bId === bId && c.star === starLevel) found.push({l:'board',i}); });
        GAME.bench.forEach((c,i) => { if(c && c.bId === bId && c.star === starLevel) found.push({l:'bench',i}); });
        if(found.length < 3) break;

        let keep = found[0];
        let keepArr = keep.l === 'board' ? GAME.board : GAME.bench;
        let keepUnit = keepArr[keep.i];
        let allItems = [...(keepUnit.items||[])];
        for(let j=1; j<3; j++) {
            let f = found[j];
            let arr = f.l === 'board' ? GAME.board : GAME.bench;
            allItems = allItems.concat(arr[f.i].items || []);
            arr[f.i] = null;
        }
        
        keepUnit.star++;
        let nextEvo = keepUnit.template.evos[keepUnit.star];
        keepUnit.name = nextEvo.n;
        keepUnit.img = nextEvo.i;
        keepUnit.maxHp = nextEvo.h;
        keepUnit.hp = nextEvo.h;
        keepUnit.atk = nextEvo.a;
        keepUnit.totalCost = keepUnit.totalCost * 3;
        keepUnit.items = allItems.slice(0, 3);

        if(allItems.length > 3) allItems.slice(3).forEach(it => GAME.inventory.push(it));
        recalcItemBonus(keepUnit);
        showMergeFX(keep.l + '-slot-' + keep.i);

        starLevel++;
    }
}

function allowDrop(ev) { ev.preventDefault(); ev.currentTarget.classList.add('drag-over'); }
function drag(ev, type, idx) {
    if(GAME.inCombat) { ev.preventDefault(); return; }
    ev.dataTransfer.setData('srcType', type);
    ev.dataTransfer.setData('srcIndex', idx);
    if(type === 'board' || type === 'bench') document.getElementById('sell-zone').classList.add('active');
}

function drop(ev, destType, destIdx) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over');
    if(GAME.inCombat) return;

    let srcType = ev.dataTransfer.getData('srcType');
    let srcIdx = parseInt(ev.dataTransfer.getData('srcIndex'));

    if(srcType === 'item') {
        let item = GAME.inventory[srcIdx];
        if(!item) return;

        if(destType === 'inventory-item') {
            let destItem = GAME.inventory[destIdx];
            if(srcIdx === destIdx || !destItem) return;
            let combined = combineItems(item, destItem);
            if(combined) {
                let lo = Math.min(srcIdx, destIdx);
                let hi = Math.max(srcIdx, destIdx);
                GAME.inventory.splice(hi, 1);
                GAME.inventory.splice(lo, 1);
                GAME.inventory.push(combined);
                showBigMsg('装备合成', combined.name, 1000);
            }
            updateUI();
            return;
        }

        let unitArr = destType === 'board' ? GAME.board : (destType === 'bench' ? GAME.bench : null);
        if(!unitArr) return;
        let unit = unitArr[destIdx];
        if(unit && unit.items.length < 3) {
            unit.items.push(item);
            GAME.inventory.splice(srcIdx, 1);
            recalcItemBonus(unit);
            updateUI();
        }
        return;
    }

    if(srcType === 'board' || srcType === 'bench') {
        let srcArr = srcType === 'board' ? GAME.board : GAME.bench;
        
        if(destType === 'sell') {
            let u = srcArr[srcIdx]; if(!u) return;
            GAME.gold += Math.max(1, Math.floor(u.totalCost * 0.7));
            if(GAME.pool[u.bId] !== undefined) GAME.pool[u.bId] += Math.pow(3, u.star);
            if(u.items) u.items.forEach(it => GAME.inventory.push(it));
            srcArr[srcIdx] = null;
            updateUI();
            return;
        }

        let destArr = destType === 'board' ? GAME.board : GAME.bench;
        if(srcType === 'bench' && destType === 'board' && !destArr[destIdx]) {
            if(GAME.board.filter(c => c).length >= GAME.level) {
                showBigMsg('人口已满', '提升等级', 800);
                return;
            }
        }
        let tmp = destArr[destIdx];
        destArr[destIdx] = srcArr[srcIdx];
        srcArr[srcIdx] = tmp;
        updateUI();
    }
}

function combineItems(a, b) {
    if(a.type !== 'base' || b.type !== 'base') return null;
    let k1 = a.id + '_' + b.id, k2 = b.id + '_' + a.id;
    let r = RECIPES[k1] || RECIPES[k2];
    return r ? { id: a.id + '+' + b.id, ...r, type: 'advanced' } : null;
}

function recalcItemBonus(unit) {
    let b = { atk:0, ap:0, hp:0, armor:0, mr:0, as:0, crit:0, startMana:0 };
    (unit.items || []).forEach(it => { Object.entries(it.stats || {}).forEach(([k,v]) => { b[k] = (b[k]||0) + v; }); });
    unit.itemBonus = b;
}

function getSynergyCounts() {
    let counts = {};
    let seen = {};
    GAME.board.forEach(p => {
        if(!p) return;
        let typeKey = p.template.t + '_' + p.bId;
        let classKey = p.template.cls + '_' + p.bId;
        if(!seen[typeKey]) {
            seen[typeKey] = true;
            counts[p.template.t] = (counts[p.template.t] || 0) + 1;
        }
        if(!seen[classKey]) {
            seen[classKey] = true;
            counts[p.template.cls] = (counts[p.template.cls] || 0) + 1;
        }
    });
    return counts;
}

function getSynergyTier(key, count) {
    let tier = 0;
    (SYN_TIERS[key] || []).forEach((need, i) => { if(count >= need) tier = i + 1; });
    return tier;
}

function getSynergyBonuses() {
    let bonuses = { atkPct:0, hpPct:0, armor:0, mr:0, ap:0, as:0, crit:0, startMana:0, damageAmp:0, heal:0 };
    let active = {};
    Object.entries(getSynergyCounts()).forEach(([key, count]) => {
        let tier = getSynergyTier(key, count);
        if(!tier) return;
        active[key] = tier;
        if(key === 'fire') bonuses.atkPct += 0.12 * tier;
        if(key === 'water') { bonuses.startMana += 12 * tier; bonuses.ap += 8 * tier; }
        if(key === 'grass') bonuses.hpPct += 0.10 * tier;
        if(key === 'electric') { bonuses.as += 0.12 * tier; bonuses.crit += 0.06 * tier; }
        if(key === 'ghost') bonuses.crit += 0.10 * tier;
        if(key === 'dragon') { bonuses.damageAmp += 0.08 * tier; bonuses.hpPct += 0.06 * tier; }
        if(key === 'tank') { bonuses.armor += 18 * tier; bonuses.mr += 12 * tier; }
        if(key === 'assassin') bonuses.crit += 0.12 * tier;
        if(key === 'fighter') { bonuses.atkPct += 0.08 * tier; bonuses.hpPct += 0.08 * tier; }
        if(key === 'marksman') bonuses.as += 0.16 * tier;
        if(key === 'mage') bonuses.ap += 14 * tier;
        if(key === 'support') { bonuses.heal += 16 * tier; bonuses.startMana += 8 * tier; }
    });
    GAME.activeSynergies = active;
    return bonuses;
}

function applyCombatStats(unit, bonuses = {}) {
    let evo = unit.template.evos[unit.star];
    let item = unit.itemBonus || {};
    unit.bonusStats = bonuses;
    unit.maxHp = Math.floor((evo.h + (item.hp || 0)) * (1 + (bonuses.hpPct || 0)));
    unit.hp = unit.maxHp;
    unit.atk = Math.floor((evo.a + (item.atk || 0)) * (1 + (bonuses.atkPct || 0)));
    unit.ap = (item.ap || 0) + (bonuses.ap || 0);
    unit.armor = 20 + (item.armor || 0) + (bonuses.armor || 0);
    unit.mr = 20 + (item.mr || 0) + (bonuses.mr || 0);
    unit.attackSpeed = 1 + (item.as || 0) + (bonuses.as || 0);
    unit.crit = Math.min(0.75, (item.crit || 0) + (bonuses.crit || 0));
    unit.damageAmp = bonuses.damageAmp || 0;
    unit.teamHeal = bonuses.heal || 0;
    unit.mana = Math.min(100, (item.startMana || 0) + (bonuses.startMana || 0));
    unit.maxMana = 100;
    unit.attackMeter = 0.65;
}

function toggleSpeed() {
    let speeds = [1, 2, 3, 4];
    let cur = speeds.indexOf(GAME.speed);
    GAME.speed = speeds[(cur+1) % speeds.length];
    if(combatTimer) {
        clearInterval(combatTimer);
        combatTimer = setInterval(combatTick, 600 / GAME.speed);
    }
    updateUI();
}

function generateEnemyTeam() {
    GAME.enemy.fill(null);
    let stage = (GAME.stage - 1) * 5 + GAME.sub;
    
    // 削弱1：敌方数量增长变慢 (原本是 /2，现在是 /2.5)
    let count = Math.min(9, 1 + Math.floor(stage / 2.5)); 
    
    // 削弱2：敌方抽卡质量下降
    let avgCost = Math.min(5, 1 + Math.floor(stage / 4));
    
    // 削弱3：推迟敌方升星的节奏（原本第6回合就2星，现在推迟到第9回合即2-4才出2星）
    let star = stage >= 18 ? 2 : (stage >= 9 ? 1 : 0);
    
    let positions = [];
    for(let i=0; i<13; i++) positions.push(i);
    positions.sort(() => Math.random() - 0.5);
    
    for(let i=0; i<count; i++) {
        let pool = CHAMP_POOL.filter(c => Math.abs(c.c - avgCost) <= 1);
        let tpl = pool[Math.floor(Math.random() * pool.length)];
        let evo = tpl.evos[star];
        let pos = positions[i];
        GAME.enemy[pos] = {
            isEnemy: true, bId: tpl.bId, template: tpl, star: star,
            name: evo.n, img: evo.i,
            // 削弱4：敌方血量和攻击力成长削减一半
            hp: evo.h * (1 + (GAME.stage - 1) * 0.05), 
            maxHp: evo.h * (1 + (GAME.stage - 1) * 0.05),
            atk: evo.a * (1 + (GAME.stage - 1) * 0.02),
            armor: 20 + GAME.stage, mr: 20 + GAME.stage,
            attackSpeed: 1, crit: 0.05, ap: 0, damageAmp: 0,
            mana: 0, maxMana: 100, attackMeter: 0.5, items: [], itemBonus: {}
        };
    }
}

function startCombat() {
    if(GAME.inCombat) return;
    let curPop = GAME.board.filter(c => c).length;
    if(curPop === 0) return;

    GAME.inCombat = true;
    combatTickCount = 0;
    GAME.stats = {};
    document.getElementById('round-timer-fill').style.width = '100%';
    
    let synergyBonuses = getSynergyBonuses();
    GAME.board.forEach((c, i) => {
        if(!c) return;
        applyCombatStats(c, synergyBonuses);
        GAME.stats[i] = { name: c.name, dmg: 0 };
    });

    generateEnemyTeam();
    showBigMsg('ROUND START', `STAGE ${GAME.stage}-${GAME.sub}`, 1200);
    updateUI();
    
    combatTimer = setInterval(combatTick, 600 / GAME.speed);
}

function combatTick() {
    combatTickCount++;
    let pAlive = GAME.board.filter((c,i) => c && c.hp > 0).length;
    let eAlive = GAME.enemy.filter((c,i) => c && c.hp > 0).length;

    if(pAlive === 0 || eAlive === 0 || combatTickCount > 60) {
        clearInterval(combatTimer); combatTimer = null;
        GAME.inCombat = false;
        setTimeout(() => endCombat(pAlive > 0 && eAlive === 0), 600);
        return;
    }

    GAME.board.forEach((c, i) => {
        if(!c || c.hp <= 0) return;
        c.attackMeter = (c.attackMeter || 0) + (c.attackSpeed || 1);
        let swings = 0;
        while(c.attackMeter >= 1 && swings < 2) {
            c.attackMeter -= 1;
            executeAttack(i, GAME.board, GAME.enemy, false);
            swings++;
        }
    });
    GAME.enemy.forEach((c, i) => {
        if(!c || c.hp <= 0) return;
        c.attackMeter = (c.attackMeter || 0) + (c.attackSpeed || 1);
        let swings = 0;
        while(c.attackMeter >= 1 && swings < 2) {
            c.attackMeter -= 1;
            executeAttack(i, GAME.enemy, GAME.board, true);
            swings++;
        }
    });
    document.getElementById('round-timer-fill').style.width = Math.max(0, 100 - combatTickCount / 60 * 100) + '%';
    
    updateUI(); // 只渲染变化的状态
}

function executeAttack(idx, atts, defs, isEnemy) {
    let attacker = atts[idx];
    if(!attacker || attacker.hp <= 0) return;

    let aliveDefs = [];
    defs.forEach((c, i) => { if(c && c.hp > 0) aliveDefs.push({c, i}); });
    if(aliveDefs.length === 0) return;

    aliveDefs.sort((a,b) => a.c.hp - b.c.hp);
    let target = aliveDefs[0];

    let baseDmg = attacker.atk * (1 + (attacker.damageAmp || 0));
    let isCrit = Math.random() < (attacker.crit || attacker.itemBonus?.crit || 0);
    if(isCrit) baseDmg *= 1.5;
    let armor = target.c.armor ?? (20 + (target.c.itemBonus?.armor || 0));
    let mitigation = armor / (armor + 100);
    let dmg = Math.floor(baseDmg * (1 - mitigation));
    
    target.c.hp -= dmg;
    attacker.mana = Math.min(attacker.maxMana, (attacker.mana||0) + 18);

    if(!isEnemy && GAME.stats[idx]) GAME.stats[idx].dmg += dmg;
    if(attacker.mana >= attacker.maxMana) {
        attacker.mana = 0;
        castAbility(idx, attacker, target.i, defs, isEnemy);
    }

    let aSlot = document.getElementById(`${isEnemy?'enemy':'board'}-slot-${idx}`);
    let tSlot = document.getElementById(`${isEnemy?'board':'enemy'}-slot-${target.i}`);
    if(aSlot && tSlot) {
        let aChamp = aSlot.querySelector('.champion');
        if(aChamp) {
            aChamp.classList.add('attacking');
            setTimeout(() => aChamp.classList.remove('attacking'), 300);
        }
        let r1 = aSlot.getBoundingClientRect(), r2 = tSlot.getBoundingClientRect();
        let p = document.createElement('div');
        p.className = 'projectile';
        let typeColor = `var(--${attacker.template.t})`;
        p.style.setProperty('--proj-color', typeColor);
        p.style.left = (r1.left + r1.width/2) + 'px';
        p.style.top = (r1.top + r1.height/2) + 'px';
        document.getElementById('fx-layer').appendChild(p);
        setTimeout(() => {
            p.style.left = (r2.left + r2.width/2) + 'px';
            p.style.top = (r2.top + r2.height/2) + 'px';
        }, 20);
        setTimeout(() => {
            let dt = document.createElement('div');
            dt.className = 'dmg-text' + (isCrit ? ' crit' : '');
            dt.textContent = (isCrit ? '💥' : '') + dmg;
            dt.style.left = (r2.left + r2.width/2) + 'px';
            dt.style.top = (r2.top + r2.height/3) + 'px';
            document.getElementById('fx-layer').appendChild(dt);
            setTimeout(() => dt.remove(), 1000);
            p.remove();
        }, 250 / GAME.speed);
    }
}

function castAbility(idx, attacker, targetIdx, defs, isEnemy) {
    let target = defs[targetIdx];
    if(!target || target.hp <= 0) return;
    let power = Math.floor(attacker.atk * 0.7 + (attacker.ap || 0) * 2.2 + 35 * (attacker.star + 1));
    let isMage = attacker.template.cls === 'mage';
    let isAssassin = attacker.template.cls === 'assassin';
    let isTank = attacker.template.cls === 'tank';
    let isSupport = attacker.template.cls === 'support';
    let dmg = isTank ? Math.floor(power * 0.55) : power;
    if(isMage) dmg = Math.floor(power * 1.25);
    if(isAssassin && target.hp / target.maxHp < 0.45) dmg = Math.floor(power * 1.45);
    target.hp -= dmg;
    if(!isEnemy && GAME.stats[idx]) GAME.stats[idx].dmg += Math.max(0, dmg);

    let allies = isEnemy ? GAME.enemy : GAME.board;
    if(isTank || isSupport || attacker.teamHeal) {
        let heal = Math.floor((isSupport ? 80 : 35) + (attacker.ap || 0) + (attacker.teamHeal || 0));
        let low = allies.filter(u => u && u.hp > 0).sort((a,b) => (a.hp/a.maxHp) - (b.hp/b.maxHp))[0];
        if(low) low.hp = Math.min(low.maxHp, low.hp + heal);
    }

    floatText(`${isEnemy ? 'enemy' : 'board'}-slot-${idx}`, attacker.template.skill, 'skill-text');
    floatText(`${isEnemy ? 'board' : 'enemy'}-slot-${targetIdx}`, dmg, 'dmg-text skill');
}

function floatText(slotId, text, className) {
    let slot = document.getElementById(slotId);
    let layer = document.getElementById('fx-layer');
    if(!slot || !layer) return;
    let r = slot.getBoundingClientRect();
    let el = document.createElement('div');
    el.className = className;
    el.textContent = text;
    el.style.left = (r.left + r.width / 2) + 'px';
    el.style.top = (r.top + r.height / 3) + 'px';
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function endCombat(win) {
    let goldReward = 5;
    let interest = Math.min(5, Math.floor(GAME.gold / 10));
    let streakBonus = 0;

    if(win) {
        if(GAME.streak >= 0) GAME.streak++; else GAME.streak = 1;
        if(GAME.streak >= 3) streakBonus = Math.min(3, Math.floor(GAME.streak / 2));
        showBigMsg('VICTORY', `+${goldReward + 1 + interest + streakBonus} 💰`, 1500, 'victory');
        GAME.gold += goldReward + 1 + interest + streakBonus; 
    } else {
        if(GAME.streak <= 0) GAME.streak--; else GAME.streak = -1;
        if(GAME.streak <= -3) streakBonus = Math.min(3, Math.floor(-GAME.streak / 2));
        let aliveEnemies = GAME.enemy.filter(c => c && c.hp > 0).length;
        let damage = aliveEnemies * 2 + GAME.stage * 2;
        GAME.hp -= damage;
        showBigMsg('DEFEAT', `-${damage} HP`, 1500, 'defeat');
        GAME.gold += goldReward + interest + streakBonus;
    }

    let pveRound = (GAME.sub === 1) || (GAME.stage === 1 && GAME.sub === 5);
    if(win && (pveRound || Math.random() < 0.15)) {
        let keys = Object.keys(BASE_ITEMS);
        let it = BASE_ITEMS[keys[Math.floor(Math.random()*keys.length)]];
        GAME.inventory.push({...it});
    }

    if(GAME.hp <= 0) {
        showBigMsg('GAME OVER', `第 ${GAME.stage}-${GAME.sub} 阶段战败<br><button onclick="location.reload()" class="restart-btn">重新开始</button>`, 99999, 'defeat');
        GAME.inCombat = true; 
        return;
    }

    GAME.sub++;
    if(GAME.sub > 5) { GAME.sub = 1; GAME.stage++; }

    GAME.xp += 2;
    while(GAME.level < 9 && GAME.xp >= XP_TABLE[GAME.level]) {
        GAME.xp -= XP_TABLE[GAME.level];
        GAME.level++;
    }

    GAME.enemy.fill(null);
    GAME.board.forEach(c => { if(c) { c.hp = c.maxHp; c.mana = c.itemBonus.startMana || 0; }});
    document.getElementById('fx-layer').innerHTML = '';
    document.getElementById('round-timer-fill').style.width = '100%';

    if(!GAME.shopLocked) rollShop(false);
    updateUI();
}

function buyXP() {
    if(GAME.gold < 4 || GAME.level >= 9 || GAME.inCombat) return;
    GAME.gold -= 4;
    GAME.xp += 4;
    while(GAME.level < 9 && GAME.xp >= XP_TABLE[GAME.level]) {
        GAME.xp -= XP_TABLE[GAME.level];
        GAME.level++;
        showBigMsg('LEVEL UP!', `Lv.${GAME.level}`, 800);
    }
    updateUI();
}

// 绑定被内联 HTML 直接调用的核心逻辑函数到 Window 对象
window.buyXP = buyXP;
window.rollShop = rollShop;
window.startCombat = startCombat;
window.toggleSpeed = toggleSpeed;
window.toggleShopLock = toggleShopLock;
window.buyChampion = buyChampion;
window.drag = drag;
window.drop = drop;
window.allowDrop = allowDrop;

// 监听拖拽状态清理
document.addEventListener('dragleave', e => { if(e.target.classList) e.target.classList.remove('drag-over'); });
document.addEventListener('dragend', () => {
    document.getElementById('sell-zone').classList.remove('active');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
});

// 初始化入口
window.addEventListener('DOMContentLoaded', () => {
    initPool();
    initBoard();
    rollShop(false);
    GAME.inventory.push({...BASE_ITEMS.sword});
    GAME.inventory.push({...BASE_ITEMS.tear});
    updateUI();
});