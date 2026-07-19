// =============================================================================
// 9b-game-exploration.js - Wild Encounters and Combat Handling
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

    // Unlock lore entries based on exploration encounter
    if (result.type === 'well') {
        if (gameState.unlockLoreEntry('location_sacred_well')) {
            ui.showLoreUnlockMessage('location_sacred_well');
        }
    }

    if (result.type !== 'vasen') {
        this.refreshUI();
    }
};

// Start combat with wild Vasen
Game.prototype.startCombat = function(enemyVasen) {
    // Stop showing explore tutorial when first combat starts
    if (!gameState.firstExploreTutorialShown) {
        gameState.firstExploreTutorialShown = true;
        gameState.saveGame();
        // Immediately update the explore button to remove tutorial class
        ui.updateExploreButton();
    }

    gameState.inCombat = true;

    // Get player team (non-null party members)
    const playerTeam = gameState.party.filter(p => p !== null);

    // Reset combat state for all
    playerTeam.forEach(v => v.resetCombatState());
    enemyVasen.resetCombatState();

    this.currentCombat = new Combat(playerTeam, [enemyVasen], COMBAT_TYPES.WILD);
    this.currentCombat.onLog = (msg, type) => ui.addCombatLog(msg, type);
    this.currentCombat.onUpdate = () => ui.renderCombat(this.currentCombat);
    this.currentCombat.onHit = (side, matchup) => ui.flashCombatant(side, matchup);
    this.currentCombat.onAttack = (side, skillType) => ui.triggerAttackAnimation(side, skillType);
    this.currentCombat.onKnockoutSwap = (callback) => ui.showKnockoutSwapModal(this.currentCombat, callback);
    this.currentCombat.onEnd = (result) => this.handleCombatEnd(result);

    ui.showCombatUI();
    ui.renderCombat(this.currentCombat);
    ui.addCombatLog(`A wild ${enemyVasen.getDisplayName()} appears!`, 'encounter');
};

// Unlock all lore entries triggered by taming a specific väsen
Game.prototype.unlockTamingLoreEntries = function(newVasen) {
    const species = newVasen.species;
    if (!species) return;

    // Species entry
    const speciesKey = LORE_ENTRY_KEYS.find(k =>
        LORE_ENTRIES[k].unlockType === 'vasen' &&
        LORE_ENTRIES[k].unlockKey === newVasen.speciesName
    );
    if (speciesKey && gameState.unlockLoreEntry(speciesKey)) {
        ui.showLoreUnlockMessage(speciesKey);
    }

    // Family entry
    const familyKey = LORE_ENTRY_KEYS.find(k =>
        LORE_ENTRIES[k].unlockType === 'family' &&
        LORE_ENTRIES[k].unlockKey === species.family
    );
    if (familyKey && gameState.unlockLoreEntry(familyKey)) {
        ui.showLoreUnlockMessage(familyKey);
    }

    // Element concept entry
    const elementKey = LORE_ENTRY_KEYS.find(k =>
        LORE_ENTRIES[k].unlockType === 'element' &&
        LORE_ENTRIES[k].unlockKey === species.element
    );
    if (elementKey && gameState.unlockLoreEntry(elementKey)) {
        ui.showLoreUnlockMessage(elementKey);
    }

    // Skill entries - only skills the väsen has actually learned at its current level
    newVasen.getAvailableSkills().forEach(skillName => {
        const skillKey = LORE_ENTRY_KEYS.find(k =>
            LORE_ENTRIES[k].unlockType === 'skill' &&
            LORE_ENTRIES[k].unlockKey === skillName
        );
        if (skillKey && gameState.unlockLoreEntry(skillKey)) {
            ui.showLoreUnlockMessage(skillKey);
        }
    });

    // Taming item entry (unlocked when correctly used to tame)
    if (species.tamingItem) {
        const itemKey = LORE_ENTRY_KEYS.find(k =>
            LORE_ENTRIES[k].unlockType === 'item' &&
            LORE_ENTRIES[k].unlockKey === species.tamingItem
        );
        if (itemKey && gameState.unlockLoreEntry(itemKey)) {
            ui.showLoreUnlockMessage(itemKey);
        }
    }

    // Valhalla entries (taming Einharje or Valkyria)
    if (newVasen.speciesName === 'Einharje' || newVasen.speciesName === 'Valkyria') {
        LORE_ENTRY_KEYS.filter(k => LORE_ENTRIES[k].unlockType === 'valhalla').forEach(k => {
            if (gameState.unlockLoreEntry(k)) {
                ui.showLoreUnlockMessage(k);
            }
        });
    }
};

// Handle combat end
Game.prototype.handleCombatEnd = function(result) {
    if (result.surrendered) {
        // Apply surrender penalty
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
        // Player lost
        gameState.party.forEach(v => {
            if (v) {
                v.currentHealth = Math.max(1, Math.floor(v.maxHealth * GAME_CONFIG.POST_COMBAT_HEAL_PERCENT));
            }
        });

        ui.showDialogue(
            'Defeat',
            `<p>${result.message || 'Your party was overwhelmed!'}</p>`,
            [{ text: 'Continue', callback: () => this.endCombat() }],
            false
        );
        return;
    }

    // Victory!
    const combatResult = {
        victory: true,
        tamed: result.tamed,
        tamedVasen: result.tamedVasen,
        expGained: []
    };

    // Calculate and apply experience
    const expYield = getExpYield(
        this.currentCombat.enemyTeam[0].level,
        this.currentCombat.enemyTeam[0].species.rarity
    );

    this.currentCombat.playerTeam.forEach((vasen, index) => {
        if (vasen.isKnockedOut()) return;

        let expMultiplier = 0.6; // Base party exp (updated from 0.3)
        if (vasen.combatFlags.turnsOnField > 0) {
            expMultiplier = 0.8; // Participated (updated from 0.6)
        }
        if (index === this.currentCombat.playerActiveIndex) {
            expMultiplier = 1.0; // Dealt killing blow
        }

        const expAmount = Math.floor(expYield * expMultiplier);
        // Check if väsen is at max level before displaying experience
        const isMaxLevel = vasen.level >= GAME_CONFIG.MAX_LEVEL;
        const displayExpAmount = isMaxLevel ? 0 : expAmount;

        if (expAmount > 0) {
            const levelResult = vasen.addExperience(expAmount);
            combatResult.expGained.push({
                name: vasen.getDisplayName(),
                amount: displayExpAmount, // Show 0 if at max level
                leveledUp: levelResult.leveledUp,
                newLevel: levelResult.newLevel
            });

            ui.addCombatLog(`${vasen.getName()} gained ${displayExpAmount} experience!`, 'exp');
            if (levelResult.leveledUp) {
                ui.addCombatLog(`${vasen.getName()} reached level ${levelResult.newLevel}!`, 'levelup');

                // Check if leveling up unlocked a new skill with a lore entry
                vasen.getAvailableSkills().forEach(skillName => {
                    const skillKey = LORE_ENTRY_KEYS.find(k =>
                        LORE_ENTRIES[k].unlockType === 'skill' &&
                        LORE_ENTRIES[k].unlockKey === skillName
                    );
                    if (skillKey && gameState.unlockLoreEntry(skillKey)) {
                        ui.showLoreUnlockMessage(skillKey);
                    }
                });
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
    newVasen.resetCombatState();

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

    // Unlock lore entries earned by taming this väsen
    this.unlockTamingLoreEntries(newVasen);

    // Show a one-time guidance popup the first time the player successfully
    // tames a väsen, once the combat result dialogue has been dismissed.
    // Flagged here and shown in endCombat() so it appears after the normal
    // Victory dialogue's "Continue" flow, mirroring the explore popups.
    if (!gameState.firstTameMessageShown) {
        gameState.firstTameMessageShown = true;
        this.pendingFirstTameMessage = true;
        gameState.saveGame();
    }
}

    // Apply post-combat heal
    gameState.party.forEach(v => {
        if (v) {
            v.healPercent(GAME_CONFIG.POST_COMBAT_HEAL_PERCENT);
            v.currentMegin = v.maxMegin;
        }
    });

    ui.showCombatResult(combatResult);
};
