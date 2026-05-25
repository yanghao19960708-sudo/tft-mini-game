import { CHAMP_POOL, SHOP_POOL_SIZE } from './data.js';

export const GAME = {
    hp: 100, gold: 12, stage: 1, sub: 1, level: 3, xp: 0,
    speed: 2, inCombat: false,
    streak: 0, 
    shop: [], shopLocked: false,
    activeSynergies: {},
    inventory: [],
    board: new Array(13).fill(null),
    bench: new Array(9).fill(null),
    enemy: new Array(13).fill(null),
    stats: {},
    pool: {}
};

export function initPool() {
    GAME.pool = {};
    CHAMP_POOL.forEach(c => { GAME.pool[c.bId] = SHOP_POOL_SIZE[c.c]; });
}