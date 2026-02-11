// =============================================================================
// 9d-game-endless.js - Endless Tower Mode
// =============================================================================

// Challenge Endless Tower
Game.prototype.challengeEndlessTower = function() {
    if (gameState.inCombat) return;
    if (!gameState.party.some(p => p !== null)) {
        ui.showMessage('Form a party with at least one Väsen to challenge.', 'error');
        return;
    }

    ui.showDialogue(
        'Endless Tower',
        `<p>The Endless Tower stretches infinitely into the void, a test of endurance and strength.</p>
         <p>Battle begins at Floor 1 with Level 30 enemies, increasing by 1 level each floor. Clearing a floor replenishes your active party somewhat.</p>
         <p><strong>Warning:</strong> Väsen cannot be tamed in this mode. Victory or defeat will end your run.</p>
         ${gameState.endlessTowerRecord.highestFloor > 0
            ? `<p class="record-reminder">Current Record: Floor ${gameState.endlessTowerRecord.highestFloor}</p>`
            : ''}`,
        [
            {
                text: 'Begin Challenge',
                callback: () => this.startEndlessTowerRun()
            },
            {
                text: 'Not yet',
                class: 'btn-secondary',
                callback: null
            }
        ],
        false
    );
};

// Start Endless Tower run
Game.prototype.startEndlessTowerRun = function() {
    this.endlessTowerCurrentFloor = 1;
    this.startEndlessTowerBattle();
};

// Start an Endless Tower battle
Game.prototype.startEndlessTowerBattle = function() {
    gameState.inCombat = true;

    const floor = this.endlessTowerCurrentFloor;
    const enemyLevel = GAME_CONFIG.ENDLESS_TOWER_START_LEVEL + (floor - 1);

    // Get random species from all available
    const allSpecies = Object.keys(VASEN_SPECIES);
    const randomSpecies = allSpecies[Math.floor(Math.random() * allSpecies.length)];

    // Create enemy
    const enemyVasen = createWildVasen(randomSpecies, enemyLevel);

    // Get player team
    const playerTeam = gameState.party.filter(p => p !== null);

    if (floor === 1) {
        // First floor - reset battle state and create new battle
        playerTeam.forEach(v => v.resetBattleState());
        enemyVasen.resetBattleState();

        this.currentBattle = new Battle(playerTeam, [enemyVasen], BATTLE_TYPES.ENDLESS_TOWER);
        this.currentBattle.currentFloor = floor;
        this.currentBattle.onLog = (msg, type) => ui.addCombatLog(msg, type);
        this.currentBattle.onUpdate = () => ui.renderCombat(this.currentBattle);
        this.currentBattle.onHit = (side, matchup) => ui.flashCombatant(side, matchup);
        this.currentBattle.onAttack = (side, abilityType) => ui.triggerAttackAnimation(side, abilityType);
        this.currentBattle.onKnockoutSwap = (callback) => ui.showKnockoutSwapModal(this.currentBattle, callback);
        this.currentBattle.onEnd = (result) => this.handleEndlessTowerBattleEnd(result);

        ui.showCombatUI();
        ui.renderCombat(this.currentBattle);

        // Add initial input delay at battle start
        this.currentBattle.waitingForPlayerAction = false;
        setTimeout(() => {
            if (this.currentBattle && !this.currentBattle.isOver) {
                this.currentBattle.waitingForPlayerAction = true;
                ui.renderCombat(this.currentBattle);
            }
        }, GAME_CONFIG.BATTLE_INPUT_DELAY);
    } else {
        // Subsequent floors - preserve player state, only reset enemy
        enemyVasen.resetBattleState();

        // Update the battle with new enemy
        this.currentBattle.enemyTeam = [enemyVasen];
        this.currentBattle.setEnemyActive(0);
        this.currentBattle.currentFloor = floor;
        this.currentBattle.isOver = false;
        this.currentBattle.winner = null;
        this.currentBattle.waitingForPlayerAction = true;

        // Reset offers but keep taming disabled
        this.currentBattle.offersGiven = 0;
        this.currentBattle.correctItemGiven = false;

        ui.renderCombat(this.currentBattle);

        // Resume auto battle if it was active
        if (this.currentBattle.isAutoBattle) {
            this.autoBattleTick();
        }
    }

    ui.addCombatLog(`Floor ${floor}: A wild ${enemyVasen.getDisplayName()} (Lvl ${enemyLevel}) appears!`, 'encounter');
};

// Handle Endless Tower battle end
Game.prototype.handleEndlessTowerBattleEnd = function(result) {
    const floor = this.endlessTowerCurrentFloor;

    // Handle surrender
    if (result.surrendered) {
        gameState.inCombat = false;

        // Calculate reached floor
        const playerTeam = gameState.party.filter(p => p !== null);
        const reachedFloor = floor - 1; // They were on this floor but didn't complete it

        // Always apply full heal after tower run ends
        gameState.party.forEach(v => {
            if (v) {
                v.restoreFully();
            }
        });
        ui.addCombatLog('Your party has been fully restored after the tower challenge!', 'heal');
        ui.showMessage('Your party was healed to full!');

        // Update record - reached floor before surrendering
        const newRecord = gameState.updateEndlessTowerRecord(reachedFloor, playerTeam);

        const recordMessage = newRecord
            ? `<p class="record-new">New Record: Floor ${reachedFloor}!</p>`
            : gameState.endlessTowerRecord.highestFloor > 0
                ? `<p>Your record remains Floor ${gameState.endlessTowerRecord.highestFloor}.</p>`
                : '';

        ui.showDialogue(
            'Tower Run Ended',
            `<p>You surrendered on Floor ${floor}.</p>
             ${reachedFloor > 0 ? `<p>You reached Floor ${reachedFloor}.</p>` : ''}
             ${recordMessage}`,
            [{
                text: 'Return',
                callback: () => {
                    ui.hideCombatUI();
                    this.refreshUI();
                }
            }],
            false
        );
        return;
    }

    if (result.victory) {
        // Player won this floor

        // Check if reached max floor
        if (floor >= GAME_CONFIG.ENDLESS_TOWER_MAX_FLOOR) {
            // Reached the cap!
            gameState.inCombat = false;

            // Apply full heal for conquering the tower
            gameState.party.forEach(v => {
                if (v) {
                    v.restoreFully();
                }
            });
            ui.addCombatLog('Your party has been fully restored after conquering the tower!', 'heal');
            ui.showMessage('Your party was healed to full!');

            // Update record
            const playerTeam = gameState.party.filter(p => p !== null);
            gameState.updateEndlessTowerRecord(floor, playerTeam);

            ui.showDialogue(
                'Tower Conquered!',
                `<p>Incredible! You have reached Floor ${GAME_CONFIG.ENDLESS_TOWER_MAX_FLOOR}, the pinnacle of the Endless Tower!</p>
                 <p>This achievement will be recorded in legend.</p>`,
                [{
                    text: 'Return',
                    callback: () => {
                        ui.hideCombatUI();
                        this.refreshUI();
                    }
                }],
                false
            );
            return;
        }

        // Continue to next floor automatically
        this.endlessTowerCurrentFloor++;
        const nextFloor = this.endlessTowerCurrentFloor;

        // Add log message for floor completion
        ui.addCombatLog(`Floor ${floor} complete! Advancing to Floor ${nextFloor}...`, 'victory');

        // Apply post-victory heal for both HP and Megin (endless tower specific)
gameState.party.forEach(v => {
    if (!v) return;

    // Skip knocked-out väsen
    if (v.currentHealth <= 0) return;

    const healthHeal = Math.floor(v.maxHealth * GAME_CONFIG.ENDLESS_TOWER_HEAL_PERCENT);
    const meginHeal = Math.floor(v.maxMegin * GAME_CONFIG.ENDLESS_TOWER_HEAL_PERCENT);

    // Correct clamping
    v.currentHealth = Math.min(v.maxHealth, v.currentHealth + healthHeal);
    v.currentMegin = Math.min(v.maxMegin, v.currentMegin + meginHeal);
});


        // Small delay before next floor for readability
        setTimeout(() => {
            this.startEndlessTowerBattle();
        }, 1500);
    } else {
        // Player lost - entire team was defeated
        gameState.inCombat = false;

        // Update record with floors completed (current floor was not completed)
        const playerTeam = gameState.party.filter(p => p !== null);
        const reachedFloor = floor - 1;

        // Always apply full heal after tower run ends (whether they reached floor 1 or not)
        gameState.party.forEach(v => {
            if (v) {
                v.restoreFully();
            }
        });
        ui.addCombatLog('Your party has been fully restored after the tower challenge!', 'heal');
        ui.showMessage('Your party was healed to full!');

        const newRecord = gameState.updateEndlessTowerRecord(reachedFloor, playerTeam);

        const recordMessage = newRecord
            ? `<p class="record-new">New Record: Floor ${reachedFloor}!</p>`
            : gameState.endlessTowerRecord.highestFloor > 0
                ? `<p>Your record remains Floor ${gameState.endlessTowerRecord.highestFloor}.</p>`
                : '';

        ui.showDialogue(
            'Tower Run Ended',
            `<p>You were defeated on Floor ${floor}.</p>
             ${reachedFloor > 0 ? `<p>You reached Floor ${reachedFloor}.</p>` : ''}
             ${recordMessage}`,
            [{
                text: 'Return',
                callback: () => {
                    ui.hideCombatUI();
                    this.refreshUI();
                }
            }],
            false
        );
    }
};
