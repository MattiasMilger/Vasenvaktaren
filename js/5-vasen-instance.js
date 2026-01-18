// =============================================================================
// 5-vasen-instance.js - Väsen Instance Class and Utilities
// =============================================================================

class VasenInstance {
    constructor(speciesName, level = 1, temperamentKey = null, runes = []) {
        const species = VASEN_SPECIES[speciesName];
        if (!species) {
            throw new Error(`Unknown species: ${speciesName}`);
        }
        
        this.id = generateUniqueId();
        this.speciesName = speciesName;
        this.species = species;
        this.level = Math.min(Math.max(1, level), GAME_CONFIG.MAX_LEVEL);
        this.temperamentKey = temperamentKey || getRandomTemperament();
        this.temperament = TEMPERAMENTS[this.temperamentKey];
        this.runes = runes.slice(0, this.level >= 30 ? 2 : 1);
        
        this.experience = 0;
        
        // Calculate max values
        this.maxHealth = this.calculateAttribute('health');
        this.maxMegin = this.calculateMaxMegin();
        
        // Current values
        this.currentHealth = this.maxHealth;
        this.currentMegin = this.maxMegin;
        
        // Battle state (reset after each battle)
        this.attributeStages = {
            strength: 0,
            wisdom: 0,
            defense: 0,
            durability: 0
        };
        
        this.battleFlags = {
            hasSwapSickness: false,
            turnsOnField: 0,
            isFirstRound: true,
            gifuTriggered: false,
            wynjaTriggered: false,
            // Family passive flags
            andePassiveTriggered: false,
            drakePassiveTriggered: false,
            odjurPassiveTriggered: false,
            raPassiveTriggered: false,
            trollPassiveTriggered: false,
            valnадPassiveTriggered: false,
            vattePassiveDamageBoost: 0 // Stores damage boost percentage
        };
    }
    
    // Getter for display name (for convenience)
    get displayName() {
        return this.getDisplayName();
    }
    
    // Get display name (Temperament + Species name)
    getDisplayName() {
        return `${this.temperament.name} ${this.species.name}`;
    }
    
    // Get short name (just species)
    getName() {
        return this.species.name;
    }
    
    // Calculate base attribute before stage modifiers
    calculateAttribute(attrName) {
        const baseAttrs = BASE_ATTRIBUTES[this.species.family];
        let base = baseAttrs[attrName] || 0;
        
        // Add element bonus
        const elementBonus = ELEMENT_BONUSES[this.species.element];
        if (elementBonus && elementBonus[attrName]) {
            base += elementBonus[attrName];
        }
        
        // Apply rarity multiplier
        const rarityMult = RARITY_MULTIPLIERS[this.species.rarity];
        base = base * rarityMult;
        
        // Apply temperament modifier
        if (this.temperament.positive === attrName) {
            base += this.temperament.modifier;
        }
        if (this.temperament.negative === attrName) {
            base -= this.temperament.modifier;
        }
        
        // Apply level scaling
        const levelScaling = 1 + GAME_CONFIG.ATTRIBUTE_LEVEL_SCALING_RATE * (this.level - 1);
        base = base * levelScaling;
        
        return Math.floor(base);
    }
    
    // Get current attribute with stage modifier (used in battle)
    getAttribute(attrName) {
        const baseValue = this.calculateAttribute(attrName);
        const stage = this.attributeStages[attrName] || 0;
        const stageMod = getAttributeStageModifier(stage);
        return Math.floor(baseValue * stageMod);
    }
    
    // Calculate max Megin
    calculateMaxMegin() {
        let megin = GAME_CONFIG.BASE_MEGIN + ((this.level - 1) * GAME_CONFIG.MEGIN_PER_LEVEL);
        
        // Check for Uruz rune
        if (this.hasRune('URUZ')) {
            megin = Math.floor(megin * 1.20);
        }
        
        // Alv family passive: Innate Megin
        if (this.species.family === FAMILIES.ALV) {
            megin = Math.floor(megin * (1 + FAMILY_PASSIVE_CONFIG.ALV_MEGIN_BOOST));
        }
        
        return megin;
    }
    
    // Get megin regeneration per turn
    getMeginRegen() {
        return Math.floor(this.maxMegin * GAME_CONFIG.MEGIN_REGEN_RATE);
    }
    
    // Get available abilities based on level
    getAvailableAbilities() {
        const abilities = [];
        
        for (let i = 0; i < ABILITY_LEARN_LEVELS.length; i++) {
            if (this.level >= ABILITY_LEARN_LEVELS[i]) {
                const abilityName = this.species.abilities[i];
                if (abilityName && ABILITIES[abilityName]) {
                    abilities.push(abilityName);
                }
            }
        }
        
        // Basic Strike is always last
        abilities.push('Basic Strike');
        
        return abilities;
    }
    
    // Get all ability names (for display, even if not learned)
    getAllAbilityNames() {
        return this.species.abilities;
    }
    
    // Check if has a specific rune
    hasRune(runeId) {
        return this.runes.includes(runeId);
    }
    
    // Equip a rune
    equipRune(runeId) {
        const maxRunes = this.level >= 30 ? 2 : 1;
        if (this.runes.length >= maxRunes) {
            return false;
        }
        if (this.runes.includes(runeId)) {
            return false;
        }
        this.runes.push(runeId);
        // Recalculate megin if Uruz
        if (runeId === 'URUZ') {
            this.maxMegin = this.calculateMaxMegin();
            this.currentMegin = Math.min(this.currentMegin, this.maxMegin);
        }
        return true;
    }
    
    // Unequip a rune
    unequipRune(runeId) {
        const index = this.runes.indexOf(runeId);
        if (index === -1) return false;
        this.runes.splice(index, 1);
        // Recalculate megin if Uruz
        if (runeId === 'URUZ') {
            this.maxMegin = this.calculateMaxMegin();
            this.currentMegin = Math.min(this.currentMegin, this.maxMegin);
        }
        return true;
    }
    
    // Get megin cost for an ability
    getAbilityMeginCost(abilityName) {
        return getAbilityMeginCost(abilityName, this.species.element);
    }
    
    // Can use ability (has enough megin)
    canUseAbility(abilityName) {
        return this.currentMegin >= this.getAbilityMeginCost(abilityName);
    }
    
    // Spend megin
    spendMegin(amount) {
        this.currentMegin = Math.max(0, this.currentMegin - amount);
    }
    
    // Regenerate megin
    regenerateMegin() {
        const regen = this.getMeginRegen();
        this.currentMegin = Math.min(this.maxMegin, this.currentMegin + regen);
        return regen;
    }
    
    // Take damage
    takeDamage(amount) {
        const actualDamage = Math.min(this.currentHealth, Math.max(0, amount));
        this.currentHealth -= actualDamage;
        return actualDamage;
    }
    
    // Heal
    heal(amount) {
        const actualHeal = Math.min(this.maxHealth - this.currentHealth, Math.max(0, amount));
        this.currentHealth += actualHeal;
        return actualHeal;
    }
    
    // Heal by percentage of max health
    healPercent(percent) {
        const amount = Math.floor(this.maxHealth * percent);
        return this.heal(amount);
    }
    
    // Is knocked out
    isKnockedOut() {
        return this.currentHealth <= 0;
    }
    
    // Modify attribute stage
    modifyAttributeStage(attrName, stages) {
        if (attrName === 'health') return { changed: 0, capped: false }; // Health can't be staged
        
        const current = this.attributeStages[attrName] || 0;
        const newValue = Math.max(GAME_CONFIG.MIN_ATTRIBUTE_STAGE, 
                                  Math.min(GAME_CONFIG.MAX_ATTRIBUTE_STAGE, current + stages));
        const actualChange = newValue - current;
        this.attributeStages[attrName] = newValue;
        
        return {
            changed: actualChange,
            capped: actualChange !== stages
        };
    }
    
    // Reset battle state
    resetBattleState() {
        this.attributeStages = {
            strength: 0,
            wisdom: 0,
            defense: 0,
            durability: 0
        };
        this.battleFlags = {
            hasSwapSickness: false,
            turnsOnField: 0,
            isFirstRound: true,
            gifuTriggered: false,
            wynjaTriggered: false,
            // Family passive flags
            andePassiveTriggered: false,
            drakePassiveTriggered: false,
            odjurPassiveTriggered: false,
            raPassiveTriggered: false,
            trollPassiveTriggered: false,
            valnadPassiveTriggered: false,
            vattePassiveDamageBoost: 0
        };
    }
    
    // Restore full resources
    restoreFully() {
        this.currentHealth = this.maxHealth;
        this.currentMegin = this.maxMegin;
        this.resetBattleState();
    }
    
    // Add experience and handle leveling
    addExperience(amount) {
        if (this.level >= GAME_CONFIG.MAX_LEVEL) return { leveledUp: false, newLevel: this.level };
        
        this.experience += amount;
        let leveledUp = false;
        let previousLevel = this.level;
        
        while (this.level < GAME_CONFIG.MAX_LEVEL) {
            const required = getRequiredExpForLevel(this.level);
            if (this.experience >= required) {
                this.experience -= required;
                this.level++;
                leveledUp = true;
                
                // Update max values
                const oldMaxHealth = this.maxHealth;
                const oldMaxMegin = this.maxMegin;
                this.maxHealth = this.calculateAttribute('health');
                this.maxMegin = this.calculateMaxMegin();
                
                // Heal the difference
                this.currentHealth += (this.maxHealth - oldMaxHealth);
                this.currentMegin += (this.maxMegin - oldMaxMegin);
            } else {
                break;
            }
        }
        
        return { leveledUp, newLevel: this.level, previousLevel };
    }
    
    // Get experience progress
    getExpProgress() {
        if (this.level >= GAME_CONFIG.MAX_LEVEL) {
            return { current: 0, required: 0, percent: 100 };
        }
        const required = getRequiredExpForLevel(this.level);
        return {
            current: this.experience,
            required: required,
            percent: Math.floor((this.experience / required) * 100)
        };
    }
    
    // Get attack elements (for UI display) - only includes learned abilities
    getAttackElements() {
        const elements = new Set();
        elements.add(this.species.element); // Basic Strike uses own element
        
        const availableAbilities = this.getAvailableAbilities();
        availableAbilities.forEach(abilityName => {
            const ability = ABILITIES[abilityName];
            if (ability && ability.type !== ATTACK_TYPES.UTILITY && ability.element) {
                elements.add(ability.element);
            }
        });
        
        return Array.from(elements);
    }
    
    // Serialize for saving
    serialize() {
        return {
            id: this.id,
            speciesName: this.speciesName,
            level: this.level,
            temperamentKey: this.temperamentKey,
            runes: this.runes.slice(),
            experience: this.experience,
            currentHealth: this.currentHealth,
            currentMegin: this.currentMegin
        };
    }
    
    // Deserialize from save data
    static deserialize(data) {
        const instance = new VasenInstance(
            data.speciesName,
            data.level,
            data.temperamentKey,
            data.runes || []
        );
        if (data.id) {
            instance.id = data.id;
        }
        instance.experience = data.experience || 0;
        instance.currentHealth = data.currentHealth !== undefined ? data.currentHealth : instance.maxHealth;
        instance.currentMegin = data.currentMegin !== undefined ? data.currentMegin : instance.maxMegin;
        return instance;
    }
}

// Utility functions
function generateUniqueId() {
    return 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

function getRandomTemperament() {
    return TEMPERAMENT_LIST[Math.floor(Math.random() * TEMPERAMENT_LIST.length)];
}

// Create a wild Väsen for encounters
function createWildVasen(speciesName, level) {
    const vasen = new VasenInstance(speciesName, level);
    
    // Assign random rune(s)
    const numRunes = level >= 30 ? 2 : 1;
    const availableRunes = RUNE_LIST.slice();
    
    for (let i = 0; i < numRunes; i++) {
        if (availableRunes.length === 0) break;
        const index = Math.floor(Math.random() * availableRunes.length);
        vasen.runes.push(availableRunes[index]);
        availableRunes.splice(index, 1);
    }
    
    // Recalculate megin if got Uruz
    if (vasen.hasRune('URUZ')) {
        vasen.maxMegin = vasen.calculateMaxMegin();
        vasen.currentMegin = vasen.maxMegin;
    }
    
    return vasen;
}

// Create guardian team
function createGuardianTeam(guardianData) {
    return guardianData.team.map(memberData => {
        const vasen = new VasenInstance(
            memberData.species,
            memberData.level,
            memberData.temperament,
            memberData.runes || []
        );
        // Recalculate megin if has Uruz
        if (vasen.hasRune('URUZ')) {
            vasen.maxMegin = vasen.calculateMaxMegin();
            vasen.currentMegin = vasen.maxMegin;
        }
        return vasen;
    });
}