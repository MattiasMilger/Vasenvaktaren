// =============================================================================
// 9c-game-guardian.js - Guardian Combat
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
            callback: () => this.startGuardianCombat(guardian)
        },
        {
            text: 'Not yet',
            class: 'btn-secondary',
            callback: null
        }
    ],
    true
);

};

// Start guardian combat
Game.prototype.startGuardianCombat = function(guardian) {
    // Stop showing explore tutorial when first combat starts
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

    // Reset combat state
    playerTeam.forEach(v => v.resetCombatState());
    enemyTeam.forEach(v => v.resetCombatState());

    this.currentCombat = new Combat(playerTeam, enemyTeam, COMBAT_TYPES.GUARDIAN);
    this.currentCombat.guardianName = guardian.name;
    this.currentCombat.guardianDialogue = guardian.dialogue;
    this.currentCombat.onLog = (msg, type) => ui.addCombatLog(msg, type);
    this.currentCombat.onUpdate = () => ui.renderCombat(this.currentCombat);
    this.currentCombat.onHit = (side, matchup) => ui.flashCombatant(side, matchup);
    this.currentCombat.onAttack = (side, skillType) => ui.triggerAttackAnimation(side, skillType);
    this.currentCombat.onKnockoutSwap = (callback) => ui.showKnockoutSwapModal(this.currentCombat, callback);
    this.currentCombat.onEnd = (result) => this.handleGuardianCombatEnd(result, guardian);

    ui.showCombatUI();
    ui.renderCombat(this.currentCombat);
    ui.addCombatLog(`${guardian.name} challenges you!`, 'encounter');
    ui.addCombatLog(`${guardian.name} sends out ${enemyTeam[0].getDisplayName()}!`, 'swap');
};

// Handle guardian combat end
Game.prototype.handleGuardianCombatEnd = function(result, guardian) {
    if (result.surrendered) {
        gameState.party.forEach(v => {
            if (v) {
                v.currentHealth = Math.max(1, Math.floor(v.maxHealth * GAME_CONFIG.POST_COMBAT_HEAL_PERCENT));
            }
        });
        ui.addCombatLog('You call retreat. Your party withdraws.', 'system');
        this.endCombat();
        return;
    }

    if (!result.victory) {
        gameState.party.forEach(v => {
            if (v) {
                v.currentHealth = Math.max(1, Math.floor(v.maxHealth * GAME_CONFIG.POST_COMBAT_HEAL_PERCENT));
            }
        });

        ui.showDialogue(
            'Defeat',
            `<p>${guardian.dialogue.lose}</p>`,
            [{ text: 'Continue', callback: () => this.endCombat() }],
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
    const combatResult = {
        victory: true,
        expGained: []
    };

    this.currentCombat.enemyTeam.forEach(enemy => {
        const expYield = getExpYield(enemy.level, enemy.species.rarity);

        this.currentCombat.playerTeam.forEach((vasen, index) => {
            if (vasen.isKnockedOut()) return;

            let expMultiplier = 0.6; // Base party exp (updated from 0.3)
            if (vasen.combatFlags.turnsOnField > 0) expMultiplier = 0.8; // Participated (updated from 0.6)

            const expAmount = Math.floor(expYield * expMultiplier);
            // Check if väsen is at max level
            const isMaxLevel = vasen.level >= GAME_CONFIG.MAX_LEVEL;

            if (expAmount > 0) {
                const levelResult = vasen.addExperience(expAmount);

                // Find existing entry or create new
                let entry = combatResult.expGained.find(e => e.name === vasen.getDisplayName());
                if (!entry) {
                    entry = { name: vasen.getDisplayName(), amount: 0, leveledUp: false, newLevel: vasen.level };
                    combatResult.expGained.push(entry);
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
    combatResult.expGained.forEach(exp => {
        ui.addCombatLog(`${exp.name} gained ${exp.amount} experience!`, 'exp');
        if (exp.leveledUp) {
            ui.addCombatLog(`${exp.name} reached level ${exp.newLevel}!`, 'levelup');
        }
    });

    // Apply post-combat heal (full heal for first-time guardian clear)
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
                v.healPercent(GAME_CONFIG.POST_COMBAT_HEAL_PERCENT);
                v.currentMegin = v.maxMegin;
            }
        });
    }

    // Check achievements
    gameState.checkAchievements();

    // Unlock lore entries on first guardian clear
    if (wasFirstClear) {
        // Guardian's own lore entry
        const guardianLoreKey = LORE_ENTRY_KEYS.find(k =>
            LORE_ENTRIES[k].unlockType === 'guardian' &&
            LORE_ENTRIES[k].unlockKey === gameState.currentZone
        );
        if (guardianLoreKey && gameState.unlockLoreEntry(guardianLoreKey)) {
            ui.showLoreUnlockMessage(guardianLoreKey);
        }

        // Next zone's lore entry
        if (currentIndex < ZONE_ORDER.length - 1) {
            const nextZoneId = ZONE_ORDER[currentIndex + 1];
            const zoneLoreKey = LORE_ENTRY_KEYS.find(k =>
                LORE_ENTRIES[k].unlockType === 'zone' &&
                LORE_ENTRIES[k].unlockKey === nextZoneId
            );
            if (zoneLoreKey && gameState.unlockLoreEntry(zoneLoreKey)) {
                ui.showLoreUnlockMessage(zoneLoreKey);
            }
        }
    }

    // Show result
    let message = `<p>${guardian.dialogue.win}</p>`;
    let callback = () => this.endCombat(); // Default callback to just return to game screen

    if (wasFirstClear && currentIndex < ZONE_ORDER.length - 1) {
        const nextZoneId = ZONE_ORDER[currentIndex + 1];
        const nextZone = ZONES[nextZoneId];

        message += `<p><strong>${nextZone.name}</strong> unlocked!</p>`;

        // Award taming items from the next zone (except when unlocking Ginnungagap)
        if (wasFirstClear && nextZoneId !== 'GINNUNGAGAP') {
            const nextZoneItems = getItemsForZone(nextZoneId);
            if (nextZoneItems.length > 0) {
                const shuffled = [...nextZoneItems].sort(() => Math.random() - 0.5);
                const itemsToGive = shuffled.slice(0, GAME_CONFIG.NEW_ZONE_ITEMS_AMOUNT);
                itemsToGive.forEach(itemId => {
                    gameState.addItem(itemId, 1);
                    const itemName = TAMING_ITEMS[itemId]?.name || itemId;
                    message += `<p>You received: <strong>${itemName}</strong>!</p>`;
                });
            }
        }

        // Custom callback to switch zone instantly
        callback = () => {
            gameState.currentZone = nextZoneId; // <--- MODIFICATION: Set current zone to the new zone
            this.endCombat();
        };
    }

    ui.showDialogue('Victory!', message, [{ text: 'Continue', callback: callback }], false);

    gameState.saveGame();
};
