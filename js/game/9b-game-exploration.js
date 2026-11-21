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
        this.unlockLoreWithMessage('location_sacred_well');
    }

    if (result.type !== 'vasen') {
        this.refreshUI();
    }
};

// Start combat with wild Vasen
Game.prototype.startCombat = function(enemyVasen) {
    gameState.inCombat = true;

    // Get player team (non-null party members)
    const playerTeam = gameState.party.filter(p => p !== null);

    // Reset combat state for all
    playerTeam.forEach(v => v.resetCombatState());
    enemyVasen.resetCombatState();

    this.currentCombat = new Combat(playerTeam, [enemyVasen], COMBAT_TYPES.WILD);
    this.attachCombatCallbacks((result) => this.handleCombatEnd(result));

    ui.showCombatUI();
    ui.renderCombat(this.currentCombat);
    ui.addCombatLog(`A wild ${enemyVasen.getDisplayName()} appears!`, 'encounter');
};

// Unlock all lore entries triggered by taming a specific väsen
Game.prototype.unlockTamingLoreEntries = function(newVasen) {
    const species = newVasen.species;
    if (!species) return;

    this.unlockLoreWithMessage(findLoreEntryKey('vasen', newVasen.speciesName));
    this.unlockLoreWithMessage(findLoreEntryKey('family', species.family));
    this.unlockLoreWithMessage(findLoreEntryKey('element', species.element));
    this.unlockSkillLoreEntries(newVasen);

    // Taming item entry (unlocked when correctly used to tame)
    if (species.tamingItem) {
        this.unlockLoreWithMessage(findLoreEntryKey('item', species.tamingItem));
    }

    // Valhalla entries (taming Einharje or Valkyria)
    if (newVasen.speciesName === 'Einharje' || newVasen.speciesName === 'Valkyria') {
        findLoreEntryKeys('valhalla').forEach(k => this.unlockLoreWithMessage(k));
    }
};

// Unlock lore entries for the skills a väsen has learned at its current level
Game.prototype.unlockSkillLoreEntries = function(vasen) {
    vasen.getAvailableSkills().forEach(skillName => {
        this.unlockLoreWithMessage(findLoreEntryKey('skill', skillName));
    });
};

// Handle combat end
Game.prototype.handleCombatEnd = function(result) {
    if (result.surrendered) {
        this.leavePartyAtLowHealth();
        ui.addCombatLog('You call retreat. Your party withdraws.', 'system');
        this.endCombat();
        return;
    }

    // New-player hints (shown until the first väsen has been tamed)
    const tutorialActive = this.isCombatTutorialActive(this.currentCombat);

    if (!result.victory) {
        this.leavePartyAtLowHealth();
        const defeatTip = tutorialActive
            ? ui.getTutorialTipHTML('Your väsen are weakened. Keep exploring: a <strong>Sacred Well</strong> will heal them.')
            : '';
        ui.showDialogue(
            result.tie ? 'Tie' : 'Defeat',
            `<p>${result.message || 'Your party was overwhelmed!'}</p>${defeatTip}`,
            [{ text: 'Continue', callback: () => this.endCombat() }],
            false,
            null,
            'swords'
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

        let expMultiplier = 0.6; // In the party
        if (vasen.combatFlags.turnsOnField > 0) {
            expMultiplier = 0.8; // Spent at least one turn on the field
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
                nameHTML: ui.getDisplayNameHTML(vasen),
                amount: displayExpAmount, // Show 0 if at max level
                leveledUp: levelResult.leveledUp,
                newLevel: levelResult.newLevel
            });

            ui.addCombatLog(`${vasen.getName()} gained ${displayExpAmount} experience!`, 'exp');
            if (levelResult.leveledUp) {
                ui.addCombatLog(`${vasen.getName()} reached level ${levelResult.newLevel}!`, 'levelup');

                // Leveling up may have unlocked a new skill with a lore entry
                this.unlockSkillLoreEntries(vasen);
            }
        }
    });

    // Handle taming
    if (result.tamed && result.tamedVasen) {
        const newVasen = result.tamedVasen;

        // Tamed väsen join runeless, at full health and with no attribute changes
        newVasen.runes = [];
        newVasen.currentHealth = newVasen.maxHealth;
        newVasen.recalculateMaxMegin(); // runes were cleared (in case it had Uruz)
        newVasen.resetCombatState();

        gameState.vasenCollection.push(newVasen);

        // Join the party directly if a slot is free
        const freeSlotIndex = gameState.party.findIndex(slot => slot === null);
        if (freeSlotIndex !== -1) {
            gameState.party[freeSlotIndex] = newVasen;
            ui.addCombatLog(`${newVasen.getDisplayName()} joined your party in slot ${freeSlotIndex + 1}!`, 'tame');
        } else {
            ui.addCombatLog(`${newVasen.getDisplayName()} has been sent to your collection!`, 'tame');
        }

        gameState.checkAchievements();
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

        // One-time nudge towards the first guardian once the player owns
        // exactly three väsen. Skipped for good if a guardian has already
        // been defeated by then (the player clearly found the way already).
        if (!gameState.guardianHintShown &&
            gameState.vasenCollection.length === GAME_CONFIG.MAX_TEAM_SIZE &&
            gameState.defeatedGuardians.size === 0) {
            gameState.guardianHintShown = true;
            this.pendingGuardianHint = true;
            gameState.saveGame();
        }
    }

    // Won without taming during the tutorial: remind how taming works
    if (tutorialActive && !result.tamed) {
        combatResult.tip = 'To make a väsen join you, <strong>offer</strong> it the item it desires, then defeat it.';
    }

    this.applyVictoryHeal();
    ui.showCombatResult(combatResult);
};
