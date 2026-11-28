// =============================================================================
// 5-core-instance.js - Väsen Instance Class and Utilities
// =============================================================================

// Combat flags for rune and family passive effects that trigger at most once per combat
const ONCE_PER_COMBAT_FLAGS = [
    // Runes and bindrunes
    'gifuTriggered',
    'wynjaTriggered',
    'mannazTeamHealTriggered',
    'fehuWynjaPassiveTriggered',
    'hagalNaudizPassiveTriggered',
    'dagazThursStrikeTriggered',
    'gifuHagalTriggered',
    // Family passives
    'andePassiveTriggered',
    'drakePassiveTriggered',
    'odjurPassiveTriggered',
    'raPassiveTriggered',
    'trollPassiveTriggered',
    'valnadPassiveTriggered'
];

class VasenInstance {
    constructor(speciesName, level = 1, temperamentKey = null, runes = [], isEnemy = false) {
        const species = VASEN_SPECIES[speciesName];
        if (!species) {
            throw new Error(`Unknown species: ${speciesName}`);
        }
        
        this.id = generateUniqueId();
        this.speciesName = speciesName;
        this.species = species;
        // Use higher level cap for enemies
        const maxLevel = isEnemy ? GAME_CONFIG.ENEMY_MAX_LEVEL : GAME_CONFIG.MAX_LEVEL;
        this.level = Math.min(Math.max(1, level), maxLevel);
        this.temperamentKey = (temperamentKey && TEMPERAMENTS[temperamentKey]) ? temperamentKey : getRandomTemperament();
        this.temperament = TEMPERAMENTS[this.temperamentKey];
        this.runes = runes.slice(0, getRuneSlotCount());

        this.experience = 0;

        // Calculate max values
        this.maxHealth = this.calculateMaxHealth();
        this.maxMegin = this.calculateMaxMegin();

        // Current values
        this.currentHealth = this.maxHealth;
        this.currentMegin = this.maxMegin;

        // Combat state (attribute stages and combat flags, reset after each combat)
        this.resetCombatState();
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
        
        // Apply level scaling
        const levelScaling = 1 + GAME_CONFIG.ATTRIBUTE_LEVEL_SCALING_RATE * (this.level - 1);
        base = base * levelScaling;
        
        // Apply temperament modifier as a flat, unscaled amount - added/subtracted
        // after rarity and level scaling so it is never affected by either. Only
        // attribute stages (applied in getAttribute()) affect it further.
        if (this.temperament.positive === attrName) {
            base += this.temperament.modifier;
        }
        if (this.temperament.negative === attrName) {
            base -= this.temperament.modifier;
        }

        // Generic bindrune: some ätt pairs raise one attribute by a small
        // percentage (health is handled in calculateMaxHealth instead)
        if (attrName !== 'health') {
            const bindRuneBonus = getGenericBindRuneBonus(this, attrName);
            if (bindRuneBonus > 0) {
                base = base * (1 + bindRuneBonus);
            }
        }

        return Math.floor(base);
    }
    
    // Get current attribute with stage modifier (used in combat)
    getAttribute(attrName) {
        const baseValue = this.calculateAttribute(attrName);
        const stage = this.attributeStages[attrName] || 0;
        const stageMod = getAttributeStageModifier(stage);
        return Math.floor(baseValue * stageMod);
    }
    
    // Calculate max health: the health attribute, plus the generic bindrune's bonus
    // when the väsen's two runes have no bindrune of their own and their ätter
    // give health
    calculateMaxHealth() {
        let health = this.calculateAttribute('health');
        const bindRuneBonus = getGenericBindRuneBonus(this, 'health');
        if (bindRuneBonus > 0) {
            health = Math.floor(health * (1 + bindRuneBonus));
        }
        return health;
    }

    // Keep max health and max Megin in sync after any rune change: Uruz and the
    // generic bindrune (which any rune change can form or break) both affect them.
    // Megin is refilled when its maximum rises (e.g. Uruz equipped) and only
    // capped when it falls.
    syncStatsForRuneChange() {
        const oldMaxMegin = this.maxMegin;
        this.recalculateMaxMegin(false);
        if (this.maxMegin > oldMaxMegin) {
            this.currentMegin = this.maxMegin;
        }
        this.recalculateMaxHealth();
    }

    // Recalculate max health after a rune change (which can form or break the
    // generic bindrune). Current health keeps the same fraction of max health,
    // rounded down, so swapping runes back and forth can never gain health.
    recalculateMaxHealth() {
        const oldMax = this.maxHealth;
        this.maxHealth = this.calculateMaxHealth();
        if (oldMax > 0 && oldMax !== this.maxHealth) {
            this.currentHealth = Math.min(this.maxHealth, Math.floor(this.currentHealth * this.maxHealth / oldMax));
        }
    }

    // Calculate max Megin
    calculateMaxMegin() {
        let megin = GAME_CONFIG.BASE_MEGIN + ((this.level - 1) * GAME_CONFIG.MEGIN_PER_LEVEL);
        
        // Apply temperament modifier for Megin (Spirited, Feral, Attuned grant it;
        // Mighty, Keen, Stoic, Steady, Unyielding trade it away). Unlike the other
        // four attributes (where the temperament modifier is applied as a flat,
        // unscaled amount after everything else - see calculateAttribute()), the
        // Megin modifier is applied here BEFORE the Uruz rune's +20% multiplier on
        // purpose: Uruz should scale off the väsen's true (temperament-adjusted)
        // Megin total, not just its unmodified base.
        if (this.temperament.positive === 'megin') {
            megin += this.temperament.modifier;
        }
        if (this.temperament.negative === 'megin') {
            megin -= this.temperament.modifier;
        }
        
        // Cap base megin (before rune bonuses) at MAX_MEGIN_CAP. This is mainly
        // relevant for enemies in Endless Tower, whose level has no cap.
        megin = Math.min(megin, GAME_CONFIG.MAX_MEGIN_CAP);
        
        // Rune bonuses add together: Uruz, and the generic bindrune when its
        // ätter give Megin
        let runeBonus = getGenericBindRuneBonus(this, 'megin');
        if (this.hasRune('URUZ')) {
            runeBonus += GAME_CONFIG.RUNE_URUZ_MEGIN_BONUS;
        }
        if (runeBonus > 0) {
            megin = Math.floor(megin * (1 + runeBonus));
        }

        return megin;
    }

    // Recalculate max Megin (e.g. after Uruz is equipped or removed). Current Megin
    // is either refilled to the new max or only capped to it.
    recalculateMaxMegin(refill = true) {
        this.maxMegin = this.calculateMaxMegin();
        this.currentMegin = refill ? this.maxMegin : Math.min(this.currentMegin, this.maxMegin);
    }

    // Number of rune slots (the same at every level)
    getRuneSlotCount() {
        return getRuneSlotCount();
    }
    
    // Get megin refill per turn
    getMeginRefill() {
        return Math.floor(this.maxMegin * GAME_CONFIG.MEGIN_REFILL_RATE);
    }
    
    // Get available skills based on level
    getAvailableSkills() {
        const skills = [];
        
        for (let i = 0; i < SKILL_LEARN_LEVELS.length; i++) {
            if (this.level >= SKILL_LEARN_LEVELS[i]) {
                const skillName = this.species.skills[i];
                if (skillName && ABILITIES[skillName]) {
                    skills.push(skillName);
                }
            }
        }
        
        // Basic Strike is always last
        skills.push('Basic Strike');
        
        return skills;
    }
    
    // Get all skill names (for display, even if not learned)
    getAllSkillNames() {
        return this.species.skills;
    }
    
    // Check if has a specific rune
    hasRune(runeId) {
        return this.runes.includes(runeId);
    }
    
    // Equip a rune
    equipRune(runeId) {
        if (this.runes.length >= this.getRuneSlotCount()) {
            return false;
        }
        if (this.runes.includes(runeId)) {
            return false;
        }
        this.runes.push(runeId);
        this.syncStatsForRuneChange();
        return true;
    }

    // Unequip a rune
    unequipRune(runeId) {
        const index = this.runes.indexOf(runeId);
        if (index === -1) return false;
        this.runes.splice(index, 1);
        this.syncStatsForRuneChange();
        return true;
    }

    // Get megin cost for a skill. Uruz + Ansuz / Uruz + Raido raise the cost of
    // the attacks the partner rune converts, after the same-element discount.
    getSkillMeginCost(skillName) {
        const cost = getSkillMeginCost(skillName, this.species.element);
        if (getConvertedAttackBindRune(this, skillName)) {
            return Math.floor(cost * (1 + GAME_CONFIG.RUNE_BIND_URUZ_CONVERTED_COST_INCREASE));
        }
        return cost;
    }

    // Get the actual megin cost for a skill this turn.
    getEffectiveSkillMeginCost(skillName) {
        return this.getSkillMeginCost(skillName);
    }
    
    // Can use skill (has enough megin)
    canUseSkill(skillName) {
        return this.currentMegin >= this.getEffectiveSkillMeginCost(skillName);
    }
    
    // Spend megin
    spendMegin(amount) {
        this.currentMegin = Math.max(0, this.currentMegin - amount);
    }
    
    // Refill megin
    refillMegin() {
        const refill = this.getMeginRefill();
        this.currentMegin = Math.min(this.maxMegin, this.currentMegin + refill);
        return refill;
    }

    // Gain a flat amount of megin, capped at maxMegin. Returns the actual amount gained.
    gainMegin(amount) {
        const actualGain = Math.min(this.maxMegin - this.currentMegin, Math.max(0, amount));
        this.currentMegin += actualGain;
        return actualGain;
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
    
    // Reset combat state
    resetCombatState() {
        this.attributeStages = {
            strength: 0,
            wisdom: 0,
            defense: 0,
            durability: 0
        };
        this.combatFlags = {
            hasSwapSickness: false,
            turnsOnField: 0,
            isFirstRound: true,
            dagazBonusRoundsLeft: 0, // Dagaz + Jera: rounds the Dagaz bonus still lasts after the first
            enteredThisTurn: false,  // Entered mid-turn: that turn's end does not use up its first round
            isEmpowered: false // Tracks if next attack deals bonus damage
        };
        this.resetOncePerCombatFlags();
    }

    // Reset only the once-per-combat passive and rune flags, without touching
    // attribute stages, health, megin, or turn counters.
    // Also used by Idunn's Apples between Endless Tower floors.
    resetOncePerCombatFlags() {
        ONCE_PER_COMBAT_FLAGS.forEach(flag => { this.combatFlags[flag] = false; });
    }
    
    // Restore full resources
    restoreFully() {
        this.currentHealth = this.maxHealth;
        this.currentMegin = this.maxMegin;
        this.resetCombatState();
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
                this.maxHealth = this.calculateMaxHealth();
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
    
    // Get attack elements (for UI display) - only includes learned skills
    getAttackElements() {
        const elements = new Set();
        elements.add(this.species.element); // Basic Strike uses own element
        
        const availableSkills = this.getAvailableSkills();
        availableSkills.forEach(skillName => {
            const skill = ABILITIES[skillName];
            if (skill && skill.type !== ATTACK_TYPES.UTILITY && skill.element) {
                elements.add(skill.element);
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
        // Capped at max health, which can be lower than when the save was made
        // (e.g. a rune pair that used to give health now gives another bonus).
        // At least 1: a save written during combat can hold knocked-out väsen,
        // and a väsen at 0 health outside combat can't be sent into a fight.
        instance.currentHealth = data.currentHealth !== undefined
            ? Math.max(1, Math.min(data.currentHealth, instance.maxHealth))
            : instance.maxHealth;
        // Megin is always fully restored outside of an active combat session.
        // Always recalculate from current maxMegin so constant changes take effect immediately.
        instance.currentMegin = instance.maxMegin;
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

// Create a wild väsen for encounters, carrying numRunes runes (capped at the
// rune slot count; see getWildRuneCountForZone for zone-based counts).
// excludeRunes: optional Set of rune ids it must not get (e.g. runes already
// worn by its teammates, so an enemy team never shares a rune)
function createWildVasen(speciesName, level, numRunes = getRuneSlotCount(), excludeRunes = null) {
    const vasen = new VasenInstance(speciesName, level, null, [], true); // Mark as enemy
    numRunes = Math.min(numRunes, getRuneSlotCount());

    // Get the valid rune pool for this väsen and shuffle it
    const validRunes = getValidRunesForVasen(vasen)
        .filter(runeId => !excludeRunes || !excludeRunes.has(runeId));
    shuffleInPlace(validRunes);

    // Assign up to numRunes unique runes from the valid pool
    for (let i = 0; i < numRunes && i < validRunes.length; i++) {
        vasen.runes.push(validRunes[i]);
    }

    vasen.syncStatsForRuneChange(); // Uruz, or two runes forming the generic bindrune

    return vasen;
}

// Create guardian team. guardianData is a resolved guardian (see
// GameState.getGuardian): { name, level, team: [{ species, temperament, runes }] }
function createGuardianTeam(guardianData) {
    return guardianData.team.map(memberData => {
        const vasen = new VasenInstance(
            memberData.species,
            memberData.level || guardianData.level,
            memberData.temperament,
            memberData.runes || []
        );
        if (vasen.hasRune('URUZ')) {
            vasen.recalculateMaxMegin();
        }
        return vasen;
    });
}

// =============================================================================
// Randomized guardians
// Every new save rolls its own guardians once, when the save is created
// (GameState.startRun), and keeps them for the whole save:
//   - a name from GUARDIAN_NAMES, never the same name twice in one save
//   - three different väsen from the zone's spawns
//   - a random temperament for each
//   - runes as wild väsen of that zone carry them (1 in the first zone, 2 after),
//     never the same rune twice within one guardian's team
// The level and dialogue come from the zone (ZONES[zoneId].guardian).
//
// SAVE MIGRATION (fixed guardians)
// Saves made before guardians were randomized have no `guardians` stored. They
// keep the old fixed guardians: normalizeGuardianRosters() returns null for
// them, and GameState.getGuardian() then falls back to ZONES[zone].guardian.legacy.
// HOW TO REMOVE: search for "SAVE MIGRATION (fixed guardians)", then
//   1. delete the `legacy: {...}` roster from each zone in 1-core-constants.js
//   2. in normalizeGuardianRosters(), drop the early `return null` and treat a
//      missing value as {} (old saves then roll new guardians like new saves)
//   3. in GameState.getGuardian(), use this.guardians[zoneId] only
// =============================================================================

const GUARDIAN_TEAM_SIZE = 3;

// Pick `count` random runes worth wearing for this väsen, leaving out the ids
// in `excluded`. Runes only useful as half of a bindrune are only picked
// together with their partner (same approach as Auto Runes).
function pickGuardianRunes(vasen, count, excluded) {
    const free = runeId => !excluded.has(runeId);
    const solo = getSoloValidRunesForVasen(vasen).filter(free);
    const candidates = solo.map(runeId => [runeId]);
    if (count >= 2) {
        const valid = getValidRunesForVasen(vasen);
        const eligible = getBindRuneEligibleRunes(vasen);
        BIND_RUNES.forEach(br => {
            if (br.runes.every(r => eligible.has(r) && valid.includes(r) && free(r))) {
                candidates.push(br.runes.slice());
            }
        });
    }
    shuffleInPlace(candidates);

    const picked = [];
    for (const runes of candidates) {
        if (picked.length >= count) break;
        if (picked.length + runes.length > count) continue;
        if (runes.some(r => picked.includes(r))) continue;
        picked.push(...runes);
    }
    return picked;
}

// One random guardian for a zone. usedNames: names already taken in this save.
function generateGuardianRoster(zoneId, usedNames = new Set()) {
    const zone = ZONES[zoneId];
    if (!zone || !zone.guardian) return null;

    const freeNames = GUARDIAN_NAMES.filter(n => !usedNames.has(n));
    const namePool = freeNames.length > 0 ? freeNames : GUARDIAN_NAMES;
    const name = namePool[Math.floor(Math.random() * namePool.length)];

    const speciesPool = zone.spawns.filter(s => VASEN_SPECIES[s]);
    shuffleInPlace(speciesPool);
    const runeCount = Math.min(getWildRuneCountForZone(zoneId), getRuneSlotCount());
    const teamRunes = new Set();

    const team = speciesPool.slice(0, GUARDIAN_TEAM_SIZE).map(species => {
        const temperament = getRandomTemperament();
        // Rune usefulness depends on the skills known at the guardian's level
        const probe = new VasenInstance(species, zone.guardian.level, temperament, [], true);
        const runes = pickGuardianRunes(probe, runeCount, teamRunes);
        runes.forEach(r => teamRunes.add(r));
        return { species, temperament, runes };
    });

    return { name, team };
}

// Guardians for every zone that has one, as stored in a save: { ZONE1: {...}, ... }
function generateGuardianRosters() {
    const rosters = {};
    const usedNames = new Set();
    ZONE_ORDER.forEach(zoneId => {
        const roster = generateGuardianRoster(zoneId, usedNames);
        if (!roster) return;
        usedNames.add(roster.name);
        rosters[zoneId] = roster;
    });
    return rosters;
}

// Is a stored guardian still usable with the current game data (species,
// temperaments and runes may be renamed or removed in later versions)?
function isValidGuardianRoster(zoneId, roster) {
    const zone = ZONES[zoneId];
    if (!zone || !zone.guardian || !roster || typeof roster.name !== 'string' || !Array.isArray(roster.team)) return false;
    if (roster.team.length === 0) return false;
    return roster.team.every(m =>
        m && VASEN_SPECIES[m.species] && TEMPERAMENTS[m.temperament] &&
        Array.isArray(m.runes) && m.runes.every(r => RUNES[r])
    );
}

// Read stored guardians. Returns null for saves made before guardians were
// randomized (they keep the fixed guardians). A stored guardian that no
// longer fits the game data is rolled again, keeping the save's other names.
function normalizeGuardianRosters(stored) {
    // SAVE MIGRATION (fixed guardians): null keeps the save on the fixed rosters
    if (!stored || typeof stored !== 'object') return null;
    const rosters = {};
    const usedNames = new Set();
    ZONE_ORDER.forEach(zoneId => {
        if (isValidGuardianRoster(zoneId, stored[zoneId])) {
            rosters[zoneId] = stored[zoneId];
            usedNames.add(stored[zoneId].name);
        }
    });
    ZONE_ORDER.forEach(zoneId => {
        if (rosters[zoneId] || !ZONES[zoneId].guardian) return;
        const roster = generateGuardianRoster(zoneId, usedNames);
        usedNames.add(roster.name);
        rosters[zoneId] = roster;
    });
    return rosters;
}
