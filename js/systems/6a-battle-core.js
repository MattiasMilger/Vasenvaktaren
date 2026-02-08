// =============================================================================
// 6a-battle-core.js - Battle Mechanics and Combat Logic (FIXED)
// =============================================================================

// Helper: Check if ability requires ally targeting
function abilityRequiresAllyTarget(abilityName) {
    const ability = ABILITIES[abilityName];
    if (!ability || !ability.effect) return false;
    return ability.effect.target === 'ally';
}

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
        
        // Enemy utility usage tracking (for AI)
        this.enemyUtilityUsage = new Map(); // "vasenId-abilityName" -> count
        
        // Callbacks for UI updates
        this.onLog = null;
        this.onUpdate = null;
        this.onHit = null;
        this.onAttack = null;
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
                // Get ally target if specified
                let allyTarget = null;
                if (action.targetAllyIndex !== undefined) {
                    allyTarget = this.playerTeam[action.targetAllyIndex];
                }
                result = this.playerUseAbility(action.abilityName, allyTarget);
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
        }
        
        // Trigger Odjur passive on turn start
        this.applyFamilyPassive('onTurnStart', { vasen: this.playerActive, isPlayer: true });
        this.applyFamilyPassive('onTurnStart', { vasen: this.enemyActive, isPlayer: false });
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
        
        // Clear swap sickness and temporary flags
        if (this.playerActive) {
            this.playerActive.battleFlags.hasSwapSickness = false;
            this.playerActive.battleFlags.isFirstRound = false;
            this.playerActive.battleFlags.turnsOnField++;
            // Clear Vätte damage boost flag
            this.playerActive.battleFlags.vatteDamageBoost = false;
        }
        if (this.enemyActive) {
            this.enemyActive.battleFlags.hasSwapSickness = false;
            this.enemyActive.battleFlags.isFirstRound = false;
            this.enemyActive.battleFlags.turnsOnField++;
            // Clear Vätte damage boost flag
            this.enemyActive.battleFlags.vatteDamageBoost = false;
        }
        
        // Check for battle end
        this.checkBattleEnd();
        
        // Update UI
        if (this.onUpdate) {
            this.onUpdate();
        }
        
        // Handle battle end with delay to allow death animations to complete
if (this.isOver && this.onEnd) {
    setTimeout(() => {
        this.onEnd(this.getBattleResult());
    }, GAME_CONFIG.BATTLE_END_ANIMATION_DELAY);
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
    playerUseAbility(abilityName, allyTarget = null) {
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
        
        // Priority: Utility > Swap > Attack
        let playerFirst = true;
        if (!playerIsUtility && enemyIsUtility) {
            playerFirst = false;
        }
        
        const results = { player: null, enemy: null };
        
        if (playerFirst) {
            results.player = this.executeAbility(this.playerActive, this.enemyActive, abilityName, true, allyTarget);
            if (!this.enemyActive.isKnockedOut()) {
                results.enemy = this.executeEnemyAction(enemyAction);
            }
        } else {
            results.enemy = this.executeEnemyAction(enemyAction);
            if (!this.playerActive.isKnockedOut()) {
                results.player = this.executeAbility(this.playerActive, this.enemyActive, abilityName, true, allyTarget);
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
        
        if (this.giftsGiven >= GAME_CONFIG.MAX_OFFERS_PER_COMBAT) {
            return { success: false, correct: false };
        }
        
        if (this.correctItemGiven) {
            return { success: false, correct: false };
        }
        
        this.giftsGiven++;
        this.addLog(`<span class="taming-item">${itemName}</span> was gifted to ${this.enemyActive.getName()}.`, 'gift');
        
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
        
        // Enemy acts (player passes)
        const enemyAction = this.getEnemyAction();
        const results = { player: { action: 'ask' }, enemy: null };
        results.enemy = this.executeEnemyAction(enemyAction);
        
        // Add the item response AFTER combat events
        this.addLog(`Tell me ${this.enemyActive.getName()}, what is it that you desire the most?`, 'dialogue');
        this.addLog(`If you must know, <span class="taming-item">${tamingItem}</span> is what I desire most.`, 'dialogue');
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
        
        // Trigger attack animation based on ability type
        if (this.onAttack) {
            this.onAttack(isPlayer ? 'player' : 'enemy', ability.type);
        }
        
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
                    this.addLog(`${attacker.getName()} gained <span style="color: #a2ba92; font-weight: 700;">${healAmount} health</span>!`);
                }
            }
            
            // Trigger debuff flash animation if this is a debuff ability
            if (ability.effect && ability.effect.type === 'debuff' && this.onHit) {
                setTimeout(() => {
                    this.onHit(isPlayer ? 'enemy' : 'player', 'DEBUFF');
                }, 200);
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
        
        // Trigger family passives after taking damage
        // Drake: Check health threshold
        this.applyFamilyPassive('onHealthThreshold', { vasen: defender, isPlayer: !isPlayer });
        
        // Rå: Malicious Retaliation when hit (FIXED: only once per combat)
        if (!defender.battleFlags.raPassiveTriggered) {
            this.applyFamilyPassive('onTakeDamage', { vasen: defender, attacker: attacker, isPlayer: !isPlayer });
        }
        
        // Check if this hit will cause a knockout BEFORE flashing
        const willKnockout = defender.isKnockedOut();
        
        // Flash the defender (hit effect) with a 200ms delay to overlap with attack animation
        // This creates a better visual flow where the flash happens as the attacker reaches forward
        if (this.onHit) {
            setTimeout(() => {
                if (willKnockout) {
                    this.onHit(isPlayer ? 'enemy' : 'player', 'KNOCKOUT');
                } else {
                    this.onHit(isPlayer ? 'enemy' : 'player', damageResult.matchup);
                }
            }, 200);
        }
        
        // Log matchup (always show effectiveness)
        if (damageResult.matchup === 'POTENT') {
            this.addLog('Potent hit!', 'potent');
        } else if (damageResult.matchup === 'WEAK') {
            this.addLog('Weak hit!', 'weak');
        }
        
        // Handle rune effects for hits
        this.applyHitRuneEffects(attacker, defender, damageResult, result, isPlayer);
        
        // Check knockout
        if (willKnockout) {
            // Hagal rune: Debuff opponent on knockout (triggers BEFORE revive check)
            if (defender.hasRune('HAGAL')) {
                this.addLog(`${RUNES.HAGAL.symbol} ${RUNES.HAGAL.name} was activated!`, 'rune');
                ['strength', 'wisdom', 'defense', 'durability'].forEach(stat => {
                    attacker.modifyAttributeStage(stat, -1);
                });
                this.addLog(`${attacker.getName()}'s attributes were lowered!`, 'debuff');
            }
            
            // Vålnad family passive: Deathless - attempt to revive
            const revived = this.applyFamilyPassive('onKnockout', { vasen: defender, isPlayer: !isPlayer });
            
            if (!revived) {
                // If not revived, log the knockout
                if (isPlayer) {
                    this.addLog(`${defender.getName()} collapses!`, 'knockout');
                    // Mark killing blow
                    const tracker = this.expTracker.get(attacker.id);
                    if (tracker) tracker.dealtKillingBlow = true;
                } else {
                    this.addLog(`${defender.getName()} has fainted!`, 'knockout');
                }
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
                    const meginDrain = RUNES.INGUZ.mechanic.value; // Get value from rune definition
                    attacker.spendMegin(meginDrain);
                    this.addLog(`${attacker.getName()} lost ${meginDrain} Megin!`, 'megin');
                    result.runeEffects.push({ rune: 'INGUZ', effect: 'drained megin on weak reflection' });
                }
            }
        }
        
        // Troll family passive: Steal attribute stage when using ability (FIXED: only once per combat)
        if (ability.type !== ATTACK_TYPES.UTILITY && !defender.isKnockedOut()) {
            if (!attacker.battleFlags.trollPassiveTriggered) {
                this.applyFamilyPassive('onUseAbility', { vasen: attacker, defender: defender, isPlayer });
            }
        }
        
        return result;
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
        
        // Vätte passive: Tag Team damage boost
        if (attacker.battleFlags.vatteDamageBoost) {
            runeMod += FAMILY_PASSIVE_CONFIG.VATTE_DAMAGE_BOOST;
        }
        
        // Calculate damage based on attack type
        let totalDamage = 0;
        
        // Jätte passive: Basic Strike has higher power
        let power = ability.power;
        if (abilityName === 'Basic Strike' && attacker.species.family === FAMILIES.JATTE) {
            power = FAMILY_PASSIVE_CONFIG.JATTE_BASIC_STRIKE_POWER;
        }
        
        if (ability.type === ATTACK_TYPES.MIXED) {
            // 50% Strength, 50% Wisdom
            const strengthDamage = this.calculateSingleTypeDamage(
                power, attacker.getAttribute('strength'), defender.getAttribute('defense'),
                damageRange, elementMod, runeMod
            ) * GAME_CONFIG.MIXED_ATTACK_STRENGTH_PORTION;
            
            const wisdomDamage = this.calculateSingleTypeDamage(
                power, attacker.getAttribute('wisdom'), defender.getAttribute('durability'),
                damageRange, elementMod, runeMod
            ) * GAME_CONFIG.MIXED_ATTACK_WISDOM_PORTION;
            
            totalDamage = strengthDamage + wisdomDamage;
        } else if (useStrength) {
            totalDamage = this.calculateSingleTypeDamage(
                power, attacker.getAttribute('strength'), defender.getAttribute('defense'),
                damageRange, elementMod, runeMod
            );
        } else if (useWisdom) {
            totalDamage = this.calculateSingleTypeDamage(
                power, attacker.getAttribute('wisdom'), defender.getAttribute('durability'),
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
    
    // Calculate Thurs reflection damage as Mixed attack
    calculateThursReflection(defender, attacker, originalDamage) {
        // Use the defender's element for the reflection
        const reflectElement = defender.species.element;
        
        // Element matchup for the reflection
        const matchup = getMatchupType(reflectElement, attacker.species.element);
        const elementMod = DAMAGE_MULTIPLIERS[matchup];
        
        // Base reflected damage is 20% of original
        const baseReflectDamage = originalDamage * 0.20;
        
        // Mixed attack: 50% based on Strength, 50% based on Wisdom
        const strengthFactor = defender.getAttribute('strength') / 100;
        const wisdomFactor = defender.getAttribute('wisdom') / 100;
        const statMod = (strengthFactor + wisdomFactor) * 0.5;
        
        // Calculate final reflected damage
        const totalReflectDamage = baseReflectDamage * elementMod * statMod;
        
        return {
            damage: Math.floor(Math.max(1, totalReflectDamage)),
            matchup: matchup,
            element: reflectElement
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
            // Determine the target of the buff
            let targetVasen = user;
            
            if (effect.target === 'ally' && selectedAllyTarget) {
                targetVasen = selectedAllyTarget;
            } else if (effect.target === 'self') {
                targetVasen = user;
            }
            
            const stats = effect.stats || [effect.stat];
            
            stats.forEach(stat => {
                const result = targetVasen.modifyAttributeStage(stat, effect.stages);
                if (result.capped) {
                    this.addLog(`${targetVasen.getName()}'s ${stat} cannot be raised any higher.`, 'status');
                } else if (result.changed !== 0) {
                    const stageWord = Math.abs(result.changed) === 1 ? 'stage' : 'stages';
                    this.addLog(`${targetVasen.getName()}'s ${stat} was raised ${Math.abs(result.changed)} ${stageWord}!`, 'buff');
                    effects.push({ stat, change: result.changed });
                    
                    // Gifu: share first buff
                    if (!user.battleFlags.gifuTriggered && user.hasRune('GIFU')) {
                        user.battleFlags.gifuTriggered = true;
                        this.addLog(`${RUNES.GIFU.symbol} ${RUNES.GIFU.name} was activated!`, 'rune');
                        
                        const allies = isPlayer ? this.playerTeam : this.enemyTeam;
                        allies.forEach(ally => {
                            if (ally !== user && !ally.isKnockedOut()) {
                                ally.modifyAttributeStage(stat, effect.stages);
                                this.addLog(`${ally.getName()}'s ${stat} was also raised!`, 'buff');
                            }
                        });
                    }
                }
            });
        } else if (effect.type === 'debuff') {
    const targetVasen = isPlayer ? target : this.playerActive;
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
        
        // Element ability buffs (Eihwaz, Sol, Ehwaz, Isaz)
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
                    this.addLog(`${attacker.getName()} gained <span style="color: #a2ba92; font-weight: 700;">${healAmount} health</span>!`);
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
                    this.addLog(`${attacker.getName()} gained <span style="color: #a2ba92; font-weight: 700;">${healAmount} health</span>!`);
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
            // Track utility usage for AI
            const ability = ABILITIES[action.ability];
            if (ability && ability.type === ATTACK_TYPES.UTILITY) {
                this.trackEnemyUtilityUsage(this.enemyActive, action.ability);
            }
            
            return this.executeAbility(this.enemyActive, this.playerActive, action.ability, false, null);
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
            
            // Check if enemy team is also wiped out (battle ends)
            const enemyAliveTeam = this.enemyTeam.filter(v => !v.isKnockedOut());
            if (enemyAliveTeam.length === 0) {
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
                const result = vasen.modifyAttributeStage(randomStat, 1);
                
                this.addLog(`${vasen.getName()}'s Ande spirit empowers it!`, 'passive');
                this.addLog(`${vasen.getName()}'s ${randomStat} was raised 1 stage!`, 'buff');
                
                // Gifu: share the buff with allies if equipped
                if (result.changed !== 0 && !vasen.battleFlags.gifuTriggered && vasen.hasRune('GIFU')) {
                    vasen.battleFlags.gifuTriggered = true;
                    this.addLog(`${RUNES.GIFU.symbol} ${RUNES.GIFU.name} was activated!`, 'rune');
                    
                    const allies = isPlayer ? this.playerTeam : this.enemyTeam;
                    allies.forEach(ally => {
                        if (ally !== vasen && !ally.isKnockedOut()) {
                            ally.modifyAttributeStage(randomStat, 1);
                            this.addLog(`${ally.getName()}'s ${randomStat} was also raised!`, 'buff');
                        }
                    });
                }
            }
        }
        
        if (trigger === 'onTurnStart' && vasen.species.family === FAMILIES.ODJUR) {
            // Odjur passive: Bestial Rage - gain Strength and Wisdom stages after 2 turns on field
            if (vasen.battleFlags.turnsOnField >= FAMILY_PASSIVE_CONFIG.ODJUR_TURNS_REQUIRED) {
                if (!vasen.battleFlags.odjurTriggered) {
                    vasen.battleFlags.odjurTriggered = true;
                    vasen.modifyAttributeStage('strength', FAMILY_PASSIVE_CONFIG.ODJUR_STRENGTH_STAGES);
                    vasen.modifyAttributeStage('wisdom', FAMILY_PASSIVE_CONFIG.ODJUR_WISDOM_STAGES);
                    this.addLog(`${vasen.getName()}'s bestial rage awakens!`, 'passive');
                    this.addLog(`${vasen.getName()}'s Strength and Wisdom were raised!`, 'buff');
                }
            }
        }
        
        if (trigger === 'onSwapOut' && vasen.species.family === FAMILIES.VATTE) {
            // Vätte passive: Tag Team - incoming ally gains 30% damage boost for current turn
            const { incomingVasen } = context;
            if (incomingVasen && !incomingVasen.isKnockedOut()) {
                // Set a temporary flag on the incoming väsen for the damage boost
                incomingVasen.battleFlags.vatteDamageBoost = true;
                this.addLog(`${vasen.getName()} tags in ${incomingVasen.getName()}!`, 'passive');
                this.addLog(`${incomingVasen.getName()} gains a damage boost!`, 'buff');
            }
        }
        
        if (trigger === 'onHealthThreshold' && vasen.species.family === FAMILIES.DRAKE) {
            // Drake passive: Draconic Resilience - gain Defense and Durability when health drops to 50% or lower
            const healthPercent = vasen.currentHealth / vasen.maxHealth;
            if (healthPercent <= FAMILY_PASSIVE_CONFIG.DRAKE_HEALTH_THRESHOLD && !vasen.battleFlags.drakePassiveTriggered) {
                vasen.battleFlags.drakePassiveTriggered = true;
                vasen.modifyAttributeStage('defense', FAMILY_PASSIVE_CONFIG.DRAKE_DEFENSE_STAGES);
                vasen.modifyAttributeStage('durability', FAMILY_PASSIVE_CONFIG.DRAKE_DURABILITY_STAGES);
                this.addLog(`${vasen.getName()}'s draconic scales harden!`, 'passive');
                this.addLog(`${vasen.getName()}'s Defense and Durability were raised!`, 'buff');
            }
        }
        
        if (trigger === 'onTakeDamage' && vasen.species.family === FAMILIES.RA) {
            // Rå passive: Malicious Retaliation - lower two random enemy attributes by 1 stage when hit (FIXED: once per combat)
            const { attacker } = context;
            if (attacker && !attacker.isKnockedOut()) {
                // Mark flag so it only triggers once
                vasen.battleFlags.raPassiveTriggered = true;
                
                const stats = ['strength', 'wisdom', 'defense', 'durability'];
                const debuffedStats = [];
                for (let i = 0; i < FAMILY_PASSIVE_CONFIG.RA_DEBUFF_COUNT; i++) {
                    if (stats.length > 0) {
                        const randomIndex = Math.floor(Math.random() * stats.length);
                        const stat = stats[randomIndex];
                        attacker.modifyAttributeStage(stat, -FAMILY_PASSIVE_CONFIG.RA_DEBUFF_STAGES);
                        debuffedStats.push(stat);
                        stats.splice(randomIndex, 1);
                    }
                }
                this.addLog(`${vasen.getName()}'s malicious aura strikes back!`, 'passive');
                debuffedStats.forEach(stat => {
                    this.addLog(`${attacker.getName()}'s ${stat} was lowered!`, 'debuff');
                });
            }
        }
        
        if (trigger === 'onUseAbility' && vasen.species.family === FAMILIES.TROLL) {
            // Troll passive: Troll Theft - steal one positive attribute stage from enemy (FIXED: once per combat)
            const { defender } = context;
            if (defender && !defender.isKnockedOut()) {
                // Mark flag so it only triggers once
                vasen.battleFlags.trollPassiveTriggered = true;
                
                const stats = ['strength', 'wisdom', 'defense', 'durability'];
                const stealableStats = stats.filter(stat => defender.attributeStages[stat] > 0);
                
                if (stealableStats.length > 0) {
                    const randomStat = stealableStats[Math.floor(Math.random() * stealableStats.length)];
                    defender.modifyAttributeStage(randomStat, -FAMILY_PASSIVE_CONFIG.TROLL_STAGE_STEAL);
                    vasen.modifyAttributeStage(randomStat, FAMILY_PASSIVE_CONFIG.TROLL_STAGE_STEAL);
                    this.addLog(`${vasen.getName()} steals ${defender.getName()}'s ${randomStat} boost!`, 'passive');
                    this.addLog(`${defender.getName()}'s ${randomStat} was lowered 1 stage!`, 'debuff');
                    this.addLog(`${vasen.getName()}'s ${randomStat} was raised 1 stage!`, 'buff');
                }
            }
        }
        
        if (trigger === 'onKnockout' && vasen.species.family === FAMILIES.VALNAD) {
            // Vålnad passive: Deathless - revive with 10% health upon knockout (once per battle)
            if (!vasen.battleFlags.valnadPassiveTriggered) {
                vasen.battleFlags.valnadPassiveTriggered = true;
                const reviveHealth = Math.floor(vasen.maxHealth * FAMILY_PASSIVE_CONFIG.VALNAD_REVIVE_HEALTH_PERCENT);
                vasen.currentHealth = reviveHealth;
                this.addLog(`${vasen.getName()} refuses to fall!`, 'passive');
                this.addLog(`${vasen.getName()} revived with <span style="color: #a2ba92; font-weight: 700;">${reviveHealth}</span> HP!`);
                return true; // Signal that the knockout was prevented
            }
        }
    }
    
    // Get how many times an enemy has used a specific utility ability
    getEnemyUtilityUsageCount(vasen, abilityName) {
        const key = `${vasen.id}-${abilityName}`;
        return this.enemyUtilityUsage.get(key) || 0;
    }
    
    // Track enemy utility ability usage
    trackEnemyUtilityUsage(vasen, abilityName) {
        const key = `${vasen.id}-${abilityName}`;
        const currentCount = this.enemyUtilityUsage.get(key) || 0;
        this.enemyUtilityUsage.set(key, currentCount + 1);
    }
}
