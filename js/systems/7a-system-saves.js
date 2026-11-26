// =============================================================================
// 7a-system-saves.js - Save Slots, Ragnarök Mode Rules and Run Guard
// =============================================================================
// Loaded before 7-system-state.js, which uses these helpers.
//
// Storage keys (all localStorage):
//   vasenvaktaren_save          Slot 1 (the original save key, unchanged)
//   vasenvaktaren_save_2 / _3   Slots 2 and 3
//   vasenvaktaren_active_slot   Slot opened on page load (the one last played)
//   vasenvaktaren_runs          Run registry: latest save counter of each save
//                               with Ragnarök rules on, and whether it has ended
//
// Saves only ever gain fields, so a version of the game from before save slots
// still loads Slot 1 normally.

const SAVE_SLOT_KEYS = [SAVE_KEY, SAVE_KEY + '_2', SAVE_KEY + '_3'];
const ACTIVE_SLOT_KEY = 'vasenvaktaren_active_slot';
const RUN_REGISTRY_KEY = 'vasenvaktaren_runs';

// sessionStorage flags that survive the page reload used to switch saves
const SHOW_MENU_FLAG = 'vasenvaktaren_show_menu';
const FLASH_MESSAGE_KEY = 'vasenvaktaren_flash';

// =============================================================================
// Ragnarök Mode - optional rules chosen when a new game starts, fixed after.
// A save stores them as `modes` ({ ruleId: true/false }). Every rule counts
// the same; how many are on picks the difficulty tier shown to the player.
// =============================================================================
const GAME_MODES = {
    permadeath: {
        id: 'permadeath',
        name: 'Permadeath',
        icon: 'permadeath',
        points: 1,
        description: 'Väsen knocked out in combat die for good, except in the Endless Tower. Fleeing knocks out the väsen on the field. If none are left, the save is over.'
    },
    lostRunes: {
        id: 'lostRunes',
        name: 'Lost Runes',
        icon: 'lostRunes',
        points: 1,
        description: 'Väsen knocked out in combat lose the runes they wear, except in the Endless Tower. Fleeing knocks out the väsen on the field. Lost runes can be found again by exploring.'
    },
    weakHealing: {
        id: 'weakHealing',
        name: 'Weak Healing',
        icon: 'weakHealing',
        points: 1,
        healMultiplier: 0.5,
        description: 'Healing outside combat is halved: Sacred Wells, taming items and the heal after each fight.'
    },
    moreFights: {
        id: 'moreFights',
        name: 'More Fights',
        icon: 'swords',
        points: 1,
        wildChance: 0.7,      // share of explorations that are wild väsen (normally 46%)
        pityMultiplier: 1.5,  // items, Sacred Wells and runes wait longer for their pity
        description: 'Wild väsen are met far more often while exploring, so items, Sacred Wells and runes turn up less.'
    }
};
const GAME_MODE_LIST = ['permadeath', 'lostRunes', 'weakHealing', 'moreFights'];

// Difficulty tiers, named after the events leading up to the end of the world.
// Every rule counts one point, and any three (all but one) reach Ragnarök.
const RAGNAROK_TIERS = [
    { level: 1, minPoints: 1, name: 'Fimbulvinter', line: 'Three winters without a summer.' },
    { level: 2, minPoints: 2, name: 'Gjallarhorn',  line: 'Heimdall\'s horn sounds across the worlds.' },
    { level: 3, minPoints: 3, name: 'Ragnarök',     line: 'The world burns. Few will see the dawn.' }
];
const RAGNAROK_POINTS = RAGNAROK_TIERS[RAGNAROK_TIERS.length - 1].minPoints;
// Points with every rule on: Ragnarök overflowing (a small extra effect only)
const RAGNAROK_MAX_POINTS = GAME_MODE_LIST.reduce((sum, id) => sum + GAME_MODES[id].points, 0);

function createDefaultModes() {
    const modes = {};
    GAME_MODE_LIST.forEach(id => { modes[id] = false; });
    return modes;
}

// Read stored modes. Unknown ids (rules tried and removed during development,
// such as hardcore, noMythicals or slowGrowth) are dropped, and a rule whose
// requirement is off is turned off.
function normalizeModes(modes) {
    const normalized = createDefaultModes();
    GAME_MODE_LIST.forEach(id => { normalized[id] = !!(modes && modes[id]); });
    GAME_MODE_LIST.forEach(id => {
        const requires = GAME_MODES[id].requires;
        if (requires && !normalized[requires]) normalized[id] = false;
    });
    return normalized;
}

// Rule ids that are on, in display order
function getActiveModeIds(modes) {
    return GAME_MODE_LIST.filter(id => modes && modes[id]);
}

function getRagnarokPoints(modes) {
    return getActiveModeIds(normalizeModes(modes)).reduce((sum, id) => sum + GAME_MODES[id].points, 0);
}

// Difficulty tier for a set of rules, or null when none are on
function getRagnarokTier(modes) {
    const points = getRagnarokPoints(modes);
    let tier = null;
    RAGNAROK_TIERS.forEach(t => { if (points >= t.minPoints) tier = t; });
    return tier;
}

// Every rule on: past Ragnarök's threshold (same tier, a little extra glow on the New Game screen)
function isRagnarokOverflowing(modes) {
    return getRagnarokPoints(modes) >= RAGNAROK_MAX_POINTS && RAGNAROK_MAX_POINTS > RAGNAROK_POINTS;
}

// How full the difficulty meter is (0 to 1; full from Ragnarök up)
function getRagnarokFill(modes) {
    return Math.min(1, getRagnarokPoints(modes) / RAGNAROK_POINTS);
}

function generateRunId() {
    return 'run_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
}

// A rolled wild väsen, kept until it is fought (Ragnarök saves only)
function serializeWildEncounter(vasen) {
    return {
        speciesName: vasen.speciesName,
        level: vasen.level,
        temperamentKey: vasen.temperamentKey,
        runes: vasen.runes.slice()
    };
}

// Rebuild a saved wild encounter exactly as it was rolled (wild väsen use the
// enemy level cap, so the normal VasenInstance.deserialize() is not used)
function deserializeWildEncounter(data) {
    if (!data || !VASEN_SPECIES[data.speciesName]) return null;
    try {
        const vasen = new VasenInstance(data.speciesName, data.level, data.temperamentKey, [], true);
        vasen.runes = (data.runes || []).filter(r => RUNES[r]);
        if (vasen.hasRune('URUZ')) vasen.recalculateMaxMegin();
        vasen.recalculateMaxHealth(); // two runes may form the generic bindrune
        vasen.currentMegin = vasen.maxMegin;
        return vasen;
    } catch (e) {
        console.warn('Could not restore the pending encounter:', e);
        return null;
    }
}

// =============================================================================
// Storage helpers
// =============================================================================
function readStoredJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        return fallback;
    }
}

function writeStoredJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error('Error writing ' + key + ':', e);
        return false;
    }
}

function getSaveSlotKey(slot) {
    return SAVE_SLOT_KEYS[slot] || SAVE_SLOT_KEYS[0];
}

function getTotalGuardianCount() {
    return ZONE_ORDER.filter(zoneId => ZONES[zoneId].guardian !== null).length;
}

function getEarnedAchievementIds(achievements) {
    return Object.values(ACHIEVEMENTS)
        .filter(a => achievements && achievements[a.id] === true)
        .map(a => a.id);
}

// =============================================================================
// Save slots
// =============================================================================
const SaveSlots = {
    count: SAVE_SLOT_KEYS.length,

    // Parsed save data of a slot (living or dead), or null if empty or unreadable
    read(slot) {
        const data = readStoredJSON(getSaveSlotKey(slot), null);
        return (data && data.version === SAVE_VERSION && data.gameStarted) ? data : null;
    },

    hasSave(slot) {
        return this.read(slot) !== null;
    },

    remove(slot) {
        try { localStorage.removeItem(getSaveSlotKey(slot)); } catch (e) { /* ignore */ }
    },

    // First slot without a save. Slots with nothing stored at all are
    // preferred over ones holding data this version can't read.
    firstEmpty() {
        let unreadable = null;
        for (let i = 0; i < this.count; i++) {
            if (this.hasSave(i)) continue;
            let raw = null;
            try { raw = localStorage.getItem(getSaveSlotKey(i)); } catch (e) { /* ignore */ }
            if (!raw) return i;
            if (unreadable === null) unreadable = i;
        }
        return unreadable;
    },

    // Slot to open on page load. Saves from before save slots have no active
    // slot stored and simply open Slot 1, as they always did.
    getActive() {
        let stored = null;
        try { stored = localStorage.getItem(ACTIVE_SLOT_KEY); } catch (e) { /* ignore */ }
        const slot = parseInt(stored, 10);
        if (slot >= 0 && slot < this.count) return slot;
        return this.hasSave(0) ? 0 : null;
    },

    setActive(slot) {
        try { localStorage.setItem(ACTIVE_SLOT_KEY, String(slot)); } catch (e) { /* ignore */ }
    },

    clearActive() {
        try { localStorage.removeItem(ACTIVE_SLOT_KEY); } catch (e) { /* ignore */ }
    },

    // Slot that already holds this run, other than `exceptSlot` (or null)
    findRun(runId, exceptSlot) {
        if (!runId) return null;
        for (let i = 0; i < this.count; i++) {
            if (i === exceptSlot) continue;
            const data = this.read(i);
            if (data && data.runId === runId) return i;
        }
        return null;
    },

    // Summary for the main menu save cards (null for an empty slot)
    summarize(slot) {
        const data = this.read(slot);
        if (!data) return null;
        const zone = ZONES[data.currentZone];
        const record = data.endlessTowerRecord || {};
        return {
            slot,
            playerName: data.playerName || 'Väktare',
            playerFace: data.playerFace,
            modes: normalizeModes(data.modes),
            ended: data.ended || null,
            zoneName: zone ? zone.name : '',
            vasenCount: (data.vasenCollection || []).length,
            guardiansDefeated: (data.defeatedGuardians || []).length,
            totalGuardians: getTotalGuardianCount(),
            fallenCount: (data.fallenVasen || []).length,
            towerFloor: record.highestFloor || 0,
            achievements: getEarnedAchievementIds(data.achievements)
        };
    },

    // Remove a save for good (Delete, Reset Game, or replaced by a new game or
    // a loaded file). A Ragnarök save is marked ended, so an older copy of it
    // can't be loaded back from a file afterwards.
    discard(slot) {
        const data = this.read(slot);
        if (data && data.runId && getActiveModeIds(normalizeModes(data.modes)).length > 0) {
            RunRegistry.markEnded(data.runId);
        }
        this.remove(slot);
    },

    // Reasons a save file must not be loaded into `targetSlot`, or null if it
    // may. Only Ragnarök saves are checked: a save that has ended or was
    // deleted, an older copy of one played since, or one already in another slot.
    getImportProblem(data, targetSlot) {
        if (!data || !getActiveModeIds(normalizeModes(data.modes)).length || !data.runId) return null;
        if (data.ended) {
            return 'This save is over and can\'t be played again.';
        }
        const run = RunRegistry.get(data.runId);
        if (run && run.ended) {
            return 'This save is over or was deleted, so it can\'t be loaded again.';
        }
        if (run && run.counter > (data.saveCounter || 0)) {
            return 'This is an older copy of a save that has been played since. Only its latest progress can be loaded.';
        }
        const otherSlot = this.findRun(data.runId, targetSlot);
        if (otherSlot !== null) {
            return `This save is already in Slot ${otherSlot + 1}.`;
        }
        return null;
    }
};

// Summary of a save's journey (main menu View, and the Game Over dialogue)
function buildSaveRecord(data) {
    const collection = data.vasenCollection || [];
    const fallen = data.fallenVasen || [];
    const species = new Set(data.tamedSpecies || []);
    collection.forEach(v => species.add(v.speciesName));
    fallen.forEach(f => species.add(f.speciesName));

    const zone = ZONES[data.currentZone];
    const record = data.endlessTowerRecord || {};
    return {
        playerName: data.playerName || 'Väktare',
        playerFace: data.playerFace || 'plain',
        modes: normalizeModes(data.modes),
        startedAt: data.createdAt || null,
        ended: data.ended || null,
        zoneName: zone ? zone.name : '',
        guardiansDefeated: (data.defeatedGuardians || []).length,
        totalGuardians: getTotalGuardianCount(),
        speciesTamed: species.size,
        achievements: getEarnedAchievementIds(data.achievements),
        towerFloor: record.highestFloor || 0,
        party: (data.party || []).filter(Boolean).map(v => ({
            speciesName: v.speciesName,
            level: v.level,
            temperamentKey: v.temperamentKey,
            runes: (v.runes || []).filter(Boolean)
        })),
        fallen: fallen.slice()
    };
}

// =============================================================================
// Run registry - one small record per Ragnarök save: its latest save counter
// and whether it has ended. It lets a tab notice that another tab moved on,
// and stops old save files from rolling a save back.
// =============================================================================
const RunRegistry = {
    readAll() {
        return readStoredJSON(RUN_REGISTRY_KEY, {}) || {};
    },

    get(runId) {
        return runId ? this.readAll()[runId] || null : null;
    },

    record(runId, counter) {
        const runs = this.readAll();
        const run = runs[runId] || { counter: 0, ended: false };
        run.counter = Math.max(run.counter, counter);
        runs[runId] = run;
        writeStoredJSON(RUN_REGISTRY_KEY, runs);
    },

    markEnded(runId) {
        const runs = this.readAll();
        runs[runId] = { counter: (runs[runId] && runs[runId].counter) || 0, ended: true };
        writeStoredJSON(RUN_REGISTRY_KEY, runs);
    }
};

// =============================================================================
// Run guard - checks around every write of a Ragnarök save. Normal saves pass
// straight through, so they behave exactly as before.
// =============================================================================
const RunGuard = {
    beforeWrite(state) {
        if (!state.hasModes() || !state.runId) return true;
        const run = RunRegistry.get(state.runId);
        if (run && (run.ended || run.counter > state.saveCounter)) {
            this.blockStaleTab(state);
            return false;
        }
        state.saveCounter++;
        return true;
    },

    afterWrite(state) {
        if (!state.hasModes() || !state.runId) return;
        RunRegistry.record(state.runId, state.saveCounter);
    },

    // Another tab (or window) has continued this save: stop writing here so
    // the older copy can't overwrite it, and ask the player to reload.
    blockStaleTab(state) {
        if (state.saveBlocked) return;
        state.saveBlocked = true;
        if (typeof ui !== 'undefined' && ui.showStaleSaveDialogue) {
            ui.showStaleSaveDialogue();
        }
    }
};

// Notice right away when another tab writes or deletes the save this tab has open
window.addEventListener('storage', (e) => {
    if (typeof gameState === 'undefined') return;
    if (!gameState.gameStarted || !gameState.hasModes() || gameState.saveBlocked) return;
    if (e.key === gameState.saveKey || e.key === null) {
        RunGuard.blockStaleTab(gameState);
    }
});
