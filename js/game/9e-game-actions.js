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

// Handle offer item
Game.prototype.handleOfferItem = function(itemId) {
    if (!this.currentCombat || !this.currentCombat.waitingForPlayerAction) return;
    if (!this.currentCombat.isWildEncounter) return;

    // Use item from inventory
    if (!gameState.removeItem(itemId, 1)) {
        ui.showMessage('You don\'t have that item.', 'error');
        return;
    }

    // Mark tutorial as shown when player offers an item; also unlock offering-type lore entries
    if (!gameState.firstCombatTutorialShown && this.currentCombat.isWildEncounter) {
        gameState.firstCombatTutorialShown = true;
        LORE_ENTRY_KEYS.filter(k => LORE_ENTRIES[k].unlockType === 'offering').forEach(k => {
            if (!gameState.unlockedLoreEntries.has(k)) {
                gameState.unlockedLoreEntries.add(k);
                ui.showLoreUnlockMessage(k);
            }
        });
        gameState.saveGame();
    }

    this.currentCombat.executePlayerAction({ type: 'offer', itemId });
};

// Handle Interrogate confirmation
Game.prototype.handleInterrogate = function() {
    if (!this.currentCombat || !this.currentCombat.waitingForPlayerAction) return;
    if (!this.currentCombat.isWildEncounter) return;

    // Show the confirmation dialog
    ui.showDialogue(
        'Interrogate',
        '<p>Beware, this action will cost a turn.</p>',
        [
            {
                text: 'Confirm',
                class: 'btn-primary',
                callback: () => {
                    // Capture current names for the dialogue
                    const player = gameState.playerName || "Väktare";
                    const enemy = this.currentCombat.enemyActive;
                    const enemyName = enemy.getDisplayName();
                    const itemName = enemy.species.tamingItem;

                    // Trigger tutorial by resetting the flag when asking about item
                    if (this.currentCombat.isWildEncounter) {
                        gameState.firstCombatTutorialShown = false;
                        gameState.saveGame();
                    }

                    // Execute the action with pre-formatted names so the UI can bold them
                    this.currentCombat.executePlayerAction({ 
                        type: 'interrogate',
                        playerLine: `${player}: Tell me ${enemyName}, what is it that you desire the most?`,
                        enemyLine: `${enemyName}: If you must know, ${itemName} is what I desire most.`
                    });
                }
            },
            {
                text: 'Close',
                class: 'btn-secondary',
                // callback: null will close the modal without executing the action
            }
        ]
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
                text: 'Surrender',
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
        ]
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
                text: 'Start Auto Battle',
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
        ]
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