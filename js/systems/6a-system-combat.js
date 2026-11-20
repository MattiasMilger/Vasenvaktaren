// =============================================================================
// 6a-system-combat.js - Combat Mechanics and Combat Logic
// =============================================================================

// Helper: Check if skill requires ally targeting
function skillRequiresAllyTarget(skillName) {
    const skill = ABILITIES[skillName];
    if (!skill || !skill.effect) return false;
    return skill.effect.target === 'ally';
}

const COMBAT_TYPES = {
    WILD: 'wild',
    GUARDIAN: 'guardian',
    ENDLESS_WILD: 'endless_wild',
    ENDLESS_GUARDIAN: 'endless_guardian',
    ENDLESS_TOWER: 'endless_tower'
};

// Element buff runes: skill element -> rune and the attributes it raises when it procs
const ELEMENT_BUFF_RUNES = {
    [ELEMENTS.EARTH]: { rune: 'EIHWAZ', attributes: ['defense', 'durability'] },
    [ELEMENTS.FIRE]:  { rune: 'SOL',    attributes: ['strength', 'wisdom'] },
    [ELEMENTS.WIND]:  { rune: 'EHWAZ',  attributes: ['defense', 'durability'] },
    [ELEMENTS.WATER]: { rune: 'ISAZ',   attributes: ['wisdom', 'strength'] }
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
        
        // Experience tracking
        this.expTracker = new Map(); // vasen id -> { participated: boolean, turnsOnField: number, dealtKillingBlow: boolean }
        
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
        
        if (isSwap) {
            vasen.combatFlags.hasSwapSickness = true;
            vasen.combatFlags.isFirstRound = true;
            vasen.combatFlags.turnsOnField = 0;
        }
        
        // Initialize exp tracking
        if (!this.expTracker.has(vasen.id)) {
            this.expTracker.set(vasen.id, { participated: true, turnsOnField: 0, dealtKillingBlow: false });
        } else {
            this.expTracker.get(vasen.id).participated = true;
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
        
        // Track participation
        if (this.playerActive && !this.playerActive.isKnockedOut()) {
            const tracker = this.expTracker.get(this.playerActive.id);
            if (tracker) tracker.turnsOnField++;
        }
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
            expGained: isVictory ? this.calculateExperience() : [],
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
        if (this.playerActive.combatFlags.hasSwapSickness) {
            this.addLog(`${this.playerActive.getDisplayName()} is preparing and cannot act this turn.`, 'status');
            return this.enemyTurn();
        }

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
        if (enemyPriority > playerPriority) {
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
    
    // Execute a skill
    executeSkill(attacker, defender, skillName, isPlayer, selectedAllyTarget = null) {
        const skill = ABILITIES[skillName];
        if (!skill) return null;

        const meginCost = attacker.getSkillMeginCost(skillName);
        attacker.spendMegin(meginCost);
        
        // Log skill use
        this.addLog(`${attacker.getDisplayName()} uses ${skill.name}!`, 'action');
        
        // Trigger attack animation based on skill type
        if (this.onAttack) {
            this.onAttack(isPlayer ? 'player' : 'enemy', skill.type);
        }

        if (meginCost > 0) {
            this.addLog(`${attacker.getDisplayName()} used ${meginCost} Megin!`, 'megin');
        }
        
        const result = {
            skill: skillName,
            attacker: attacker,
            defender: defender,
            damage: 0,
            effects: [],
            runeEffects: []
        };
        
        // Handle utility skills
        if (skill.type === ATTACK_TYPES.UTILITY) {
            result.effects = this.applyUtilityEffect(attacker, defender, skill, isPlayer, selectedAllyTarget);
            
            // Mannaz: heal on utility
            if (attacker.hasRune('MANNAZ')) {
                const healAmount = attacker.healPercent(GAME_CONFIG.RUNE_MANNAZ_HEAL_PERCENT);
                if (healAmount > 0) {
                    result.runeEffects.push({ rune: 'MANNAZ', effect: `healed ${healAmount}` });
                    this.logRuneActivated(attacker, 'MANNAZ');
                    this.logHealthGained(attacker, healAmount);
                }

                // Bind Rune - GIFU + MANNAZ: the first time this väsen's Mannaz heal
                // triggers this combat, also heal all allies by the same Mannaz heal
                // percent. Uses its own dedicated flag (not gifuTriggered) so it fires
                // independently of any other Gifu-shared buff that may have already
                // triggered this combat, and so it also applies to utility skills that
                // never touch gifuTriggered at all (e.g. Freya's Tears).
                if (!attacker.combatFlags.mannazTeamHealTriggered && hasMannazTeamHealBindRune(attacker)) {
                    attacker.combatFlags.mannazTeamHealTriggered = true;
                    const gifuMannazBR = getActiveBindRunes(attacker).find(b => b.type === 'mannaz_team_heal');
                    this.logBindRuneActivated(attacker, gifuMannazBR);

                    const allies = isPlayer ? this.playerTeam : this.enemyTeam;
                    allies.forEach(ally => {
                        if (ally !== attacker && !ally.isKnockedOut()) {
                            const allyHealAmount = ally.healPercent(GAME_CONFIG.RUNE_MANNAZ_HEAL_PERCENT);
                            if (allyHealAmount > 0) {
                                this.logHealthGained(ally, allyHealAmount);
                            }
                        }
                    });
                }
            }
            
            // These skill-use rune procs apply to utility skills too
            this.tryJeraHeal(attacker, skillName, result);
            this.tryJeraOdalBuff(attacker, skillName);
            this.tryAlgizHeal(attacker, skill.element, result);
            this.tryElementBuffRune(attacker, skill.element, result);

            // Trigger debuff flash animation if this is a debuff skill
            if (skill.effect && skill.effect.type === 'debuff' && this.onHit) {
                setTimeout(() => {
                    this.onHit(isPlayer ? 'enemy' : 'player', 'DEBUFF');
                }, 200);
            }
            
            return result;
        }
        
        // Calculate and apply damage
        const damageResult = this.calculateDamage(attacker, defender, skillName);
        result.damage = damageResult.damage;
        result.matchup = damageResult.matchup;
        result.attackType = damageResult.attackType;
        
        // Apply damage
        const actualDamage = defender.takeDamage(result.damage);

        this.addLog(`${attacker.getDisplayName()} deals ${actualDamage} damage to ${defender.getDisplayName()}!`, 'damage');

        // Bind Rune - Elemental Conversion: log when element was converted
        if (damageResult.bindRuneEleConverted) {
            const br = getElementConversionBindRune(attacker);
            if (br) {
                this.logBindRuneActivated(attacker, br);
            }
        }

        // Bind Rune - Use Best Stat (Ansuz + Raido): log when activated
        if (damageResult.bindRuneUseBestStat) {
            const br = getActiveBindRunes(attacker).find(b => b.type === 'use_best_stat');
            if (br) {
                this.logBindRuneActivated(attacker, br);
            }
        }

        this.logMatchup(damageResult.matchup);

        // Trigger family passives after taking damage
        // Drake: Check health threshold
        this.applyFamilyPassive('onHealthThreshold', { vasen: defender, isPlayer: !isPlayer });

        // Rå: Malicious Retaliation when hit (once per combat)
        if (!defender.combatFlags.raPassiveTriggered) {
            this.applyFamilyPassive('onTakeDamage', { vasen: defender, attacker: attacker, isPlayer: !isPlayer });
        }

        // Bind Rune - Hagal + Naudiz: when the enemy's (defender's) health falls to the
        // configured threshold or less, lower all of their attribute stages by the
        // configured amount. Triggered from the attacker's side (the rune belongs to
        // the attacker), tracked once per combat via a flag on the attacker.
        if (hasEnemyHealthThresholdDebuffAllBindRune(attacker) && !attacker.combatFlags.hagalNaudizPassiveTriggered) {
            const defenderHealthPercent = defender.currentHealth / defender.maxHealth;
            if (defenderHealthPercent <= GAME_CONFIG.RUNE_BIND_HAGAL_NAUDIZ_HEALTH_THRESHOLD) {
                attacker.combatFlags.hagalNaudizPassiveTriggered = true;
                const hagalNaudizBR = getActiveBindRunes(attacker).find(b => b.type === 'enemy_health_threshold_debuff_all');
                this.logBindRuneActivated(attacker, hagalNaudizBR);

                STAGEABLE_ATTRIBUTES.forEach(stat => {
                    const result = defender.modifyAttributeStage(stat, -GAME_CONFIG.RUNE_BIND_HAGAL_NAUDIZ_DEBUFF_STAGES);
                    if (result.changed !== 0) {
                        const stageWord = pluralizeStage(result.changed);
                        this.addLog(`${defender.getDisplayName()}'s ${stat} was lowered by ${Math.abs(result.changed)} ${stageWord}!`, 'debuff');
                    }
                });
            }
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
        
        // Handle rune effects for hits
        this.applyHitRuneEffects(attacker, defender, damageResult, result, isPlayer);
        
        // Check knockout
        if (willKnockout) {
            // Hagal rune: Debuff enemy on knockout (triggers BEFORE revive check)
            if (defender.hasRune('HAGAL')) {
                this.logRuneActivated(defender, 'HAGAL');
                STAGEABLE_ATTRIBUTES.forEach(stat => {
                    const result = attacker.modifyAttributeStage(stat, -GAME_CONFIG.RUNE_HAGAL_DEBUFF_STAGES);
                    if (result.changed !== 0) {
                        const stageWord = pluralizeStage(result.changed);
                        this.addLog(`${attacker.getDisplayName()}'s ${stat} was lowered by ${Math.abs(result.changed)} ${stageWord}!`, 'debuff');
                    }
                });
            }
            
            // Vålnad family passive: Deathless - attempt to revive
            const revived = this.applyFamilyPassive('onKnockout', { vasen: defender, isPlayer: !isPlayer });

            if (!revived) {
                // If not revived, log the knockout
                if (isPlayer) {
                    this.addLog(`${defender.getDisplayName()} collapses!`, 'knockout');
                    // Mark killing blow
                    const tracker = this.expTracker.get(attacker.id);
                    if (tracker) tracker.dealtKillingBlow = true;
                } else {
                    this.addLog(`${defender.getDisplayName()} has fainted!`, 'knockout');
                }
            }
        }
        
        // Thurs: damage reflect as Mixed hit (only if not knocked out)
        if (!attacker.isKnockedOut() && defender.hasRune('THURS') && result.damage > 0) {
            this.logRuneActivated(defender, 'THURS');
            
            // Calculate reflected damage as Mixed-type attack
            // The defender (Thurs user) becomes the "attacker" for the reflection
            // The original attacker becomes the "target" for the reflection
            const reflectResult = this.calculateThursReflection(defender, attacker, result.damage);
            
            if (reflectResult.damage > 0) {
                attacker.takeDamage(reflectResult.damage);
                this.addLog(`${attacker.getDisplayName()} took ${reflectResult.damage} damage!`, 'damage');
                result.runeEffects.push({ rune: 'THURS', effect: `reflected ${reflectResult.damage}` });

                this.logMatchup(reflectResult.matchup);

                // Apply Naudiz effect if Thurs user has it and reflection was WEAK
                if (reflectResult.matchup === 'WEAK' && defender.hasRune('NAUDIZ')) {
                    this.logRuneActivated(defender, 'NAUDIZ');
                    for (let i = 0; i < GAME_CONFIG.RUNE_NAUDIZ_DEBUFF_COUNT; i++) {
                        const stat = randomAttribute();
                        // Wynja on the original attacker blocks the entire Naudiz sequence
                        if (this.tryWynjaBlock(attacker)) break;
                        attacker.modifyAttributeStage(stat, -GAME_CONFIG.RUNE_NAUDIZ_DEBUFF_STAGES);
                        const stageWord = pluralizeStage(GAME_CONFIG.RUNE_NAUDIZ_DEBUFF_STAGES);
                        this.addLog(`${attacker.getDisplayName()}'s ${stat} was lowered by ${GAME_CONFIG.RUNE_NAUDIZ_DEBUFF_STAGES} ${stageWord}!`, 'debuff');
                    }
                    result.runeEffects.push({ rune: 'NAUDIZ', effect: 'debuffed on weak reflection' });
                }

                // Apply Inguz effect if Thurs user has it on any reflection hit
                if (defender.hasRune('INGUZ')) {
                    if (Math.random() < GAME_CONFIG.RUNE_INGUZ_DEBUFF_PROC_CHANCE) {
                        if (!this.tryWynjaBlock(attacker)) {
                            this.logRuneActivated(defender, 'INGUZ');
                            const randomStat = randomAttribute();
                            attacker.modifyAttributeStage(randomStat, -GAME_CONFIG.RUNE_INGUZ_DEBUFF_STAGES);
                            const stageWord = pluralizeStage(GAME_CONFIG.RUNE_INGUZ_DEBUFF_STAGES);
                            this.addLog(`${attacker.getDisplayName()}'s ${randomStat} was lowered by ${GAME_CONFIG.RUNE_INGUZ_DEBUFF_STAGES} ${stageWord}!`, 'debuff');
                            result.runeEffects.push({ rune: 'INGUZ', effect: 'debuffed on reflection' });
                        }
                    }
                }
            }
        }
        
        // Troll family passive: Steal attribute stage when using skill (once per combat)
        if (skill.type !== ATTACK_TYPES.UTILITY && !defender.isKnockedOut()) {
            if (!attacker.combatFlags.trollPassiveTriggered) {
                this.applyFamilyPassive('onUseSkill', { vasen: attacker, defender: defender, isPlayer });
            }
        }
        
        return result;
    }
    
    // Calculate damage
    calculateDamage(attacker, defender, skillName) {
        const skill = ABILITIES[skillName];
        let skillElement = getSkillElement(skillName, attacker.species.element);

        // Bind Rune - Elemental Conversion: if the attacker has an active elemental
        // conversion bind rune and this skill's element matches the source element,
        // override skillElement to the converted element for matchup and damage.
        const eleConversionBR = getElementConversionBindRune(attacker);
        let bindRuneEleConverted = false;
        if (eleConversionBR && skillElement === eleConversionBR.sourceElement) {
            skillElement = eleConversionBR.convertedElement;
            bindRuneEleConverted = true;
        }
        
        // Determine attack type (considering Ansuz and Raido)
        let attackType = skill.type;
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

        // Bind Rune - Use Best Stat (Ansuz + Raido): all attacks use whichever of
        // the attacker's Strength or Wisdom (with stage modifiers) is currently higher.
        const bindRuneUseBestStat = hasUseBestStatBindRune(attacker);
        
        const matchup = this.applyJotunsFury(attacker, getMatchupType(skillElement, defender.species.element));
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
        
        if (elementBonusRunes[skillElement] && attacker.hasRune(elementBonusRunes[skillElement])) {
            runeMod += GAME_CONFIG.RUNE_ELEMENT_DAMAGE_BOOST;
        }
        
        // Odal: low cost bonus
        if (attacker.hasRune('ODAL') && attacker.getSkillMeginCost(skillName) <= GAME_CONFIG.RUNE_ODAL_COST_THRESHOLD) {
            runeMod += GAME_CONFIG.RUNE_ODAL_DAMAGE_BOOST;
        }
        
        // Dagaz: first round bonus
        if (attacker.hasRune('DAGAZ') && attacker.combatFlags.isFirstRound) {
            runeMod += GAME_CONFIG.RUNE_DAGAZ_DAMAGE_BOOST;
        }
        
        // Fehu: reduce potent damage taken
        if (matchup === 'POTENT' && defender.hasRune('FEHU')) {
            runeMod *= GAME_CONFIG.RUNE_FEHU_DAMAGE_REDUCTION;
        }
        
        // Calculate damage based on attack type
        let totalDamage = 0;
        
        let power = skill.power;
        
        // Loki's Betrayal: bonus power if the defender has any negative attribute stage
        if (skill.lokiBetrayalBonus) {
            const defenderStages = defender.attributeStages;
            const hasNegativeStage = Object.values(defenderStages).some(stage => stage < 0);
            if (hasNegativeStage) {
                power += skill.enemy_debuff_bonus;
            }
        }
        
        // Rotvälta: bonus power if the attacker was attacked this turn
        if (skill.retaliationBonus && attacker.combatFlags.wasAttackedThisTurn) {
            power += skill.retaliationBonus;
        }
        
        // Giantsbane: gains power based on the target's current HP
        if (skill.giantsbaneBonus) {
            power += Math.floor(defender.currentHealth * skill.target_hp_bonus_percent);
        }
        
        if (skill.type === ATTACK_TYPES.MIXED) {
            if (bindRuneUseBestStat) {
                // Use the higher of strength/wisdom for both halves
                const bestStat = attacker.getAttribute('strength') >= attacker.getAttribute('wisdom')
                    ? attacker.getAttribute('strength')
                    : attacker.getAttribute('wisdom');
                const bestDef = attacker.getAttribute('strength') >= attacker.getAttribute('wisdom')
                    ? defender.getAttribute('defense')
                    : defender.getAttribute('durability');
                totalDamage = this.calculateSingleTypeDamage(
                    power, bestStat, bestDef, damageRange, elementMod, runeMod
                );
            } else {
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
            }
        } else if (useStrength) {
            if (bindRuneUseBestStat && attacker.getAttribute('wisdom') > attacker.getAttribute('strength')) {
                // Wisdom is higher - use wisdom stat, check vs durability
                totalDamage = this.calculateSingleTypeDamage(
                    power, attacker.getAttribute('wisdom'), defender.getAttribute('durability'),
                    damageRange, elementMod, runeMod
                );
            } else {
                totalDamage = this.calculateSingleTypeDamage(
                    power, attacker.getAttribute('strength'), defender.getAttribute('defense'),
                    damageRange, elementMod, runeMod
                );
            }
        } else if (useWisdom) {
            if (bindRuneUseBestStat && attacker.getAttribute('strength') > attacker.getAttribute('wisdom')) {
                // Strength is higher - use strength stat, check vs defense
                totalDamage = this.calculateSingleTypeDamage(
                    power, attacker.getAttribute('strength'), defender.getAttribute('defense'),
                    damageRange, elementMod, runeMod
                );
            } else {
                totalDamage = this.calculateSingleTypeDamage(
                    power, attacker.getAttribute('wisdom'), defender.getAttribute('durability'),
                    damageRange, elementMod, runeMod
                );
            }
        }
        
        return {
            damage: Math.floor(Math.max(1, totalDamage)),
            matchup: matchup,
            attackType: skill.type,
            element: skillElement,
            bindRuneEleConverted: bindRuneEleConverted,
            bindRuneUseBestStat: bindRuneUseBestStat && (useStrength || useWisdom || skill.type === ATTACK_TYPES.MIXED)
        };
    }
    
    // Calculate Thurs reflection damage as Mixed attack
    calculateThursReflection(defender, attacker, originalDamage) {
        // Use the defender's element for the reflection
        const reflectElement = defender.species.element;
        
        // Element matchup for the reflection (Jotun's Fury can also upgrade it)
        const matchup = this.applyJotunsFury(defender, getMatchupType(reflectElement, attacker.species.element));
        const elementMod = DAMAGE_MULTIPLIERS[matchup];

        // Base reflected damage is a fixed fraction of the original hit
        const baseReflectDamage = originalDamage * GAME_CONFIG.RUNE_THURS_RETURN_DAMAGE;
        
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

    // Jätte passive (Jotun's Fury): once per combat, at low health, upgrade the
    // attacker's hit by one step (weak -> neutral -> potent). Returns the final matchup.
    applyJotunsFury(attacker, matchup) {
        if (
            attacker.species.family !== FAMILIES.JATTE ||
            attacker.combatFlags.jattePassiveTriggered ||
            attacker.currentHealth / attacker.maxHealth > FAMILY_PASSIVE_CONFIG.JATTE_HEALTH_THRESHOLD
        ) {
            return matchup;
        }
        attacker.combatFlags.jattePassiveTriggered = true;
        this.addLog(`${attacker.getDisplayName()} activated Jotun\'s Fury!`, 'passive');
        if (matchup === 'WEAK') return 'NEUTRAL';
        if (matchup === 'NEUTRAL') return 'POTENT';
        return matchup;
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

    // --- Shared rune effects ---

    // Wynja: blocks the first debuff aimed at this väsen each combat and raises a
    // random attribute instead. Returns true if the debuff was blocked.
    tryWynjaBlock(target) {
        if (target.combatFlags.wynjaTriggered || !target.hasRune('WYNJA')) return false;
        target.combatFlags.wynjaTriggered = true;
        this.logRuneActivated(target, 'WYNJA');
        this.addLog(`${target.getDisplayName()} blocked the debuff!`, 'block');
        const counterStat = randomAttribute();
        const stages = GAME_CONFIG.RUNE_WYNJA_COUNTER_STAGE;
        target.modifyAttributeStage(counterStat, stages);
        this.addLog(`${target.getDisplayName()}'s ${counterStat} was raised by ${stages} ${pluralizeStage(stages)}!`, 'buff');
        return true;
    }

    // Returns the first-use initial bonus stages for this skill on this side
    // (0 if the skill has none or its bonus was already used this combat)
    consumeInitialBonus(skill, isPlayer) {
        if (!skill.initialBonus) return 0;
        const initialBonusSet = isPlayer ? this.playerInitialBonusUsed : this.enemyInitialBonusUsed;
        if (initialBonusSet.has(skill.name)) return 0;
        initialBonusSet.add(skill.name);
        return skill.initialBonus;
    }

    // Jera: chance to heal when using a low-cost skill
    tryJeraHeal(attacker, skillName, result) {
        if (!attacker.hasRune('JERA') || attacker.getSkillMeginCost(skillName) > GAME_CONFIG.RUNE_ODAL_COST_THRESHOLD) return;
        if (Math.random() >= GAME_CONFIG.RUNE_LOW_COST_HEAL_PROC_CHANCE) return;
        const healAmount = attacker.healPercent(GAME_CONFIG.RUNE_JERA_HEAL_PERCENT);
        if (healAmount > 0) {
            this.logRuneActivated(attacker, 'JERA');
            this.logHealthGained(attacker, healAmount);
            result.runeEffects.push({ rune: 'JERA', effect: `healed ${healAmount}` });
        }
    }

    // Bind Rune - Jera + Odal: chance to raise a random attribute when using a low-cost skill
    tryJeraOdalBuff(attacker, skillName) {
        if (!hasLowCostRandomBuffBindRune(attacker) || attacker.getSkillMeginCost(skillName) > GAME_CONFIG.RUNE_ODAL_COST_THRESHOLD) return;
        if (Math.random() >= GAME_CONFIG.RUNE_BIND_JERA_ODAL_PROC_CHANCE) return;
        const jeraOdalBR = getActiveBindRunes(attacker).find(b => b.type === 'low_cost_random_buff');
        const randomStat = randomAttribute();
        const buffResult = attacker.modifyAttributeStage(randomStat, GAME_CONFIG.RUNE_BIND_JERA_ODAL_BUFF_STAGES);
        this.logBindRuneActivated(attacker, jeraOdalBR);
        if (buffResult.capped) {
            this.addLog(`${attacker.getDisplayName()}'s ${randomStat} cannot be raised any higher.`, 'status');
        } else if (buffResult.changed !== 0) {
            this.addLog(`${attacker.getDisplayName()}'s ${randomStat} was raised by ${Math.abs(buffResult.changed)} ${pluralizeStage(buffResult.changed)}!`, 'buff');
        }
    }

    // Algiz: chance to heal when using a Nature skill
    tryAlgizHeal(attacker, element, result) {
        if (element !== ELEMENTS.NATURE || !attacker.hasRune('ALGIZ')) return;
        if (Math.random() >= GAME_CONFIG.RUNE_NATURE_HEAL_PROC_CHANCE) return;
        const healAmount = attacker.healPercent(GAME_CONFIG.RUNE_ALGIZ_HEAL_PERCENT);
        if (healAmount > 0) {
            this.logRuneActivated(attacker, 'ALGIZ');
            this.logHealthGained(attacker, healAmount);
            result.runeEffects.push({ rune: 'ALGIZ', effect: `healed ${healAmount}` });
        }
    }

    // Eihwaz, Sol, Ehwaz, Isaz: chance to raise two attributes when using a skill of the rune's element
    tryElementBuffRune(attacker, element, result) {
        const buffData = ELEMENT_BUFF_RUNES[element];
        if (!buffData || !attacker.hasRune(buffData.rune)) return;
        if (Math.random() >= GAME_CONFIG.RUNE_ELEMENT_BUFF_PROC_CHANCE) return;
        const stages = GAME_CONFIG.RUNE_ELEMENT_BUFF_STAGES;
        this.logRuneActivated(attacker, buffData.rune);
        buffData.attributes.forEach(stat => {
            attacker.modifyAttributeStage(stat, stages);
            this.addLog(`${attacker.getDisplayName()}'s ${stat} was raised by ${stages} ${pluralizeStage(stages)}!`, 'buff');
        });
        result.runeEffects.push({ rune: buffData.rune, effect: 'buffed' });
    }

    // Apply utility effect
    applyUtilityEffect(user, target, skill, isPlayer, selectedAllyTarget = null) {
        const effects = [];
        const effect = skill.effect;
        
        if (!effect) return effects;
        
        if (effect.type === 'tyrs_sacrifice') {
            // Tyr's Sacrifice: sacrifice a share of max HP to raise all attributes (lethal if HP runs out)
            const healthCost = Math.floor(user.maxHealth * skill.healthCost);
            user.currentHealth = Math.max(0, user.currentHealth - healthCost);
            this.addLog(`${user.getDisplayName()} sacrifices ${healthCost} HP</span>!`, 'damage');

            // Raise all 4 attributes by TYRS_SACRIFICE_STAGES stages
            const sacrificeAttributes = STAGEABLE_ATTRIBUTES;
            sacrificeAttributes.forEach(stat => {
                const result = user.modifyAttributeStage(stat, GAME_CONFIG.TYRS_SACRIFICE_STAGES);
                if (result.changed !== 0) {
                    const stageWord = pluralizeStage(result.changed);
                    this.addLog(`${user.getDisplayName()}'s ${stat} was raised by ${Math.abs(result.changed)} ${stageWord}!`, 'buff');
                    effects.push({ stat, change: result.changed });
                }
            });

            // Gifu: share the full buff (all 4 attributes) with allies
            if (!user.combatFlags.gifuTriggered && user.hasRune('GIFU')) {
                user.combatFlags.gifuTriggered = true;
                this.logRuneActivated(user, 'GIFU');

                const allies = isPlayer ? this.playerTeam : this.enemyTeam;
                const stageWord = pluralizeStage(GAME_CONFIG.TYRS_SACRIFICE_STAGES);
                allies.forEach(ally => {
                    if (ally !== user && !ally.isKnockedOut()) {
                        sacrificeAttributes.forEach(stat => {
                            ally.modifyAttributeStage(stat, GAME_CONFIG.TYRS_SACRIFICE_STAGES);
                            this.addLog(`${ally.getDisplayName()}'s ${stat} was raised by ${GAME_CONFIG.TYRS_SACRIFICE_STAGES} ${stageWord}!`, 'buff');
                        });
                    }
                });
            }

            return effects;
        }

        if (effect.type === 'freyastears') {
            // Freya's Tears: affects the entire team for a few turns.
            const teamFlag = isPlayer ? 'playerTeamFreyasTears' : 'enemyTeamFreyasTears';
            const teamName = isPlayer ? 'your team' : 'the enemy team';

            if (this[teamFlag] > 0) {
                this.addLog(`Freya's Tears are already active for ${teamName}.`, 'status');
                return effects; // Already active, non-stackable
            }

            this[teamFlag] = GAME_CONFIG.FREYASTEARS_TURNS;
            this.addLog(`Freya's Tears rain down, replenishing ${teamName}.`, 'buff');
            effects.push({ type: 'freyastears', team: isPlayer ? 'player' : 'enemy', turns: GAME_CONFIG.FREYASTEARS_TURNS });
            return effects;
        }

        if (effect.type === 'buff') {
            // Determine the target of the buff
            let targetVasen = user;
            
            if (effect.target === 'ally' && selectedAllyTarget) {
                targetVasen = selectedAllyTarget;
            } else if (effect.target === 'self') {
                targetVasen = user;
            }

            // First use of this buff skill this combat for this side (ally- or self-targeted)
            // grants bonus stages. The bonus is applied to the direct target; Gifu then shares
            // the full total to all other allies in one pass after the loop.
            const initialBonusStages = this.consumeInitialBonus(skill, isPlayer);

            const totalStagesToShare = effect.stages + initialBonusStages;
            const attributes = effect.attributes || [effect.stat];

            // Apply all attribute buffs to the direct target first.
            // Gifu sharing is done in a single pass after this loop so that ALL
            // buffed attributes (not just the first one) are shared to allies.
            attributes.forEach(stat => {
                // Apply bonus stages to the direct target first (if any)
                if (initialBonusStages > 0) {
                    const bonusResult = targetVasen.modifyAttributeStage(stat, initialBonusStages);
                    if (bonusResult.changed !== 0) {
                        const stageWord = pluralizeStage(bonusResult.changed);
                        this.addLog(`Initial bonus! ${targetVasen.getDisplayName()}'s ${stat} was raised by ${Math.abs(bonusResult.changed)} ${stageWord}!`, 'buff');
                        effects.push({ stat, change: bonusResult.changed });
                    }
                }

                // Apply the regular stages to the direct target
                const result = targetVasen.modifyAttributeStage(stat, effect.stages);
                if (result.capped) {
                    this.addLog(`${targetVasen.getDisplayName()}'s ${stat} cannot be raised any higher.`, 'status');
                } else if (result.changed !== 0) {
                    const stageWord = pluralizeStage(result.changed);
                    this.addLog(`${targetVasen.getDisplayName()}'s ${stat} was raised by ${Math.abs(result.changed)} ${stageWord}!`, 'buff');
                    effects.push({ stat, change: result.changed });
                }
            });

            const allies = isPlayer ? this.playerTeam : this.enemyTeam;

            // --- ALV: ELVEN CRAFTSMANSHIP ---
            // If the user is Alv family and the skill buffs only Strength or only Wisdom,
            // also apply the same total stages to the mirror stat on the direct target.
            // The mirror stat will also be shared by Gifu in the pass below.
            let elvMirrorStat = null;
            if (user.species.family === FAMILIES.ALV) {
                const mirrorMap = { strength: 'wisdom', wisdom: 'strength' };
                if (attributes.length === 1 && mirrorMap[attributes[0]]) {
                    elvMirrorStat = mirrorMap[attributes[0]];
                    const mirrorResult = targetVasen.modifyAttributeStage(elvMirrorStat, totalStagesToShare);
                    if (mirrorResult.changed !== 0) {
                        const stageWord = pluralizeStage(mirrorResult.changed);
                        this.addLog(`${user.getDisplayName()} activated Elven Craftsmanship!`, 'passive');
                        this.addLog(`${targetVasen.getDisplayName()}'s ${elvMirrorStat} was raised by ${Math.abs(mirrorResult.changed)} ${stageWord}!`, 'buff');
                        effects.push({ stat: elvMirrorStat, change: mirrorResult.changed });
                    }
                }
            }

            // Build the full list of stats to share via Gifu (all buffed attributes +
            // the Elven Craftsmanship mirror stat if applicable).
            const statsToShare = elvMirrorStat ? [...attributes, elvMirrorStat] : [...attributes];

            // Gifu on the caster (user): share ALL buffed stats to allies in one activation.
            if (!user.combatFlags.gifuTriggered && user.hasRune('GIFU')) {
                user.combatFlags.gifuTriggered = true;
                this.logRuneActivated(user, 'GIFU');

                const stageWord = pluralizeStage(totalStagesToShare);
                allies.forEach(ally => {
                    if (ally !== user && ally !== targetVasen && !ally.isKnockedOut()) {
                        statsToShare.forEach(stat => {
                            ally.modifyAttributeStage(stat, totalStagesToShare);
                            this.addLog(`${ally.getDisplayName()}'s ${stat} was raised by ${totalStagesToShare} ${stageWord}!`, 'buff');
                        });
                    }
                });
            }

            // Gifu on the recipient (targetVasen): share ALL buffed stats to allies in one activation.
            // This handles the case where a benched ally is buffed and they carry Gifu.
            if (targetVasen !== user && !targetVasen.combatFlags.gifuTriggered && targetVasen.hasRune('GIFU')) {
                targetVasen.combatFlags.gifuTriggered = true;
                this.logRuneActivated(targetVasen, 'GIFU');

                const stageWord = pluralizeStage(totalStagesToShare);
                allies.forEach(ally => {
                    if (ally !== targetVasen && !ally.isKnockedOut()) {
                        statsToShare.forEach(stat => {
                            ally.modifyAttributeStage(stat, totalStagesToShare);
                            this.addLog(`${ally.getDisplayName()}'s ${stat} was raised by ${totalStagesToShare} ${stageWord}!`, 'buff');
                        });
                    }
                });
            }

        } else if (effect.type === 'debuff') {
            const targetVasen = isPlayer ? target : this.playerActive;
            const attributes = effect.attributes || [effect.stat];
            
            // Wynja: block first debuff entirely (including the first-use bonus)
            if (this.tryWynjaBlock(targetVasen)) return effects;

            // First use of this debuff skill this combat for this side grants extra lowering
            const initialBonusStages = this.consumeInitialBonus(skill, isPlayer);

            attributes.forEach(stat => {
                // Apply bonus stages on first use (extra lowering)
                if (initialBonusStages > 0) {
                    const bonusResult = targetVasen.modifyAttributeStage(stat, -initialBonusStages);
                    if (bonusResult.changed !== 0) {
                        const stageWord = pluralizeStage(bonusResult.changed);
                        this.addLog(`Initial bonus! ${targetVasen.getDisplayName()}'s ${stat} was lowered by ${Math.abs(bonusResult.changed)} ${stageWord}!`, 'debuff');
                        effects.push({ stat, change: bonusResult.changed });
                    }
                }

                // Apply the regular stages
                const result = targetVasen.modifyAttributeStage(stat, -effect.stages);
                if (result.capped) {
                    this.addLog(`${targetVasen.getDisplayName()}'s ${stat} cannot be lowered any further.`, 'status');
                } else if (result.changed !== 0) {
                    const stageWord = pluralizeStage(result.changed);
                    this.addLog(`${targetVasen.getDisplayName()}'s ${stat} was lowered by ${Math.abs(result.changed)} ${stageWord}!`, 'debuff');
                    effects.push({ stat, change: result.changed });
                }
            });
        }
        
        return effects;
    }
    
    // Apply hit-based rune effects
    applyHitRuneEffects(attacker, defender, damageResult, result, isPlayer) {
        // Skill-use rune procs, keyed on the (possibly converted) hit element
        const skillElement = damageResult.element;
        this.tryElementBuffRune(attacker, skillElement, result);
        this.tryAlgizHeal(attacker, skillElement, result);
        this.tryJeraHeal(attacker, result.skill, result);
        this.tryJeraOdalBuff(attacker, result.skill);

        // Weak hit effects
        if (damageResult.matchup === 'WEAK') {
            // Naudiz: debuff on weak hit
            if (attacker.hasRune('NAUDIZ')) {
                this.logRuneActivated(attacker, 'NAUDIZ');
                // Wynja on the defender blocks the first debuff
                if (!this.tryWynjaBlock(defender)) {
                    for (let i = 0; i < GAME_CONFIG.RUNE_NAUDIZ_DEBUFF_COUNT; i++) {
                        const stat = randomAttribute();
                        defender.modifyAttributeStage(stat, -GAME_CONFIG.RUNE_NAUDIZ_DEBUFF_STAGES);
                        const stageWord = pluralizeStage(GAME_CONFIG.RUNE_NAUDIZ_DEBUFF_STAGES);
                        this.addLog(`${defender.getDisplayName()}'s ${stat} was lowered by ${GAME_CONFIG.RUNE_NAUDIZ_DEBUFF_STAGES} ${stageWord}!`, 'debuff');
                    }
                }
                result.runeEffects.push({ rune: 'NAUDIZ', effect: 'debuffed' });
            }
        }

        // Inguz: chance to lower a random enemy attribute on any hit
        if (attacker.hasRune('INGUZ')) {
            if (Math.random() < GAME_CONFIG.RUNE_INGUZ_DEBUFF_PROC_CHANCE) {
                this.logRuneActivated(attacker, 'INGUZ');
                // Wynja on the defender blocks the first debuff
                if (!this.tryWynjaBlock(defender)) {
                    const randomStat = randomAttribute();
                    defender.modifyAttributeStage(randomStat, -GAME_CONFIG.RUNE_INGUZ_DEBUFF_STAGES);
                    const stageWord = pluralizeStage(GAME_CONFIG.RUNE_INGUZ_DEBUFF_STAGES);
                    this.addLog(`${defender.getDisplayName()}'s ${randomStat} was lowered by ${GAME_CONFIG.RUNE_INGUZ_DEBUFF_STAGES} ${stageWord}!`, 'debuff');
                    result.runeEffects.push({ rune: 'INGUZ', effect: 'debuffed' });
                }
            }
        }
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
    
    // Handle post-turn effects and knockouts
    handlePostTurn(results) {
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
    
    // Calculate and award experience
    calculateExperience() {
        if (this.winner !== 'player') return [];
        
        const totalEnemyExp = this.enemyTeam.reduce((sum, enemy) => {
            return sum + getExpYield(enemy.level, enemy.species.rarity);
        }, 0);
        
        const results = [];
        
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
    
    // Apply family passive skills
    applyFamilyPassive(trigger, context) {
        const { vasen, isPlayer } = context;
        
        // --- ANDE: ETHEREAL SURGE ---
        if (trigger === 'onEnterBattlefield' && vasen.species.family === FAMILIES.ANDE) {
            if (!vasen.combatFlags.andePassiveTriggered) {
                vasen.combatFlags.andePassiveTriggered = true;
                
                const stages = FAMILY_PASSIVE_CONFIG.ANDE_ATTRIBUTE_STAGES;
                const rollCount = FAMILY_PASSIVE_CONFIG.ANDE_ATTRIBUTE_TIMES;

                this.addLog(`${vasen.getDisplayName()} activated Ethereal Surge!`, 'passive');

                // Collect which attributes were actually raised so Gifu can share them all at once after
                const raisedAttributes = [];
                for (let i = 0; i < rollCount; i++) {
                    const randomStat = randomAttribute();
                    const result = vasen.modifyAttributeStage(randomStat, stages);
                    const stageWord = pluralizeStage(stages);
                    this.addLog(`${vasen.getDisplayName()}'s ${randomStat} was raised by ${stages} ${stageWord}!`, 'buff');
                    if (result.changed !== 0) {
                        raisedAttributes.push(randomStat);
                    }
                }

                // Gifu: share each raised stat to allies exactly once
                if (raisedAttributes.length > 0 && !vasen.combatFlags.gifuTriggered && vasen.hasRune('GIFU')) {
                    vasen.combatFlags.gifuTriggered = true;
                    this.logRuneActivated(vasen, 'GIFU');
                    const allies = isPlayer ? this.playerTeam : this.enemyTeam;
                    raisedAttributes.forEach(randomStat => {
                        const stageWord = pluralizeStage(stages);
                        allies.forEach(ally => {
                            if (ally !== vasen && !ally.isKnockedOut()) {
                                ally.modifyAttributeStage(randomStat, stages);
                                this.addLog(`${ally.getDisplayName()}'s ${randomStat} was raised by ${stages} ${stageWord}!`, 'buff');
                            }
                        });
                    });
                }
            }
        }
        
        // --- ODJUR: BESTIAL RAGE ---
        if (trigger === 'onTurnEnd' && vasen.species.family === FAMILIES.ODJUR) {
            if (vasen.combatFlags.turnsOnField >= FAMILY_PASSIVE_CONFIG.ODJUR_TURNS_REQUIRED) {
                if (!vasen.combatFlags.odjurPassiveTriggered) {
                    vasen.combatFlags.odjurPassiveTriggered = true;
                    this.addLog(`${vasen.getDisplayName()} activated Bestial Rage!`, 'passive');

                    const attributesToChange = [
                        { name: 'strength', stages: FAMILY_PASSIVE_CONFIG.ODJUR_STRENGTH_STAGES },
                        { name: 'wisdom', stages: FAMILY_PASSIVE_CONFIG.ODJUR_WISDOM_STAGES }
                    ];

                    attributesToChange.forEach(item => {
                        const result = vasen.modifyAttributeStage(item.name, item.stages);
                        if (result.changed !== 0) {
                            const stageWord = pluralizeStage(result.changed);
                            const actionWord = result.changed > 0 ? 'raised' : 'lowered';
                            const logType = result.changed > 0 ? 'buff' : 'debuff';
                            this.addLog(`${vasen.getDisplayName()}'s ${item.name} was ${actionWord} by ${Math.abs(result.changed)} ${stageWord}!`, logType);
                        }
                        
                        // Gifu Sharing
                        if (vasen.hasRune('GIFU') && item.stages > 0) {
                            if (!vasen.combatFlags.gifuTriggered) {
                                vasen.combatFlags.gifuTriggered = true;
                                this.logRuneActivated(vasen, 'GIFU');
                            }
                            const allies = isPlayer ? this.playerTeam : this.enemyTeam;
                            allies.forEach(ally => {
                                if (ally !== vasen && !ally.isKnockedOut()) {
                                    const allyResult = ally.modifyAttributeStage(item.name, item.stages);
                                     if (allyResult.changed !== 0) {
                                        const stageWord = pluralizeStage(allyResult.changed);
                                        const actionWord = allyResult.changed > 0 ? 'raised' : 'lowered';
                                        const logType = allyResult.changed > 0 ? 'buff' : 'debuff';
                                        this.addLog(`${ally.getDisplayName()}'s ${item.name} was ${actionWord} by ${Math.abs(allyResult.changed)} ${stageWord}!`, logType);
                                    }
                                }
                            });
                        }
                    });
                }
            }
        }
        
        // --- OKNYTT: TAG TEAM ---
        if (trigger === 'onSwapOut' && vasen.species.family === FAMILIES.OKNYTT) {
            const { incomingVasen } = context;
            if (incomingVasen && !incomingVasen.isKnockedOut()) {
                const attributes = [...STAGEABLE_ATTRIBUTES]; // copied: picks are removed so they don't repeat
                const stages = FAMILY_PASSIVE_CONFIG.OKNYTT_TAG_TEAM_STAGES;
                const stageWord = pluralizeStage(stages);
                const allies = isPlayer ? this.playerTeam : this.enemyTeam;
                this.addLog(`${vasen.getDisplayName()} activated Tag Team!`, 'passive');
                for (let i = 0; i < FAMILY_PASSIVE_CONFIG.OKNYTT_TAG_TEAM_ATTRIBUTE_COUNT; i++) {
                    if (attributes.length === 0) break;
                    const randomIndex = Math.floor(Math.random() * attributes.length);
                    const randomStat = attributes[randomIndex];
                    attributes.splice(randomIndex, 1);
                    incomingVasen.modifyAttributeStage(randomStat, stages);
                    this.addLog(`${incomingVasen.getDisplayName()}'s ${randomStat} was raised by ${stages} ${stageWord}!`, 'buff');

                    // Gifu on the incoming vasen: their attributes were just raised, so share to all
                    // other allies (the outgoing Oknytt is included - it never received the buff directly)
                    if (incomingVasen.hasRune('GIFU')) {
                        if (!incomingVasen.combatFlags.gifuTriggered) {
                            incomingVasen.combatFlags.gifuTriggered = true;
                            this.logRuneActivated(incomingVasen, 'GIFU');
                        }
                        allies.forEach(ally => {
                            if (ally !== incomingVasen && !ally.isKnockedOut()) {
                                ally.modifyAttributeStage(randomStat, stages);
                                this.addLog(`${ally.getDisplayName()}'s ${randomStat} was raised by ${stages} ${stageWord}!`, 'buff');
                            }
                        });
                    }

                    // Gifu on the outgoing Oknytt: it granted the buff, so share to all other allies
                    // (incomingVasen is excluded - it already received the buff directly above)
                    if (vasen.hasRune('GIFU')) {
                        if (!vasen.combatFlags.gifuTriggered) {
                            vasen.combatFlags.gifuTriggered = true;
                            this.logRuneActivated(vasen, 'GIFU');
                        }
                        allies.forEach(ally => {
                            if (ally !== incomingVasen && !ally.isKnockedOut()) {
                                ally.modifyAttributeStage(randomStat, stages);
                                this.addLog(`${ally.getDisplayName()}'s ${randomStat} was raised by ${stages} ${stageWord}!`, 'buff');
                            }
                        });
                    }
                }
            }
        }
        
        // --- DRAKE: DRACONIC RESILIENCE ---
        if (trigger === 'onHealthThreshold' && vasen.species.family === FAMILIES.DRAKE) {
            const healthPercent = vasen.currentHealth / vasen.maxHealth;
            if (healthPercent <= FAMILY_PASSIVE_CONFIG.DRAKE_HEALTH_THRESHOLD && !vasen.combatFlags.drakePassiveTriggered) {
                vasen.combatFlags.drakePassiveTriggered = true;
                this.addLog(`${vasen.getDisplayName()} activated Draconic Resilience!`, 'passive');

                const attributesToBuff = [
                    { name: 'defense', stages: FAMILY_PASSIVE_CONFIG.DRAKE_DEFENSE_DURABILITY_STAGES },
                    { name: 'durability', stages: FAMILY_PASSIVE_CONFIG.DRAKE_DEFENSE_DURABILITY_STAGES }
                ];

                attributesToBuff.forEach(item => {
                    vasen.modifyAttributeStage(item.name, item.stages);
                    this.addLog(`${vasen.getDisplayName()}'s ${item.name} was raised by ${item.stages} stage!`, 'buff');
                });

                // Gifu Sharing: share all buffed attributes in one activation (once per combat)
                if (vasen.hasRune('GIFU') && !vasen.combatFlags.gifuTriggered) {
                    vasen.combatFlags.gifuTriggered = true;
                    this.logRuneActivated(vasen, 'GIFU');
                    const allies = isPlayer ? this.playerTeam : this.enemyTeam;
                    allies.forEach(ally => {
                        if (ally !== vasen && !ally.isKnockedOut()) {
                            attributesToBuff.forEach(item => {
                                ally.modifyAttributeStage(item.name, item.stages);
                                this.addLog(`${ally.getDisplayName()}'s ${item.name} was raised by ${item.stages} stage!`, 'buff');
                            });
                        }
                    });
                }
            }
        }

        // --- BIND RUNE: FEHU + WYNJA (health threshold all-attribute buff) ---
        // When this väsen's health falls to the configured threshold or lower,
        // raise all four attribute stages. Triggers once per combat, at
        // the same onHealthThreshold point used by Drake's family passive
        // (after this väsen takes damage from an attack).
        if (trigger === 'onHealthThreshold' && hasHealthThresholdBuffAllBindRune(vasen)) {
            const healthPercent = vasen.currentHealth / vasen.maxHealth;
            if (healthPercent <= GAME_CONFIG.RUNE_BIND_FEHU_WYNJA_HEALTH_THRESHOLD && !vasen.combatFlags.fehuWynjaPassiveTriggered) {
                vasen.combatFlags.fehuWynjaPassiveTriggered = true;
                const fehuWynjaBR = getActiveBindRunes(vasen).find(b => b.type === 'health_threshold_buff_all');
                this.logBindRuneActivated(vasen, fehuWynjaBR);

                STAGEABLE_ATTRIBUTES.forEach(stat => {
                    const result = vasen.modifyAttributeStage(stat, GAME_CONFIG.RUNE_BIND_FEHU_WYNJA_BUFF_STAGES);
                    if (result.changed !== 0) {
                        const stageWord = pluralizeStage(result.changed);
                        this.addLog(`${vasen.getDisplayName()}'s ${stat} was raised by ${Math.abs(result.changed)} ${stageWord}!`, 'buff');
                    }
                });
            }
        }

        // --- RA: MALICIOUS RETALIATION ---
        if (trigger === 'onTakeDamage' && vasen.species.family === FAMILIES.RA) {
            const { attacker } = context;
            if (attacker && !attacker.isKnockedOut() && !vasen.combatFlags.raPassiveTriggered) {
                vasen.combatFlags.raPassiveTriggered = true;
                const attributes = [...STAGEABLE_ATTRIBUTES]; // copied: picks are removed so they don't repeat
                const debuffedAttributes = [];
                for (let i = 0; i < FAMILY_PASSIVE_CONFIG.RA_DEBUFF_COUNT; i++) {
                    if (attributes.length > 0) {
                        const randomIndex = Math.floor(Math.random() * attributes.length);
                        const stat = attributes[randomIndex];
                        attacker.modifyAttributeStage(stat, -FAMILY_PASSIVE_CONFIG.RA_DEBUFF_STAGES);
                        debuffedAttributes.push(stat);
                        attributes.splice(randomIndex, 1);
                    }
                }
                this.addLog(`${vasen.getDisplayName()} activated Malicious Retaliation!`, 'passive');
                debuffedAttributes.forEach(stat => {
                    const stageWord = pluralizeStage(FAMILY_PASSIVE_CONFIG.RA_DEBUFF_STAGES);
                    this.addLog(`${attacker.getDisplayName()}'s ${stat} was lowered by ${FAMILY_PASSIVE_CONFIG.RA_DEBUFF_STAGES} ${stageWord}!`, 'debuff');
                });
            }
        }
        
        // --- TROLL: TROLL THEFT ---
        if (trigger === 'onUseSkill' && vasen.species.family === FAMILIES.TROLL) {
            const { defender } = context;
            if (defender && !defender.isKnockedOut() && !vasen.combatFlags.trollPassiveTriggered) {
                vasen.combatFlags.trollPassiveTriggered = true;
                const stealableAttributes = STAGEABLE_ATTRIBUTES.filter(stat => defender.attributeStages[stat] > 0);
                
                if (stealableAttributes.length > 0) {
                    const randomStat = stealableAttributes[Math.floor(Math.random() * stealableAttributes.length)];
                    defender.modifyAttributeStage(randomStat, -FAMILY_PASSIVE_CONFIG.TROLL_STAGE_STEAL);
                    vasen.modifyAttributeStage(randomStat, FAMILY_PASSIVE_CONFIG.TROLL_STAGE_STEAL);
                    
                    const stageWord = pluralizeStage(FAMILY_PASSIVE_CONFIG.TROLL_STAGE_STEAL);
                    this.addLog(`${vasen.getDisplayName()} activated Troll Theft!`, 'passive');
                    this.addLog(`${defender.getDisplayName()}'s ${randomStat} was lowered by ${FAMILY_PASSIVE_CONFIG.TROLL_STAGE_STEAL} ${stageWord}!`, 'debuff');
                    this.addLog(`${vasen.getDisplayName()}'s ${randomStat} was raised by ${FAMILY_PASSIVE_CONFIG.TROLL_STAGE_STEAL} ${stageWord}!`, 'buff');

                    // Gifu Sharing (once per combat)
                    if (vasen.hasRune('GIFU') && !vasen.combatFlags.gifuTriggered) {
                        vasen.combatFlags.gifuTriggered = true;
                        this.logRuneActivated(vasen, 'GIFU');
                        const allies = isPlayer ? this.playerTeam : this.enemyTeam;
                        allies.forEach(ally => {
                            if (ally !== vasen && !ally.isKnockedOut()) {
                                ally.modifyAttributeStage(randomStat, FAMILY_PASSIVE_CONFIG.TROLL_STAGE_STEAL);
                                this.addLog(`${ally.getDisplayName()}'s ${randomStat} was raised by ${FAMILY_PASSIVE_CONFIG.TROLL_STAGE_STEAL} ${stageWord}!`, 'buff');
                            }
                        });
                    }
                }
            }
        }
        
        // --- VALNAD: DEATHLESS ---
        if (trigger === 'onKnockout' && vasen.species.family === FAMILIES.VALNAD) {
            if (!vasen.combatFlags.valnadPassiveTriggered) {
                vasen.combatFlags.valnadPassiveTriggered = true;
                const reviveHealth = Math.floor(vasen.maxHealth * FAMILY_PASSIVE_CONFIG.VALNAD_REVIVE_HEALTH_PERCENT);
                vasen.currentHealth = reviveHealth;
                this.addLog(`${vasen.getDisplayName()} activated Deathless ᛣ.`, 'passive');
                this.addLog(`${vasen.getDisplayName()} revived with <span style="color: var(--color-positive-soft); font-weight: 700;">${reviveHealth}</span> HP!`);
                return true;
            }
        }

        // --- BIND RUNE: INGUZ + DAGAZ (enter battlefield debuff) ---
        // Lowers a random enemy attribute whenever this väsen enters the
        // battlefield (combat start or any swap-in), re-triggering on every
        // entry just like Dagaz's own first-round damage bonus. Can be
        // blocked by the enemy's Wynja rune, same as Inguz's hit-based debuff.
        if (trigger === 'onEnterBattlefield' && hasEnterBattlefieldDebuffBindRune(vasen)) {
            const opponent = isPlayer ? this.enemyActive : this.playerActive;
            if (opponent && !opponent.isKnockedOut()) {
                const inguzDagazBR = getActiveBindRunes(vasen).find(b => b.type === 'enter_battlefield_debuff');
                this.logBindRuneActivated(vasen, inguzDagazBR);

                if (!this.tryWynjaBlock(opponent)) {
                    const randomStat = randomAttribute();
                    opponent.modifyAttributeStage(randomStat, -GAME_CONFIG.RUNE_BIND_INGUZ_DAGAZ_DEBUFF_STAGES);
                    const stageWord = pluralizeStage(GAME_CONFIG.RUNE_BIND_INGUZ_DAGAZ_DEBUFF_STAGES);
                    this.addLog(`${opponent.getDisplayName()}'s ${randomStat} was lowered by ${GAME_CONFIG.RUNE_BIND_INGUZ_DAGAZ_DEBUFF_STAGES} ${stageWord}!`, 'debuff');
                }
            }
        }
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
