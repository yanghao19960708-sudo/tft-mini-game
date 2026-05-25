import { TYPE_NAME, TYPE_ICON, SYN_TIERS } from './data.js';
import { GAME } from './state.js';

export function initBoard() {
    let html_e0 = '', html_e1 = '', html_p0 = '', html_p1 = '';
    for(let i=0; i<6; i++) html_e0 += `<div class="hex-slot enemy-row" id="enemy-slot-${i}"></div>`;
    for(let i=6; i<13; i++) html_e1 += `<div class="hex-slot enemy-row" id="enemy-slot-${i}"></div>`;
    for(let i=0; i<7; i++) html_p0 += `<div class="hex-slot" id="board-slot-${i}" ondrop="drop(event,'board',${i})" ondragover="allowDrop(event)"></div>`;
    for(let i=7; i<13; i++) html_p1 += `<div class="hex-slot" id="board-slot-${i}" ondrop="drop(event,'board',${i})" ondragover="allowDrop(event)"></div>`;
    document.getElementById('enemy-row-0').innerHTML = html_e0;
    document.getElementById('enemy-row-1').innerHTML = html_e1;
    document.getElementById('player-row-0').innerHTML = html_p0;
    document.getElementById('player-row-1').innerHTML = html_p1;

    let bench = '';
    for(let i=0; i<9; i++) bench += `<div class="bench-slot" id="bench-slot-${i}" ondrop="drop(event,'bench',${i})" ondragover="allowDrop(event)"></div>`;
    document.getElementById('bench-row').innerHTML = bench;

    renderInventory();
}

export function updateUI() {
    document.getElementById('player-hp').innerText = Math.max(0, Math.floor(GAME.hp));
    document.getElementById('gold-amt').innerText = GAME.gold;
    document.getElementById('stage-text').innerText = `${GAME.stage}-${GAME.sub}`;
    
    let curPop = GAME.board.filter(c => c !== null).length;
    document.getElementById('pop-current').innerText = curPop;
    document.getElementById('pop-max').innerText = GAME.level;
    document.getElementById('pop-current').style.color = curPop > GAME.level ? 'var(--pink)' : '#fff';
    document.getElementById('level-num').innerText = GAME.level;

    let xpMax = window.XP_TABLE_REF[GAME.level] || 1; 
    let xpPct = GAME.level >= 9 ? 100 : (GAME.xp / xpMax) * 100;
    document.getElementById('xp-bar-fill').style.width = xpPct + '%';
    
    let interest = Math.min(5, Math.floor(GAME.gold / 10));
    for(let i=1; i<=5; i++) {
        document.getElementById('ip-'+i).classList.toggle('active', i <= interest);
    }

    let streakStr = GAME.streak === 0 ? '0' : (GAME.streak > 0 ? '+'+GAME.streak : ''+GAME.streak);
    let streakIcon = GAME.streak > 0 ? '🔥' : (GAME.streak < 0 ? '💀' : '➖');
    document.getElementById('streak-text').innerText = streakStr;
    document.getElementById('streak-btn').firstChild.textContent = streakIcon + ' ';

    document.getElementById('btn-combat').disabled = GAME.inCombat || curPop === 0;
    document.getElementById('btn-combat').classList.toggle('combat', GAME.inCombat);
    document.getElementById('btn-combat').textContent = GAME.inCombat ? '战斗中…' : '开始接战';
    document.getElementById('btn-roll').disabled = GAME.inCombat || GAME.gold < 2;
    document.getElementById('btn-exp').disabled = GAME.inCombat || GAME.gold < 4 || GAME.level >= 9;
    let lockBtn = document.getElementById('btn-lock');
    if(lockBtn) {
        lockBtn.classList.toggle('active', GAME.shopLocked);
        lockBtn.disabled = GAME.inCombat;
        document.getElementById('lock-text').innerText = GAME.shopLocked ? '已锁定' : '锁定商店';
        lockBtn.querySelector('.cost').innerText = GAME.shopLocked ? '🔒' : '🔓';
    }
    document.getElementById('speed-text').innerText = GAME.speed + 'X';

    document.getElementById('board-stack').classList.toggle('in-combat', GAME.inCombat);

    renderShop();
    renderUnits();
    renderInventory();
    renderStats();
    renderSynergies();
}

function renderUnits() {
    for(let i=0; i<14; i++) renderSingle(`board-slot-${i}`, GAME.board[i], 'board', i, false);
    for(let i=0; i<9; i++) renderSingle(`bench-slot-${i}`, GAME.bench[i], 'bench', i, false);
    for(let i=0; i<14; i++) renderSingle(`enemy-slot-${i}`, GAME.enemy[i], 'enemy', i, true);
}

function renderSingle(elId, u, type, idx, isEnemy) {
    let el = document.getElementById(elId);
    if(!el) return;
    el.innerHTML = '';
    if(!u || u.hp <= 0) return;

    let pct = (u.hp / u.maxHp) * 100;
    let manaPct = u.mana ? Math.min(100, (u.mana / (u.maxMana||100)) * 100) : 0;
    let starClass = 's' + Math.min(5, u.star + 1);
    let stars = '★'.repeat(u.star + 1);
    let imgSrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${u.img}.png`;

    let itemsHtml = '';
    if(u.items && u.items.length) {
        u.items.forEach(it => itemsHtml += `<div class="item-mini" title="${it.name}">${it.icon}</div>`);
    }

    let typeColor = `var(--${u.template ? u.template.t : 'normal'})`;
    let costColor = `var(--c${u.template ? u.template.c : 1})`;

    /* 核心修改：新增悬浮的身价(totalCost)可视化标签 */
    let costBadgeHtml = !isEnemy ? `<div class="cost-badge" style="color:${costColor}; border-color:${costColor}; text-shadow: 0 0 6px ${costColor};">💎${u.totalCost}</div>` : '';

    el.innerHTML = `
        <div class="champion ${!isEnemy?'draggable':''} ${isEnemy?'enemy':''}" 
             style="--unit-color: ${costColor}"
             draggable="${!isEnemy && !GAME.inCombat}" 
             ondragstart="drag(event,'${type}',${idx})"
             onmouseenter="showTooltip(event, ${idx}, '${type}')"
             onmouseleave="hideTooltip()">
            ${costBadgeHtml}
            <div class="stars ${starClass}">${stars}</div>
            <div class="hp-bar"><div class="hp-fill" style="width:${pct}%"></div></div>
            <div class="mana-bar"><div class="mana-fill" style="width:${manaPct}%"></div></div>
            <div class="champion-img-wrap">
                <img src="${imgSrc}" onerror="this.style.opacity=0.2">
            </div>
            <div class="items">${itemsHtml}</div>
        </div>`;
}

function renderShop() {
    let el = document.getElementById('shop-cards');
    el.innerHTML = '';
    GAME.shop.forEach((c, idx) => {
        if(!c) {
            el.innerHTML += `<div class="hero-card empty"></div>`;
            return;
        }
        let canBuy = GAME.gold >= c.c;
        let trait1 = `<div class="trait-pill" style="color:var(--${c.t})"><span class="dot" style="background:var(--${c.t})"></span>${TYPE_NAME[c.t]}</div>`;
        let trait2 = `<div class="trait-pill" style="color:var(--${c.cls})"><span class="dot" style="background:var(--${c.cls})"></span>${TYPE_NAME[c.cls]}</div>`;
        el.innerHTML += `
            <div class="hero-card cost-${c.c} ${!canBuy?'too-poor':''} ${GAME.shopLocked?'locked':''}" 
                 style="--card-color: var(--c${c.c}); --card-glow: var(--c${c.c});"
                 onclick="buyChampion(${idx})">
                <div class="cost-strip"></div>
                <div class="traits">${trait1}${trait2}</div>
                <div class="price-tag" style="color: var(--c${c.c})">💎${c.c}</div>
                <div class="hero-img-wrap">
                    <img class="hero-img" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${c.evos[0].i}.png" onerror="this.style.opacity=0.3">
                </div>
                <div class="name-strip">${c.evos[0].n}</div>
            </div>`;
    });
}

function renderInventory() {
    let el = document.getElementById('inventory-grid');
    el.innerHTML = '';
    for(let i=0; i<10; i++) {
        let it = GAME.inventory[i];
        if(it) {
            el.innerHTML += `<div class="item-slot has-item ${it.type==='advanced'?'advanced':''}"
                draggable="true"
                ondragstart="drag(event,'item',${i})"
                ondrop="drop(event,'inventory-item',${i})"
                ondragover="allowDrop(event)"
                onmouseenter="showItemTooltip(event,${i})"
                onmouseleave="hideTooltip()">${it.icon}</div>`;
        } else {
            el.innerHTML += `<div class="item-slot"></div>`;
        }
    }
}

function renderStats() {
    let el = document.getElementById('stats-area');
    el.innerHTML = '';
    let entries = Object.values(GAME.stats).filter(s => s && s.name);
    if(entries.length === 0) {
        el.innerHTML = `<div style="text-align:center; color:var(--text-dim); font-size:12px; padding:20px;">>> 待机中... <<</div>`;
        return;
    }
    entries.sort((a,b) => b.dmg - a.dmg);
    let max = entries[0].dmg || 1;
    entries.forEach(s => {
        let pct = (s.dmg / max) * 100;
        el.innerHTML += `
            <div class="stat-line">
                <div class="stat-row">
                    <span class="stat-name">${s.name}</span>
                    <span class="stat-val">${s.dmg}</span>
                </div>
                <div class="stat-bar-bg"><div class="stat-bar" style="width:${pct}%"></div></div>
            </div>`;
    });
}

function renderSynergies() {
    let el = document.getElementById('syn-list');
    let counts = {};
    let traits = {};
    GAME.board.forEach(p => {
        if(!p) return;
        let key1 = p.template.t + '_' + p.bId;  
        let key2 = p.template.cls + '_' + p.bId;
        if(!traits[key1]) { traits[key1] = true; counts[p.template.t] = (counts[p.template.t]||0) + 1; }
        if(!traits[key2]) { traits[key2] = true; counts[p.template.cls] = (counts[p.template.cls]||0) + 1; }
    });

    let html = '';
    let entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    if(entries.length === 0) {
        el.innerHTML = `<div style="text-align:center; color:var(--text-dim); font-size:11px; padding:30px 4px;">部署角色以激活羁绊回路</div>`;
        return;
    }

    entries.forEach(([k, n]) => {
        let tiers = SYN_TIERS[k] || [];
        let tier = 0;
        for(let i = tiers.length - 1; i >= 0; i--) {
            if(n >= tiers[i]) { tier = i + 1; break; }
        }
        let nextTier = tiers.find(t => t > n);
        let pipsHtml = '';
        let maxTier = tiers[tiers.length-1] || 2;
        for(let i = 1; i <= maxTier; i++) {
            let cls = '';
            if(i <= n) cls = 'active';
            else if(nextTier && i === nextTier) cls = 'next';
            pipsHtml += `<div class="syn-pip ${cls}"></div>`;
        }
        let progress = nextTier ? `${n}/${nextTier}` : `${n} ★`;
        html += `
            <div class="syn-card tier-${tier}" style="color:var(--${k})">
                <div class="syn-icon">${TYPE_ICON[k] || '?'}</div>
                <div class="syn-info">
                    <div class="syn-name">${TYPE_NAME[k] || k}</div>
                    <div class="syn-progress" style="margin-top: 4px;">
                        <div class="syn-pips">${pipsHtml}</div>
                        <span style="margin-left:auto;color:var(--text-mid)">${progress}</span>
                    </div>
                    ${tier ? `<div class="syn-bonus">羁绊 ${tier} 阶已生效</div>` : ''}
                </div>
            </div>`;
    });
    el.innerHTML = html;
}

export function showTooltip(ev, idx, type) {
    let arr = type === 'board' ? GAME.board : (type === 'bench' ? GAME.bench : GAME.enemy);
    let u = arr[idx]; if(!u) return;
    let tt = document.getElementById('tooltip');
    let evo = u.template.evos[u.star];
    let baseAtk = evo.a;
    let totalAtk = u.atk || baseAtk;
    let bonus = u.itemBonus || {};
    let itemList = u.items && u.items.length ? '<div class="tt-skill" style="margin-top: 10px;">'+u.items.map(it=>`${it.icon} ${it.name}`).join(' · ')+'</div>' : '';
    
    tt.innerHTML = `
        <div class="tt-name" style="font-size: 16px; margin-bottom: 8px;">${'★'.repeat(u.star+1)} ${u.name}</div>
        <div class="tt-traits">
            <span class="tt-trait" style="color:var(--${u.template.t})">${TYPE_ICON[u.template.t]} ${TYPE_NAME[u.template.t]}</span>
            <span class="tt-trait" style="color:var(--${u.template.cls})">${TYPE_ICON[u.template.cls]} ${TYPE_NAME[u.template.cls]}</span>
        </div>
        <div class="tt-stats" style="margin-top: 8px;">
            <span class="tt-stat-label">生命</span><span class="tt-stat-val">${Math.floor(u.maxHp)}</span>
            <span class="tt-stat-label">攻击</span><span class="tt-stat-val">${Math.floor(totalAtk)}</span>
            <span class="tt-stat-label">法强</span><span class="tt-stat-val">${Math.floor(u.ap || bonus.ap || 0)}</span>
            <span class="tt-stat-label">攻速</span><span class="tt-stat-val">${Math.round(((u.attackSpeed || 1 + (bonus.as||0)) - 1) * 100)}%</span>
            <span class="tt-stat-label">护甲</span><span class="tt-stat-val">${Math.floor(u.armor ?? (20 + (bonus.armor||0)))}</span>
            <span class="tt-stat-label">魔抗</span><span class="tt-stat-val">${Math.floor(u.mr ?? (20 + (bonus.mr||0)))}</span>
            <span class="tt-stat-label">暴击</span><span class="tt-stat-val">${Math.round((u.crit || bonus.crit || 0) * 100)}%</span>
        </div>
        <div class="tt-skill" style="color: var(--cyan); margin-top: 8px;">✨ 技能: ${u.template.skill}</div>
        ${itemList}`;
    tt.style.left = (ev.clientX + 20) + 'px';
    tt.style.top = (ev.clientY - 80) + 'px';
    tt.classList.add('show');
}

export function showItemTooltip(ev, idx) {
    let it = GAME.inventory[idx]; if(!it) return;
    let tt = document.getElementById('tooltip');
    tt.innerHTML = `
        <div class="tt-name" style="font-size: 16px;">${it.icon} ${it.name}</div>
        <div class="tt-skill" style="color:var(--gold-bright); font-size: 13px; margin: 6px 0;">${it.desc}</div>
        ${it.type === 'base' ? '<div style="font-size:11px;color:var(--text-mid);">基础材料</div>' : '<div style="font-size:11px;color:var(--pink);">高级合成核心</div>'}`;
    tt.style.left = (ev.clientX + 20) + 'px';
    tt.style.top = (ev.clientY - 60) + 'px';
    tt.classList.add('show');
}

export function hideTooltip() { document.getElementById('tooltip').classList.remove('show'); }

export function showBigMsg(main, sub = '', dur = 1500, cls = '') {
    let el = document.getElementById('overlay-msg');
    el.innerHTML = `
        <div class="overlay-main ${cls}" style="color: ${cls === 'victory' ? 'var(--cyan)' : (cls === 'defeat' ? 'var(--pink)' : '#fff')}">${main}</div>
        ${sub ? '<div class="overlay-sub" style="color: #fff; font-weight: bold;">'+sub+'</div>' : ''}`;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), dur);
}

export function showMergeFX(elId) {
    let el = document.getElementById(elId);
    if(!el) return;
    let r = el.getBoundingClientRect();
    let fx = document.createElement('div');
    fx.className = 'merge-fx';
    fx.style.left = (r.left + r.width/2) + 'px';
    fx.style.top = (r.top + r.height/2) + 'px';
    document.getElementById('fx-layer').appendChild(fx);
    setTimeout(() => fx.remove(), 800);
}

window.showTooltip = showTooltip;
window.showItemTooltip = showItemTooltip;
window.hideTooltip = hideTooltip;