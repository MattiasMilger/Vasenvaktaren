// =============================================================================
// 9b-game-exploration.js - Wild Encounters and Battle Handling
// =============================================================================

// Handle exploration
Game.prototype.explore = function() {
    if (gameState.inCombat) return;
    if (!gameState.party.some(p => p !== null)) {
        ui.showMessage('Form a party with at least one Väsen to explore.', 'error');
        return;
    }

    const result = gameState.explore();
    ui.showEncounterResult(result);

    if (result.type !== 'vasen') {
        this.refreshUI();
    }
};

// Start battle with wild Vasen
Game.prototype.startBattle = function(enemyVasen) {
    // NEW: Stop showing explore tutorial when first combat starts
    if (!gameState.firstExploreTutorialShown) {
        gameState.firstExploreTutorialShown = true;
        gameState.saveGame();
        // Immediately update the explore button to remove tutorial class
        ui.updateExploreButton();
    }

    gameState.inCombat = true;

    // Get player team (non-null party members)
    const playerTeam = gameState.party.filter(p => p !== null);

    // Reset battle state for all
    playerTeam.forEach(v => v.resetBattleState());
    enemyVasen.resetBattleState();

    this.currentBattle = new Battle(playerTeam, [enemyVasen], BATTLE_TYPES.WILD);
    this.currentBattle.onLog = (msg, type) => ui.addCombatLog(msg, type);
    this.currentBattle.onUpdate = () => ui.renderCombat(this.currentBattle);
    this.currentBattle.onHit = (side, matchup) => ui.flashCombatant(side, matchup);
    this.currentBattle.onAttack = (side, abilityType) => ui.triggerAttackAnimation(side, abilityType);
    this.currentBattle.onKnockoutSwap = (callback) => ui.showKnockoutSwapModal(this.currentBattle, callback);
    this.currentBattle.onEnd = (result) => this.handleBattleEnd(result);

    ui.showCombatUI();
    ui.renderCombat(this.currentBattle);
    ui.addCombatLog(`A wild ${enemyVasen.getDisplayName()} appears!`, 'encounter');
};

// Handle battle end
Game.prototype.handleBattleEnd = function(result) {
    if (result.surrendered) {
        // Apply surrender penalty
        gameState.party.forEach(v => {
            if (v) {
                v.currentHealth = Math.max(1, Math.floor(v.maxHealth * GAME_CONFIG.POST_BATTLE_HEAL_PERCENT));
            }
        });

        ui.addCombatLog('You call retreat. Your party withdraws.', 'system');
        this.endBattle();
        return;
    }

    if (!result.victory) {
        // Player lost
        gameState.party.forEach(v => {
            if (v) {
                v.currentHealth = Math.max(1, Math.floor(v.maxHealth * GAME_CONFIG.POST_BATTLE_HEAL_PERCENT));
            }
        });

        ui.showDialogue(
            'Defeat',
            `<p>${result.message || 'Your party was overwhelmed!'}</p>`,
            [{ text: 'Continue', callback: () => this.endBattle() }],
            false
        );
        return;
    }

    // Victory!
    const battleResult = {
        victory: true,
        tamed: result.tamed,
        tamedVasen: result.tamedVasen,
        expGained: []
    };

    // Calculate and apply experience
    const expYield = getExpYield(
        this.currentBattle.enemyTeam[0].level,
        this.currentBattle.enemyTeam[0].species.rarity
    );

    this.currentBattle.playerTeam.forEach((vasen, index) => {
        if (vasen.isKnockedOut()) return;

        let expMultiplier = 0.6; // Base party exp (updated from 0.3)
        if (vasen.battleFlags.turnsOnField > 0) {
            expMultiplier = 0.8; // Participated (updated from 0.6)
        }
        if (index === this.currentBattle.playerActiveIndex) {
            expMultiplier = 1.0; // Dealt killing blow
        }

        const expAmount = Math.floor(expYield * expMultiplier);
        // Check if väsen is at max level before displaying experience
        const isMaxLevel = vasen.level >= GAME_CONFIG.MAX_LEVEL;
        const displayExpAmount = isMaxLevel ? 0 : expAmount;

        if (expAmount > 0) {
            const levelResult = vasen.addExperience(expAmount);
            battleResult.expGained.push({
                name: vasen.getDisplayName(),
                amount: displayExpAmount, // Show 0 if at max level
                leveledUp: levelResult.leveledUp,
                newLevel: levelResult.newLevel
            });

            ui.addCombatLog(`${vasen.getName()} gained ${displayExpAmount} experience!`, 'exp');
            if (levelResult.leveledUp) {
                ui.addCombatLog(`${vasen.getName()} reached level ${levelResult.newLevel}!`, 'levelup');
            }
        }
    });

    // Handle taming
if (result.tamed && result.tamedVasen) {
    const newVasen = result.tamedVasen;

    // Clear runes from tamed väsen - they join runeless
    newVasen.runes = [];

    // Heal to full before adding to collection
    newVasen.currentHealth = newVasen.maxHealth;

    // Recalculate megin since runes were cleared (in case it had Uruz)
    newVasen.maxMegin = newVasen.calculateMaxMegin();
    newVasen.currentMegin = newVasen.maxMegin;

    // Reset attribute changes
    newVasen.resetBattleState();

    // Add to total collection
    gameState.vasenCollection.push(newVasen);

    // --- NEW LOGIC: Add to party if a slot is free ---
    const freeSlotIndex = gameState.party.findIndex(slot => slot === null);
    if (freeSlotIndex !== -1) {
        gameState.party[freeSlotIndex] = newVasen;
        ui.addCombatLog(`${newVasen.getDisplayName()} joined your party in slot ${freeSlotIndex + 1}!`, 'tame');
    } else {
        ui.addCombatLog(`${newVasen.getDisplayName()} has been sent to your collection!`, 'tame');
    }
    // ------------------------------------------------

    // Check for achievements
    gameState.checkAchievements();
}

    // Apply post-battle heal
    gameState.party.forEach(v => {
        if (v) {
            v.healPercent(GAME_CONFIG.POST_BATTLE_HEAL_PERCENT);
            v.currentMegin = v.maxMegin;
        }
    });

    ui.showBattleResult(battleResult);
};
