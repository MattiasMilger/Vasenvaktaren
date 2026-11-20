// =============================================================================
// 9e-game-actions.js - Combat Action Handlers
// =============================================================================

// Handle skill use
Game.prototype.handleSkillUse = function(skillName) {
    if (!this.currentCombat || !this.currentCombat.waitingForPlayerAction) return;

    // Check if skill requires ally targeting
    if (skillRequiresAllyTarget(skillName)) {
        ui.showAllySelectionModal(this.currentCombat, skillName, (allyIndex) => {
            // Execute the skill on the selected ally
            this.currentCombat.executePlayerAction({
                type: 'skill',
                skillName: skillName,
                targetAllyIndex: allyIndex
            });
        });
        return;
    }

    this.currentCombat.executePlayerAction({ type: 'skill', skillName });
};

// Handle swap
Game.prototype.handleSwap = function(targetIndex) {
    if (!this.currentCombat || !this.currentCombat.waitingForPlayerAction) return;
    this.currentCombat.executePlayerAction({ type: 'swap', targetIndex });
};

// -----------------------------------------------------------------------------
// New-player combat tutorial
// -----------------------------------------------------------------------------
// Runs in wild encounters until the player has tamed their first väsen
// (gameState.firstCombatTutorialShown is only set to true once
// vasenCollection.length > 1, see Game.init / Game.endCombat). Saves that have
// already completed it keep the flag true and never see it again.
//
// Two steps per combat, and only when the enemy desires an item the player owns:
//   1. 'interrogate' - the Interrogate button glows. The first interrogation of
//      the combat is a free turn: the enemy skips its action.
//   2. 'offer'       - after interrogating, the Offer Item button glows, and in
//      the offer modal the desired item and its Confirm button glow.
// Outside the tutorial, interrogating still makes the Offer Item button glow
// for the rest of that combat if the player owns the desired item.
Game.prototype.isCombatTutorialActive = function(combat = this.currentCombat) {
    return !!combat && !gameState.firstCombatTutorialShown &&
        combat.isWildEncounter && combat.canTame && !combat.isEndlessTower;
};

// Returns 'interrogate', 'offer' or null
Game.prototype.getCombatTutorialStage = function(combat = this.currentCombat) {
    if (!combat || !combat.isWildEncounter || !combat.canTame || combat.isEndlessTower) return null;
    if (combat.isOver || combat.correctItemGiven || !combat.enemyActive) return null;

    const desiredItem = VASEN_SPECIES[combat.enemyActive.speciesName]?.tamingItem;
    if (!desiredItem || !(gameState.itemInventory[desiredItem] > 0)) return null;

    const tutorialActive = this.isCombatTutorialActive(combat);
    if (tutorialActive && !combat.hasInterrogated) return 'interrogate';
    if (tutorialActive || combat.hasInterrogated) return 'offer';
    return null;
};

// Handle offer item
Game.prototype.handleOfferItem = function(itemId) {
    if (!this.currentCombat || !this.currentCombat.waitingForPlayerAction) return;
    if (!this.currentCombat.isWildEncounter) return;

    // Use item from inventory
    if (!gameState.removeItem(itemId, 1)) {
        ui.showMessage('You don\'t have that item.', 'error');
        return;
    }

    // Unlock offering-type lore entries on the first offer. The tutorial itself
    // keeps running until the first successful tame (so losing the fight after
    // offering doesn't leave a new player without guidance).
    let unlockedLore = false;
    findLoreEntryKeys('offering').forEach(k => {
        if (!gameState.unlockedLoreEntries.has(k)) {
            gameState.unlockedLoreEntries.add(k);
            ui.showLoreUnlockMessage(k);
            unlockedLore = true;
        }
    });
    if (unlockedLore) gameState.saveGame();

    this.currentCombat.executePlayerAction({ type: 'offer', itemId });
};

// Handle Interrogate confirmation
Game.prototype.handleInterrogate = function() {
    if (!this.currentCombat || !this.currentCombat.waitingForPlayerAction) return;
    if (!this.currentCombat.isWildEncounter) return;
    // Already offered the desired item - nothing left to learn
    if (this.currentCombat.correctItemGiven) return;

    const isTutorialStep = this.getCombatTutorialStage(this.currentCombat) === 'interrogate';
    const message = isTutorialStep
        ? '<p>Ask the väsen what it desires most.</p><p>Interrogating normally costs a turn, but this väsen is curious about you and <strong>will not act this turn</strong>.</p>'
        : '<p>Beware, this action will cost a turn.</p>';

    // Show the confirmation dialog
    ui.showDialogue(
        'Interrogate',
        message,
        [
            {
                text: 'Confirm',
                class: isTutorialStep ? 'btn-primary tutorial-blink' : 'btn-primary',
                callback: () => {
                    const combat = this.currentCombat;
                    // The combat may have changed while the dialog was open
                    if (!combat || combat.isOver || !combat.waitingForPlayerAction || combat.correctItemGiven) return;

                    // Re-check at confirm time: only the tutorial's first
                    // interrogation of this combat is a free turn.
                    const freeTurn = this.getCombatTutorialStage(combat) === 'interrogate';

                    // From now on (this combat only) the Offer Item button guides the player
                    combat.hasInterrogated = true;

                    combat.executePlayerAction({ type: 'interrogate', freeTurn });
                }
            },
            {
                text: 'Close',
                class: 'btn-secondary' // No callback: just closes the dialogue
            }
        ],
        true,
        null,
        'interrogate'
    );
};

// Handle pass
Game.prototype.handlePass = function() {
    if (!this.currentCombat || !this.currentCombat.waitingForPlayerAction) return;
    this.currentCombat.executePlayerAction({ type: 'pass' });
};

// Handle surrender
Game.prototype.handleSurrender = function() {
    if (!this.currentCombat) return;

    ui.showDialogue(
        'Surrender?',
        '<p>Are you sure you want to surrender? Your party will be left at very low health.</p>',
        [
            {
                text: `${uiIcon('surrender')}Surrender`,
                class: 'btn-danger',
                callback: () => {
                    this.currentCombat.executePlayerAction({ type: 'surrender' });
                }
            },
            {
                text: 'Continue Fighting',
                class: 'btn-secondary',
                callback: null
            }
        ],
        true,
        null,
        'surrender'
    );
};

// Show offer modal
Game.prototype.showOfferModal = function() {
    if (!this.currentCombat || !this.currentCombat.waitingForPlayerAction) return;
    if (!this.currentCombat.isWildEncounter) return;
    ui.showOfferModal(this.currentCombat);
};

// Handle auto battle
Game.prototype.handleAutoBattle = function() {
    if (!this.currentCombat) return;

    // If already auto battling, cancel it
    if (this.currentCombat.isAutoBattle) {
        this.currentCombat.isAutoBattle = false;
        if (this.currentCombat.onUpdate) this.currentCombat.onUpdate();
        return;
    }

    ui.showDialogue(
        'Auto Battle',
        '<p>Let the AI fight for you? The combat will play out automatically using the same AI as the enemy.</p>',
        [
            {
                text: `${uiIcon('swords')}Start Auto Battle`,
                class: 'btn-primary',
                callback: () => {
                    this.startAutoBattle();
                }
            },
            {
                text: 'Cancel',
                class: 'btn-secondary',
                callback: null
            }
        ],
        true,
        null,
        'swords'
    );
};

// Start auto battle loop
Game.prototype.startAutoBattle = function() {
    const combat = this.currentCombat;
    if (!combat || combat.isOver) return;

    combat.isAutoBattle = true;
    combat.playerAutoUtilityUsage = new Map();

    // Override knockout swap to auto-select during auto battle
    const originalOnKnockoutSwap = combat.onKnockoutSwap;
    combat.onKnockoutSwap = (callback) => {
        if (!combat.isAutoBattle) {
            originalOnKnockoutSwap(callback);
            return;
        }
        // Auto-select best swap target using AI logic
        const aliveTeam = combat.playerTeam
            .map((v, i) => ({ vasen: v, index: i }))
            .filter(({ vasen, index }) => !vasen.isKnockedOut() && index !== combat.playerActiveIndex);

        if (aliveTeam.length > 0) {
            // Pick the team member with best element matchup against enemy
            let bestIndex = aliveTeam[0].index;
            let bestScore = -Infinity;

            aliveTeam.forEach(({ vasen, index }) => {
                let score = vasen.currentHealth / vasen.maxHealth * 50;
                const matchup = getMatchupType(vasen.species.element, combat.enemyActive.species.element);
                if (matchup === 'POTENT') score += 30;
                else if (matchup === 'WEAK') score -= 20;
                if (score > bestScore) {
                    bestScore = score;
                    bestIndex = index;
                }
            });

            callback(bestIndex);
        }
    };

    // Update UI to show auto battle is active
    if (combat.onUpdate) combat.onUpdate();

    this.autoBattleTick();
};

// Single auto battle tick
Game.prototype.autoBattleTick = function() {
    const combat = this.currentCombat;
    if (!combat || combat.isOver || !combat.isAutoBattle) return;

    // Wait for player action to be enabled
    if (!combat.waitingForPlayerAction) {
        setTimeout(() => this.autoBattleTick(), 200);
        return;
    }

    // Use AI to choose player's action
    const action = this.getAutoBattleAction();
    if (!action) return;

    // Track utility usage for the player auto AI
    if (action.type === 'skill') {
        const skill = ABILITIES[action.skillName];
        if (skill && skill.type === ATTACK_TYPES.UTILITY && combat.playerAutoUtilityUsage) {
            const key = `auto-${combat.playerActive.id}-${action.skillName}`;
            const count = combat.playerAutoUtilityUsage.get(key) || 0;
            combat.playerAutoUtilityUsage.set(key, count + 1);
        }
    }

    combat.executePlayerAction(action);

    // Schedule next tick after the combat input delay
    setTimeout(() => {
        if (combat.isOver || !combat.isAutoBattle) return;
        this.autoBattleTick();
    }, GAME_CONFIG.COMBAT_INPUT_DELAY + 200);
};

// Get AI-chosen action for the player
Game.prototype.getAutoBattleAction = function() {
    const combat = this.currentCombat;
    if (!combat) return null;

    // Create a mirrored combat view so the AI thinks it's playing from the player's side
    const mirroredCombat = {
        enemyActive: combat.playerActive,
        playerActive: combat.enemyActive,
        enemyTeam: combat.playerTeam,
        playerTeam: combat.enemyTeam,
        enemyActiveIndex: combat.playerActiveIndex,
        playerActiveIndex: combat.enemyActiveIndex,
        isWildEncounter: combat.isWildEncounter,
        getEnemyUtilityUsageCount: (vasen, skillName) => {
            // Track player-side utility usage with a separate key prefix
            const key = `auto-${vasen.id}-${skillName}`;
            return combat.playerAutoUtilityUsage ? (combat.playerAutoUtilityUsage.get(key) || 0) : 0;
        }
    };

    // Use guardian-level AI (smarter) for the player
    const ai = new EnemyAI(mirroredCombat, true);
    const aiAction = ai.chooseAction();

    // Map AI action back to a player action
    if (aiAction.type === 'skill') {
        return { type: 'skill', skillName: aiAction.skill };
    } else if (aiAction.type === 'swap') {
        const targetIndex = combat.playerTeam.indexOf(aiAction.target);
        if (targetIndex !== -1) {
            return { type: 'swap', targetIndex: targetIndex };
        }
    }

    // Fallback to basic strike
    return { type: 'skill', skillName: 'Basic Strike' };
};