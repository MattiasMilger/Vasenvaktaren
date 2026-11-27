// =============================================================================
// 9g-game-modes.js - Ragnarök Mode Rules, Save Slots and Save Files
// =============================================================================
// Ragnarök Mode rules are chosen when a new game starts and fixed after that
// (definitions in 7a-system-saves.js):
//   Permadeath      knocked-out väsen die; with none left the save is over and
//                   stays in its slot as an ended save to view or delete.
//                   The Endless Tower is a Permadeath-free zone.
//   Lost Runes      knocked-out väsen lose their runes, which go back to being
//                   undiscovered so exploring can find them again
//   Weak Healing    healing outside combat is halved (getHealMultiplier())
//   More Fights     more wild väsen while exploring, fewer other finds
//                   (getExplorationRates(), getPityThreshold())
// The Endless Tower is safe from both Permadeath and Lost Runes.
//
// Reloading the page can't undo a death or a lost rune. When a combat starts
// in a Ragnarök save it is written down as pending, and every loss is saved
// the moment it happens. A combat still pending on the next page load is
// abandoned: losses already taken stand and the party is left at low health,
// but nobody is lost for the reload itself (closing the browser by accident
// shouldn't cost a väsen). A rolled wild encounter is kept until it is fought.
// Normal saves skip all of this and behave exactly as before.

// =============================================================================
// Main menu and save slots
// =============================================================================

Game.prototype.getSlotSummaries = function() {
    const summaries = [];
    for (let i = 0; i < SaveSlots.count; i++) summaries.push(SaveSlots.summarize(i));
    return summaries;
};

Game.prototype.continueSlot = function(slot) {
    if (!this.openSlot(slot)) {
        ui.showMessage('This save could not be loaded.', 'error');
        this.showMainMenu();
    }
};

// New Game: use the first empty slot, or ask which save to replace when all are in use
Game.prototype.startNewGame = function() {
    const slot = SaveSlots.firstEmpty();
    if (slot !== null) {
        this.showNewJourney(slot);
        return;
    }
    ui.showSlotPicker(
        'Replace a Save',
        'All save slots are in use. Choose the save to replace.',
        this.getSlotSummaries(),
        chosen => this.showNewJourney(chosen)
    );
};

// New Game screen: Ragnarök Mode rules (optional), then pick a starter.
// initialModes restores the rules chosen before (Back from the starter screen).
Game.prototype.showNewJourney = function(slot, initialModes = null) {
    ui.showScreen('newJourney');
    ui.renderNewJourney(
        SaveSlots.summarize(slot),
        modes => {
            this.newRun = { slot, modes: normalizeModes(modes) };
            this.showStarterSelection();
        },
        () => {
            this.newRun = null;
            this.showMainMenu();
        },
        initialModes
    );
};

// A save that is over: show its summary, with the options to download it as
// text or delete the save
Game.prototype.viewEndedSave = function(slot) {
    const data = SaveSlots.read(slot);
    if (!data) return;
    ui.showEndedSaveDialogue(buildSaveRecord(data), () => this.confirmDeleteSlot(slot), () => this.exportSlotSummary(slot));
};

// Summary on a main menu save card: show the summary first (an ended save uses
// its journey dialogue, with Delete), downloading it from there
Game.prototype.showSlotSummary = function(slot) {
    const data = SaveSlots.read(slot);
    if (!data) return;
    if (data.ended) {
        this.viewEndedSave(slot);
        return;
    }
    ui.showSaveSummaryDialogue(data, slot, () => this.exportSlotSummary(slot));
};

// Download Summary: a readable .txt of the save, to keep
// before deleting it or as a record of a save in progress
Game.prototype.exportSlotSummary = function(slot) {
    const data = SaveSlots.read(slot);
    if (!data) return;
    const name = ui.getSaveFileName(data).replace(/\.json$/, '-summary.txt');
    ui.downloadTextFile(buildSaveSummaryText(data, slot), name, {
        description: 'Väsenväktaren summary', mime: 'text/plain', ext: '.txt', doneMessage: 'Summary saved!'
    });
};

Game.prototype.confirmDeleteSlot = function(slot) {
    const summary = SaveSlots.summarize(slot);
    if (!summary) return;
    ui.showDialogue(
        'Delete Save',
        `<p>Delete <strong>Slot ${slot + 1}</strong> (${escapeHTML(summary.playerName)}, ${summary.zoneName})? This can't be undone.</p>`,
        [
            {
                text: `${uiIcon('trash')}Delete`,
                class: 'btn-danger',
                callback: () => {
                    SaveSlots.discard(slot);
                    if (SaveSlots.getActive() === slot) SaveSlots.clearActive();
                    ui.showMessage(`Slot ${slot + 1} deleted.`);
                    this.showMainMenu();
                }
            },
            { text: 'Cancel', class: 'btn-secondary', callback: null }
        ],
        true,
        null,
        'trash'
    );
};

// Leave the current save for the main menu (Settings > Main Menu)
Game.prototype.returnToMainMenu = function() {
    if (gameState.inCombat) {
        ui.showMessage('You can\'t leave in the middle of a battle.', 'error');
        return;
    }
    gameState.saveGame();
    try { sessionStorage.setItem(SHOW_MENU_FLAG, '1'); } catch (e) { /* ignore */ }
    location.reload();
};

// Save to File on a main menu save card: the slot's save as a .json file.
// Saves that are over can't be loaded again, so they have no file to save.
Game.prototype.exportSlot = function(slot) {
    const data = SaveSlots.read(slot);
    if (!data || data.ended) return;
    ui.downloadSaveFile(JSON.stringify(data, null, 2), ui.getSaveFileName(data));
};

// =============================================================================
// Save files
// =============================================================================

// Load from File (main menu): into the first empty slot, or a chosen one
Game.prototype.loadFileFromMenu = function(text) {
    const slot = SaveSlots.firstEmpty();
    if (slot !== null) {
        this.importSaveIntoSlot(text, slot);
        return;
    }
    ui.showSlotPicker(
        'Load into Which Slot?',
        'All save slots are in use. Choose the save to replace.',
        this.getSlotSummaries(),
        chosen => this.importSaveIntoSlot(text, chosen)
    );
};

// Read a save file's text. Accepts the plain JSON from Save to File, and also
// the base64 code that older versions' Export Save copied to the clipboard
// (pasted into a text file), so old backups still load. Returns the save
// data, or null if unreadable.
function parseSaveText(text) {
    try {
        const clean = String(text || '').trim().replace(/^﻿/, '');
        return JSON.parse(clean.startsWith('{') ? clean : atob(clean));
    } catch (e) {
        return null;
    }
}

// Put a save file into a slot and open it, replacing what was there. Ragnarök
// saves that are over, deleted, outdated or already in another slot are refused.
Game.prototype.importSaveIntoSlot = function(text, slot) {
    const data = parseSaveText(text);
    const loaded = new GameState();
    loaded.saveSlot = slot;
    if (!data || !loaded.deserialize(data) || !loaded.gameStarted) {
        ui.showMessage('Invalid or corrupted save.', 'error');
        return;
    }

    const problem = SaveSlots.getImportProblem(data, slot);
    if (problem) {
        ui.showDialogue('Can\'t Load This Save', `<p>${problem}</p>`, [{ text: 'OK', callback: null }], true, null, 'lock');
        return;
    }

    // This tab must not write the save it is replacing any more
    if (slot === gameState.saveSlot) gameState.saveBlocked = true;

    // A newer copy of the same save replaces it quietly; anything else in the
    // slot is discarded first
    const existing = SaveSlots.read(slot);
    if (existing && !(data.runId && existing.runId === data.runId)) {
        SaveSlots.discard(slot);
    }

    if (!loaded.writeSave()) {
        ui.showMessage('Could not save the loaded game.', 'error');
        return;
    }
    SaveSlots.setActive(slot);
    ui.setFlashMessage('Save loaded successfully!');
    location.reload();
};

// =============================================================================
// Loading a Ragnarök save
// =============================================================================

// Called right after a save is loaded. False if it can't be played: it is
// over (it stays in its slot to view or delete), or a leftover copy of a save
// that ended or was deleted (removed).
Game.prototype.checkLoadedRun = function() {
    if (gameState.ended) return false;
    if (!gameState.hasModes() || !gameState.runId) return true;
    const run = RunRegistry.get(gameState.runId);
    if (run && run.ended) {
        SaveSlots.remove(gameState.saveSlot);
        SaveSlots.clearActive();
        return false;
    }
    // A save write that failed after its counter was recorded must not lock
    // the save forever: continue from the save's own progress.
    if (run && run.counter > gameState.saveCounter) {
        gameState.saveCounter = run.counter;
    }
    return true;
};

// After the game screen is shown: finish a combat that was interrupted, or
// bring back a wild encounter that was rolled but not fought.
Game.prototype.resumeModesAfterLoad = function() {
    if (!gameState.hasModes()) return;

    if (gameState.pendingCombat) {
        this.resolveInterruptedCombat(gameState.pendingCombat);
        return;
    }

    if (gameState.pendingEncounter) {
        const vasen = deserializeWildEncounter(gameState.pendingEncounter);
        if (vasen) {
            ui.showEncounterResult({ type: 'vasen', vasen });
        } else {
            gameState.pendingEncounter = null;
            gameState.saveGame();
        }
    }
};

// A Ragnarök combat was still going when the page closed: the battle is
// abandoned. Losses already taken in it stand and the party is left at low
// health, but the reload itself costs nothing more.
Game.prototype.resolveInterruptedCombat = function(pending) {
    gameState.pendingCombat = null;
    gameState.pendingEncounter = null;

    const isTower = pending.type === COMBAT_TYPES.ENDLESS_TOWER;

    const fallen = gameState.modes.permadeath ? this.commitFallen(pending.fallen || []) : [];
    const lostRunes = this.commitLostRunes(pending.lostRunes || []);

    if (isTower) {
        // A tower run that ends always restores the party (see finishEndlessTowerRun)
        this.restorePartyFully();
        gameState.updateEndlessTowerRecord(Math.max(0, (pending.floor || 1) - 1), gameState.getActiveParty());
    } else {
        this.leavePartyAtLowHealth();
    }

    if (this.isCollectionGone()) {
        this.endSave(this.describeLastFall(fallen));
        return;
    }

    gameState.saveGame();
    this.refreshUI();
    const story = isTower
        ? 'Your climb through the Endless Tower was cut short, and you find yourself back at its foot.'
        : `You broke away from your battle against ${pending.opponent || 'your foe'} before it could be decided.`;
    ui.showDialogue(
        'Battle Abandoned',
        `<p>${story}</p>
         <p>${isTower ? 'The run has ended and your party has been restored.' : 'Your party withdrew, battered and weary, and is left at low health.'}${fallen.length > 0 || lostRunes.length > 0 ? ' What was lost in the fighting cannot be regained.' : ''}</p>
         ${fallen.length > 0 ? ui.getFallenListHTML(fallen) : ''}
         ${lostRunes.length > 0 ? ui.getLostRunesListHTML(lostRunes) : ''}`,
        [{ text: 'Continue', callback: null }],
        false,
        null,
        'surrender'
    );
};

// =============================================================================
// Combat in a Ragnarök save
// =============================================================================

// Called when any combat starts (attachCombatCallbacks): note it as pending
// so that reloading the page mid-fight can't undo losses already taken.
Game.prototype.beginModeCombat = function() {
    if (!gameState.hasModes() || !this.currentCombat) return;
    const combat = this.currentCombat;
    gameState.pendingEncounter = null;
    gameState.pendingCombat = {
        type: combat.combatType,
        opponent: this.describeOpponent(combat),
        zone: gameState.currentZone,
        floor: combat.currentFloor || null,
        startedAt: Date.now(),
        fallen: [],
        lostRunes: []
    };
    gameState.writeSave();
};

// A player väsen was knocked out. With Permadeath it dies; with Lost Runes it
// loses its runes. The loss is saved right away so a reload can't undo it,
// and announced in the log and a popup. It takes effect when the combat ends.
// The Endless Tower is a safe zone: Idunn's apples keep every väsen and its
// runes, and the party is restored when the run ends.
Game.prototype.handleModeKnockout = function(vasen, killer) {
    const { permadeath, lostRunes } = gameState.modes;
    const runes = (vasen.runes || []).filter(Boolean);
    if (!permadeath && !(lostRunes && runes.length > 0)) return;
    const combat = this.currentCombat;
    if (combat && combat.combatType === COMBAT_TYPES.ENDLESS_TOWER) return;

    if (!gameState.pendingCombat) {
        gameState.pendingCombat = { type: combat ? combat.combatType : null, opponent: this.describeOpponent(combat), fallen: [], lostRunes: [] };
    }
    const retreat = !!(combat && combat.fleeing);
    const record = this.addModeLoss(gameState.pendingCombat, vasen, this.describeKiller(killer, combat), retreat);
    gameState.writeSave();

    if (permadeath) {
        ui.addCombatLog(`${vasen.getDisplayName()} has fallen. It will not return.`, 'fallen');
        ui.showFallenToast(vasen);
    } else {
        ui.addCombatLog(`${vasen.getDisplayName()} lost its runes: ${getRunesPlainText(record.runes)}.`, 'fallen');
        ui.showLostRunesToast(record);
    }
};

// Record what a knocked-out väsen loses under the save's rules: its life
// (Permadeath) or its runes (Lost Runes). retreat: it stayed behind to cover
// the party fleeing. Returns the record, or null when the rules take nothing.
Game.prototype.addModeLoss = function(pending, vasen, killer, retreat) {
    const { permadeath, lostRunes } = gameState.modes;
    const runes = (vasen.runes || []).filter(Boolean);
    if (!pending.fallen) pending.fallen = [];
    if (!pending.lostRunes) pending.lostRunes = [];

    if (permadeath) {
        const record = {
            id: vasen.id,
            speciesName: vasen.speciesName,
            level: vasen.level,
            temperamentKey: vasen.temperamentKey,
            runes,
            runesLost: !!lostRunes,
            killer,
            retreat,
            zoneName: ZONES[gameState.currentZone] ? ZONES[gameState.currentZone].name : '',
            date: Date.now()
        };
        pending.fallen.push(record);
        return record;
    }
    if (lostRunes && runes.length > 0) {
        const record = { id: vasen.id, name: vasen.getDisplayName(), runes, retreat };
        pending.lostRunes.push(record);
        return record;
    }
    return null;
};

// Flee confirmation: what the väsen covering the retreat will lose in this save
// (always shown, since it is a real cost)
Game.prototype.getFleeWarningHTML = function() {
    const combat = this.currentCombat;
    const vasen = combat && combat.playerActive;
    if (!vasen || combat.combatType === COMBAT_TYPES.ENDLESS_TOWER) return '';
    const { permadeath, lostRunes } = gameState.modes;
    const runes = (vasen.runes || []).filter(Boolean);
    const name = `<strong>${vasen.getDisplayName()}</strong>`;
    if (permadeath) {
        return `<p class="flee-warning">${uiIcon('permadeath', 14)}<span>${name} will die covering your retreat.</span></p>`;
    }
    if (lostRunes && runes.length > 0) {
        return `<p class="flee-warning">${uiIcon('lostRunes', 14)}<span>${name} will lose its runes covering your retreat: ${getRunesPlainText(runes)}.</span></p>`;
    }
    return '';
};

// Runs before a combat type's own ending: commits deaths, and ends the save
// when Permadeath has left no väsen. Returns true if it took over the ending.
Game.prototype.applyModeRulesOnCombatEnd = function(result) {
    const combat = this.currentCombat;
    if (!gameState.hasModes() || !combat) return false;

    combat.reportPlayerKnockouts(); // safety net: nothing may die unrecorded
    const pending = gameState.pendingCombat || { fallen: [] };
    const isTower = combat.combatType === COMBAT_TYPES.ENDLESS_TOWER;

    // A cleared tower floor: the run goes on, still pending
    if (isTower && result.victory) {
        pending.floor = (combat.currentFloor || 1) + 1;
        gameState.pendingCombat = pending;
        gameState.writeSave();
        return false;
    }

    gameState.pendingCombat = null;
    gameState.pendingEncounter = null;
    const fallen = gameState.modes.permadeath ? this.commitFallen(pending.fallen || []) : [];
    this.pendingFallenNotice = fallen;
    this.pendingLostRunesNotice = this.commitLostRunes(pending.lostRunes || []);

    if (this.isCollectionGone()) {
        if (isTower) gameState.updateEndlessTowerRecord(Math.max(0, (combat.currentFloor || 1) - 1), combat.playerTeam);
        this.endSave(this.describeLastFall(fallen));
        return true;
    }

    gameState.writeSave();
    return false;
};

// Remove fallen väsen from the collection and party, and add them to the
// save's fallen record. Their runes come free, or with Lost Runes go back to
// being undiscovered so exploring can find them again.
Game.prototype.commitFallen = function(records) {
    const committed = [];
    records.forEach(record => {
        if (gameState.fallenVasen.some(f => f.id === record.id)) return;
        const index = gameState.vasenCollection.findIndex(v => v.id === record.id);
        if (index === -1) return;

        gameState.vasenCollection.splice(index, 1);
        gameState.party = gameState.party.map(v => (v && v.id === record.id) ? null : v);
        gameState.favoriteVasen.delete(record.id);
        if (ui.selectedVasen && ui.selectedVasen.id === record.id) ui.selectedVasen = null;

        if (gameState.modes.lostRunes) {
            (record.runes || []).forEach(runeId => {
                gameState.foundRunes.add(runeId); // still counts as found
                gameState.collectedRunes.delete(runeId);
                gameState.favoriteRunes.delete(runeId);
            });
        }

        gameState.fallenVasen.push(record);
        committed.push(record);
    });
    return committed;
};

// Lost Runes without Permadeath: knocked-out väsen lose the runes they wore.
// The runes go back to being undiscovered (still counted as found).
Game.prototype.commitLostRunes = function(records) {
    const committed = [];
    records.forEach(record => {
        const vasen = gameState.vasenCollection.find(v => v.id === record.id);
        if (!vasen) return;
        const lost = record.runes.filter(runeId => vasen.runes.includes(runeId));
        if (lost.length === 0) return;
        lost.forEach(runeId => {
            vasen.unequipRune(runeId);
            gameState.foundRunes.add(runeId);
            gameState.collectedRunes.delete(runeId);
            gameState.favoriteRunes.delete(runeId);
        });
        trimTrailingEmptyRuneSlots(vasen);
        committed.push({ ...record, runes: lost });
    });
    return committed;
};

// Permadeath with no väsen left at all: the save is over
Game.prototype.isCollectionGone = function() {
    return gameState.modes.permadeath && gameState.vasenCollection.length === 0;
};

// After combat: show the väsen (Permadeath) and runes (Lost Runes) lost in
// it, then continue with `next`
Game.prototype.showFallenNoticeThen = function(next) {
    const fallen = this.pendingFallenNotice || [];
    const lostRunes = this.pendingLostRunesNotice || [];
    this.pendingFallenNotice = null;
    this.pendingLostRunesNotice = null;
    if (fallen.length === 0 && lostRunes.length === 0) {
        if (next) next();
        return;
    }
    ui.showFallenDialogue(fallen, lostRunes, next);
};

// Permadeath has left no väsen: the save is over. It stays in its slot,
// marked as ended, so it can be looked at and deleted from the main menu.
Game.prototype.endSave = function(cause) {
    gameState.inCombat = false;
    gameState.pendingCombat = null;
    gameState.pendingEncounter = null;
    if (this.currentCombat) this.currentCombat.isAutoBattle = false;
    this.pendingFallenNotice = null;
    this.pendingLostRunesNotice = null;

    gameState.ended = { cause, date: Date.now() };
    gameState.writeSave();
    if (gameState.runId) RunRegistry.markEnded(gameState.runId);
    gameState.saveBlocked = true;
    SaveSlots.clearActive();

    ui.showGameOverDialogue(buildSaveRecord(gameState.serialize()), () => this.returnToMenuAfterEnd());
};

Game.prototype.returnToMenuAfterEnd = function() {
    try { sessionStorage.setItem(SHOW_MENU_FLAG, '1'); } catch (e) { /* ignore */ }
    location.reload();
};

// =============================================================================
// Descriptions for fallen records and the end of a save (plain text)
// =============================================================================

function describeVasenPlain(vasen) {
    return vasen ? `Lvl ${vasen.level} ${vasen.getDisplayName()}` : 'an unknown foe';
}

// Who the player is fighting: "a wild Lvl 12 Calm Skogsrå", a guardian, or the tower
Game.prototype.describeOpponent = function(combat) {
    if (!combat) return 'your foe';
    if (combat.combatType === COMBAT_TYPES.GUARDIAN) return combat.guardianName || 'a guardian';
    if (combat.combatType === COMBAT_TYPES.ENDLESS_TOWER) return 'the Endless Tower';
    return `a wild ${describeVasenPlain(combat.enemyTeam[0])}`;
};

// Who struck the killing blow, for a fallen record
Game.prototype.describeKiller = function(killer, combat) {
    if (!combat) return describeVasenPlain(killer);
    if (combat.combatType === COMBAT_TYPES.GUARDIAN) {
        return `${combat.guardianName || 'A guardian'}'s ${describeVasenPlain(killer)}`;
    }
    if (combat.combatType === COMBAT_TYPES.ENDLESS_TOWER) {
        return `${describeVasenPlain(killer)} on Floor ${combat.currentFloor || 1} of the Endless Tower`;
    }
    return `a wild ${describeVasenPlain(killer)}`;
};

Game.prototype.describeLastFall = function(fallen) {
    const last = fallen && fallen[fallen.length - 1];
    if (!last) return 'The last of your väsen has fallen.';
    return last.retreat
        ? `The last of your väsen stayed behind to cover the retreat from ${last.killer}.`
        : `The last of your väsen fell to ${last.killer}.`;
};

// =============================================================================
// Rule tips in dialogues
// =============================================================================

// Extra tips for the tower, flee and auto battle dialogues in
// a save with Permadeath or Lost Runes (hidden by Disable Tutorial).
Game.prototype.getModeWarningHTML = function(context) {
    const { permadeath, lostRunes } = gameState.modes;
    if ((!permadeath && !lostRunes) || !ui.areTipsEnabled()) return '';
    switch (context) {
        case 'tower':
            return ui.getTipHTML('<strong>Permadeath-free zone</strong>: Idunn\'s apples keep every väsen, and its runes, safe within the tower. Väsen that fall here are restored when the run ends.');
        case 'surrender':
            return ui.getTipHTML('Swap in another väsen first to choose who stays behind. Swapping costs a turn.');
        case 'autoBattle':
            return ui.getTipHTML('Auto Battle never flees for you.');
        default:
            return '';
    }
};
