// =============================================================================
// 9e-game-actions.js - Combat Action Handlers
// =============================================================================

// Handle ability use
Game.prototype.handleAbilityUse = function(abilityName) {
    if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;

    // Check if ability requires ally targeting
    if (abilityRequiresAllyTarget(abilityName)) {
        ui.showAllySelectionModal(this.currentBattle, abilityName, (allyIndex) => {
            // Execute the ability on the selected ally
            this.currentBattle.executePlayerAction({
                type: 'ability',
                abilityName: abilityName,
                targetAllyIndex: allyIndex
            });
        });
        return;
    }

    this.currentBattle.executePlayerAction({ type: 'ability', abilityName });
};

// Handle swap
Game.prototype.handleSwap = function(targetIndex) {
    if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
    this.currentBattle.executePlayerAction({ type: 'swap', targetIndex });
};

// Handle offer item
Game.prototype.handleOfferItem = function(itemId) {
    if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
    if (!this.currentBattle.isWildEncounter) return;

    // Use item from inventory
    if (!gameState.removeItem(itemId, 1)) {
        ui.showMessage('You don\'t have that item.', 'error');
        return;
    }

    // NEW: Mark tutorial as shown when player offers an item
    if (!gameState.firstCombatTutorialShown && this.currentBattle.isWildEncounter) {
        gameState.firstCombatTutorialShown = true;
        gameState.saveGame();
    }

    this.currentBattle.executePlayerAction({ type: 'offer', itemId });
};

// Handle ask about item confirmation
Game.prototype.handleAskItem = function() {
    if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
    if (!this.currentBattle.isWildEncounter) return;

    // Show the confirmation dialog
    ui.showDialogue(
        'Ask About Item',
        '<p>Beware, this action will cost a turn.</p>',
        [
            {
                text: 'Confirm',
                class: 'btn-primary',
                callback: () => {
                    // NEW: Trigger tutorial by resetting the flag when asking about item
                    if (this.currentBattle.isWildEncounter) {
                        gameState.firstCombatTutorialShown = false;
                        gameState.saveGame();
                    }
                    // Execute the action if confirmed
                    this.currentBattle.executePlayerAction({ type: 'ask' });
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
    if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
    this.currentBattle.executePlayerAction({ type: 'pass' });
};

// Handle surrender
Game.prototype.handleSurrender = function() {
    if (!this.currentBattle) return;

    ui.showDialogue(
        'Surrender?',
        '<p>Are you sure you want to surrender? Your party will be left at very low health.</p>',
        [
            {
                text: 'Surrender',
                class: 'btn-danger',
                callback: () => {
                    this.currentBattle.executePlayerAction({ type: 'surrender' });
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
    if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
    if (!this.currentBattle.isWildEncounter) return;
    ui.showOfferModal(this.currentBattle);
};

// Handle auto battle
Game.prototype.handleAutoBattle = function() {
    if (!this.currentBattle) return;

    // If already auto battling, cancel it
    if (this.currentBattle.isAutoBattle) {
        this.currentBattle.isAutoBattle = false;
        if (this.currentBattle.onUpdate) this.currentBattle.onUpdate();
        return;
    }

    ui.showDialogue(
        'Auto Battle',
        '<p>Let the AI fight for you? The battle will play out automatically using the same AI as the enemy.</p>',
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
    const battle = this.currentBattle;
    if (!battle || battle.isOver) return;

    battle.isAutoBattle = true;
    battle.playerAutoUtilityUsage = new Map();

    // Override knockout swap to auto-select during auto battle
    const originalOnKnockoutSwap = battle.onKnockoutSwap;
    battle.onKnockoutSwap = (callback) => {
        if (!battle.isAutoBattle) {
            originalOnKnockoutSwap(callback);
            return;
        }
        // Auto-select best swap target using AI logic
        const aliveTeam = battle.playerTeam
            .map((v, i) => ({ vasen: v, index: i }))
            .filter(({ vasen, index }) => !vasen.isKnockedOut() && index !== battle.playerActiveIndex);

        if (aliveTeam.length > 0) {
            // Pick the team member with best element matchup against enemy
            let bestIndex = aliveTeam[0].index;
            let bestScore = -Infinity;

            aliveTeam.forEach(({ vasen, index }) => {
                let score = vasen.currentHealth / vasen.maxHealth * 50;
                const matchup = getMatchupType(vasen.species.element, battle.enemyActive.species.element);
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
    if (battle.onUpdate) battle.onUpdate();

    this.autoBattleTick();
};

// Single auto battle tick
Game.prototype.autoBattleTick = function() {
    const battle = this.currentBattle;
    if (!battle || battle.isOver || !battle.isAutoBattle) return;

    // Wait for player action to be enabled
    if (!battle.waitingForPlayerAction) {
        setTimeout(() => this.autoBattleTick(), 200);
        return;
    }

    // Use AI to choose player's action
    const action = this.getAutoBattleAction();
    if (!action) return;

    // Track utility usage for the player auto AI
    if (action.type === 'ability') {
        const ability = ABILITIES[action.abilityName];
        if (ability && ability.type === ATTACK_TYPES.UTILITY && battle.playerAutoUtilityUsage) {
            const key = `auto-${battle.playerActive.id}-${action.abilityName}`;
            const count = battle.playerAutoUtilityUsage.get(key) || 0;
            battle.playerAutoUtilityUsage.set(key, count + 1);
        }
    }

    battle.executePlayerAction(action);

    // Schedule next tick after the battle input delay
    setTimeout(() => {
        if (battle.isOver || !battle.isAutoBattle) return;
        this.autoBattleTick();
    }, GAME_CONFIG.BATTLE_INPUT_DELAY + 200);
};

// Get AI-chosen action for the player
Game.prototype.getAutoBattleAction = function() {
    const battle = this.currentBattle;
    if (!battle) return null;

    // Create a mirrored battle view so the AI thinks it's playing from the player's side
    const mirroredBattle = {
        enemyActive: battle.playerActive,
        playerActive: battle.enemyActive,
        enemyTeam: battle.playerTeam,
        playerTeam: battle.enemyTeam,
        enemyActiveIndex: battle.playerActiveIndex,
        playerActiveIndex: battle.enemyActiveIndex,
        isWildEncounter: battle.isWildEncounter,
        getEnemyUtilityUsageCount: (vasen, abilityName) => {
            // Track player-side utility usage with a separate key prefix
            const key = `auto-${vasen.id}-${abilityName}`;
            return battle.playerAutoUtilityUsage ? (battle.playerAutoUtilityUsage.get(key) || 0) : 0;
        }
    };

    // Use guardian-level AI (smarter) for the player
    const ai = new EnemyAI(mirroredBattle, true);
    const aiAction = ai.chooseAction();

    // Map AI action back to a player action
    if (aiAction.type === 'ability') {
        return { type: 'ability', abilityName: aiAction.ability };
    } else if (aiAction.type === 'swap') {
        const targetIndex = battle.playerTeam.indexOf(aiAction.target);
        if (targetIndex !== -1) {
            return { type: 'swap', targetIndex: targetIndex };
        }
    }

    // Fallback to basic strike
    return { type: 'ability', abilityName: 'Basic Strike' };
};
