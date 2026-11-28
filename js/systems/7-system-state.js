// =============================================================================
// 7-system-state.js - Game State Management and Save/Load System
// =============================================================================

// Fresh default records, shared by the constructor, resetGame() and old-save fallbacks
function createDefaultAchievements() {
    return { champion: false, rune_master: false, hoarder: false, lore_master: false };
}

function createDefaultEndlessTowerRecord() {
    return {
        highestFloor: 0,
        team: [], // Array of { speciesName, level, temperamentKey, runes }
        timestamp: null
    };
}

// Remove trailing null placeholders (empty slots) from a väsen's rune array
function trimTrailingEmptyRuneSlots(vasen) {
    while (vasen.runes.length > 0 && vasen.runes[vasen.runes.length - 1] === null) {
        vasen.runes.pop();
    }
}

// Keep max Megin and max health in sync after a rune change: Uruz and the
// generic bindrune (any rune change can form or break it) affect them. Megin
// refills when its maximum rises and is capped when it falls.
function syncMeginForRuneChange(vasen) {
    vasen.syncStatsForRuneChange();
}

// Move a rune already equipped on this väsen into another of its slots. Whatever
// occupied the target slot (a rune or nothing) moves into the rune's old slot.
function moveRuneWithinVasen(vasen, fromIndex, toIndex) {
    // Pad the array if the target slot is beyond the current length
    while (vasen.runes.length <= toIndex) {
        vasen.runes.push(null);
    }

    const displacedRune = vasen.runes[toIndex];
    vasen.runes[toIndex] = vasen.runes[fromIndex];
    vasen.runes[fromIndex] = displacedRune;

    // A swap never changes whether Uruz is equipped on this väsen,
    // only which slot it occupies, so maxMegin is unaffected.
    trimTrailingEmptyRuneSlots(vasen);
}

// Place a rune in the exact slot the player chose - whether that slot is
// currently filled (replace), the next slot in sequence, or an empty slot reached
// only by skipping over other empty slots (e.g. clicking the right slot while
// both slots are empty). Skipped slots are recorded as `null` placeholders, which
// render and behave as empty slots everywhere they're read.
function placeRuneInSlot(vasen, runeId, slotIndex) {
    if (slotIndex < vasen.runes.length) {
        // Targeted slot is within the current array - replace (or fill, if it
        // currently holds a null placeholder) directly at that index
        const removedRune = vasen.runes[slotIndex];
        vasen.runes[slotIndex] = runeId;
        syncMeginForRuneChange(vasen, runeId, removedRune);
        return;
    }

    // Targeted slot is beyond the current array - pad any skipped slots
    while (vasen.runes.length < slotIndex) {
        vasen.runes.push(null);
    }
    vasen.runes.push(runeId);
    syncMeginForRuneChange(vasen, runeId);
}

// Place a rune when no slot was chosen: fill the first empty slot, add a slot
// if there is room, or replace the last slot when all slots are full
function placeRuneInFirstFreeSlot(vasen, runeId, maxRunes) {
    // Count actually-equipped runes (ignoring null placeholders), since
    // array length alone doesn't reflect how many slots are filled.
    const equippedCount = vasen.runes.filter(r => r !== null).length;
    const nullIndex = vasen.runes.indexOf(null);

    if (nullIndex !== -1) {
        vasen.runes[nullIndex] = runeId;
        syncMeginForRuneChange(vasen, runeId);
    } else if (equippedCount < maxRunes) {
        vasen.runes.push(runeId);
        syncMeginForRuneChange(vasen, runeId);
    } else {
        const indexToReplace = vasen.runes.length - 1;
        const removedRune = vasen.runes[indexToReplace];
        vasen.runes[indexToReplace] = runeId;
        syncMeginForRuneChange(vasen, runeId, removedRune);
    }
}

// GameState manages all persistent game data including inventory, progression, and saves
class GameState {
    constructor() {
        this.playerName = '';
        this.playerFace = 'plain';
        this.playerLevel = 1;
        
        // Party: array of 3 slots, each can hold a VasenInstance or null.
        // Runes belong to each väsen (vasen.runes), not to party slots, so they
        // stay equipped when a väsen leaves the party.
        this.party = [null, null, null];

        // Collection of all caught Vasen (capped at GAME_CONFIG.MAX_INVENTORY_SIZE)
        this.vasenCollection = [];
        
        // Inventory of taming items: { itemId: count }
        this.itemInventory = {};
        
        // Set of collected rune IDs
        this.collectedRunes = new Set();
        
        // Set of favorite väsen IDs (shown first in inventory)
        this.favoriteVasen = new Set();

        // Set of favorite item IDs (shown first in item inventory)
        this.favoriteItems = new Set();

        // Set of favorite rune IDs (shown first in rune inventory)
        this.favoriteRunes = new Set();

        // Set of favorite Game Guide category keys (shown first in the Game Guide)
        this.favoriteGuideCategories = new Set();

        // Set of favorite Lore Book category keys (shown first in the Lore Book)
        this.favoriteLoreCategories = new Set();

        // Set of favorite lore entry keys (shown first within their category)
        this.favoriteLoreEntries = new Set();

        // Set of unlocked lore entry keys
        this.unlockedLoreEntries = new Set();

        // Set of lore entry keys the player has opened at least once
        // (unopened unlocked entries get a small marker in the Lore Book)
        this.readLoreEntries = new Set();

        // Lore Book tutorial: key of the first lore entry the player unlocked
        // (glows in the Lore Book until expanded), or null. Only set before the
        // book has been opened for the first time; later unlocks never glow.
        this.tutorialLoreEntry = null;

        // Set of discovered skill names (ABILITIES keys), found by having the
        // skill unlocked on a väsen. Gates the Lore Book "i" info for skills.
        this.discoveredSkills = new Set();

        // Set of discovered taming item ids, found by taming the väsen the item
        // belongs to. Gates the Lore Book "i" info for items.
        this.discoveredItems = new Set();

        // Zone progression
        this.currentZone = 'ZONE1';
        this.defeatedGuardians = new Set();
        // This save's guardians, rolled when the save is created (see
        // generateGuardianRosters). null: an older save with the fixed guardians.
        this.guardians = null;
        
        this.achievements = createDefaultAchievements();
        
        // Game flags
        this.gameStarted = false;
        this.runeMenuFirstOpen = false;
        this.firstCombatTutorialShown = false;
        this.firstExploreTutorialShown = false;
        this.loreBookTutorialShown = false;
        this.runeEquipTutorialShown = false;
        this.firstTameMessageShown = false;
        this.guardianHintShown = false;
        this.minimizedTips = new Set(); // ids of tips the player collapsed (see getTipHTML)
        
        this.endlessTowerRecord = createDefaultEndlessTowerRecord();

        // Current combat state (not saved)
        this.currentCombat = null;
        this.currentEncounter = null;
        this.inCombat = false;

        // UI lock (not saved)
        this.uiLocked = false;
        
        // Exploration pity counters (anti-grief system)
        this.combatCounter = 0;      // Increments on non-combat, resets on combat
        this.itemCounter = 0;        // Increments on non-item, resets on item
        this.runeCounter = 0;        // Increments on non-rune, resets on rune
        this.sacredWellCounter = 0;  // Increments on combats only, resets on Sacred Well
        this.lastEncounterType = null; // Tracks last encounter to prevent consecutive Sacred Wells

        // Same-väsen pity counter: tracks consecutive wild encounters of the
        // same species. Once the same species has appeared twice in a row,
        // the next wild väsen encounter is guaranteed to be a different
        // species, and the counter resets.
        this.lastVasenSpecies = null;
        this.sameVasenCounter = 0;

        // Number of remaining wild väsen encounters guaranteed to be Nature
        // element, counting down from GAME_CONFIG.STARTER_GUARANTEED_NATURE_BATTLES
        // at the start of a new game. Set by resetGame(); 0 means no guarantee
        // is currently active.
        this.starterNatureBattlesRemaining = 0;

        // Save slot this game is stored in (index into SAVE_SLOT_KEYS, not saved)
        this.saveSlot = 0;
        // Set when this tab must stop writing: the save ended, or another tab
        // continued this save (not saved). See 7b-system-saves.js.
        this.saveBlocked = false;
        this.resetRunFields();
    }

    // Save modes and run bookkeeping (see 7b-system-saves.js and 9g-game-modes.js).
    // Modes are chosen when a new game starts and never change afterwards.
    resetRunFields() {
        this.modes = createDefaultModes(); // Ragnarök Mode rules (see 7a-system-saves.js)
        this.runId = null;          // Identifies this save across tabs and files
        this.createdAt = null;      // When the game was started (null for saves older than this field)
        this.saveCounter = 0;       // Increases on every write of a Ragnarök save
        this.ended = null;          // Permadeath: { cause, date } once no väsen are left
        this.fallenVasen = [];      // Permadeath: records of väsen that died, oldest first
        this.pendingCombat = null;  // A Ragnarök combat in progress (see 9g)
        this.pendingEncounter = null; // A rolled wild encounter not yet fought (Ragnarök only)
        // Everything ever collected, so profile counts never go down when a
        // väsen dies or is released, or a rune is lost
        this.foundRunes = new Set();
        this.tamedSpecies = new Set();
    }

    // True when the save has any Ragnarök Mode rule on
    hasModes() {
        return getActiveModeIds(this.modes).length > 0;
    }

    // Weak Healing: multiplier for healing outside combat (1 when the rule is off)
    getHealMultiplier() {
        return this.modes.weakHealing ? GAME_MODES.weakHealing.healMultiplier : 1;
    }

    // More Fights: exploration odds with wild väsen raised to the rule's share
    // and the other finds scaled down to fit (the normal odds when it is off)
    getExplorationRates() {
        if (!this.modes.moreFights) return EXPLORATION_RATES;
        const wild = GAME_MODES.moreFights.wildChance;
        const scale = (1 - wild) / (1 - EXPLORATION_RATES.WILD_VASEN);
        return {
            WILD_VASEN: wild,
            ITEM: EXPLORATION_RATES.ITEM * scale,
            SACRED_WELL: EXPLORATION_RATES.SACRED_WELL * scale,
            RUNE: EXPLORATION_RATES.RUNE * scale
        };
    }

    // Pity threshold (GAME_CONFIG key). More Fights makes items, Sacred Wells
    // and runes wait longer, so their pity doesn't undo the rule.
    getPityThreshold(key) {
        const base = GAME_CONFIG[key];
        if (!this.modes.moreFights || key === 'PITY_COMBAT_THRESHOLD') return base;
        return Math.round(base * GAME_MODES.moreFights.pityMultiplier);
    }

    // Runes ever found (runes lost to Lost Runes still count)
    getFoundRuneCount() {
        return new Set([...this.foundRunes, ...this.collectedRunes]).size;
    }

    // localStorage key of this game's save slot
    get saveKey() {
        return getSaveSlotKey(this.saveSlot);
    }
    
    // count väsen types tamed
    // Väsen types ever tamed (released or fallen väsen still count)
    getUniqueSpeciesTamed() {
        const set = new Set(this.tamedSpecies);
        this.vasenCollection.forEach(v => set.add(v.speciesName));
        return set.size;
    }
    
    // Toggle favorite status for a väsen
    toggleFavorite(vasenId) {
        if (this.favoriteVasen.has(vasenId)) {
            this.favoriteVasen.delete(vasenId);
            this.saveGame();
            return false; // No longer favorite
        } else {
            this.favoriteVasen.add(vasenId);
            this.saveGame();
            return true; // Now favorite
        }
    }
    
    // Check if a väsen is favorited
    isFavorite(vasenId) {
        return this.favoriteVasen.has(vasenId);
    }
    
    // Add a Vasen to collection
    addVasenToCollection(vasenInstance) {
        if (this.vasenCollection.length >= GAME_CONFIG.MAX_INVENTORY_SIZE) {
            return { success: false, message: 'Collection full. You cannot tame more Väsen.' };
        }

        // Heal to full before adding
        vasenInstance.currentHealth = vasenInstance.maxHealth;
        vasenInstance.currentMegin = vasenInstance.maxMegin;
        
        this.vasenCollection.push(vasenInstance);
        this.checkAchievements();
        this.saveGame();
        
        return { success: true, message: `${vasenInstance.displayName} has joined you.` };
    }
    
    // Add Vasen to party slot
    addToParty(vasenIdOrInstance, slotIndex) {
        // Accept either an ID or an instance
        let vasenInstance;
        if (typeof vasenIdOrInstance === 'string') {
            vasenInstance = this.vasenCollection.find(v => v.id === vasenIdOrInstance);
            if (!vasenInstance) {
                return { success: false, message: 'Väsen not found.' };
            }
        } else {
            vasenInstance = vasenIdOrInstance;
        }
        
        // Check if already in party
        const existingSlot = this.party.findIndex(v => v && v.id === vasenInstance.id);
        if (existingSlot !== -1) {
            // Already in party
            if (slotIndex === null || slotIndex === undefined || existingSlot === slotIndex) {
                return { success: false, message: `${vasenInstance.displayName} is already in party.` };
            }
            // Moving to different slot - remove from existing
            this.party[existingSlot] = null;
        }
        
        // If slotIndex is null, find first empty slot
        if (slotIndex === null || slotIndex === undefined) {
            slotIndex = this.party.findIndex(p => p === null);
            if (slotIndex === -1) {
                return { success: false, message: 'Party is full.' };
            }
        }
        
        if (slotIndex < 0 || slotIndex >= GAME_CONFIG.MAX_TEAM_SIZE) {
            return { success: false, message: 'Invalid party slot.' };
        }
        
        // Check mythical limit
        if (vasenInstance.species && vasenInstance.species.rarity === RARITIES.MYTHICAL) {
            const mythicalInParty = this.party.filter((v, i) => 
                v && v.species && v.species.rarity === RARITIES.MYTHICAL && i !== slotIndex
            );
            if (mythicalInParty.length > 0) {
                return { success: false, message: 'Only one mythical Väsen allowed in party.' };
            }
        }

        // Check duplicate species limit
        const duplicateInParty = this.party.filter((v, i) =>
            v && v.speciesName === vasenInstance.speciesName && i !== slotIndex
        );
        if (duplicateInParty.length > 0) {
            return { success: false, message: `You cannot have two ${vasenInstance.species.name} in your party.` };
        }
        
        this.party[slotIndex] = vasenInstance;
        this.saveGame();
        
        return { success: true, message: `${vasenInstance.displayName} added to party.` };
    }
    
    // Remove Vasen from party by slot index
    removeFromParty(slotIndex) {
        if (slotIndex < 0 || slotIndex >= GAME_CONFIG.MAX_TEAM_SIZE) {
            return { success: false, message: 'Invalid party slot.' };
        }
        
        this.party[slotIndex] = null;
        this.saveGame();
        
        return { success: true, message: 'Väsen removed from party.' };
    }
    
    // Remove Vasen from party by ID
    removeFromPartyById(vasenId) {
        const slotIndex = this.party.findIndex(v => v && v.id === vasenId);
        if (slotIndex === -1) {
            return { success: false, message: 'Väsen not found in party.' };
        }
        
        return this.removeFromParty(slotIndex);
    }
    
    // Swap party slots
    swapPartySlots(slotA, slotB) {
        if (slotA < 0 || slotA >= GAME_CONFIG.MAX_TEAM_SIZE || slotB < 0 || slotB >= GAME_CONFIG.MAX_TEAM_SIZE) {
            return { success: false, message: 'Invalid party slots.' };
        }
        
        // Swap Vasen - they keep their equipped runes
        const temp = this.party[slotA];
        this.party[slotA] = this.party[slotB];
        this.party[slotB] = temp;
        
        this.saveGame();
        return { success: true };
    }
    
    // Equip rune to a specific väsen (by vasen ID)
    equipRune(runeId, vasenId, slotIndex = null) {
        if (this.currentCombat || this.inCombat) {
            return { success: false, message: 'You cannot change runes during combat.' };
        }
        if (!this.collectedRunes.has(runeId)) {
            return { success: false, message: 'You do not own this rune.' };
        }

        // Find the väsen in collection
        const vasen = this.vasenCollection.find(v => v.id === vasenId);
        if (!vasen) {
            return { success: false, message: 'Väsen not found.' };
        }

        const maxRunes = vasen.getRuneSlotCount();
        // A slot index is honored only when it is within the väsen's current slot range
        const hasValidExplicitSlot = slotIndex !== null && slotIndex !== undefined &&
            slotIndex >= 0 && slotIndex < maxRunes;

        // Already has this rune equipped somewhere on this same väsen?
        const currentIndexOnThisVasen = vasen.runes.indexOf(runeId);
        if (currentIndexOnThisVasen !== -1) {
            // If a specific (different) slot was clicked, treat this as a swap
            if (hasValidExplicitSlot && slotIndex !== currentIndexOnThisVasen) {
                moveRuneWithinVasen(vasen, currentIndexOnThisVasen, slotIndex);
                this.saveGame();
                return { success: true, message: `Rune swapped on ${vasen.getDisplayName()}.` };
            }

            // No valid distinct slot given - this is the rune already sitting in
            // the targeted slot (or no slot context at all), so there's nothing to do.
            return { success: false, message: 'This Väsen already has this rune equipped.' };
        }

        // A rune can only be equipped on one väsen - take it from its current owner
        const previousOwner = this.vasenCollection.find(v => v.id !== vasenId && v.runes.includes(runeId));
        if (previousOwner) {
            previousOwner.unequipRune(runeId);
        }

        if (hasValidExplicitSlot) {
            placeRuneInSlot(vasen, runeId, slotIndex);
        } else {
            placeRuneInFirstFreeSlot(vasen, runeId, maxRunes);
        }

        // Any successful equip completes the rune equip tutorial
        this.runeEquipTutorialShown = true;

        this.saveGame();
        return { success: true, message: `Rune equipped to ${vasen.getDisplayName()}.` };
    }

    // Unequip rune from a specific väsen
    unequipRune(vasenId, runeId) {
        if (this.currentCombat || this.inCombat) {
            return { success: false, message: 'You cannot change runes during combat.' };
        }
        // Find the väsen in collection
        const vasen = this.vasenCollection.find(v => v.id === vasenId);
        if (!vasen) {
            return { success: false, message: 'Väsen not found.' };
        }
        
        if (!vasen.runes.includes(runeId)) {
            return { success: false, message: 'This Väsen does not have this rune equipped.' };
        }
        
        vasen.unequipRune(runeId);

        // Trim trailing empty placeholders left behind (e.g. if the slot ahead of
        // the removed rune was itself empty)
        trimTrailingEmptyRuneSlots(vasen);

        this.saveGame();
        return { success: true, message: `Rune removed from ${vasen.getDisplayName()}.` };
    }
    
    // Find which väsen has a rune equipped (searches entire collection)
    findRuneOwner(runeId) {
        return this.vasenCollection.find(v => v.runes.includes(runeId)) || null;
    }
    
    // Add item to inventory
    addItem(itemId, count = 1) {
        if (!TAMING_ITEMS[itemId]) {
            console.error('Invalid item:', itemId);
            return false;
        }
        
        if (!this.itemInventory[itemId]) {
            this.itemInventory[itemId] = 0;
        }
        
        this.itemInventory[itemId] = Math.min(this.itemInventory[itemId] + count, GAME_CONFIG.MAX_ITEM_STACK);
        this.saveGame();
        return true;
    }
    
    // Remove item from inventory
    removeItem(itemId, count = 1) {
        if (!this.itemInventory[itemId] || this.itemInventory[itemId] < count) {
            return false;
        }
        
        this.itemInventory[itemId] -= count;
        if (this.itemInventory[itemId] <= 0) {
            delete this.itemInventory[itemId];
        }
        
        this.saveGame();
        return true;
    }
    
    // Get item count
    getItemCount(itemId) {
        return this.itemInventory[itemId] || 0;
    }
    
    // Collect a rune
    collectRune(runeId) {
        if (this.collectedRunes.has(runeId)) {
            return { success: false, message: 'You already have this rune.' };
        }
        
        this.collectedRunes.add(runeId);
        
        // Auto-equip to first party väsen that has an empty rune slot
        for (let i = 0; i < GAME_CONFIG.MAX_TEAM_SIZE; i++) {
            const vasen = this.party[i];
            if (vasen) {
                if (vasen.runes.length < vasen.getRuneSlotCount()) {
                    vasen.equipRune(runeId);
                    break;
                }
            }
        }
        
        this.checkAchievements();
        this.saveGame();
        
        const rune = RUNES[runeId];
        return { 
            success: true, 
            message: `You discovered ${rune.symbol} ${rune.name}.`,
            rune: rune
        };
    }
    
    // Check if all runes collected
    hasAllRunes() {
        return this.getFoundRuneCount() >= Object.keys(RUNES).length;
    }

    // Unlock a single lore entry by key; returns true if newly unlocked
    unlockLoreEntry(key) {
        if (!LORE_ENTRIES[key]) return false;
        if (this.unlockedLoreEntries.has(key)) return false;
        this.unlockedLoreEntries.add(key);
        this.checkAchievements();
        this.saveGame();
        return true;
    }

    // Unlock all standard lore entries and the starting zone entry
    unlockStandardLoreEntries() {
        LORE_STANDARD_KEYS.forEach(k => this.unlockLoreEntry(k));
        // Trollskogen is always the starting zone - unlock its lore entry
        this.unlockLoreEntry('location_trollskogen');
    }

    // Scan existing game state and retroactively unlock all earned lore entries.
    // Uses batch pattern - adds directly to the Set, single save at the end.
    retroactivelyUnlockLoreEntries() {
        // Remove stale keys from deleted or renamed lore entries so the count stays accurate
        this.unlockedLoreEntries.forEach(k => {
            if (!LORE_ENTRIES[k]) this.unlockedLoreEntries.delete(k);
        });

        const unlock = (key) => {
            if (LORE_ENTRIES[key]) this.unlockedLoreEntries.add(key);
        };

        // Standard entries (auto-unlocked at game start) + starting zone
        LORE_STANDARD_KEYS.forEach(k => unlock(k));
        unlock('location_trollskogen');

        // Unlock entries earned by väsen already in collection
        this.vasenCollection.forEach(vasen => {
            const species = vasen.species;
            if (!species) return;

            findLoreEntryKeys('vasen', vasen.speciesName).forEach(unlock);
            findLoreEntryKeys('family', species.family).forEach(unlock);
            findLoreEntryKeys('element', species.element).forEach(unlock);

            // Skill entries - only skills the väsen has actually learned at its current level
            vasen.getAvailableSkills().forEach(skillName => {
                findLoreEntryKeys('skill', skillName).forEach(unlock);
            });

            if (species.tamingItem) {
                findLoreEntryKeys('item', species.tamingItem).forEach(unlock);
            }
        });

        // Zone entries for all zones the player has unlocked
        findLoreEntryKeys('zone').forEach(k => {
            if (this.isZoneUnlocked(LORE_ENTRIES[k].unlockKey)) unlock(k);
        });

        // Guardian entries for each defeated guardian
        findLoreEntryKeys('guardian').forEach(k => {
            if (this.defeatedGuardians.has(LORE_ENTRIES[k].unlockKey)) unlock(k);
        });

        // Offering entries - unlocked once the player has made their first offer
        if (this.firstCombatTutorialShown) {
            findLoreEntryKeys('offering').forEach(unlock);
        }

        // Single save at the end
        this.checkAchievements();
        this.saveGame();
    }

    // Check if all lore entries are unlocked
    hasAllLoreEntries() {
        return this.unlockedLoreEntries.size >= LORE_TOTAL;
    }

    // Record every skill and taming item discovered so far. A skill is discovered
    // once it is unlocked on a väsen in the collection, an item once the väsen it
    // belongs to is in the collection. Already unlocked lore entries count too, so
    // discoveries from released väsen are kept. Only ever adds, so discoveries
    // persist after a väsen is released. Does not save by itself (saveGame() calls it).
    syncDiscoveries() {
        this.collectedRunes.forEach(runeId => this.foundRunes.add(runeId));
        this.vasenCollection.forEach(vasen => {
            this.tamedSpecies.add(vasen.speciesName);
            vasen.getAvailableSkills().forEach(skillName => this.discoveredSkills.add(skillName));
            if (vasen.species.tamingItem) this.discoveredItems.add(vasen.species.tamingItem);
        });

        this.unlockedLoreEntries.forEach(key => {
            const entry = LORE_ENTRIES[key];
            if (!entry) return;

            if (entry.unlockType === 'skill' && ABILITIES[entry.unlockKey]) {
                this.discoveredSkills.add(entry.unlockKey);
            } else if (entry.unlockType === 'item' && TAMING_ITEMS[entry.unlockKey]) {
                this.discoveredItems.add(entry.unlockKey);
            } else if (entry.unlockType === 'vasen' && VASEN_SPECIES[entry.unlockKey] && VASEN_SPECIES[entry.unlockKey].tamingItem) {
                this.discoveredItems.add(VASEN_SPECIES[entry.unlockKey].tamingItem);
            }
        });
    }

    // Discovery checks used to gate the Lore Book "i" info. Kept here so the
    // rules for what counts as discovered live in one place.
    isSkillDiscovered(skillName) {
        return this.discoveredSkills.has(skillName);
    }

    isItemDiscovered(itemId) {
        return this.discoveredItems.has(itemId);
    }

    isRuneDiscovered(runeId) {
        return this.collectedRunes.has(runeId) || this.foundRunes.has(runeId);
    }

    // A bind rune is discovered once both runes of its pair are collected
    isBindRuneDiscovered(bindRune) {
        return bindRune.runes.every(runeId => this.collectedRunes.has(runeId));
    }
    
    // The guardian of a zone in this save: { name, level, team, dialogue },
    // each team member { species, level, temperament, runes }. Randomized saves
    // use their own guardians; older saves use the fixed ones. null if none.
    getGuardian(zoneId) {
        const zoneGuardian = ZONES[zoneId] && ZONES[zoneId].guardian;
        if (!zoneGuardian) return null;
        // SAVE MIGRATION (fixed guardians): saves without guardians use the fixed roster
        const roster = (this.guardians && this.guardians[zoneId]) || zoneGuardian.legacy;
        return {
            name: roster.name,
            level: zoneGuardian.level,
            dialogue: zoneGuardian.dialogue,
            team: roster.team.map(m => ({ ...m, level: zoneGuardian.level, runes: (m.runes || []).slice() }))
        };
    }

    // Defeat guardian (the next zone unlocks implicitly, see isZoneUnlocked)
    defeatGuardian(zoneId) {
        this.defeatedGuardians.add(zoneId);
        this.checkAchievements();
        this.saveGame();
    }
    
    // Check if zone is unlocked
    isZoneUnlocked(zoneId) {
        const zoneKeys = Object.keys(ZONES);
        const zoneIndex = zoneKeys.indexOf(zoneId);
        
        if (zoneIndex === 0) return true; // First zone always unlocked
        
        // Previous zone's guardian must be defeated
        const previousZone = zoneKeys[zoneIndex - 1];
        return this.defeatedGuardians.has(previousZone);
    }
    
    // Set current zone
    setCurrentZone(zoneId) {
        if (this.isZoneUnlocked(zoneId)) {
            this.currentZone = zoneId;
            this.saveGame();
            return true;
        }
        return false;
    }
    
    // Explore current zone - returns encounter result with anti-grief pity system
    explore() {
        const zone = ZONES[this.currentZone];
        if (!zone) return null;

        const encounterType = this.rollEncounterType();
        this.lastEncounterType = encounterType;
        this.updatePityCounters(encounterType);

        let result;
        switch (encounterType) {
            case 'vasen':
                result = this.createWildEncounter();
                break;
            case 'item':
                result = this.findZoneItem(zone);
                break;
            case 'well':
                result = this.visitSacredWell();
                break;
            case 'rune':
                result = this.discoverRune();
                // Safety net: the rune roll is skipped once every rune is collected
                if (!result) return this.explore();
                break;
        }

        // With a mode on, a rolled wild encounter is saved until it is fought,
        // so reloading the page can't skip it (see 9g-game-modes.js)
        this.pendingEncounter = (result.type === 'vasen' && this.hasModes())
            ? serializeWildEncounter(result.vasen)
            : null;

        this.saveGame();
        return result;
    }

    // Decide what the next exploration finds: pity counters take priority over the random roll
    rollEncounterType() {
        // Check if all runes collected
        const allRunesCollected = this.collectedRunes.size >= RUNE_LIST.length;
        const rates = this.getExplorationRates(); // Ragnarök Mode: More Fights

        let encounterType;

        // Priority 1: Sacred Well pity (triggers after threshold combats without a well)
        if (this.sacredWellCounter >= this.getPityThreshold('PITY_SACRED_WELL_THRESHOLD')) {
            encounterType = 'well';
        }
        // Priority 2: Combat pity (triggers after threshold explores without combat)
        else if (this.combatCounter >= GAME_CONFIG.PITY_COMBAT_THRESHOLD) {
            encounterType = 'vasen';
        }
        // Priority 3: Item pity (triggers after threshold explores without an item)
        else if (this.itemCounter >= this.getPityThreshold('PITY_ITEM_THRESHOLD')) {
            encounterType = 'item';
        }
        // Priority 4: Rune pity (triggers after threshold explores without a rune, only if runes remain)
        else if (!allRunesCollected && this.runeCounter >= this.getPityThreshold('PITY_RUNE_THRESHOLD')) {
            encounterType = 'rune';
        }
        // Priority 5: Normal RNG
        else {
            const roll = Math.random();

            // If all runes collected, rune chance is added to vasen chance
            if (roll < rates.WILD_VASEN + (allRunesCollected ? rates.RUNE : 0)) {
                encounterType = 'vasen';
            } else if (roll < rates.WILD_VASEN + rates.ITEM + (allRunesCollected ? rates.RUNE : 0)) {
                encounterType = 'item';
            } else if (roll < rates.WILD_VASEN + rates.ITEM + rates.SACRED_WELL + (allRunesCollected ? rates.RUNE : 0)) {
                encounterType = 'well';
            } else {
                encounterType = 'rune';
            }
        }

        // Prevent consecutive Sacred Wells - re-roll as a combat encounter
        if (encounterType === 'well' && this.lastEncounterType === 'well') {
            encounterType = 'vasen';
        }

        return encounterType;
    }

    // Reset the pity counter of the encounter type that was found and advance the others
    updatePityCounters(encounterType) {
        switch (encounterType) {
            case 'vasen':
                this.combatCounter = 0;       // Reset: got combat
                this.itemCounter++;           // Increment: not an item
                this.runeCounter++;           // Increment: not a rune
                this.sacredWellCounter++;     // Increment: combat occurred
                break;
            case 'item':
                this.combatCounter++;         // Increment: not combat
                this.itemCounter = 0;         // Reset: got item
                this.runeCounter++;           // Increment: not a rune
                // sacredWellCounter unchanged: only increments on combats
                break;
            case 'well':
                this.combatCounter++;         // Increment: not combat
                this.itemCounter++;           // Increment: not an item
                this.runeCounter++;           // Increment: not a rune
                this.sacredWellCounter = 0;   // Reset: got Sacred Well
                break;
            case 'rune':
                this.combatCounter++;         // Increment: not combat
                this.itemCounter++;           // Increment: not an item
                this.runeCounter = 0;         // Reset: got rune
                // sacredWellCounter unchanged: only increments on combats
                break;
        }
    }

    // Wild väsen encounter, honoring the starter, tutorial and same-väsen pity rules
    createWildEncounter() {
        // Starter guarantee: the first few wild väsen encounters of a
        // new game are restricted to Nature element, so early combat
        // isn't decided by a bad elemental matchup roll.
        const useStarterNatureFilter = this.starterNatureBattlesRemaining > 0;
        const elementFilter = useStarterNatureFilter ? ELEMENTS.NATURE : null;

        // New-player tutorial (until the first tame): prefer väsen whose
        // desired item the player carries, so the interrogate -> offer ->
        // tame lesson is always possible. Falls back to the normal pool
        // if no carried item matches anything in this zone.
        const speciesFilter = !this.firstCombatTutorialShown
            ? name => this.itemInventory[VASEN_SPECIES[name]?.tamingItem] > 0
            : null;

        // Same-väsen pity: if the same species has appeared twice in a
        // row, guarantee a different species this time and reset the streak.
        let speciesName;
        const forceDifferentSpecies = this.sameVasenCounter >= 2 && this.lastVasenSpecies;

        if (forceDifferentSpecies) {
            // Retry a bounded number of times in case of bad luck; falls
            // back to the normal roll if the zone genuinely only has one
            // possible väsen (avoids an infinite loop in that edge case).
            let attempts = 0;
            do {
                speciesName = getRandomSpawnFromZone(this.currentZone, elementFilter, speciesFilter);
                attempts++;
            } while (speciesName === this.lastVasenSpecies && attempts < 20);
        } else {
            speciesName = getRandomSpawnFromZone(this.currentZone, elementFilter, speciesFilter);
        }

        if (useStarterNatureFilter) {
            this.starterNatureBattlesRemaining--;
        }

        // Track the consecutive same-väsen streak
        if (speciesName === this.lastVasenSpecies) {
            this.sameVasenCounter++;
        } else {
            this.lastVasenSpecies = speciesName;
            this.sameVasenCounter = 1;
        }

        const level = getRandomLevelForZone(this.currentZone);
        const vasen = createWildVasen(speciesName, level, getWildRuneCountForZone(this.currentZone));
        return { type: 'vasen', vasen };
    }

    // Find a taming item wanted by one of the väsen that spawn in this zone
    findZoneItem(zone) {
        const spawns = zone.spawns === 'ALL' ? VASEN_LIST : zone.spawns;
        const items = spawns.map(name => VASEN_SPECIES[name]?.tamingItem).filter(Boolean);
        const randomItem = items[Math.floor(Math.random() * items.length)];

        this.addItem(randomItem, 1);

        // Item dialogue is derived from the item description
        const itemData = TAMING_ITEMS[randomItem];
        const dialogue = itemData ? 'You found ' + itemData.description[0].toLowerCase() + itemData.description.slice(1) : `You found a ${randomItem}!`;

        return { type: 'item', itemId: randomItem, dialogue };
    }

    // Sacred Well: heal every tamed väsen
    visitSacredWell() {
        const anyHealed = this.applySacredWellHealing();
        const healPercent = Math.round(GAME_CONFIG.SACRED_WELL_HEAL_PERCENT * this.getHealMultiplier() * 100);
        const dialogue = anyHealed
            ? `A spring of crystal-clear water bubbles forth, shimmering with sacred power. Your Väsen drink deeply and feel renewed. All tamed Väsen are healed by <span style="color: var(--color-positive-soft); font-weight: 700;">${healPercent}%</span>.`
            : 'A spring of crystal-clear water bubbles forth, shimmering with sacred power. Your tamed Väsen are already at full vigor, but the sacred waters shimmer with approval.';
        return { type: 'well', dialogue };
    }

    // Discover a random rune the player does not own yet. Returns null when every
    // rune is already collected.
    discoverRune() {
        const uncollectedRunes = RUNE_LIST.filter(r => !this.collectedRunes.has(r));
        if (uncollectedRunes.length === 0) return null;

        const randomRune = uncollectedRunes[Math.floor(Math.random() * uncollectedRunes.length)];
        this.collectedRunes.add(randomRune);

        const runeData = RUNES[randomRune];
        const dialogue = `The wind carries a whisper of old galdr. Another rune has chosen to reveal itself to you. You discovered ${runeData.symbol} ${runeData.name}.`;

        return { type: 'rune', runeId: randomRune, dialogue };
    }
    
    // Get active party (non-null members)
    getActiveParty() {
        return this.party.filter(v => v !== null);
    }
    
    // Get alive party members
    getAliveParty() {
        return this.party.filter(v => v !== null && v.currentHealth > 0);
    }
    
    // Apply post-combat healing
    applyPostCombatHealing() {
        this.party.forEach(vasen => {
            if (vasen) {
                const healAmount = Math.floor(vasen.maxHealth * GAME_CONFIG.POST_COMBAT_HEAL_PERCENT * this.getHealMultiplier());
                vasen.currentHealth = Math.max(vasen.currentHealth, healAmount);
                vasen.currentMegin = vasen.maxMegin; // Full megin restore
            }
        });
        this.saveGame();
    }
    
    // Apply Sacred Well healing
    applySacredWellHealing() {
        let anyHealed = false;
        
        this.vasenCollection.forEach(vasen => {
            if (vasen.currentHealth < vasen.maxHealth) {
                anyHealed = true;
            }
            const healAmount = Math.floor(vasen.maxHealth * GAME_CONFIG.SACRED_WELL_HEAL_PERCENT * this.getHealMultiplier());
            vasen.currentHealth = Math.min(vasen.maxHealth, vasen.currentHealth + healAmount);
        });
        
        this.saveGame();
        return anyHealed;
    }
    
    // Use taming item on own Vasen for healing
    useItemOnVasen(itemId, vasenInstance) {
        if (vasenInstance.currentHealth >= vasenInstance.maxHealth) {
            return { success: false, message: `${vasenInstance.displayName} is already at full health.` };
        }

        const initialHealth = vasenInstance.currentHealth;

        if (!this.removeItem(itemId, 1)) {
            return { success: false, message: 'You do not have this item.' };
        }

        const isCorrectItem = vasenInstance.species.tamingItem === itemId;
        const healPercent = (isCorrectItem ? 1.0 : GAME_CONFIG.WRONG_ITEM_HEAL_PERCENT) * this.getHealMultiplier();

        const calculatedHealAmount = Math.floor(vasenInstance.maxHealth * healPercent);
        
        // Determine the actual health restored, capping at maxHealth
        const newHealth = Math.min(vasenInstance.maxHealth, initialHealth + calculatedHealAmount);
        const healAmount = newHealth - initialHealth;
        vasenInstance.currentHealth = newHealth;

        const percentDisplay = Math.round(healPercent * 100);
        const message = `${vasenInstance.displayName} health restored ${percentDisplay}%. (+${healAmount} HP)`;

        this.saveGame();

        return {
            success: true,
            message: message,
            healAmount: healAmount
        };
    }
    
    // Update Endless Tower record
    updateEndlessTowerRecord(floor, team) {
        if (floor > this.endlessTowerRecord.highestFloor) {
            this.endlessTowerRecord.highestFloor = floor;
            this.endlessTowerRecord.timestamp = Date.now();
            // Save team composition
            this.endlessTowerRecord.team = team.map(vasen => ({
                speciesName: vasen.speciesName,
                level: vasen.level,
                temperamentKey: vasen.temperamentKey,
                runes: vasen.runes.slice()
            }));
            this.saveGame();
            return true;
        }
        return false;
    }
    
    // Check and update achievements
    checkAchievements() {
        const before = { ...this.achievements };

        // Champion - Defeat all zone guardians
        const allGuardians = Object.keys(ZONES).filter(z => ZONES[z].guardian);
        if (allGuardians.every(z => this.defeatedGuardians.has(z))) {
            this.achievements.champion = true;
        }

        // Rune Master - Collect all runes
        if (this.hasAllRunes()) {
            this.achievements.rune_master = true;
        }

        // Hoarder - Tame every väsen type
        const totalSpecies = Object.keys(VASEN_SPECIES).length;
        if (this.getUniqueSpeciesTamed() === totalSpecies) {
            this.achievements.hoarder = true;
        }

        // Lore Master - Collect all lore entries
        if (this.hasAllLoreEntries()) {
            this.achievements.lore_master = true;
        }

        // Notify for newly unlocked achievements
        const achievementNames = {
            champion:    'Achievement unlocked: Champion',
            rune_master: 'Achievement unlocked: Rune Master',
            hoarder:     'Achievement unlocked: Hoarder',
            lore_master: 'Achievement unlocked: Lore Master'
        };
        if (typeof ui !== 'undefined') {
            Object.keys(achievementNames).forEach(key => {
                if (!before[key] && this.achievements[key]) {
                    ui.showMessage(achievementNames[key], 'success');
                }
            });
        }
    }
    
    // Serialize game state for saving
    serialize() {
        return {
            version: SAVE_VERSION,
            playerName: this.playerName,
            playerFace: this.playerFace,
            playerLevel: this.playerLevel,
            party: this.party.map(v => v ? v.serialize() : null),
            vasenCollection: this.vasenCollection.map(v => v.serialize()),
            itemInventory: this.itemInventory,
            collectedRunes: Array.from(this.collectedRunes),
            favoriteVasen: Array.from(this.favoriteVasen),
            favoriteItems: Array.from(this.favoriteItems),
            favoriteRunes: Array.from(this.favoriteRunes),
            favoriteGuideCategories: Array.from(this.favoriteGuideCategories),
            favoriteLoreCategories: Array.from(this.favoriteLoreCategories),
            favoriteLoreEntries: Array.from(this.favoriteLoreEntries),
            unlockedLoreEntries: Array.from(this.unlockedLoreEntries),
            readLoreEntries: Array.from(this.readLoreEntries),
            tutorialLoreEntry: this.tutorialLoreEntry,
            discoveredSkills: Array.from(this.discoveredSkills),
            discoveredItems: Array.from(this.discoveredItems),
            currentZone: this.currentZone,
            defeatedGuardians: Array.from(this.defeatedGuardians),
            guardians: this.guardians,
            achievements: this.achievements,
            gameStarted: this.gameStarted,
            runeMenuFirstOpen: this.runeMenuFirstOpen,
            firstCombatTutorialShown: this.firstCombatTutorialShown,
            firstExploreTutorialShown: this.firstExploreTutorialShown,
            loreBookTutorialShown: this.loreBookTutorialShown,
            runeEquipTutorialShown: this.runeEquipTutorialShown,
            firstTameMessageShown: this.firstTameMessageShown,
            guardianHintShown: this.guardianHintShown,
            minimizedTips: Array.from(this.minimizedTips),
            settings: this.settings,
            endlessTowerRecord: this.endlessTowerRecord,
            // Pity counters for exploration anti-grief system
            combatCounter: this.combatCounter,
            itemCounter: this.itemCounter,
            runeCounter: this.runeCounter,
            sacredWellCounter: this.sacredWellCounter,
            lastEncounterType: this.lastEncounterType,
            // Same-väsen pity counter
            lastVasenSpecies: this.lastVasenSpecies,
            sameVasenCounter: this.sameVasenCounter,
            // Starter guaranteed-Nature-battle counter
            starterNatureBattlesRemaining: this.starterNatureBattlesRemaining,
            // Save modes and run bookkeeping (older versions of the game ignore these)
            modes: this.modes,
            runId: this.runId,
            createdAt: this.createdAt,
            saveCounter: this.saveCounter,
            ended: this.ended,
            fallenVasen: this.fallenVasen,
            foundRunes: Array.from(this.foundRunes),
            tamedSpecies: Array.from(this.tamedSpecies),
            pendingCombat: this.pendingCombat,
            pendingEncounter: this.pendingEncounter
        };
    }

    // Deserialize game state from save data.
    //
    // SAVE MIGRATIONS - code that exists only so saves made by older versions
    // still load. Each one is tagged "SAVE MIGRATION (<name>)" at every place
    // it touches, with removal steps next to it. When a new version or rebuild
    // no longer needs to load those saves, search for the tag and remove it.
    //   (legacy item ids)        items stored by name -> 4-core-items.js
    //   (fixed guardians)        pre-randomized guardians -> 5-core-instance.js
    //   (read lore entries)      unread lore markers, below
    //   (latestLoreEntry)        old Lore Book tutorial field, below
    //   (loreBookTutorialShown)  flag inferred for old saves, below
    //   (runeEquipTutorialShown) flag inferred for old saves, below
    // Plain defaults for missing fields (`data.x || 0`) are not migrations:
    // they keep loading safe and should stay.
    deserialize(data) {
        if (!data || data.version !== SAVE_VERSION) {
            console.warn('Save version mismatch or invalid data');
            return false;
        }
        
        try {
            this.playerName = data.playerName || '';
            this.playerFace = data.playerFace || 'plain';
            this.playerLevel = data.playerLevel || 1;
            
            // Restore Vasen collection first (runes are stored on each väsen)
            // This includes a purge function to remove faulty or outdated väsen from the save
            this.vasenCollection = (data.vasenCollection || []).map(vData => {
                try {
                    const vasen = VasenInstance.deserialize(vData);
                    // Also check if the species exists in case deserialize() doesn't throw
                    if (vasen && VASEN_SPECIES[vasen.speciesName]) {
                        return vasen;
                    }
                    console.warn('Purging vasen with non-existent species:', vData.speciesName);
                    return null;
                } catch(e) {
                    console.warn('Error deserializing vasen, removing from save.', e);
                    return null;
                }
            }).filter(v => v !== null);
            
            // Restore party with references to collection
            this.party = (data.party || [null, null, null]).map(vData => {
                if (!vData) return null;
                // Find matching Vasen in collection by id
                return this.vasenCollection.find(v => v.id === vData.id) || null;
            });
            
            // Unknown item ids are dropped.
            // SAVE MIGRATION (legacy item ids): normalizeItemId converts old
            // name-based ids, see 4-core-items.js. Remove with that block.
            this.itemInventory = {};
            Object.entries(data.itemInventory || {}).forEach(([id, count]) => {
                const itemId = normalizeItemId(id);
                if (!TAMING_ITEMS[itemId] || !(count > 0)) return;
                this.itemInventory[itemId] = Math.min((this.itemInventory[itemId] || 0) + count, GAME_CONFIG.MAX_ITEM_STACK);
            });
            this.collectedRunes = new Set(data.collectedRunes || []);
            this.favoriteVasen = new Set(data.favoriteVasen || []);
            // SAVE MIGRATION (legacy item ids)
            this.favoriteItems = new Set((data.favoriteItems || []).map(normalizeItemId).filter(id => TAMING_ITEMS[id]));
            this.favoriteRunes = new Set(data.favoriteRunes || []);
            this.favoriteGuideCategories = new Set(data.favoriteGuideCategories || []);
            this.favoriteLoreCategories = new Set(data.favoriteLoreCategories || []);
            this.favoriteLoreEntries = new Set(data.favoriteLoreEntries || []);
            this.unlockedLoreEntries = new Set(data.unlockedLoreEntries || []);
            // SAVE MIGRATION (read lore entries): saves from before read tracking
            // count everything already unlocked as read, so the whole book
            // doesn't light up. To remove: new Set(data.readLoreEntries || [])
            this.readLoreEntries = new Set(data.readLoreEntries || data.unlockedLoreEntries || []);
            // SAVE MIGRATION (latestLoreEntry): older saves stored the latest
            // unread entry (latestLoreEntry) instead; it only carries over while
            // the Lore Book tutorial is still pending.
            // To remove: const tutorialKey = data.tutorialLoreEntry;
            const tutorialKey = data.tutorialLoreEntry !== undefined
                ? data.tutorialLoreEntry
                : (data.loreBookTutorialShown ? null : data.latestLoreEntry);
            this.tutorialLoreEntry = (tutorialKey && LORE_ENTRIES[tutorialKey] && this.unlockedLoreEntries.has(tutorialKey))
                ? tutorialKey : null;
            // Default to empty for saves made before discoveries were tracked;
            // saveGame() fills them in from the collection and unlocked lore entries.
            // Ids that no longer exist are dropped so renamed or removed skills/items don't linger.
            this.discoveredSkills = new Set((data.discoveredSkills || []).filter(id => ABILITIES[id]));
            // SAVE MIGRATION (legacy item ids)
            this.discoveredItems = new Set((data.discoveredItems || []).map(normalizeItemId).filter(id => TAMING_ITEMS[id]));
            this.currentZone = data.currentZone || 'ZONE1';
            this.defeatedGuardians = new Set(data.defeatedGuardians || []);
            // SAVE MIGRATION (fixed guardians): null for saves from before
            // guardians were randomized (they keep the fixed ones)
            this.guardians = normalizeGuardianRosters(data.guardians);

            this.achievements = data.achievements || createDefaultAchievements();
            this.gameStarted = data.gameStarted || false;
            this.runeMenuFirstOpen = data.runeMenuFirstOpen || false;
            this.firstCombatTutorialShown = data.firstCombatTutorialShown || false;
            this.firstExploreTutorialShown = data.firstExploreTutorialShown || false;
            // SAVE MIGRATION (loreBookTutorialShown): saves from before this flag
            // existed treat players who already unlocked lore beyond the
            // starting entries as past the tutorial.
            // To remove: this.loreBookTutorialShown = data.loreBookTutorialShown || false;
            this.loreBookTutorialShown = data.loreBookTutorialShown !== undefined
                ? data.loreBookTutorialShown
                : (data.unlockedLoreEntries || []).length > LORE_STANDARD_KEYS.length + 1;
            // SAVE MIGRATION (runeEquipTutorialShown): saves from before this
            // flag existed treat a väsen already wearing two runes as proof the
            // player knows how to equip them.
            // To remove: this.runeEquipTutorialShown = data.runeEquipTutorialShown || false;
            this.runeEquipTutorialShown = data.runeEquipTutorialShown !== undefined
                ? data.runeEquipTutorialShown
                : this.vasenCollection.some(v => v.runes.filter(r => r !== null).length >= 2);
            this.firstTameMessageShown = data.firstTameMessageShown || false;
            this.guardianHintShown = data.guardianHintShown || false;
            this.minimizedTips = new Set(data.minimizedTips || []);
            
            this.endlessTowerRecord = data.endlessTowerRecord || createDefaultEndlessTowerRecord();
            
            // Restore pity counters (default to 0 for backwards compatibility)
            this.combatCounter = data.combatCounter || 0;
            this.itemCounter = data.itemCounter || 0;
            this.runeCounter = data.runeCounter || 0;
            this.sacredWellCounter = data.sacredWellCounter || 0;
            this.lastEncounterType = data.lastEncounterType || null;

            // Restore same-väsen pity counter (default for backwards compatibility)
            this.lastVasenSpecies = data.lastVasenSpecies || null;
            this.sameVasenCounter = data.sameVasenCounter || 0;

            // Restore starter guaranteed-Nature-battle counter (default 0 for
            // backwards compatibility - the guarantee only ever matters at the
            // very start of a new game, so old saves simply have none left)
            this.starterNatureBattlesRemaining = data.starterNatureBattlesRemaining || 0;

            // Save modes and run bookkeeping (saves made before modes existed
            // are normal saves with nothing pending)
            this.modes = normalizeModes(data.modes);
            this.runId = data.runId || null;
            this.createdAt = data.createdAt || null;
            this.saveCounter = data.saveCounter || 0;
            this.ended = data.ended || null;
            this.fallenVasen = Array.isArray(data.fallenVasen) ? data.fallenVasen : [];
            // Everything ever collected (saves older than these fields start
            // from what they hold now)
            this.foundRunes = new Set([...(data.foundRunes || []), ...this.collectedRunes].filter(id => RUNES[id]));
            this.tamedSpecies = new Set([
                ...(data.tamedSpecies || []),
                ...this.vasenCollection.map(v => v.speciesName),
                ...this.fallenVasen.map(f => f.speciesName)
            ].filter(name => VASEN_SPECIES[name]));
            this.pendingCombat = data.pendingCombat || null;
            this.pendingEncounter = data.pendingEncounter || null;

            return true;
        } catch (e) {
            console.error('Error deserializing game state:', e);
            return false;
        }
    }
    
    // Save game to localStorage
    saveGame() {
        // Never save mid-combat - party health is in a transient combat state.
        // All end-of-combat paths set inCombat = false before saving.
        // (Mode-protected combats write their checkpoints with writeSave().)
        if (this.inCombat) return true;
        return this.writeSave();
    }

    // Write the save to its slot, also mid-combat. Saves with a mode on go
    // through the run guard, which refuses the write if this tab's copy is out
    // of date (another tab continued it) or the save has ended.
    writeSave() {
        if (this.saveBlocked) return false;
        // Capture any newly discovered skills/items before persisting, so they
        // are never lost if a väsen is released afterwards.
        this.syncDiscoveries();
        if (!RunGuard.beforeWrite(this)) return false;
        try {
            const saveData = JSON.stringify(this.serialize());
            localStorage.setItem(this.saveKey, saveData);
            RunGuard.afterWrite(this);
            return true;
        } catch (e) {
            console.error('Error saving game:', e);
            return false;
        }
    }

    // Load game from localStorage
    loadGame() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (!saveData) return false;
            
            const data = JSON.parse(saveData);
            return this.deserialize(data);
        } catch (e) {
            console.error('Error loading game:', e);
            return false;
        }
    }
    
    // Export save data as readable JSON (used for the downloadable save file).
    exportSaveFile() {
        try {
            return JSON.stringify(this.serialize(), null, 2);
        } catch (e) {
            console.error('Error exporting save file:', e);
            return null;
        }
    }

    // Save files are imported by Game.importSaveIntoSlot() (9g-game-modes.js),
    // which reads them with parseSaveText() and puts them into a save slot.

    // Reset game
    resetGame() {
        localStorage.removeItem(this.saveKey);
        localStorage.removeItem('combatRunesVisible');
        localStorage.removeItem('combatDescriptionVisible');
        localStorage.removeItem('combatCardsMinimized');

        this.playerName = '';
        this.playerFace = 'plain';
        this.playerLevel = 1;
        this.party = [null, null, null];
        this.vasenCollection = [];
        this.itemInventory = {};
        this.collectedRunes = new Set();
        this.favoriteVasen = new Set();
        this.favoriteItems = new Set();
        this.favoriteRunes = new Set();
        this.favoriteGuideCategories = new Set();
        this.favoriteLoreCategories = new Set();
        this.favoriteLoreEntries = new Set();
        this.unlockedLoreEntries = new Set();
        this.readLoreEntries = new Set();
        this.tutorialLoreEntry = null;
        this.discoveredSkills = new Set();
        this.discoveredItems = new Set();
        this.currentZone = 'ZONE1';
        this.defeatedGuardians = new Set();
        this.guardians = null;
        this.achievements = createDefaultAchievements();
        this.gameStarted = false;
        this.runeMenuFirstOpen = false;
        this.firstCombatTutorialShown = false;
        this.firstExploreTutorialShown = false;
        this.loreBookTutorialShown = false;
        this.runeEquipTutorialShown = false;
        this.firstTameMessageShown = false;
        this.guardianHintShown = false;
        this.minimizedTips = new Set();
        this.currentCombat = null;
        this.currentEncounter = null;
        this.inCombat = false;
        
        this.endlessTowerRecord = createDefaultEndlessTowerRecord();
        
        // Reset pity counters
        this.combatCounter = 0;
        this.itemCounter = 0;
        this.runeCounter = 0;
        this.sacredWellCounter = 0;

        // Reset same-väsen pity counter
        this.lastVasenSpecies = null;
        this.sameVasenCounter = 0;

        // Arm the starter guaranteed-Nature-battle counter for the new game
        this.starterNatureBattlesRemaining = GAME_CONFIG.STARTER_GUARANTEED_NATURE_BATTLES;

        // Modes and run bookkeeping are set again by startRun() for a new game
        this.resetRunFields();
        this.saveBlocked = false;
    }

    // Begin a new run with the chosen modes (called right after resetGame())
    startRun(modes) {
        this.modes = normalizeModes(modes);
        this.runId = generateRunId();
        this.createdAt = Date.now();
        this.saveCounter = 0;
        // Every new save gets its own guardians
        this.guardians = generateGuardianRosters();
    }
}

// Global game state instance
const gameState = new GameState();
