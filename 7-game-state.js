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
        
        // Rune slots bound to party positions (index 0-2)
        this.partyRuneSlots = [
            [null, null], // Slot 0: [rune1, rune2]
            [null, null], // Slot 1: [rune1, rune2]
            [null, null]  // Slot 2: [rune1, rune2]
        ];
        
        // Collection of all caught Vasen (max 360)
        this.vasenCollection = [];
        
        // Inventory of taming items: { itemId: count }
        this.itemInventory = {};
        
        // Set of collected rune IDs
        this.collectedRunes = new Set();
        
        // Zone progression
        this.currentZone = 'TROLLSKOGEN';
        this.defeatedGuardians = new Set();
        this.endlessTowerUnlocked = false;
        
        // Endless Tower records
        this.endlessTowerRecords = {
            wild: { floor: 0, team: [] },
            guardian: { floor: 0, team: [] }
        };
        
        // Achievements
        this.achievements = {
            champion: false,
            rune_master: false,
            grinder: false,
            mega_grinder: false
        };
        
        // Game flags
        this.gameStarted = false;
        this.runeMenuFirstOpen = false;
        
        // Current battle state (not saved)
        this.currentBattle = null;
        this.currentEncounter = null;
        this.endlessTowerMode = null;
        this.endlessTowerFloor = 0;
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
        
        // Add to first party slot
        this.party[0] = starter;
        
        // Give starter rune (Uruz)
        this.collectedRunes.add('URUZ');
        this.partyRuneSlots[0][0] = 'URUZ';
        starter.runes = ['URUZ'];
        
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
        
        // Check if this specific temperament + species combo exists
        const exists = this.vasenCollection.some(v => 
            v.speciesId === vasenInstance.speciesId && 
            v.temperament === vasenInstance.temperament
        );
        
        if (exists) {
            return { success: false, message: 'You already have this Väsen with this temperament.' };
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
        if (slotIndex < 0 || slotIndex >= GAME_CONFIG.MAX_TEAM_SIZE) {
            return { success: false, message: 'Invalid party slot.' };
        }
        
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
        if (existingSlot !== -1 && existingSlot !== slotIndex) {
            // Move from existing slot
            this.party[existingSlot] = null;
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
        
        // Assign runes from slot to Vasen
        const runesInSlot = this.partyRuneSlots[slotIndex].filter(r => r !== null);
        vasenInstance.runes = runesInSlot;
        
        this.party[slotIndex] = vasenInstance;
        this.saveGame();
        
        return { success: true, message: `${vasenInstance.displayName} added to party.` };
    }
    
    // Remove Vasen from party
    removeFromParty(slotIndex) {
        if (slotIndex < 0 || slotIndex >= GAME_CONFIG.MAX_TEAM_SIZE) {
            return { success: false, message: 'Invalid party slot.' };
        }
        
        const vasen = this.party[slotIndex];
        if (vasen) {
            vasen.runes = [];
        }
        
        this.party[slotIndex] = null;
        this.saveGame();
        
        return { success: true, message: 'Väsen removed from party.' };
    }
    
    // Swap party slots
    swapPartySlots(slotA, slotB) {
        if (slotA < 0 || slotA >= GAME_CONFIG.MAX_TEAM_SIZE || slotB < 0 || slotB >= GAME_CONFIG.MAX_TEAM_SIZE) {
            return { success: false, message: 'Invalid party slots.' };
        }
        
        // Swap Vasen
        const temp = this.party[slotA];
        this.party[slotA] = this.party[slotB];
        this.party[slotB] = temp;
        
        // Swap rune assignments
        const tempRunes = this.partyRuneSlots[slotA];
        this.partyRuneSlots[slotA] = this.partyRuneSlots[slotB];
        this.partyRuneSlots[slotB] = tempRunes;
        
        // Update equipped runes on Vasen
        if (this.party[slotA]) {
            this.party[slotA].runes = this.partyRuneSlots[slotA].filter(r => r !== null);
        }
        if (this.party[slotB]) {
            this.party[slotB].runes = this.partyRuneSlots[slotB].filter(r => r !== null);
        }
        
        this.saveGame();
        return { success: true };
    }
    
    // Equip rune to party slot
    equipRune(runeId, partySlotIndex, runeSlotIndex = 0) {
        if (!this.collectedRunes.has(runeId)) {
            return { success: false, message: 'You do not own this rune.' };
        }
        
        if (partySlotIndex < 0 || partySlotIndex >= GAME_CONFIG.MAX_TEAM_SIZE) {
            return { success: false, message: 'Invalid party slot.' };
        }
        
        const vasen = this.party[partySlotIndex];
        
        // Check if rune is already equipped elsewhere
        for (let i = 0; i < GAME_CONFIG.MAX_TEAM_SIZE; i++) {
            for (let j = 0; j < 2; j++) {
                if (this.partyRuneSlots[i][j] === runeId && !(i === partySlotIndex && j === runeSlotIndex)) {
                    return { success: false, message: 'This rune is already equipped to another Väsen.' };
                }
            }
        }
        
        // Check second slot availability
        if (runeSlotIndex === 1) {
            if (!vasen || vasen.level < GAME_CONFIG.MAX_LEVEL) {
                return { success: false, message: `${vasen ? vasen.displayName : 'This Väsen'} can only equip one rune.` };
            }
        }
        
        this.partyRuneSlots[partySlotIndex][runeSlotIndex] = runeId;
        
        // Update Vasen equipped runes
        if (vasen) {
            vasen.runes = this.partyRuneSlots[partySlotIndex].filter(r => r !== null);
        }
        
        this.saveGame();
        return { success: true, message: vasen ? `Rune equipped to ${vasen.displayName}.` : 'Rune equipped to slot.' };
    }
    
    // Unequip rune from party slot
    unequipRune(partySlotIndex, runeSlotIndex) {
        if (partySlotIndex < 0 || partySlotIndex >= GAME_CONFIG.MAX_TEAM_SIZE) {
            return { success: false, message: 'Invalid party slot.' };
        }
        
        const runeId = this.partyRuneSlots[partySlotIndex][runeSlotIndex];
        if (!runeId) {
            return { success: false, message: 'No rune in this slot.' };
        }
        
        this.partyRuneSlots[partySlotIndex][runeSlotIndex] = null;
        
        // Update Vasen equipped runes
        const vasen = this.party[partySlotIndex];
        if (vasen) {
            vasen.runes = this.partyRuneSlots[partySlotIndex].filter(r => r !== null);
        }
        
        this.saveGame();
        return { success: true, message: vasen ? `Rune removed from ${vasen.displayName}.` : 'Rune removed from slot.' };
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
        
        // Auto-equip to first empty slot
        for (let i = 0; i < GAME_CONFIG.MAX_TEAM_SIZE; i++) {
            if (this.partyRuneSlots[i][0] === null) {
                this.partyRuneSlots[i][0] = runeId;
                const vasen = this.party[i];
                if (vasen) {
                    vasen.runes = this.partyRuneSlots[i].filter(r => r !== null);
                }
                break;
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
        
        // Check for endless tower unlock
        if (zoneId === 'varldens_ande') {
            this.endlessTowerUnlocked = true;
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
    
    // Explore current zone - returns encounter result
    explore() {
        const zone = ZONES[this.currentZone];
        if (!zone) return null;
        
        // Roll for encounter type
        const roll = Math.random();
        let encounterType;
        
        // Check if all runes collected - if so, rune chance becomes vasen chance
        const allRunesCollected = this.collectedRunes.size >= RUNE_LIST.length;
        
        if (roll < EXPLORATION_RATES.WILD_VASEN + (allRunesCollected ? EXPLORATION_RATES.RUNE : 0)) {
            encounterType = 'vasen';
        } else if (roll < EXPLORATION_RATES.WILD_VASEN + EXPLORATION_RATES.ITEM + (allRunesCollected ? EXPLORATION_RATES.RUNE : 0)) {
            encounterType = 'item';
        } else if (roll < EXPLORATION_RATES.WILD_VASEN + EXPLORATION_RATES.ITEM + EXPLORATION_RATES.SACRED_WELL + (allRunesCollected ? EXPLORATION_RATES.RUNE : 0)) {
            encounterType = 'well';
        } else {
            encounterType = 'rune';
        }
        
        switch (encounterType) {
            case 'vasen': {
                const speciesName = getRandomSpawnFromZone(this.currentZone);
                const level = getRandomLevelForZone(this.currentZone);
                const vasen = createWildVasen(speciesName, level);
                return { type: 'vasen', vasen };
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
                
                return { type: 'item', itemId: randomItem, dialogue };
            }
            
            case 'well': {
                const anyHealed = this.applySacredWellHealing();
                const dialogue = anyHealed 
                    ? 'A spring of crystal-clear water bubbles forth, shimmering with sacred power. Your Väsen drink deeply and feel renewed. All tamed Väsen are healed by 70%.'
                    : 'A spring of crystal-clear water bubbles forth, shimmering with sacred power. Your tamed Väsen are already at full vigor, but the sacred waters shimmer with approval.';
                return { type: 'well', dialogue };
            }
            
            case 'rune': {
                // Get uncollected runes
                const uncollectedRunes = RUNE_LIST.filter(r => !this.collectedRunes.has(r));
                if (uncollectedRunes.length === 0) {
                    // Fallback to vasen if somehow all runes collected
                    return this.explore();
                }
                
                const randomRune = uncollectedRunes[Math.floor(Math.random() * uncollectedRunes.length)];
                this.collectedRunes.add(randomRune);
                this.saveGame();
                
                const runeData = RUNES[randomRune];
                const dialogue = `The wind carries the scent of old magic. Another rune has chosen to reveal itself to you. You discovered ${runeData.symbol} ${runeData.name}.`;
                
                return { type: 'rune', runeId: randomRune, dialogue };
            }
        }
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
    
    // Apply Sacred Well healing (70% to all Vasen)
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
    
    // Update endless tower record
    updateEndlessTowerRecord(mode, floor) {
        const currentRecord = this.endlessTowerRecords[mode].floor;
        
        if (floor > currentRecord) {
            this.endlessTowerRecords[mode] = {
                floor: floor,
                team: this.getActiveParty().map(v => ({
                    name: v.displayName,
                    level: v.level,
                    runes: v.runes.map(r => RUNES[r].symbol + ' ' + RUNES[r].name)
                }))
            };
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
        
        // Grinder - Tame one of each Vasen species
        const speciesCount = new Set(this.vasenCollection.map(v => v.speciesId));
        if (speciesCount.size >= Object.keys(VASEN_SPECIES).length) {
            this.achievements.grinder = true;
        }
        
        // Mega Grinder - Tame all Vasen with all temperaments
        if (this.vasenCollection.length >= GAME_CONFIG.MAX_INVENTORY_SIZE) {
            this.achievements.mega_grinder = true;
        }
        
        this.saveGame();
    }
    
    // Serialize game state for saving
    serialize() {
        return {
            version: SAVE_VERSION,
            playerName: this.playerName,
            playerLevel: this.playerLevel,
            party: this.party.map(v => v ? v.serialize() : null),
            partyRuneSlots: this.partyRuneSlots,
            vasenCollection: this.vasenCollection.map(v => v.serialize()),
            itemInventory: this.itemInventory,
            collectedRunes: Array.from(this.collectedRunes),
            currentZone: this.currentZone,
            defeatedGuardians: Array.from(this.defeatedGuardians),
            endlessTowerUnlocked: this.endlessTowerUnlocked,
            endlessTowerRecords: this.endlessTowerRecords,
            achievements: this.achievements,
            gameStarted: this.gameStarted,
            runeMenuFirstOpen: this.runeMenuFirstOpen,
            settings: this.settings
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
            
            // Restore Vasen collection first
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
            
            this.partyRuneSlots = data.partyRuneSlots || [[null, null], [null, null], [null, null]];
            this.itemInventory = data.itemInventory || {};
            this.collectedRunes = new Set(data.collectedRunes || []);
            this.currentZone = data.currentZone || 'TROLLSKOGEN';
            this.defeatedGuardians = new Set(data.defeatedGuardians || []);
            this.endlessTowerUnlocked = data.endlessTowerUnlocked || false;
            this.endlessTowerRecords = data.endlessTowerRecords || {
                wild: { floor: 0, team: [] },
                guardian: { floor: 0, team: [] }
            };
            this.achievements = data.achievements || {
                champion: false,
                rune_master: false,
                grinder: false,
                mega_grinder: false
            };
            this.gameStarted = data.gameStarted || false;
            this.runeMenuFirstOpen = data.runeMenuFirstOpen || false;
            
            // Restore rune assignments to party Vasen
            for (let i = 0; i < GAME_CONFIG.MAX_TEAM_SIZE; i++) {
                if (this.party[i]) {
                    this.party[i].runes = this.partyRuneSlots[i].filter(r => r !== null);
                }
            }
            
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
        this.partyRuneSlots = [[null, null], [null, null], [null, null]];
        this.vasenCollection = [];
        this.itemInventory = {};
        this.collectedRunes = new Set();
        this.currentZone = 'TROLLSKOGEN';
        this.defeatedGuardians = new Set();
        this.endlessTowerUnlocked = false;
        this.endlessTowerRecords = {
            wild: { floor: 0, team: [] },
            guardian: { floor: 0, team: [] }
        };
        this.achievements = {
            champion: false,
            rune_master: false,
            grinder: false,
            mega_grinder: false
        };
        this.gameStarted = false;
        this.runeMenuFirstOpen = false;
        this.currentBattle = null;
        this.currentEncounter = null;
        this.endlessTowerMode = null;
        this.endlessTowerFloor = 0;
        this.inCombat = false;
    }
    
    // Get available temperaments for a species (ones not yet caught)
    getAvailableTemperaments(speciesId) {
        const caughtTemperaments = this.vasenCollection
            .filter(v => v.speciesId === speciesId)
            .map(v => v.temperament);
        
        return Object.keys(TEMPERAMENTS).filter(t => !caughtTemperaments.includes(t));
    }
    
    // Check if can catch more of a species
    canCatchSpecies(speciesId) {
        const available = this.getAvailableTemperaments(speciesId);
        return available.length > 0 && this.vasenCollection.length < GAME_CONFIG.MAX_INVENTORY_SIZE;
    }
}

// Global game state instance
const gameState = new GameState();
