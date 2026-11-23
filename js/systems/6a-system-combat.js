// =============================================================================
// 6a-system-combat.js - Combat Class: Turn Flow, Actions and Combat Log
// =============================================================================
//
// The Combat class is spread over three files, extended through
// Combat.prototype in the same way as UIController and Game:
//   6a-system-combat.js          class definition, turn flow, player and enemy
//                                actions, knockout handling, experience, log helpers
//   6c-system-combat-skills.js   skill resolution, damage calculation and
//                                utility skill effects
//   6d-system-combat-passives.js rune effects and family passives
// =============================================================================

const COMBAT_TYPES = {
    WILD: 'wild',
    GUARDIAN: 'guardian',
    ENDLESS_WILD: 'endless_wild',
    ENDLESS_GUARDIAN: 'endless_guardian',
    ENDLESS_TOWER: 'endless_tower'
};

class Combat {
    constructor(playerTeam, enemyTeam, combatType = COMBAT_TYPES.WILD, onCombatEnd = null) {
        this.playerTeam = playerTeam;
        this.enemyTeam = enemyTeam;
        this.combatType = combatType;
        this.onCombatEnd = onCombatEnd;
        
        this.playerActive = null;
        this.enemyActive = null;
        this.playerActiveIndex = 0;
        this.enemyActiveIndex = 0;
        
        this.turnCount = 0;
        this.log = [];
        this.isOver = false;
        this.winner = null;

        this.playerTeamFreyasTears = 0;
        this.enemyTeamFreyasTears = 0;
        
        // Taming state
        this.giftsGiven = 0;
        this.correctItemGiven = false;
        this.canTame = combatType === COMBAT_TYPES.WILD;
        this.isWildEncounter = combatType === COMBAT_TYPES.WILD;
        
        
        // Enemy utility usage tracking (for AI)
        this.enemyUtilityUsage = new Map(); // "vasenId-skillName" -> count

        // Initial Bonus tracking (per side, per skill name)
        this.playerInitialBonusUsed = new Set();
        this.enemyInitialBonusUsed = new Set();
        
        // Callbacks for UI updates
        this.onLog = null;
        this.onUpdate = null;
        this.onHit = null;
        this.onAttack = null;
        this.onKnockoutSwap = null;
        this.onEnd = null;
        // Called with the väsen sent onto the field (Ragnarök saves remember it,
        // so a reload mid-battle knows who covers the retreat)
        this.onPlayerActiveChange = null;
        // Called once for each player väsen that is knocked out (after revives
        // had their chance), with (vasen, enemyActive). Used by Permadeath.
        this.onPlayerKnockout = null;
        this.reportedKnockouts = new Set();

        // Action state
        this.waitingForPlayerAction = true;
        
        // Initialize active Väsen
        this.setPlayerActive(0);
        this.setEnemyActive(0);

        // Defer initial passives to allow UI to set up loggers
        setTimeout(() => {
            this.applyFamilyPassive('onEnterBattlefield', { vasen: this.playerActive, isPlayer: true });
            this.applyFamilyPassive('onEnterBattlefield', { vasen: this.enemyActive, isPlayer: false });
            if (this.onUpdate) this.onUpdate();
        }, 50);
    }
    
    // Execute player action (dispatcher method)
    executePlayerAction(action) {
        if (!action || !action.type) return null;
        
        // Disable player input immediately
        this.waitingForPlayerAction = false;
        
        let result = null;
        
        switch (action.type) {
            case 'skill':
                // Get ally target if specified
                let allyTarget = null;
                if (action.targetAllyIndex !== undefined) {
                    allyTarget = this.playerTeam[action.targetAllyIndex];
                }
                result = this.playerUseSkill(action.skillName, allyTarget);
                break;
            case 'swap':
                result = this.playerSwap(action.targetIndex);
                break;
            case 'offer':
                result = this.offerItem(action.itemId);
                break;
            case 'interrogate':
                result = this.interrogate(action.freeTurn === true);
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
        
        // Re-enable player input after delay (if combat is not over)
        setTimeout(() => {
            if (!this.isOver) {
                this.waitingForPlayerAction = true;
                if (this.onUpdate) {
                    this.onUpdate();
                }
            }
        }, GAME_CONFIG.COMBAT_INPUT_DELAY);
        
        return result;
    }
    
    // Set player's active Väsen
    setPlayerActive(index, isSwap = false) {
        const vasen = this.playerTeam[index];
        if (!vasen || vasen.isKnockedOut()) return false;
        
        // Handle Oknytt passive for outgoing Väsen
        if (isSwap && this.playerActive && this.playerActive.species.family === FAMILIES.OKNYTT) {
            this.applyFamilyPassive('onSwapOut', { 
                vasen: this.playerActive, 
                incomingVasen: vasen,
                isPlayer: true 
            });
        }
        
        if (this.playerActive) {
            this.playerActive.combatFlags.hasSwapSickness = false;
            if (isSwap) {
                this.playerActive.combatFlags.odjurPassiveTriggered = false;
            }
        }
        
        this.playerActive = vasen;
        this.playerActiveIndex = index;
        if (this.onPlayerActiveChange) this.onPlayerActiveChange(vasen);
        
        if (isSwap) {
            vasen.combatFlags.hasSwapSickness = true;
            vasen.combatFlags.isFirstRound = true;
            vasen.combatFlags.turnsOnField = 0;
        }
        
        
        // Trigger Ande passive when entering battlefield (via swap)
        if (isSwap) {
            this.applyFamilyPassive('onEnterBattlefield', { vasen, isPlayer: true });
        }
        
        return true;
    }
    
    // Set enemy's active Väsen
    setEnemyActive(index, isSwap = false) {
        const vasen = this.enemyTeam[index];
        if (!vasen || vasen.isKnockedOut()) return false;
        
        // Handle Oknytt passive for outgoing Väsen
        if (isSwap && this.enemyActive && this.enemyActive.species.family === FAMILIES.OKNYTT) {
            this.applyFamilyPassive('onSwapOut', { 
                vasen: this.enemyActive, 
                incomingVasen: vasen,
                isPlayer: false 
            });
        }
        
        if (this.enemyActive) {
            this.enemyActive.combatFlags.hasSwapSickness = false;
            if (isSwap) {
                this.enemyActive.combatFlags.odjurPassiveTriggered = false;
            }
        }
        
        this.enemyActive = vasen;
        this.enemyActiveIndex = index;
        vasen.combatFlags.isFirstRound = true;
        vasen.combatFlags.turnsOnField = 0;
        
        // Trigger Ande passive when entering battlefield (via swap)
        if (isSwap) {
            this.applyFamilyPassive('onEnterBattlefield', { vasen, isPlayer: false });
        }
        
        return true;
    }
    
    // Add to combat log
    addLog(message, type = 'info') {
        this.log.push({ message, type, turn: this.turnCount });
        if (this.log.length > GAME_CONFIG.MAX_COMBAT_LOG) {
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
    }
    
    // End turn (refill megin, clear flags)
    endTurn() {
        // Snapshot pre-refill megin values so the combat log can report the
        // TOTAL megin gained this turn (base refill + any Freya's Tears bonus
        // refill applied further below), rather than just the base amount.
        const allCombatants = [...this.playerTeam, ...this.enemyTeam];
        const meginBeforeRefill = new Map();
        allCombatants.forEach(v => meginBeforeRefill.set(v.id, v.currentMegin));

        // Refill megin for all team members (base refill only)
        allCombatants.forEach(v => {
            if (!v.isKnockedOut()) {
                v.refillMegin();
            }
        });

        // Freya's Tears: apply heal + extra megin refill to active combatants
        const teams = [
            { vasen: this.playerActive, teamFlag: 'playerTeamFreyasTears', teamName: 'your team' },
            { vasen: this.enemyActive, teamFlag: 'enemyTeamFreyasTears', teamName: 'the opposing team' }
        ];
        
        teams.forEach(team => {
            if (this[team.teamFlag] > 0 && team.vasen && !team.vasen.isKnockedOut()) {
                const vasen = team.vasen;

                // 1. Log Freya's Tears effect first
                this.addLog(`Freya's Tears rain on ${vasen.getDisplayName()}`, 'status');

                // Health refill
                const healAmount = Math.floor(vasen.maxHealth * GAME_CONFIG.FREYASTEARS_HEALTH_REFILL_PERCENT);
                if (healAmount > 0) {
                    vasen.heal(healAmount);
                    // 2. Log gained health right after
                    this.addLog(`${vasen.getDisplayName()} gained <span style="color: var(--color-positive-soft); font-weight: 700;">${healAmount} health!`, 'heal');
                }

                // Megin refill
                for (let i = 1; i < GAME_CONFIG.FREYASTEARS_MEGIN_MULTIPLIER; i++) {
                    vasen.refillMegin();
                }
            }
        });

        // Report TOTAL megin gained this turn per väsen
        // (base refill plus any Freya's Tears bonus refill applied above).
        allCombatants.forEach(v => {
            if (!v.isKnockedOut()) {
                const gained = v.currentMegin - (meginBeforeRefill.get(v.id) || 0);
                if (gained > 0) {
                    this.addLog(`${v.getDisplayName()} gained ${gained} Megin!`, 'megin');
                }
            }
        });
        
        // Decrement Freya's Tears counter at the end of the turn
        if (this.playerTeamFreyasTears > 0) {
            this.playerTeamFreyasTears--;
            if (this.playerTeamFreyasTears === 0) {
                this.addLog(`Freya's Tears have dried up for your team.`, 'status');
            }
        }
        if (this.enemyTeamFreyasTears > 0) {
            this.enemyTeamFreyasTears--;
            if (this.enemyTeamFreyasTears === 0) {
                this.addLog(`Freya's Tears have dried up for the opposing team.`, 'status');
            }
        }
        
        // Clear swap sickness and temporary flags
        if (this.playerActive) {
            this.playerActive.combatFlags.hasSwapSickness = false;
            this.playerActive.combatFlags.isFirstRound = false;
        }
        if (this.enemyActive) {
            this.enemyActive.combatFlags.hasSwapSickness = false;
            this.enemyActive.combatFlags.isFirstRound = false;
        }
        
        // turnsOnField is incremented now that this turn has fully completed,
        // so it represents turns fully completed on the battlefield. The
        // Odjur passive check runs immediately after, using the updated
        // count, so the buff is already active by the time the UI re-renders
        // for the next turn's planning phase (before any action is taken).
        if (this.playerActive) {
            this.playerActive.combatFlags.turnsOnField++;
        }
        if (this.enemyActive) {
            this.enemyActive.combatFlags.turnsOnField++;
        }

        this.applyFamilyPassive('onTurnEnd', { vasen: this.playerActive, isPlayer: true });
        this.applyFamilyPassive('onTurnEnd', { vasen: this.enemyActive, isPlayer: false });

        this.reportPlayerKnockouts();

        // Check for combat end
        this.checkCombatEnd();
        
        // Update UI
        if (this.onUpdate) {
            this.onUpdate();
        }
        
        // Handle combat end with delay to allow death animations to complete
        if (this.isOver && this.onEnd) {
            setTimeout(() => {
                this.onEnd(this.getCombatResult());
            }, GAME_CONFIG.COMBAT_END_ANIMATION_DELAY);
        }
    }
    
    // Get combat result
    getCombatResult() {
        const isVictory = this.winner === 'player';
        // A tie is a double knockout: the enemy is declared the winner by checkCombatEnd(),
        // but the enemy team has also been fully knocked out. Display-only flag, no other behavior changes.
        const isTie = this.winner === 'enemy' && !this.enemyTeam.some(v => !v.isKnockedOut());
        return {
            victory: isVictory,
            tie: isTie,
            tamed: isVictory && this.correctItemGiven && this.canTame,
            surrendered: false,
            tamedVasen: this.correctItemGiven && this.canTame ? this.enemyTeam[0] : null,
            // Experience is awarded (and shown) by the victory handlers in 9b/9c
            message: isVictory ? 'Victory!' : (isTie ? 'Both sides fell at the same moment. The battle ends in a tie.' : 'Your party has been defeated!')
        };
    }
    
    // Check if combat is over
    checkCombatEnd() {
        const playerAlive = this.playerTeam.some(v => !v.isKnockedOut());
        const enemyAlive = this.enemyTeam.some(v => !v.isKnockedOut());
        
        if (!playerAlive) {
            this.isOver = true;
            this.winner = 'enemy';
            this.addLog(`${this.playerActive.getDisplayName()} has fainted! You lost and ran away!`, 'defeat');
        } else if (!enemyAlive) {
            this.isOver = true;
            this.winner = 'player';
            this.addLog('Victory!', 'victory');
        }
        
        return this.isOver;
    }
    
    // Player action: use skill
    playerUseSkill(skillName, allyTarget = null) {
        if (this.isOver) return null;

        const skill = ABILITIES[skillName];
        if (!skill) return null;

        const meginCost = this.playerActive.getEffectiveSkillMeginCost(skillName);
        if (this.playerActive.currentMegin < meginCost) {
            this.addLog('Not enough Megin.', 'error');
            return null;
        }

        this.startTurn();

        const enemyAction = this.getEnemyAction();
        const enemySkill = ABILITIES[enemyAction.skill];

        // Pre-calculation step for Rotvalta
        if (skill.retaliationBonus && isSkillDamaging(enemyAction.skill)) {
            this.playerActive.combatFlags.wasAttackedThisTurn = true;
        }
        if (enemySkill && enemySkill.retaliationBonus && isSkillDamaging(skillName)) {
            this.enemyActive.combatFlags.wasAttackedThisTurn = true;
        }

        // Determine turn order based on priority
        const playerPriority = skill.priority || 0;
        const enemyPriority = (enemySkill ? enemySkill.priority : 0) || 0;

        let playerFirst = true;
        // Swap has highest priority: an enemy swap resolves before the player's
        // skill, so the incoming Väsen takes the hit (mirrors playerSwap).
        if (enemyAction.type === 'swap' || enemyPriority > playerPriority) {
            playerFirst = false;
        }

        const results = { player: null, enemy: null };

        if (playerFirst) {
            results.player = this.executeSkill(this.playerActive, this.enemyActive, skillName, true, allyTarget);
            if (!this.enemyActive.isKnockedOut()) {
                results.enemy = this.executeEnemyAction(enemyAction);
            }
        } else {
            results.enemy = this.executeEnemyAction(enemyAction);
            if (!this.playerActive.isKnockedOut()) {
                results.player = this.executeSkill(this.playerActive, this.enemyActive, skillName, true, allyTarget);
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
        this.addLog(`${target.getDisplayName()} enters the fray!`, 'swap');
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
        this.addLog(`${this.playerActive.getDisplayName()} waits.`, 'pass');
        
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
        this.addLog(`<span class="taming-item">${itemName}</span> was offered to ${this.enemyActive.getDisplayName()}.`, 'gift');
        
        const isCorrect = isCorrectTamingItem(itemName, this.enemyActive.speciesName);
        const enemyName = this.enemyActive.getDisplayName(); // Get the name for the dialogue
        
        if (isCorrect) {
            this.correctItemGiven = true;
            // "Name: line" format lets the UI bold the speaker's name
            this.addLog(`${enemyName}: Thanks, I love this item. But you have to prove yourself worthy before I join you. Go ahead and try to defeat me.`, 'dialogue');
        } else {
            this.addLog(`${enemyName}: What am I supposed to do with this?`, 'dialogue');
        }
        
        if (this.onUpdate) this.onUpdate();
        
        return { success: true, correct: isCorrect };
    }
    
    // Player action: Interrogate
    // freeTurn: new-player tutorial - the enemy skips its action this turn.
    interrogate(freeTurn = false) {
        if (this.isOver) return null;

        this.startTurn();

        // 1. Get correct names
        const playerName = typeof gameState !== 'undefined' ? (gameState.playerName || "Väktare") : "Väktare";
        const enemyName = this.enemyActive.getDisplayName();
        const tamingItem = this.enemyActive.species.tamingItem;

        // 2. Enemy acts (player passes), unless this is the tutorial's free turn
        const results = { player: { action: 'interrogate' }, enemy: null };
        if (freeTurn) {
            this.addLog(`${enemyName} is curious and waits to hear what you have to say.`, 'status');
        } else {
            const enemyAction = this.getEnemyAction();
            results.enemy = this.executeEnemyAction(enemyAction);
        }
        
        // 3. Resolve the rest of the turn first (knockouts, megin refill, Freya's
        //    Tears...) so the dialogue is always the last thing logged this turn.
        this.handlePostTurn(results);
        this.endTurn();
        if (this.isOver) return results;

        // 4. Add the dialogue with Colons so the UI can bold the names.
        //    The reply follows shortly after, but before player input is
        //    re-enabled (COMBAT_INPUT_DELAY), so it can't slip into the next turn.
        this.addLog(`${playerName}: Tell me, ${enemyName}, what do you desire most?`, 'dialogue');
        setTimeout(() => {
            if (this.isOver) return;
            this.addLog(`${enemyName}: If you must know, <span class="taming-item">${tamingItem}</span> is what I desire most.`, 'dialogue');
        }, 600);

        return results;
    }
    
    // Player action: surrender (shown to the player as "Flee"). The väsen on
    // the field stays behind to cover the retreat and is knocked out. In a
    // normal game that changes nothing (the party is left at low health after
    // fleeing anyway); Ragnarök Mode rules apply to it like any knockout.
    surrender() {
        this.isOver = true;
        this.winner = 'enemy';
        this.fleeing = true;
        if (this.playerActive && !this.playerActive.isKnockedOut()) {
            this.addLog(`${this.playerActive.getDisplayName()} stays behind to cover the retreat!`, 'surrender');
            this.playerActive.currentHealth = 0;
            this.reportPlayerKnockouts();
        }
        this.addLog('You flee. Your party withdraws.', 'surrender');
        
        if (this.onUpdate) {
            this.onUpdate();
        }
        
        if (this.onEnd) {
            this.onEnd({ surrendered: true, victory: false });
        }
        
        return { surrendered: true };
    }
    

    // --- Shared combat log messages ---

    logRuneActivated(vasen, runeId) {
        this.addLog(`${vasen.getDisplayName()}'s ${RUNES[runeId].symbol} ${RUNES[runeId].name} was activated!`, 'rune');
    }

    logBindRuneActivated(vasen, bindRune) {
        this.addLog(`${vasen.getDisplayName()}'s Bindrune ${bindRune.symbols} ${bindRune.names} was activated!`, 'rune');
    }

    logHealthGained(vasen, amount, type) {
        this.addLog(`${vasen.getDisplayName()} gained <span style="color: var(--color-positive-soft); font-weight: 700;">${amount} health</span>!`, type);
    }

    // Only potent and weak hits are announced; neutral hits stay silent
    logMatchup(matchup) {
        if (matchup === 'POTENT') {
            this.addLog('Potent hit!', 'potent');
        } else if (matchup === 'WEAK') {
            this.addLog('Weak hit!', 'weak');
        }
    }

    // Logs an attribute stage change. The sign of `change` picks "raised" / "lowered"
    // and the buff / debuff log style; `prefix` is prepended (e.g. "Initial bonus! ").
    logStageChange(vasen, stat, change, prefix = '') {
        const raised = change > 0;
        this.addLog(`${prefix}${vasen.getDisplayName()}'s ${stat} was ${raised ? 'raised' : 'lowered'} by ${Math.abs(change)} ${pluralizeStage(change)}!`, raised ? 'buff' : 'debuff');
    }

    // --- Team helpers ---

    // The team on the given side (the player's team or the opposing team)
    getTeam(isPlayer) {
        return isPlayer ? this.playerTeam : this.enemyTeam;
    }

    // Get enemy action using AI
    getEnemyAction() {
        const ai = new EnemyAI(this, this.combatType !== COMBAT_TYPES.WILD);
        return ai.chooseAction();
    }
    
    // Execute enemy action
    executeEnemyAction(action) {
        if (this.enemyActive.isKnockedOut()) return null;
        
        if (action.type === 'swap') {
            const index = this.enemyTeam.indexOf(action.target);
            if (index !== -1) {
                this.addLog(`The Guardian calls forth ${action.target.getDisplayName()}!`, 'swap');
                this.setEnemyActive(index, true);
                return { action: 'swap', target: action.target };
            }
        }
        
        if (action.type === 'skill') {
            // Track utility usage for AI
            const skill = ABILITIES[action.skill];
            if (skill && skill.type === ATTACK_TYPES.UTILITY) {
                this.trackEnemyUtilityUsage(this.enemyActive, action.skill);
            }

            // Use the pre-selected ally target chosen by the AI, if present
            const allyTarget = action.selectedAllyTarget || null;
            return this.executeSkill(this.enemyActive, this.playerActive, action.skill, false, allyTarget);
        }
        
        return null;
    }
    
    // Report each newly knocked-out player väsen once to onPlayerKnockout.
    // Runs after the turn's hits, so a väsen revived by Deathless is not reported.
    reportPlayerKnockouts() {
        if (!this.onPlayerKnockout) return;
        this.playerTeam.forEach(vasen => {
            if (vasen.isKnockedOut() && !this.reportedKnockouts.has(vasen.id)) {
                this.reportedKnockouts.add(vasen.id);
                this.onPlayerKnockout(vasen, this.enemyActive);
            }
        });
    }

    // Handle post-turn effects and knockouts
    handlePostTurn(results) {
        this.reportPlayerKnockouts();

        // Handle player knockout
        if (this.playerActive && this.playerActive.isKnockedOut()) {
            const aliveTeam = this.playerTeam.filter(v => !v.isKnockedOut());
            if (aliveTeam.length === 0) {
                this.checkCombatEnd();
                return;
            }
            
            // Check if enemy team is also wiped out (combat ends)
            const enemyAliveTeam = this.enemyTeam.filter(v => !v.isKnockedOut());
            if (enemyAliveTeam.length === 0) {
                this.checkCombatEnd();
                return;
            }
            
            // Need to swap - call UI to show swap modal
            if (this.onKnockoutSwap) {
                this.onKnockoutSwap((index) => {
                    this.setPlayerActive(index, false); // No swap sickness for forced swap
                    this.addLog(`${this.playerActive.getDisplayName()} enters the fray!`, 'swap');
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
                    this.addLog(`The enemy sends out ${this.enemyActive.getDisplayName()}!`, 'swap');
                }
            }
        }
    }
    
    // Get alive player team members for swap
    getAlivePlayerTeam() {
        return this.playerTeam.filter(v => !v.isKnockedOut() && v !== this.playerActive);
    }
    
    // Check if taming conditions are met
    canBeTamed() {
        return this.canTame && 
               this.correctItemGiven && 
               this.winner === 'player';
    }
    
    // Get how many times an enemy has used a specific utility skill
    getEnemyUtilityUsageCount(vasen, skillName) {
        const key = `${vasen.id}-${skillName}`;
        return this.enemyUtilityUsage.get(key) || 0;
    }
    
    // Track enemy utility skill usage
    trackEnemyUtilityUsage(vasen, skillName) {
        const key = `${vasen.id}-${skillName}`;
        const currentCount = this.enemyUtilityUsage.get(key) || 0;
        this.enemyUtilityUsage.set(key, currentCount + 1);
    }
}
