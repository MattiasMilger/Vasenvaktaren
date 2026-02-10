// =============================================================================
// 9c-game-guardian.js - Guardian Battles
// =============================================================================

// Challenge guardian
Game.prototype.challengeGuardian = function() {
    if (gameState.inCombat) return;
    if (!gameState.party.some(p => p !== null)) {
        ui.showMessage('Form a party with at least one Väsen to challenge.', 'error');
        return;
    }

    const zone = ZONES[gameState.currentZone];
    if (!zone || !zone.guardian) return;

    const guardian = zone.guardian;
    const isRematch = gameState.defeatedGuardians.has(gameState.currentZone);
    const dialogueText = isRematch
        ? (guardian.dialogue.rematch || guardian.dialogue.challenge)
        : guardian.dialogue.challenge;

    ui.showDialogue(
    guardian.name,
    `<p>${dialogueText}</p>`,
    [
        {
            text: 'Fight!',
            callback: () => this.startGuardianBattle(guardian)
        },
        {
            text: 'Not yet',
            class: 'btn-secondary',
            callback: null
        }
    ],
    false // non‑dismissible
);

};

// Start guardian battle
Game.prototype.startGuardianBattle = function(guardian) {
    // NEW: Stop showing explore tutorial when first combat starts
    if (!gameState.firstExploreTutorialShown) {
        gameState.firstExploreTutorialShown = true;
        gameState.saveGame();
        // Immediately update the explore button to remove tutorial class
        ui.updateExploreButton();
    }

    gameState.inCombat = true;

    // Get player team
    const playerTeam = gameState.party.filter(p => p !== null);

    // Create guardian team
    const enemyTeam = createGuardianTeam(guardian);

    // Reset battle state
    playerTeam.forEach(v => v.resetBattleState());
    enemyTeam.forEach(v => v.resetBattleState());

    this.currentBattle = new Battle(playerTeam, enemyTeam, BATTLE_TYPES.GUARDIAN);
    this.currentBattle.guardianName = guardian.name;
    this.currentBattle.guardianDialogue = guardian.dialogue;
    this.currentBattle.onLog = (msg, type) => ui.addCombatLog(msg, type);
    this.currentBattle.onUpdate = () => ui.renderCombat(this.currentBattle);
    this.currentBattle.onHit = (side, matchup) => ui.flashCombatant(side, matchup);
    this.currentBattle.onAttack = (side, abilityType) => ui.triggerAttackAnimation(side, abilityType);
    this.currentBattle.onKnockoutSwap = (callback) => ui.showKnockoutSwapModal(this.currentBattle, callback);
    this.currentBattle.onEnd = (result) => this.handleGuardianBattleEnd(result, guardian);

    ui.showCombatUI();
    ui.renderCombat(this.currentBattle);
    ui.addCombatLog(`${guardian.name} challenges you!`, 'encounter');
    ui.addCombatLog(`${guardian.name} sends out ${enemyTeam[0].getDisplayName()}!`, 'swap');
};

// Handle guardian battle end
Game.prototype.handleGuardianBattleEnd = function(result, guardian) {
    if (result.surrendered) {
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
        gameState.party.forEach(v => {
            if (v) {
                v.currentHealth = Math.max(1, Math.floor(v.maxHealth * GAME_CONFIG.POST_BATTLE_HEAL_PERCENT));
            }
        });

        ui.showDialogue(
            'Defeat',
            `<p>${guardian.dialogue.lose}</p>`,
            [{ text: 'Continue', callback: () => this.endBattle() }],
            false
        );
        return;
    }

    // Victory!
    const wasFirstClear = !gameState.defeatedGuardians.has(gameState.currentZone);

    // Mark zone as cleared (this also unlocks the next zone via isZoneUnlocked check)
    gameState.defeatedGuardians.add(gameState.currentZone);

    // Get current zone index for messages
    const currentIndex = ZONE_ORDER.indexOf(gameState.currentZone);

    // Check if this was the final guardian (Gylfe)
    if (gameState.currentZone === 'varldens-ande' && wasFirstClear) {
    }

    // Calculate experience
    const battleResult = {
        victory: true,
        expGained: []
    };

    this.currentBattle.enemyTeam.forEach(enemy => {
        const expYield = getExpYield(enemy.level, enemy.species.rarity);

        this.currentBattle.playerTeam.forEach((vasen, index) => {
            if (vasen.isKnockedOut()) return;

            let expMultiplier = 0.6; // Base party exp (updated from 0.3)
            if (vasen.battleFlags.turnsOnField > 0) expMultiplier = 0.8; // Participated (updated from 0.6)

            const expAmount = Math.floor(expYield * expMultiplier);
            // Check if väsen is at max level
            const isMaxLevel = vasen.level >= GAME_CONFIG.MAX_LEVEL;

            if (expAmount > 0) {
                const levelResult = vasen.addExperience(expAmount);

                // Find existing entry or create new
                let entry = battleResult.expGained.find(e => e.name === vasen.getDisplayName());
                if (!entry) {
                    entry = { name: vasen.getDisplayName(), amount: 0, leveledUp: false, newLevel: vasen.level };
                    battleResult.expGained.push(entry);
                }
                // Only add to display amount if not at max level
                if (!isMaxLevel) {
                    entry.amount += expAmount;
                }
                if (levelResult.leveledUp) {
                    entry.leveledUp = true;
                    entry.newLevel = levelResult.newLevel;
                }
            }
        });
    });

    // Log exp gains
    battleResult.expGained.forEach(exp => {
        ui.addCombatLog(`${exp.name} gained ${exp.amount} experience!`, 'exp');
        if (exp.leveledUp) {
            ui.addCombatLog(`${exp.name} reached level ${exp.newLevel}!`, 'levelup');
        }
    });

    // Apply post-battle heal (full heal for first-time guardian clear)
    if (wasFirstClear) {
        gameState.party.forEach(v => {
            if (v) {
                v.restoreFully();
            }
        });
        ui.addCombatLog('Your party has been fully restored by the guardian\'s blessing!', 'heal');
        ui.showMessage('Your party was healed to full!');
    } else {
        gameState.party.forEach(v => {
            if (v) {
                v.healPercent(GAME_CONFIG.POST_BATTLE_HEAL_PERCENT);
                v.currentMegin = v.maxMegin;
            }
        });
    }

    // Check achievements
    gameState.checkAchievements();

    // Show result
    let message = `<p>${guardian.dialogue.win}</p>`;
    let callback = () => this.endBattle(); // Default callback to just return to game screen

    if (wasFirstClear && currentIndex < ZONE_ORDER.length - 1) {
        const nextZoneId = ZONE_ORDER[currentIndex + 1];
        const nextZone = ZONES[nextZoneId];

        message += `<p><strong>${nextZone.name}</strong> unlocked!</p>`;

        // Custom callback to switch zone instantly
        callback = () => {
            gameState.currentZone = nextZoneId; // <--- MODIFICATION: Set current zone to the new zone
            this.endBattle();
        };
    }

    ui.showDialogue('Victory!', message, [{ text: 'Continue', callback: callback }], false);

    gameState.saveGame();
};
