// =============================================================================
// 7-game-state.js - Game State Management and Save/Load System
// =============================================================================

// GameState manages all persistent game data including inventory, progression, and saves
class GameState {
    constructor() {
        this.playerName = '';
        this.playerLevel = 1;
        
        // Party: array of 3 slots, each can hold a VasenInstance or null
        this.party = [null, null, null];
        
        // Note: Runes are now bound to individual Väsen (stored in vasen.runes),
        // not to party slots. This allows väsen to keep their runes when removed from party.
        
        // Collection of all caught Vasen (max 99)
        this.vasenCollection = [];
        
        // Inventory of taming items: { itemId: count }
        this.itemInventory = {};
        
        // Set of collected rune IDs
        this.collectedRunes = new Set();
        
        // Set of favorite väsen IDs (shown first in inventory)
        this.favoriteVasen = new Set();
        
        // Zone progression
        this.currentZone = 'TROLLSKOGEN';
        this.defeatedGuardians = new Set();
        
        // Achievements
        this.achievements = {
            champion: false,
            rune_master: false,
            hoarder: false,
        };
        
        // Game flags
        this.gameStarted = false;
        this.runeMenuFirstOpen = false;
        
        // Endless Tower tracking
        this.endlessTowerRecord = {
            highestFloor: 0,
            team: [], // Array of { speciesName, level, temperamentKey, runes }
            timestamp: null
        };
        
        // Current battle state (not saved)
        this.currentBattle = null;
        this.currentEncounter = null;
        this.inCombat = false;

        // UI lock (not saved)
        this.uiLocked = false;
        
        // Exploration pity counters (anti-grief system)
        this.battleCounter = 0;      // Increments on non-combat, resets on combat
        this.itemCounter = 0;        // Increments on non-item, resets on item
        this.runeCounter = 0;        // Increments on non-rune, resets on rune
        this.sacredWellCounter = 0;  // Increments on battles only, resets on Sacred Well
    }
    
    // count väsen types tamed
    getUniqueSpeciesTamed() {
    const set = new Set();
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
    
    // Initialize new game with starter Vasen
    startNewGame(starterSpeciesId, starterTemperament) {
        const speciesData = VASEN_SPECIES[starterSpeciesId];
        if (!speciesData) {
            console.error('Invalid starter species:', starterSpeciesId);
            return false;
        }
        
        // Create starter Vasen at level 5 - pass species NAME (key) not data
        const starter = new VasenInstance(starterSpeciesId, GAME_CONFIG.STARTER_LEVEL, starterTemperament);
        
        // Add to collection
        this.vasenCollection.push(starter);
        this.checkAchievements();
        
        // Add to first party slot
        this.party[0] = starter;
        
        // Give starter rune (Uruz) - equip directly to the väsen
        this.collectedRunes.add('URUZ');
        starter.equipRune('URUZ');
        
        this.gameStarted = true;
        this.currentZone = 'TROLLSKOGEN';
        
        this.saveGame();
        return true;
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
        
        // Väsen keeps their equipped runes (no longer assigned from party slots)
        this.party[slotIndex] = vasenInstance;
        this.saveGame();
        
        return { success: true, message: `${vasenInstance.displayName} added to party.` };
    }
    
    // Remove Vasen from party by slot index
    removeFromParty(slotIndex) {
        if (slotIndex < 0 || slotIndex >= GAME_CONFIG.MAX_TEAM_SIZE) {
            return { success: false, message: 'Invalid party slot.' };
        }
        
        // Väsen keeps their equipped runes when removed from party
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
equipRune(runeId, vasenId) {
    if (this.currentBattle || this.inCombat) {
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

    // Determine rune slot limit
    const maxRunes = vasen.level >= GAME_CONFIG.MAX_LEVEL ? 2 : 1;

    // Already has this rune?
    if (vasen.runes.includes(runeId)) {
        return { success: false, message: 'This Väsen already has this rune equipped.' };
    }

    // If rune slots are full, replace the first rune
    if (vasen.runes.length >= maxRunes) {
        const removedRune = vasen.runes[0];
        vasen.unequipRune(removedRune);
    }

    // If another väsen has this rune, unequip it
    for (const otherVasen of this.vasenCollection) {
        if (otherVasen.id !== vasenId && otherVasen.runes.includes(runeId)) {
            otherVasen.unequipRune(runeId);
            break;
        }
    }

    // Equip the new rune
    vasen.equipRune(runeId);

    this.saveGame();
    return { success: true, message: `Rune equipped to ${vasen.getDisplayName()}.` };
}

    
    // Unequip rune from a specific väsen
    unequipRune(vasenId, runeId) {
        if (this.currentBattle || this.inCombat) {
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
                const maxRunes = vasen.level >= GAME_CONFIG.MAX_LEVEL ? 2 : 1;
                if (vasen.runes.length < maxRunes) {
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
        return this.collectedRunes.size >= Object.keys(RUNES).length;
    }
    
    // Defeat guardian and unlock next zone
    defeatGuardian(zoneId) {
        this.defeatedGuardians.add(zoneId);
        
        const zoneKeys = Object.keys(ZONES);
        const currentIndex = zoneKeys.indexOf(zoneId);
        
        // Unlock next zone
        if (currentIndex < zoneKeys.length - 1) {
            const nextZone = zoneKeys[currentIndex + 1];
            // Zone is automatically available once guardian is defeated
        }
        
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
        
        // Check if all runes collected
        const allRunesCollected = this.collectedRunes.size >= RUNE_LIST.length;
        
        let encounterType;
        
        // Priority 1: Sacred Well pity (triggers after threshold battles without a well)
        if (this.sacredWellCounter >= GAME_CONFIG.PITY_SACRED_WELL_THRESHOLD) {
            encounterType = 'well';
        }
        // Priority 2: Battle pity (triggers after threshold explores without combat)
        else if (this.battleCounter >= GAME_CONFIG.PITY_BATTLE_THRESHOLD) {
            encounterType = 'vasen';
        }
        // Priority 3: Item pity (triggers after threshold explores without an item)
        else if (this.itemCounter >= GAME_CONFIG.PITY_ITEM_THRESHOLD) {
            encounterType = 'item';
        }
        // Priority 4: Rune pity (triggers after threshold explores without a rune, only if runes remain)
        else if (!allRunesCollected && this.runeCounter >= GAME_CONFIG.PITY_RUNE_THRESHOLD) {
            encounterType = 'rune';
        }
        // Priority 5: Normal RNG
        else {
            const roll = Math.random();
            
            // If all runes collected, rune chance is added to vasen chance
            if (roll < EXPLORATION_RATES.WILD_VASEN + (allRunesCollected ? EXPLORATION_RATES.RUNE : 0)) {
                encounterType = 'vasen';
            } else if (roll < EXPLORATION_RATES.WILD_VASEN + EXPLORATION_RATES.ITEM + (allRunesCollected ? EXPLORATION_RATES.RUNE : 0)) {
                encounterType = 'item';
            } else if (roll < EXPLORATION_RATES.WILD_VASEN + EXPLORATION_RATES.ITEM + EXPLORATION_RATES.SACRED_WELL + (allRunesCollected ? EXPLORATION_RATES.RUNE : 0)) {
                encounterType = 'well';
            } else {
                encounterType = 'rune';
            }
        }
        
        // Update pity counters based on encounter type
        switch (encounterType) {
            case 'vasen':
                this.battleCounter = 0;       // Reset: got combat
                this.itemCounter++;           // Increment: not an item
                this.runeCounter++;           // Increment: not a rune
                this.sacredWellCounter++;     // Increment: battle occurred
                break;
            case 'item':
                this.battleCounter++;         // Increment: not combat
                this.itemCounter = 0;         // Reset: got item
                this.runeCounter++;           // Increment: not a rune
                // sacredWellCounter unchanged: only increments on battles
                break;
            case 'well':
                this.battleCounter++;         // Increment: not combat
                this.itemCounter++;           // Increment: not an item
                this.runeCounter++;           // Increment: not a rune
                this.sacredWellCounter = 0;   // Reset: got Sacred Well
                break;
            case 'rune':
                this.battleCounter++;         // Increment: not combat
                this.itemCounter++;           // Increment: not an item
                this.runeCounter = 0;         // Reset: got rune
                // sacredWellCounter unchanged: only increments on battles
                break;
        }
        
        // Process encounter and return result
        let result;
        
        switch (encounterType) {
            case 'vasen': {
                const speciesName = getRandomSpawnFromZone(this.currentZone);
                const level = getRandomLevelForZone(this.currentZone);
                const vasen = createWildVasen(speciesName, level);
                result = { type: 'vasen', vasen };
                break;
            }
            
            case 'item': {
                // Get items from Väsen that spawn in this zone
                const spawns = zone.spawns === 'ALL' ? VASEN_LIST : zone.spawns;
                const items = spawns.map(name => VASEN_SPECIES[name]?.tamingItem).filter(Boolean);
                const randomItem = items[Math.floor(Math.random() * items.length)];
                
                // Add to inventory
                this.addItem(randomItem, 1);
                
                // Get item dialogue
                const itemData = TAMING_ITEMS[randomItem];
                const dialogue = itemData?.foundText || `You found a ${randomItem}!`;
                
                result = { type: 'item', itemId: randomItem, dialogue };
                break;
            }
            
            case 'well': {
                const anyHealed = this.applySacredWellHealing();
                const dialogue = anyHealed 
                    ? 'A spring of crystal-clear water bubbles forth, shimmering with sacred power. Your Väsen drink deeply and feel renewed. All tamed Väsen are healed by 80%.'
                    : 'A spring of crystal-clear water bubbles forth, shimmering with sacred power. Your tamed Väsen are already at full vigor, but the sacred waters shimmer with approval.';
                result = { type: 'well', dialogue };
                break;
            }
            
            case 'rune': {
                // Get uncollected runes
                const uncollectedRunes = RUNE_LIST.filter(r => !this.collectedRunes.has(r));
                if (uncollectedRunes.length === 0) {
                    // Fallback to vasen if somehow all runes collected (shouldn't happen due to check above)
                    return this.explore();
                }
                
                const randomRune = uncollectedRunes[Math.floor(Math.random() * uncollectedRunes.length)];
                this.collectedRunes.add(randomRune);
                this.saveGame();
                
                const runeData = RUNES[randomRune];
                const dialogue = `The wind carries the scent of old magic. Another rune has chosen to reveal itself to you. You discovered ${runeData.symbol} ${runeData.name}.`;
                
                result = { type: 'rune', runeId: randomRune, dialogue };
                break;
            }
        }
        
        this.saveGame();
        return result;
    }
    
    // Get active party (non-null members)
    getActiveParty() {
        return this.party.filter(v => v !== null);
    }
    
    // Get alive party members
    getAliveParty() {
        return this.party.filter(v => v !== null && v.currentHealth > 0);
    }
    
    // Apply post-battle healing (5% to all party members)
    applyPostBattleHealing() {
        this.party.forEach(vasen => {
            if (vasen) {
                const healAmount = Math.floor(vasen.maxHealth * GAME_CONFIG.POST_BATTLE_HEAL_PERCENT);
                vasen.currentHealth = Math.max(vasen.currentHealth, healAmount);
                vasen.currentMegin = vasen.maxMegin; // Full megin restore
            }
        });
        this.saveGame();
    }
    
    // Apply Sacred Well healing (80% to all Vasen)
    applySacredWellHealing() {
        let anyHealed = false;
        
        this.vasenCollection.forEach(vasen => {
            if (vasen.currentHealth < vasen.maxHealth) {
                anyHealed = true;
            }
            const healAmount = Math.floor(vasen.maxHealth * GAME_CONFIG.SACRED_WELL_HEAL_PERCENT);
            vasen.currentHealth = Math.min(vasen.maxHealth, vasen.currentHealth + healAmount);
        });
        
        this.saveGame();
        return anyHealed;
    }
    
    // Use taming item on own Vasen for healing
    useItemOnVasen(itemId, vasenInstance) {
        if (!this.removeItem(itemId, 1)) {
            return { success: false, message: 'You do not have this item.' };
        }
        
        const item = TAMING_ITEMS[itemId];
        const isCorrectItem = vasenInstance.tamingItem === itemId;
        const healPercent = isCorrectItem ? CORRECT_ITEM_HEAL_PERCENT : WRONG_ITEM_HEAL_PERCENT;
        const healAmount = Math.floor(vasenInstance.maxHealth * healPercent);
        
        vasenInstance.currentHealth = Math.min(vasenInstance.maxHealth, vasenInstance.currentHealth + healAmount);
        
        this.saveGame();
        
        const percentDisplay = Math.round(healPercent * 100);
        return { 
            success: true, 
            message: `${vasenInstance.displayName} health restored ${percentDisplay}%.`,
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
    // Champion - Defeat all zone guardians
    const allGuardians = Object.keys(ZONES).filter(z => ZONES[z].guardian);
    if (allGuardians.every(z => this.defeatedGuardians.has(z))) {
        this.achievements.champion = true;
    }
    
    // Rune Master - Collect all runes
    if (this.hasAllRunes()) {
        this.achievements.rune_master = true;
    }

    // Hoarder - Tame every Väsen type
    const totalSpecies = Object.keys(VASEN_SPECIES).length;
    if (this.getUniqueSpeciesTamed() === totalSpecies) {
        this.achievements.hoarder = true;
    }
}
    
    // Serialize game state for saving
    serialize() {
        return {
            version: SAVE_VERSION,
            playerName: this.playerName,
            playerLevel: this.playerLevel,
            party: this.party.map(v => v ? v.serialize() : null),
            vasenCollection: this.vasenCollection.map(v => v.serialize()),
            itemInventory: this.itemInventory,
            collectedRunes: Array.from(this.collectedRunes),
            favoriteVasen: Array.from(this.favoriteVasen),
            currentZone: this.currentZone,
            defeatedGuardians: Array.from(this.defeatedGuardians),
            achievements: this.achievements,
            gameStarted: this.gameStarted,
            runeMenuFirstOpen: this.runeMenuFirstOpen,
            settings: this.settings,
            endlessTowerRecord: this.endlessTowerRecord,
            // Pity counters for exploration anti-grief system
            battleCounter: this.battleCounter,
            itemCounter: this.itemCounter,
            runeCounter: this.runeCounter,
            sacredWellCounter: this.sacredWellCounter
        };
    }
    
    // Deserialize game state from save data
    deserialize(data) {
        if (!data || data.version !== SAVE_VERSION) {
            console.warn('Save version mismatch or invalid data');
            return false;
        }
        
        try {
            this.playerName = data.playerName || '';
            this.playerLevel = data.playerLevel || 1;
            
            // Restore Vasen collection first (runes are stored on each väsen)
            this.vasenCollection = (data.vasenCollection || []).map(vData => {
                const vasen = VasenInstance.deserialize(vData);
                return vasen;
            }).filter(v => v !== null);
            
            // Restore party with references to collection
            this.party = (data.party || [null, null, null]).map(vData => {
                if (!vData) return null;
                // Find matching Vasen in collection by id
                return this.vasenCollection.find(v => v.id === vData.id) || null;
            });
            
            this.itemInventory = data.itemInventory || {};
            this.collectedRunes = new Set(data.collectedRunes || []);
            this.favoriteVasen = new Set(data.favoriteVasen || []);
            this.currentZone = data.currentZone || 'TROLLSKOGEN';
            this.defeatedGuardians = new Set(data.defeatedGuardians || []);
            this.achievements = data.achievements || {
                champion: false,
                rune_master: false,
            };
            this.gameStarted = data.gameStarted || false;
            this.runeMenuFirstOpen = data.runeMenuFirstOpen || false;
            
            // Restore Endless Tower record
            this.endlessTowerRecord = data.endlessTowerRecord || {
                highestFloor: 0,
                team: [],
                timestamp: null
            };
            
            // Restore pity counters (default to 0 for backwards compatibility)
            this.battleCounter = data.battleCounter || 0;
            this.itemCounter = data.itemCounter || 0;
            this.runeCounter = data.runeCounter || 0;
            this.sacredWellCounter = data.sacredWellCounter || 0;
            
            // Note: Runes are now stored directly on each väsen instance,
            // so no need to reassign from party slots
            
            return true;
        } catch (e) {
            console.error('Error deserializing game state:', e);
            return false;
        }
    }
    
    // Save game to localStorage
    saveGame() {
        try {
            const saveData = JSON.stringify(this.serialize());
            localStorage.setItem(SAVE_KEY, saveData);
            return true;
        } catch (e) {
            console.error('Error saving game:', e);
            return false;
        }
    }
    
    // Load game from localStorage
    loadGame() {
        try {
            const saveData = localStorage.getItem(SAVE_KEY);
            if (!saveData) return false;
            
            const data = JSON.parse(saveData);
            return this.deserialize(data);
        } catch (e) {
            console.error('Error loading game:', e);
            return false;
        }
    }
    
    // Export save data as string
    exportSave() {
        try {
            return btoa(JSON.stringify(this.serialize()));
        } catch (e) {
            console.error('Error exporting save:', e);
            return null;
        }
    }
    
    // Import save data from string
    importSave(saveString) {
        try {
            const data = JSON.parse(atob(saveString));
            if (this.deserialize(data)) {
                this.saveGame();
                return true;
            }
            return false;
        } catch (e) {
            console.error('Error importing save:', e);
            return false;
        }
    }
    
    // Reset game
    resetGame() {
        localStorage.removeItem(SAVE_KEY);
        
        this.playerName = '';
        this.playerLevel = 1;
        this.party = [null, null, null];
        this.vasenCollection = [];
        this.itemInventory = {};
        this.collectedRunes = new Set();
        this.favoriteVasen = new Set();
        this.currentZone = 'TROLLSKOGEN';
        this.defeatedGuardians = new Set();
        this.achievements = {
            champion: false,
            rune_master: false,
        };
        this.gameStarted = false;
        this.runeMenuFirstOpen = false;
        this.currentBattle = null;
        this.currentEncounter = null;
        this.inCombat = false;
        
        // Reset Endless Tower record
        this.endlessTowerRecord = {
            highestFloor: 0,
            team: [],
            timestamp: null
        };
        
        // Reset pity counters
        this.battleCounter = 0;
        this.itemCounter = 0;
        this.runeCounter = 0;
        this.sacredWellCounter = 0;
    }
}

// Global game state instance
const gameState = new GameState();
