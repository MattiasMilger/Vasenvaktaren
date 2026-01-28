// =============================================================================
// 6a-battle-core.js - Battle Mechanics and Combat Logic (FIXED GIFU)
// =============================================================================

const BATTLE_TYPES = {
    WILD: 'wild',
    GUARDIAN: 'guardian',
    ENDLESS_WILD: 'endless_wild',
    ENDLESS_GUARDIAN: 'endless_guardian'
};

class Battle {
    constructor(playerTeam, enemyTeam, battleType = BATTLE_TYPES.WILD, onBattleEnd = null) {
        this.playerTeam = playerTeam;
        this.enemyTeam = enemyTeam;
        this.battleType = battleType;
        this.onBattleEnd = onBattleEnd;
        
        this.playerActive = null;
        this.enemyActive = null;
        this.playerActiveIndex = 0;
        this.enemyActiveIndex = 0;
        
        this.turnCount = 0;
        this.log = [];
        this.isOver = false;
        this.winner = null;
        
        // Taming state
        this.giftsGiven = 0;
        this.correctItemGiven = false;
        this.canTame = battleType === BATTLE_TYPES.WILD;
        this.isWildEncounter = battleType === BATTLE_TYPES.WILD;
        
        // Experience tracking
        this.expTracker = new Map(); // vasen id -> { participated: boolean, turnsOnField: number, dealtKillingBlow: boolean }
        
        // Callbacks for UI updates
        this.onLog = null;
        this.onUpdate = null;
        this.onHit = null;
        this.onKnockoutSwap = null;
        this.onEnd = null;
        
        // Action state
        this.waitingForPlayerAction = true;
        
        // Initialize active Väsen
        this.setPlayerActive(0);
        this.setEnemyActive(0);
    }
    
    // Execute player action (dispatcher method)
    executePlayerAction(action) {
        if (!action || !action.type) return null;
        
        // Disable player input immediately
        this.waitingForPlayerAction = false;
        
        let result = null;
        
        switch (action.type) {
            case 'ability':
                result = this.playerUseAbility(action.abilityName);
                break;
            case 'swap':
                result = this.playerSwap(action.targetIndex);
                break;
            case 'offer':
                result = this.offerItem(action.itemId);
                break;
            case 'ask':
                result = this.askAboutItem();
                break;
            case 'pass':
                result = this.playerPass();
                break;
            case 'surrender':
                result = this.surrender();
                break;
            default:
                console.error('Unknown action type:', action.type);
                this.waitingForPlayerAction = true; // Re-enable on error
                return null;
        }
        
        // Re-enable player input after delay (if battle is not over)
        setTimeout(() => {
            if (!this.isOver) {
                this.waitingForPlayerAction = true;
                if (this.onUpdate) {
                    this.onUpdate();
                }
            }
        }, GAME_CONFIG.BATTLE_INPUT_DELAY);
        
        return result;
    }
    
    // Set player's active Väsen
    setPlayerActive(index, isSwap = false) {
        const vasen = this.playerTeam[index];
        if (!vasen || vasen.isKnockedOut()) return false;
        
        // Handle Vätte passive for outgoing Väsen
        if (isSwap && this.playerActive && this.playerActive.species.family === FAMILIES.VATTE) {
            this.applyFamilyPassive('onSwapOut', { 
                vasen: this.playerActive, 
                incomingVasen: vasen,
                isPlayer: true 
            });
        }
        
        if (this.playerActive) {
            this.playerActive.battleFlags.hasSwapSickness = false;
        }
        
        this.playerActive = vasen;
        this.playerActiveIndex = index;
        
        if (isSwap) {
            vasen.battleFlags.hasSwapSickness = true;
            vasen.battleFlags.isFirstRound = true;
            vasen.battleFlags.turnsOnField = 0;
        }
        
        // Initialize exp tracking
        if (!this.expTracker.has(vasen.id)) {
            this.expTracker.set(vasen.id, { participated: true, turnsOnField: 0, dealtKillingBlow: false });
        } else {
            this.expTracker.get(vasen.id).participated = true;
        }
        
        // Trigger Ande passive when entering battlefield (via swap OR at battle start)
        if (isSwap || !this.playerActive.battleFlags.andePassiveTriggered) {
            this.applyFamilyPassive('onEnterBattlefield', { vasen, isPlayer: true });
        }
        
        return true;
    }
    
    // Set enemy's active Väsen
    setEnemyActive(index, isSwap = false) {
        const vasen = this.enemyTeam[index];
        if (!vasen || vasen.isKnockedOut()) return false;
        
        // Handle Vätte passive for outgoing Väsen
        if (isSwap && this.enemyActive && this.enemyActive.species.family === FAMILIES.VATTE) {
            this.applyFamilyPassive('onSwapOut', { 
                vasen: this.enemyActive, 
                incomingVasen: vasen,
                isPlayer: false 
            });
        }
        
        if (this.enemyActive) {
            this.enemyActive.battleFlags.hasSwapSickness = false;
        }
        
        this.enemyActive = vasen;
        this.enemyActiveIndex = index;
        vasen.battleFlags.isFirstRound = true;
        vasen.battleFlags.turnsOnField = 0;
        
        // Trigger Ande passive when entering battlefield (via swap OR at battle start)
        if (isSwap || !this.enemyActive.battleFlags.andePassiveTriggered) {
            this.applyFamilyPassive('onEnterBattlefield', { vasen, isPlayer: false });
        }
        
        return true;
    }
    
    // Add to battle log
    addLog(message, type = 'info') {
        this.log.push({ message, type, turn: this.turnCount });
        if (this.log.length > GAME_CONFIG.MAX_BATTLE_LOG) {
            this.log.shift();
        }
        // Call UI callback if set
        if (this.onLog) {
            this.onLog(message, type);
        }
    }
    
    // Start a new turn
    startTurn() {
        this.turnCount++;
        this.addLog(`Turn ${this.turnCount} begins.`, 'turn');
        
        // Track participation
        if (this.playerActive && !this.playerActive.isKnockedOut()) {
            const tracker = this.expTracker.get(this.playerActive.id);
            if (tracker) tracker.turnsOnField++;
            
            // Trigger Odjur passive if conditions met
            this.applyFamilyPassive('onTurnStart', { vasen: this.playerActive, isPlayer: true });
        }
        
        if (this.enemyActive && !this.enemyActive.isKnockedOut()) {
            // Trigger Odjur passive for enemy
            this.applyFamilyPassive('onTurnStart', { vasen: this.enemyActive, isPlayer: false });
        }
    }
    
    // End turn (regenerate megin, clear flags)
    endTurn() {
        // Regenerate megin for all team members
        this.playerTeam.forEach(v => {
            if (!v.isKnockedOut()) {
                v.regenerateMegin();
            }
        });
        this.enemyTeam.forEach(v => {
            if (!v.isKnockedOut()) {
                v.regenerateMegin();
            }
        });
        
        // Clear swap sickness
        if (this.playerActive) {
            this.playerActive.battleFlags.hasSwapSickness = false;
            this.playerActive.battleFlags.isFirstRound = false;
            this.playerActive.battleFlags.turnsOnField++;
        }
        if (this.enemyActive) {
            this.enemyActive.battleFlags.hasSwapSickness = false;
            this.enemyActive.battleFlags.isFirstRound = false;
            this.enemyActive.battleFlags.turnsOnField++;
        }
        
        // Check for battle end
        this.checkBattleEnd();
        
        // Update UI
        if (this.onUpdate) {
            this.onUpdate();
        }
        
        // Handle battle end
        if (this.isOver && this.onEnd) {
            this.onEnd(this.getBattleResult());
        }
    }
    
    // Get battle result
    getBattleResult() {
        const isVictory = this.winner === 'player';
        return {
            victory: isVictory,
            tamed: isVictory && this.correctItemGiven && this.canTame,
            surrendered: false,
            tamedVasen: this.correctItemGiven && this.canTame ? this.enemyTeam[0] : null,
            expGained: isVictory ? this.calculateExperience() : [],
            message: isVictory ? 'Victory!' : 'Your party has been defeated!'
        };
    }
    
    // Check if battle is over
    checkBattleEnd() {
        const playerAlive = this.playerTeam.some(v => !v.isKnockedOut());
        const enemyAlive = this.enemyTeam.some(v => !v.isKnockedOut());
        
        if (!playerAlive) {
            this.isOver = true;
            this.winner = 'enemy';
            this.addLog(`${this.playerActive.getName()} has fainted! You lost and ran away!`, 'defeat');
        } else if (!enemyAlive) {
            this.isOver = true;
            this.winner = 'player';
            this.addLog('Victory!', 'victory');
        }
        
        return this.isOver;
    }
    
    // Player action: use ability
    playerUseAbility(abilityName, selectedAllyTarget = null) {
        if (this.isOver) return null;
        if (this.playerActive.battleFlags.hasSwapSickness) {
            this.addLog(`${this.playerActive.getName()} is preparing and cannot act this turn.`, 'status');
            return this.enemyTurn();
        }
        
        const ability = ABILITIES[abilityName];
        if (!ability) return null;
        
        const meginCost = this.playerActive.getAbilityMeginCost(abilityName);
        if (this.playerActive.currentMegin < meginCost) {
            this.addLog('Not enough Megin.', 'error');
            return null;
        }
        
        this.startTurn();
        
        // Determine turn order
        const playerIsUtility = ability.type === ATTACK_TYPES.UTILITY;
        const enemyAction = this.getEnemyAction();
        const enemyAbility = ABILITIES[enemyAction.ability];
        const enemyIsUtility = enemyAbility && enemyAbility.type === ATTACK_TYPES.UTILITY;
        
        // Priority: Player attacks first unless enemy uses utility and player doesn't
        let playerFirst = true;
        if (!playerIsUtility && enemyIsUtility) {
            playerFirst = false;
            this.addLog('The utility move goes first!', 'priority');
        }
        
        const results = { player: null, enemy: null };
        
        if (playerFirst) {
            results.player = this.executeAbility(this.playerActive, this.enemyActive, abilityName, true, selectedAllyTarget);
            if (!this.enemyActive.isKnockedOut()) {
                results.enemy = this.executeEnemyAction(enemyAction);
            }
        } else {
            results.enemy = this.executeEnemyAction(enemyAction);
            if (!this.playerActive.isKnockedOut()) {
                results.player = this.executeAbility(this.playerActive, this.enemyActive, abilityName, true, selectedAllyTarget);
            }
        }
        
        this.handlePostTurn(results);
        this.endTurn();
        
        return results;
    }
    
    // Player action: swap
    playerSwap(index) {
        if (this.isOver) return null;
        
        const target = this.playerTeam[index];
        if (!target || target.isKnockedOut() || target === this.playerActive) {
            return null;
        }
        
        this.startTurn();
        
        // Swap has highest priority
        this.addLog(`${target.getName()} enters the fray!`, 'swap');
        this.setPlayerActive(index, true);
        
        // Enemy still acts
        const enemyAction = this.getEnemyAction();
        const results = { player: { action: 'swap' }, enemy: null };
        
        results.enemy = this.executeEnemyAction(enemyAction);
        
        this.handlePostTurn(results);
        this.endTurn();
        
        return results;
    }
    
    // Player action: pass
    playerPass() {
        if (this.isOver) return null;
        
        this.startTurn();
        this.addLog(`${this.playerActive.getName()} waits.`, 'pass');
        
        const enemyAction = this.getEnemyAction();
        const results = { player: { action: 'pass' }, enemy: null };
        results.enemy = this.executeEnemyAction(enemyAction);
        
        this.handlePostTurn(results);
        this.endTurn();
        
        return results;
    }
    
    // Player action: offer item
    offerItem(itemName) {
        if (!this.canTame) {
            this.addLog('This Väsen can not be tamed!', 'error');
            if (this.onUpdate) this.onUpdate();
            return { success: false, correct: false };
        }
        
        if (this.giftsGiven >= GAME_CONFIG.MAX_GIFTS_PER_COMBAT) {
            return { success: false, correct: false };
        }
        
        if (this.correctItemGiven) {
            return { success: false, correct: false };
        }
        
        this.giftsGiven++;
        this.addLog(`${itemName} was gifted to ${this.enemyActive.getName()}.`, 'gift');
        
        const isCorrect = isCorrectTamingItem(itemName, this.enemyActive.speciesName);
        
        if (isCorrect) {
            this.correctItemGiven = true;
            this.addLog('Thanks, I love this item. But you have to prove yourself worthy before I join you. Go ahead and try to defeat me.', 'dialogue');
        } else {
            this.addLog('What am I supposed to do with this?', 'dialogue');
        }
        
        // Update UI (gift is a free action, don't end turn)
        if (this.onUpdate) this.onUpdate();
        
        return { success: true, correct: isCorrect };
    }
    
    // Player action: ask about item
    askAboutItem() {
        if (this.isOver) return null;
        
        this.startTurn();
        
        const tamingItem = this.enemyActive.species.tamingItem;
        this.addLog(`Tell me ${this.enemyActive.getName()}, what is it that you like the most?`, 'dialogue');
        
        // Enemy acts (player passes)
        const enemyAction = this.getEnemyAction();
        const results = { player: { action: 'ask' }, enemy: null };
        results.enemy = this.executeEnemyAction(enemyAction);
        
        // Add the item response AFTER combat events
        this.addLog(`If you must know, ${tamingItem} is what I desire most.`, 'dialogue');
        
        this.handlePostTurn(results);
        this.endTurn();
        
        return results;
    }
    
    // Player action: surrender
    surrender() {
        this.isOver = true;
        this.winner = 'enemy';
        this.addLog('You call retreat. Your party withdraws..', 'surrender');
        
        if (this.onUpdate) {
            this.onUpdate();
        }
        
        if (this.onEnd) {
            this.onEnd({ surrendered: true, victory: false });
        }
        
        return { surrendered: true };
    }
    
    // Execute an ability
    executeAbility(attacker, defender, abilityName, isPlayer, selectedAllyTarget = null) {
        const ability = ABILITIES[abilityName];
        if (!ability) return null;
        
        const meginCost = attacker.getAbilityMeginCost(abilityName);
        attacker.spendMegin(meginCost);
        
        // Log ability use
        this.addLog(`${attacker.getName()} uses ${ability.name}!`, 'action');
        
        if (meginCost > 0) {
            this.addLog(`${attacker.getName()} used ${meginCost} Megin!`, 'megin');
        }
        
        const result = {
            ability: abilityName,
            attacker: attacker,
            defender: defender,
            damage: 0,
            effects: [],
            runeEffects: []
        };
        
        // Handle utility abilities
        if (ability.type === ATTACK_TYPES.UTILITY) {
            result.effects = this.applyUtilityEffect(attacker, defender, ability, isPlayer, selectedAllyTarget);
            
            // Mannaz: heal on utility
            if (attacker.hasRune('MANNAZ')) {
                const healAmount = attacker.healPercent(GAME_CONFIG.RUNE_MANNAZ_HEAL_PERCENT);
                if (healAmount > 0) {
                    result.runeEffects.push({ rune: 'MANNAZ', effect: `healed ${healAmount}` });
                    this.addLog(`${RUNES.MANNAZ.symbol} ${RUNES.MANNAZ.name} was activated!`, 'rune');
                    this.addLog(`${attacker.getName()} gained ${healAmount} health!`, 'heal');
                }
            }
            
            return result;
        }
        
        // Calculate and apply damage
        const damageResult = this.calculateDamage(attacker, defender, abilityName);
        result.damage = damageResult.damage;
        result.matchup = damageResult.matchup;
        result.attackType = damageResult.attackType;
        
        // Apply damage
        const actualDamage = defender.takeDamage(result.damage);
        this.addLog(`${attacker.getName()} deals ${actualDamage} damage to ${defender.getName()}!`, 'damage');
        
        // Flash the defender (hit effect)
        if (this.onHit) {
            this.onHit(isPlayer ? 'enemy' : 'player');
        }
        
        // Log matchup
        if (damageResult.matchup === 'POTENT') {
            this.addLog('Potent hit!', 'potent');
        } else if (damageResult.matchup === 'WEAK') {
            this.addLog('Weak hit!', 'weak');
        }
        
        // Handle rune effects for hits
        this.applyHitRuneEffects(attacker, defender, damageResult, result, isPlayer);
        
        // Check knockout
        if (defender.isKnockedOut()) {
            if (isPlayer) {
                this.addLog(`${defender.getName()} collapses!`, 'knockout');
                // Mark killing blow
                const tracker = this.expTracker.get(attacker.id);
                if (tracker) tracker.dealtKillingBlow = true;
            } else {
                this.addLog(`${defender.getName()} has fainted!`, 'knockout');
            }
        }
        
        // Thurs: damage reflect as Mixed hit (only if not knocked out)
        if (!attacker.isKnockedOut() && defender.hasRune('THURS') && result.damage > 0) {
            this.addLog(`${RUNES.THURS.symbol} ${RUNES.THURS.name} was activated!`, 'rune');
            
            // Calculate reflected damage as Mixed-type attack
            // The defender (Thurs user) becomes the "attacker" for the reflection
            // The original attacker becomes the "target" for the reflection
            const reflectResult = this.calculateThursReflection(defender, attacker, result.damage);
            
            if (reflectResult.damage > 0) {
                attacker.takeDamage(reflectResult.damage);
                this.addLog(`${attacker.getName()} took ${reflectResult.damage} reflected damage!`, 'damage');
                result.runeEffects.push({ rune: 'THURS', effect: `reflected ${reflectResult.damage}` });
                
                // Log matchup for reflected damage
                if (reflectResult.matchup === 'POTENT') {
                    this.addLog('Potent reflection!', 'potent');
                } else if (reflectResult.matchup === 'WEAK') {
                    this.addLog('Weak reflection!', 'weak');
                }
                
                // Apply Naudiz effect if Thurs user has it and reflection was WEAK
                if (reflectResult.matchup === 'WEAK' && defender.hasRune('NAUDIZ')) {
                    this.addLog(`${RUNES.NAUDIZ.symbol} ${RUNES.NAUDIZ.name} was activated!`, 'rune');
                    const stats = ['strength', 'wisdom', 'defense', 'durability'];
                    for (let i = 0; i < 2; i++) {
                        const randomIndex = Math.floor(Math.random() * stats.length);
                        const stat = stats[randomIndex];
                        attacker.modifyAttributeStage(stat, -1);
                        this.addLog(`${attacker.getName()}'s ${stat} was lowered 1 stage!`, 'debuff');
                    }
                    result.runeEffects.push({ rune: 'NAUDIZ', effect: 'debuffed on weak reflection' });
                }
                
                // Apply Inguz effect if Thurs user has it and reflection was WEAK
                if (reflectResult.matchup === 'WEAK' && defender.hasRune('INGUZ')) {
                    this.addLog(`${RUNES.INGUZ.symbol} ${RUNES.INGUZ.name} was activated!`, 'rune');
                    attacker.spendMegin(GAME_CONFIG.RUNE_INGUZ_MEGIN_DRAIN);
                    this.addLog(`${attacker.getName()} lost ${GAME_CONFIG.RUNE_INGUZ_MEGIN_DRAIN} Megin!`, 'megin');
                    result.runeEffects.push({ rune: 'INGUZ', effect: 'drained megin on weak reflection' });
                }
            }
        }
        
        return result;
    }
    
    // Calculate Thurs reflection damage as a Mixed-type hit
    calculateThursReflection(thursUser, reflectTarget, originalDamage) {
        // Base reflected damage is defined in the rune's mechanic value
        const reflectPercent = RUNES.THURS.mechanic.value;
        const baseReflectDamage = originalDamage * reflectPercent;
        
        // Element matchup: Use Thurs wielder's element vs reflect target's element
        const matchupType = getMatchupType(thursUser.species.element, reflectTarget.species.element);
        const elementMod = DAMAGE_MULTIPLIERS[matchupType];
        
        // Apply as Mixed hit: 50% checked against Defense, 50% checked against Durability
        // Defense reduction
        const defenseReduction = 1 - (reflectTarget.getAttribute('defense') / 
            (reflectTarget.getAttribute('defense') + GAME_CONFIG.DEFENSE_CONSTANT));
        const defensePortionDamage = (baseReflectDamage * 0.5) * defenseReduction * elementMod;
        
        // Durability reduction
        const durabilityReduction = 1 - (reflectTarget.getAttribute('durability') / 
            (reflectTarget.getAttribute('durability') + GAME_CONFIG.DEFENSE_CONSTANT));
        const durabilityPortionDamage = (baseReflectDamage * 0.5) * durabilityReduction * elementMod;
        
        // Total Mixed-type damage
        const totalDamage = defensePortionDamage + durabilityPortionDamage;
        
        return {
            damage: Math.floor(Math.max(1, totalDamage)),
            matchup: matchupType,
            element: thursUser.species.element
        };
    }
    
    // Calculate damage
    calculateDamage(attacker, defender, abilityName) {
        const ability = ABILITIES[abilityName];
        const abilityElement = getAbilityElement(abilityName, attacker.species.element);
        
        // Determine attack type (considering Ansuz and Raido)
        let attackType = ability.type;
        let useWisdom = attackType === ATTACK_TYPES.WISDOM;
        let useStrength = attackType === ATTACK_TYPES.STRENGTH;
        
        if (attackType === ATTACK_TYPES.MIXED) {
            useWisdom = true;
            useStrength = true;
        }
        
        // Ansuz: Strength attacks use Wisdom
        if (attacker.hasRune('ANSUZ') && attackType === ATTACK_TYPES.STRENGTH) {
            useWisdom = true;
            useStrength = false;
        }
        
        // Raido: Wisdom attacks use Strength
        if (attacker.hasRune('RAIDO') && attackType === ATTACK_TYPES.WISDOM) {
            useStrength = true;
            useWisdom = false;
        }
        
        // Element matchup
        const matchup = getMatchupType(abilityElement, defender.species.element);
        const elementMod = DAMAGE_MULTIPLIERS[matchup];
        
        // Damage range
        const damageRange = 1 + (Math.random() * GAME_CONFIG.DAMAGE_RANGE_VARIANCE);
        
        // Rune damage modifiers
        let runeMod = 1;
        
        // Element damage bonuses
        const elementBonusRunes = {
            [ELEMENTS.FIRE]: 'KAUNAN',
            [ELEMENTS.EARTH]: 'PERTHO',
            [ELEMENTS.WIND]: 'TYR',
            [ELEMENTS.NATURE]: 'BJARKA',
            [ELEMENTS.WATER]: 'LAGUZ'
        };
        
        if (elementBonusRunes[abilityElement] && attacker.hasRune(elementBonusRunes[abilityElement])) {
            runeMod += GAME_CONFIG.RUNE_ELEMENT_DAMAGE_BOOST;
        }
        
        // Odal: low cost bonus
        if (attacker.hasRune('ODAL') && ability.meginCost <= GAME_CONFIG.RUNE_ODAL_COST_THRESHOLD) {
            runeMod += GAME_CONFIG.RUNE_ODAL_DAMAGE_BOOST;
        }
        
        // Dagaz: first round bonus
        if (attacker.hasRune('DAGAZ') && attacker.battleFlags.isFirstRound) {
            runeMod += GAME_CONFIG.RUNE_DAGAZ_DAMAGE_BOOST;
        }
        
        // Fehu: reduce potent damage taken
        if (matchup === 'POTENT' && defender.hasRune('FEHU')) {
            runeMod *= GAME_CONFIG.RUNE_FEHU_DAMAGE_REDUCTION;
        }
        
        // Vätte family passive: Tag Team damage boost
        if (attacker.species.family === FAMILIES.VATTE) {
            const allyTeam = this.playerTeam.includes(attacker) ? this.playerTeam : this.enemyTeam;
            const vatteAllies = allyTeam.filter(v => 
                v !== attacker && 
                !v.isKnockedOut() && 
                v.species.family === FAMILIES.VATTE
            );
            if (vatteAllies.length > 0) {
                runeMod += GAME_CONFIG.FAMILY_VATTE_DAMAGE_BOOST;
            }
        }
        
        // Calculate damage based on attack type
        let totalDamage = 0;
        const power = ability.power;
        
        if (ability.type === ATTACK_TYPES.MIXED) {
            // 50% Strength, 50% Wisdom
            const strengthDamage = this.calculateSingleTypeDamage(
                power, attacker.getAttribute('strength'), defender.getAttribute('defense'),
                damageRange, elementMod, runeMod
            ) * 0.5;
            
            const wisdomDamage = this.calculateSingleTypeDamage(
                power, attacker.getAttribute('wisdom'), defender.getAttribute('durability'),
                damageRange, elementMod, runeMod
            ) * 0.5;
            
            totalDamage = strengthDamage + wisdomDamage;
        } else if (useStrength) {
            const defenseStat = attacker.hasRune('RAIDO') ? 'defense' : 'defense';
            totalDamage = this.calculateSingleTypeDamage(
                power, attacker.getAttribute('strength'), defender.getAttribute(defenseStat),
                damageRange, elementMod, runeMod
            );
        } else if (useWisdom) {
            const defenseStat = attacker.hasRune('ANSUZ') ? 'durability' : 'durability';
            totalDamage = this.calculateSingleTypeDamage(
                power, attacker.getAttribute('wisdom'), defender.getAttribute(defenseStat),
                damageRange, elementMod, runeMod
            );
        }
        
        return {
            damage: Math.floor(Math.max(1, totalDamage)),
            matchup: matchup,
            attackType: ability.type,
            element: abilityElement
        };
    }
    
    // Calculate single type damage
    calculateSingleTypeDamage(power, attackStat, defenseStat, damageRange, elementMod, runeMod) {
        const powerFactor = power / GAME_CONFIG.POWER_CONSTANT;
        const defenseReduction = 1 - (defenseStat / (defenseStat + GAME_CONFIG.DEFENSE_CONSTANT));
        return powerFactor * damageRange * attackStat * elementMod * runeMod * defenseReduction;
    }
    
    // Apply utility effect
    applyUtilityEffect(user, target, ability, isPlayer, selectedAllyTarget = null) {
        const effects = [];
        const effect = ability.effect;
        
        if (!effect) return effects;
        
        if (effect.type === 'buff') {
            let targetVasen;
            if (effect.target === 'ally') {
                // Use selected ally if provided, otherwise default to user (self)
                targetVasen = selectedAllyTarget || user;
            } else if (effect.target === 'self') {
                targetVasen = user;
            } else {
                targetVasen = target;
            }
            const stats = effect.stats || [effect.stat];
            
            // Track which stats were actually buffed for Gifu
            const buffedStats = [];
            
            stats.forEach(stat => {
                const result = targetVasen.modifyAttributeStage(stat, effect.stages);
                if (result.capped) {
                    this.addLog(`${targetVasen.getName()}'s ${stat} cannot be raised any higher.`, 'status');
                } else if (result.changed !== 0) {
                    const stageWord = Math.abs(result.changed) === 1 ? 'stage' : 'stages';
                    this.addLog(`${targetVasen.getName()}'s ${stat} was raised ${Math.abs(result.changed)} ${stageWord}!`, 'buff');
                    effects.push({ stat, change: result.changed });
                    buffedStats.push({ stat, stages: result.changed });
                }
            });
            
            // Gifu: share ALL buffed stats to allies (moved outside individual stat loop)
            if (buffedStats.length > 0 && !targetVasen.battleFlags.gifuTriggered && targetVasen.hasRune('GIFU')) {
                targetVasen.battleFlags.gifuTriggered = true;
                this.addLog(`${RUNES.GIFU.symbol} ${RUNES.GIFU.name} was activated!`, 'rune');
                
                const allies = isPlayer ? this.playerTeam : this.enemyTeam;
                allies.forEach(ally => {
                    if (ally !== targetVasen && !ally.isKnockedOut()) {
                        // Apply ALL buffed stats to each ally
                        buffedStats.forEach(buffedStat => {
                            ally.modifyAttributeStage(buffedStat.stat, buffedStat.stages);
                            this.addLog(`${ally.getName()}'s ${buffedStat.stat} was also raised!`, 'buff');
                        });
                    }
                });
            }
        } else if (effect.type === 'debuff') {
            const opponent = isPlayer ? target : this.playerActive;
            const targetVasen = effect.target === 'enemy' ? opponent : user;
            const stats = effect.stats || [effect.stat];
            
            // Wynja: block first debuff
            if (!targetVasen.battleFlags.wynjaTriggered && targetVasen.hasRune('WYNJA')) {
                targetVasen.battleFlags.wynjaTriggered = true;
                this.addLog(`${RUNES.WYNJA.symbol} ${RUNES.WYNJA.name} was activated!`, 'rune');
                this.addLog(`${targetVasen.getName()} blocked the debuff!`, 'block');
                
                // Raise random attribute
                const randomStat = ['strength', 'wisdom', 'defense', 'durability'][Math.floor(Math.random() * 4)];
                targetVasen.modifyAttributeStage(randomStat, 1);
                this.addLog(`${targetVasen.getName()}'s ${randomStat} was raised 1 stage!`, 'buff');
                return effects;
            }
            
            stats.forEach(stat => {
                const result = targetVasen.modifyAttributeStage(stat, -effect.stages);
                if (result.capped) {
                    this.addLog(`${targetVasen.getName()}'s ${stat} cannot be lowered any further.`, 'status');
                } else if (result.changed !== 0) {
                    const stageWord = Math.abs(result.changed) === 1 ? 'stage' : 'stages';
                    this.addLog(`${targetVasen.getName()}'s ${stat} was lowered ${Math.abs(result.changed)} ${stageWord}!`, 'debuff');
                    effects.push({ stat, change: result.changed });
                }
            });
        }
        
        return effects;
    }
    
    // Apply hit-based rune effects
    applyHitRuneEffects(attacker, defender, damageResult, result, isPlayer) {
        const ability = ABILITIES[result.ability];
        const abilityElement = damageResult.element;
        
        // Element ability buffs (Eihwaz, Sol, Ehwaz)
        const elementAbilityBuffs = {
            [ELEMENTS.EARTH]: { rune: 'EIHWAZ', stats: ['defense', 'durability'] },
            [ELEMENTS.FIRE]: { rune: 'SOL', stats: ['strength', 'wisdom'] },
            [ELEMENTS.WIND]: { rune: 'EHWAZ', stats: ['defense', 'durability'] },
            [ELEMENTS.WATER]: { rune: 'ISAZ', stats: ['wisdom', 'strength'] }
        };
        
        if (elementAbilityBuffs[abilityElement] && attacker.hasRune(elementAbilityBuffs[abilityElement].rune)) {
            if (Math.random() < GAME_CONFIG.RUNE_ELEMENT_BUFF_PROC_CHANCE) {
                const buffData = elementAbilityBuffs[abilityElement];
                this.addLog(`${RUNES[buffData.rune].symbol} ${RUNES[buffData.rune].name} was activated!`, 'rune');
                buffData.stats.forEach(stat => {
                    attacker.modifyAttributeStage(stat, 1);
                    this.addLog(`${attacker.getName()}'s ${stat} was raised 1 stage!`, 'buff');
                });
                result.runeEffects.push({ rune: buffData.rune, effect: 'buffed' });
            }
        }
        
        // Algiz: Nature ability heal
        if (abilityElement === ELEMENTS.NATURE && attacker.hasRune('ALGIZ')) {
            if (Math.random() < GAME_CONFIG.RUNE_NATURE_HEAL_PROC_CHANCE) {
                const healAmount = attacker.healPercent(GAME_CONFIG.RUNE_ALGIZ_HEAL_PERCENT);
                if (healAmount > 0) {
                    this.addLog(`${RUNES.ALGIZ.symbol} ${RUNES.ALGIZ.name} was activated!`, 'rune');
                    this.addLog(`${attacker.getName()} gained ${healAmount} health!`, 'heal');
                    result.runeEffects.push({ rune: 'ALGIZ', effect: `healed ${healAmount}` });
                }
            }
        }
        
        // Jera: low cost heal
        if (attacker.hasRune('JERA') && ability.meginCost <= GAME_CONFIG.RUNE_ODAL_COST_THRESHOLD) {
            if (Math.random() < GAME_CONFIG.RUNE_LOW_COST_HEAL_PROC_CHANCE) {
                const healAmount = attacker.healPercent(GAME_CONFIG.RUNE_JERA_HEAL_PERCENT);
                if (healAmount > 0) {
                    this.addLog(`${RUNES.JERA.symbol} ${RUNES.JERA.name} was activated!`, 'rune');
                    this.addLog(`${attacker.getName()} gained ${healAmount} health!`, 'heal');
                    result.runeEffects.push({ rune: 'JERA', effect: `healed ${healAmount}` });
                }
            }
        }
        
        // Weak hit effects
        if (damageResult.matchup === 'WEAK') {
            // Naudiz: debuff on weak hit
            if (attacker.hasRune('NAUDIZ')) {
                this.addLog(`${RUNES.NAUDIZ.symbol} ${RUNES.NAUDIZ.name} was activated!`, 'rune');
                const stats = ['strength', 'wisdom', 'defense', 'durability'];
                for (let i = 0; i < 2; i++) {
                    const randomIndex = Math.floor(Math.random() * stats.length);
                    const stat = stats[randomIndex];
                    defender.modifyAttributeStage(stat, -1);
                    this.addLog(`${defender.getName()}'s ${stat} was lowered 1 stage!`, 'debuff');
                }
                result.runeEffects.push({ rune: 'NAUDIZ', effect: 'debuffed' });
            }
            
            // Inguz: megin drain on weak hit
            if (attacker.hasRune('INGUZ')) {
                this.addLog(`${RUNES.INGUZ.symbol} ${RUNES.INGUZ.name} was activated!`, 'rune');
                defender.spendMegin(GAME_CONFIG.RUNE_INGUZ_MEGIN_DRAIN);
                this.addLog(`${defender.getName()} lost ${GAME_CONFIG.RUNE_INGUZ_MEGIN_DRAIN} Megin!`, 'megin');
                result.runeEffects.push({ rune: 'INGUZ', effect: 'drained megin' });
            }
        }
    }
    
    // Get enemy action using AI
    getEnemyAction() {
        const ai = new EnemyAI(this, this.battleType !== BATTLE_TYPES.WILD);
        return ai.chooseAction();
    }
    
    // Execute enemy action
    executeEnemyAction(action) {
        if (this.enemyActive.isKnockedOut()) return null;
        
        if (action.type === 'swap') {
            const index = this.enemyTeam.indexOf(action.target);
            if (index !== -1) {
                this.addLog(`The Guardian calls forth ${action.target.getName()}!`, 'swap');
                this.setEnemyActive(index, true);
                return { action: 'swap', target: action.target };
            }
        }
        
        if (action.type === 'ability') {
            return this.executeAbility(this.enemyActive, this.playerActive, action.ability, false);
        }
        
        return null;
    }
    
    // Handle post-turn effects and knockouts
    handlePostTurn(results) {
        // Handle player knockout
        if (this.playerActive && this.playerActive.isKnockedOut()) {
            const aliveTeam = this.playerTeam.filter(v => !v.isKnockedOut());
            if (aliveTeam.length === 0) {
                this.checkBattleEnd();
                return;
            }
            // Need to swap - call UI to show swap modal
            if (this.onKnockoutSwap) {
                this.onKnockoutSwap((index) => {
                    this.setPlayerActive(index, false); // No swap sickness for forced swap
                    this.addLog(`${this.playerActive.getName()} enters the fray!`, 'swap');
                    if (this.onUpdate) this.onUpdate();
                });
            }
        }
        
        // Handle enemy knockout
        if (this.enemyActive && this.enemyActive.isKnockedOut()) {
            const aliveTeam = this.enemyTeam.filter(v => !v.isKnockedOut());
            if (aliveTeam.length > 0) {
                // Auto swap to next enemy
                const nextIndex = this.enemyTeam.findIndex(v => !v.isKnockedOut());
                if (nextIndex !== -1) {
                    this.setEnemyActive(nextIndex, true);
                    this.addLog(`The enemy sends out ${this.enemyActive.getName()}!`, 'swap');
                }
            }
        }
    }
    
    // Get alive player team members for swap
    getAlivePlayerTeam() {
        return this.playerTeam.filter(v => !v.isKnockedOut() && v !== this.playerActive);
    }
    
    // Calculate and award experience
    calculateExperience() {
        if (this.winner !== 'player') return [];
        
        const results = [];
        const totalEnemyExp = this.enemyTeam.reduce((sum, enemy) => {
            return sum + getExpYield(enemy.level, enemy.species.rarity);
        }, 0);
        
        this.playerTeam.forEach(vasen => {
            if (vasen.isKnockedOut()) return; // Fainted get nothing
            
            const tracker = this.expTracker.get(vasen.id);
            if (!tracker) return;
            
            let expPercent = 0;
            
            if (tracker.dealtKillingBlow) {
                expPercent = 1.0; // 100%
            } else if (tracker.turnsOnField > 0) {
                expPercent = 0.6; // 60% for participated
            } else if (tracker.participated) {
                expPercent = 0.3; // 30% for in party but not on field
            }
            
            const expGained = Math.floor(totalEnemyExp * expPercent);
            if (expGained > 0) {
                const levelResult = vasen.addExperience(expGained);
                results.push({
                    vasen: vasen,
                    expGained: expGained,
                    leveledUp: levelResult.leveledUp,
                    newLevel: levelResult.newLevel,
                    previousLevel: levelResult.previousLevel
                });
            }
        });
        
        return results;
    }
    
    // Check if taming conditions are met
    canBeTamed() {
        return this.canTame && 
               this.correctItemGiven && 
               this.winner === 'player';
    }
    
    // Apply family passive abilities
    applyFamilyPassive(trigger, context) {
        const { vasen, isPlayer } = context;
        
        if (trigger === 'onEnterBattlefield' && vasen.species.family === FAMILIES.ANDE) {
            // Ande passive: Gain +1 stage to a random attribute when entering
            if (!vasen.battleFlags.andePassiveTriggered) {
                vasen.battleFlags.andePassiveTriggered = true;
                const stats = ['strength', 'wisdom', 'defense', 'durability'];
                const randomStat = stats[Math.floor(Math.random() * stats.length)];
                vasen.modifyAttributeStage(randomStat, 1);
                this.addLog(`${vasen.getName()}'s Ande spirit empowers it!`, 'passive');
                this.addLog(`${vasen.getName()}'s ${randomStat} was raised 1 stage!`, 'buff');
            }
        }
        
        if (trigger === 'onTurnStart' && vasen.species.family === FAMILIES.ODJUR) {
            // Odjur passive: Megin drain on turn 4+ when Health is below 30%
            if (vasen.battleFlags.turnsOnField >= 3) {
                const healthPercent = vasen.currentHealth / vasen.maxHealth;
                if (healthPercent < 0.30) {
                    const opponent = isPlayer ? this.enemyActive : this.playerActive;
                    if (opponent && !opponent.isKnockedOut()) {
                        opponent.spendMegin(GAME_CONFIG.FAMILY_ODJUR_MEGIN_DRAIN);
                        this.addLog(`${vasen.getName()}'s bestial fury drains ${opponent.getName()}!`, 'passive');
                        this.addLog(`${opponent.getName()} lost ${GAME_CONFIG.FAMILY_ODJUR_MEGIN_DRAIN} Megin!`, 'megin');
                    }
                }
            }
        }
        
        if (trigger === 'onSwapOut' && vasen.species.family === FAMILIES.VATTE) {
            // Vätte passive: Heal incoming ally
            const { incomingVasen } = context;
            if (incomingVasen && !incomingVasen.isKnockedOut()) {
                const healAmount = incomingVasen.healPercent(GAME_CONFIG.FAMILY_VATTE_SWAP_HEAL);
                if (healAmount > 0) {
                    this.addLog(`${vasen.getName()} passes its blessing to ${incomingVasen.getName()}!`, 'passive');
                    this.addLog(`${incomingVasen.getName()} gained ${healAmount} health!`, 'heal');
                }
            }
        }
    }
}

// Enemy AI Class
class EnemyAI {
    constructor(battle, isGuardian) {
        this.battle = battle;
        this.isGuardian = isGuardian;
        this.vasen = battle.enemyActive;
        this.target = battle.playerActive;
    }
    
    chooseAction() {
        const actions = this.scoreAllActions();
        
        // Sort by score descending
        actions.sort((a, b) => b.score - a.score);
        
        // Return best action
        return actions[0] || { type: 'ability', ability: 'Basic Strike' };
    }
    
    scoreAllActions() {
        const actions = [];
        
        // Score abilities
        const abilities = this.vasen.getAvailableAbilities();
        abilities.forEach(abilityName => {
            if (this.vasen.canUseAbility(abilityName)) {
                const score = this.scoreAbility(abilityName);
                actions.push({ type: 'ability', ability: abilityName, score });
            }
        });
        
        // Score swap (guardians only)
        if (this.isGuardian) {
            const swapTargets = this.battle.enemyTeam.filter(v => 
                !v.isKnockedOut() && v !== this.vasen
            );
            swapTargets.forEach(target => {
                const score = this.scoreSwap(target);
                actions.push({ type: 'swap', target, score });
            });
        }
        
        return actions;
    }
    
    scoreAbility(abilityName) {
        const ability = ABILITIES[abilityName];
        let score = 0;
        
        // Base score
        if (ability.type === ATTACK_TYPES.UTILITY) {
            score += 30;
        } else {
            score += 20;
        }
        
        // Damage bonus
        if (ability.type !== ATTACK_TYPES.UTILITY) {
            const predictedDamage = this.predictDamage(abilityName);
            
            if (predictedDamage >= this.target.currentHealth) {
                score += 100; // Knockout bonus
            } else if (predictedDamage >= this.target.maxHealth * 0.5) {
                score += 50; // High damage bonus
            }
            
            // Element bonus
            const abilityElement = getAbilityElement(abilityName, this.vasen.species.element);
            const matchup = getMatchupType(abilityElement, this.target.species.element);
            
            if (matchup === 'POTENT') {
                score += 20;
            } else if (matchup === 'WEAK') {
                // Check for weak hit runes
                if (this.vasen.hasRune('NAUDIZ') || this.vasen.hasRune('INGUZ')) {
                    score -= 5;
                } else {
                    score -= 30;
                }
            }
            
            // Rune synergy bonus
            if (this.isGuardian) {
                score += this.scoreRuneSynergy(abilityName);
            }
        } else {
            // Utility scoring
            if (ability.effect && ability.effect.type === 'buff') {
                score += 40;
            } else if (ability.effect && ability.effect.type === 'debuff') {
                score += 30;
            }
        }
        
        // Megin penalty
        const meginCost = this.vasen.getAbilityMeginCost(abilityName);
        if (meginCost > this.vasen.currentMegin * 0.5) {
            score -= 15;
        }
        
        // Risk penalty
        const threatLevel = this.assessThreat();
        if (threatLevel > 0.6) {
            score -= 20;
        }
        
        // Variance
        const variance = this.isGuardian ? 5 : 20;
        score += (Math.random() * variance * 2) - variance;
        
        return score;
    }
    
    scoreSwap(target) {
        let score = 25;
        
        // Low health bonus
        if (this.vasen.currentHealth < this.vasen.maxHealth * 0.3) {
            score += 30;
        }
        
        // Type advantage
        const currentMatchup = getMatchupType(this.target.species.element, this.vasen.species.element);
        const newMatchup = getMatchupType(this.target.species.element, target.species.element);
        
        if (currentMatchup === 'POTENT' && newMatchup !== 'POTENT') {
            score += 20;
        }
        
        // Variance
        score += (Math.random() * 10) - 5;
        
        return score;
    }
    
    predictDamage(abilityName) {
        const ability = ABILITIES[abilityName];
        if (ability.type === ATTACK_TYPES.UTILITY) return 0;
        
        // Simplified damage prediction
        const abilityElement = getAbilityElement(abilityName, this.vasen.species.element);
        const matchup = getMatchupType(abilityElement, this.target.species.element);
        const elementMod = DAMAGE_MULTIPLIERS[matchup];
        
        const power = ability.power;
        const attackStat = ability.type === ATTACK_TYPES.WISDOM ? 
            this.vasen.getAttribute('wisdom') : this.vasen.getAttribute('strength');
        const defenseStat = ability.type === ATTACK_TYPES.WISDOM ?
            this.target.getAttribute('durability') : this.target.getAttribute('defense');
        
        const powerFactor = power / GAME_CONFIG.POWER_CONSTANT;
        const defenseReduction = 1 - (defenseStat / (defenseStat + GAME_CONFIG.DEFENSE_CONSTANT));
        
        return Math.floor(powerFactor * attackStat * elementMod * defenseReduction);
    }
    
    scoreRuneSynergy(abilityName) {
        let bonus = 0;
        const ability = ABILITIES[abilityName];
        const abilityElement = getAbilityElement(abilityName, this.vasen.species.element);
        
        // Element damage runes
        const elementRunes = {
            [ELEMENTS.FIRE]: 'KAUNAN',
            [ELEMENTS.EARTH]: 'PERTHO',
            [ELEMENTS.WIND]: 'TYR',
            [ELEMENTS.NATURE]: 'BJARKA',
            [ELEMENTS.WATER]: 'LAGUZ'
        };
        
        if (this.vasen.hasRune(elementRunes[abilityElement])) {
            bonus += 10;
        }
        
        // Low cost runes
        if (ability.meginCost <= 30) {
            if (this.vasen.hasRune('ODAL')) bonus += 10;
            if (this.vasen.hasRune('JERA')) bonus += 5;
        }
        
        return bonus;
    }
    
    assessThreat() {
        // Estimate threat level from 0 to 1
        const healthRatio = this.vasen.currentHealth / this.vasen.maxHealth;
        const matchup = getMatchupType(this.target.species.element, this.vasen.species.element);
        
        let threat = 1 - healthRatio;
        if (matchup === 'POTENT') threat += 0.2;
        
        return Math.min(1, threat);
    }
}
