// =============================================================================
// 9-main.js - Main Game Controller and Initialization
// =============================================================================

class Game {
    constructor() {
        this.currentBattle = null;
    }

    // Initialize the game
    init() {
        ui.init();

        // Check for existing save
        if (gameState.loadGame()) {
            // Has save data - go to game screen
            this.showGameScreen();
        } else {
            // No save - show main menu
            this.showMainMenu();
        }
    }

    // Show main menu
    showMainMenu() {
        ui.showScreen('mainMenu');

        document.getElementById('new-game-btn').onclick = () => this.showStarterSelection();
        document.getElementById('continue-btn').onclick = () => {
            if (gameState.loadGame()) {
                this.showGameScreen();
            } else {
                ui.showMessage('No save data found.', 'error');
            }
        };

        // Update continue button state
        const hasSave = localStorage.getItem(GAME_CONFIG.SAVE_KEY) !== null;
        document.getElementById('continue-btn').disabled = !hasSave;
    }

    // Show starter selection
    showStarterSelection() {
        ui.showScreen('starterSelect');

        const starterOptions = document.getElementById('starter-options');
        starterOptions.innerHTML = '';

        STARTER_VASEN.forEach(speciesName => {
            const species = VASEN_SPECIES[speciesName];
            if (!species) return;

            const card = document.createElement('div');
            card.className = `starter-card element-${species.element.toLowerCase()}`;
            card.innerHTML = `
                <img src="${species.image}" alt="${species.name}" class="starter-image">
                <h3 class="starter-name">${species.name}</h3>
                <p class="starter-family">${species.family}</p>
                <span class="starter-element element-${species.element.toLowerCase()}">${species.element}</span>
                <p class="starter-description">${species.description}</p>
            `;
            card.onclick = () => this.selectStarter(speciesName, card);
            starterOptions.appendChild(card);
        });

        document.getElementById('confirm-starter-btn').disabled = true;
        document.getElementById('confirm-starter-btn').onclick = () => this.confirmStarter();
    }

    // Select starter
    selectStarter(speciesName, card) {
        // Remove selection from all cards
        document.querySelectorAll('.starter-card').forEach(c => c.classList.remove('selected'));
        // Add selection to clicked card
        card.classList.add('selected');
        this.selectedStarter = speciesName;
        document.getElementById('confirm-starter-btn').disabled = false;
    }

    // Confirm starter selection
    confirmStarter() {
        if (!this.selectedStarter) return;

        // Initialize new game
        gameState.resetGame();

        // Create starter Vasen at level 5
        const starter = new VasenInstance(this.selectedStarter, GAME_CONFIG.STARTER_LEVEL);

        // Give starting rune (Uruz)
        starter.equipRune('URUZ');
        starter.maxMegin = starter.calculateMaxMegin();
        starter.currentMegin = starter.maxMegin;

        // Add to collection and party
        gameState.vasenCollection.push(starter);
        gameState.party[0] = starter;

        // Add starting rune to collected
        gameState.collectedRunes.add('URUZ');

        // Give a random starting taming item from zone 1
        const zone1Items = ['Mossy Bark', 'Shed Antlers', 'Elderflower Sprig', 'Morning Dew', 'Shedded Scale', 'Festive Midsommarkrans'];
        const startingItem = zone1Items[Math.floor(Math.random() * zone1Items.length)];
        gameState.addItem(startingItem, 1);

        // Save and show game
        gameState.saveGame();

        // Show intro dialogue
        ui.showDialogue(
    'Welcome, Väktare',
    `
        <p>The first rune has revealed itself to you: 
            <span class="rune-symbol">${RUNES.URUZ.symbol}</span> ${RUNES.URUZ.name}
        </p>
        <p class="rune-hint">${RUNES.URUZ.effect}</p>
        <p>Your <strong>${starter.getDisplayName()}</strong> stands ready at your side, 
           equipped with the rune's power.</p>
        <p>You also found a <strong>${startingItem}</strong> to help you tame new Väsen.</p>
    `,
    [
        {
            text: 'Begin Journey',
            class: 'btn-primary',
            callback: () => {
                // Start the game for real
                gameState.gameStarted = true;
                gameState.saveGame();

                game.showGameScreen();
            }
        },
        {
            text: 'Cancel',
            class: 'btn-secondary',
            callback: () => {
                // Close popup and return to starter selection
                ui.hideDialogue();
            }
        }
    ],
    false // non‑dismissible
);

    }

    // Show main game screen
    showGameScreen() {
        ui.showScreen('game');
        this.refreshUI();
    }

    // Refresh all UI elements
    refreshUI() {
        ui.refreshAll();
    }

    // Handle exploration
    explore() {
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
    }

    // Challenge guardian
    challengeGuardian() {
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

    }

    // Challenge Endless Tower
    challengeEndlessTower() {
        if (gameState.inCombat) return;
        if (!gameState.party.some(p => p !== null)) {
            ui.showMessage('Form a party with at least one Väsen to challenge.', 'error');
            return;
        }

        ui.showDialogue(
            'Endless Tower',
            `<p>The Endless Tower stretches infinitely into the void, a test of endurance and strength.</p>
             <p>Battle begins at Floor 1 with Level 30 enemies, increasing by 1 level each floor.</p>
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
    }

    // Start Endless Tower run
    startEndlessTowerRun() {
        this.endlessTowerCurrentFloor = 1;
        this.startEndlessTowerBattle();
    }

    // Start an Endless Tower battle
    startEndlessTowerBattle() {
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
            this.currentBattle.onHit = (side) => ui.flashCombatant(side);
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
        }
        
        ui.addCombatLog(`Floor ${floor}: A wild ${enemyVasen.getDisplayName()} (Lvl ${enemyLevel}) appears!`, 'encounter');
    }

    // Handle Endless Tower battle end
    handleEndlessTowerBattleEnd(result) {
        const floor = this.endlessTowerCurrentFloor;

        // Handle surrender
        if (result.surrendered) {
            gameState.inCombat = false;
            
            // Apply post-battle healing
            gameState.applyPostBattleHealing();
            
            // Update record - reached floor before surrendering
            const playerTeam = gameState.party.filter(p => p !== null);
            const reachedFloor = floor - 1; // They were on this floor but didn't complete it
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
                
                // Apply post-battle healing
                gameState.applyPostBattleHealing();
                
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
            
            // Small delay before next floor for readability
            setTimeout(() => {
                // No healing in Endless Tower - pure endurance challenge
                this.startEndlessTowerBattle();
            }, 1500);
        } else {
            // Player lost - entire team was defeated
            gameState.inCombat = false;
            
            // Apply post-battle healing
            gameState.applyPostBattleHealing();
            
            // Update record with floors completed (current floor was not completed)
            const playerTeam = gameState.party.filter(p => p !== null);
            const reachedFloor = floor - 1;
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
    }

    // Start battle with wild Vasen
    startBattle(enemyVasen) {
        gameState.inCombat = true;

        // Get player team (non-null party members)
        const playerTeam = gameState.party.filter(p => p !== null);

        // Reset battle state for all
        playerTeam.forEach(v => v.resetBattleState());
        enemyVasen.resetBattleState();

        this.currentBattle = new Battle(playerTeam, [enemyVasen], BATTLE_TYPES.WILD);
        this.currentBattle.onLog = (msg, type) => ui.addCombatLog(msg, type);
        this.currentBattle.onUpdate = () => ui.renderCombat(this.currentBattle);
        this.currentBattle.onHit = (side) => ui.flashCombatant(side);
        this.currentBattle.onKnockoutSwap = (callback) => ui.showKnockoutSwapModal(this.currentBattle, callback);
        this.currentBattle.onEnd = (result) => this.handleBattleEnd(result);

        ui.showCombatUI();
        ui.renderCombat(this.currentBattle);
        ui.addCombatLog(`A wild ${enemyVasen.getDisplayName()} appears!`, 'encounter');
    }

    // Start guardian battle
    startGuardianBattle(guardian) {
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
        this.currentBattle.onHit = (side) => ui.flashCombatant(side);
        this.currentBattle.onKnockoutSwap = (callback) => ui.showKnockoutSwapModal(this.currentBattle, callback);
        this.currentBattle.onEnd = (result) => this.handleGuardianBattleEnd(result, guardian);

        ui.showCombatUI();
        ui.renderCombat(this.currentBattle);
        ui.addCombatLog(`${guardian.name} challenges you!`, 'encounter');
        ui.addCombatLog(`${guardian.name} sends out ${enemyTeam[0].getDisplayName()}!`, 'swap');
    }

    // Handle ability use
    handleAbilityUse(abilityName) {
        if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
        
        // Check if ability requires ally targeting
        if (abilityRequiresAllyTarget(abilityName)) {
            ui.showAllySelectionModal(this.currentBattle, abilityName, (allyIndex) => {
                this.currentBattle.playerUseAbilityOnAlly(abilityName, allyIndex);
            });
            return;
        }
        
        this.currentBattle.executePlayerAction({ type: 'ability', abilityName });
    }

    // Handle swap
    handleSwap(targetIndex) {
        if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
        // Hide swap options after selecting
        document.getElementById('swap-options').classList.remove('visible');
        this.currentBattle.executePlayerAction({ type: 'swap', targetIndex });
    }

    // Handle offer item
    handleOfferItem(itemId) {
        if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
        if (!this.currentBattle.isWildEncounter) return;

        // Use item from inventory
        if (!gameState.removeItem(itemId, 1)) {
            ui.showMessage('You don\'t have that item.', 'error');
            return;
        }

        this.currentBattle.executePlayerAction({ type: 'offer', itemId });
    }

    // Handle ask about item confirmation
handleAskItem() {
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
}

    // Handle pass
    handlePass() {
        if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
        this.currentBattle.executePlayerAction({ type: 'pass' });
    }

    // Handle surrender
    handleSurrender() {
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
    }

    // Show offer modal
    showOfferModal() {
        if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
        if (!this.currentBattle.isWildEncounter) return;
        ui.showOfferModal(this.currentBattle);
    }

    // Handle battle end
    handleBattleEnd(result) {
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

            let expMultiplier = 0.3; // Base party exp
            if (vasen.battleFlags.turnsOnField > 0) {
                expMultiplier = 0.6; // Participated
            }
            if (index === this.currentBattle.playerActiveIndex) {
                expMultiplier = 1.0; // Dealt killing blow
            }

            const expAmount = Math.floor(expYield * expMultiplier);
            if (expAmount > 0) {
                const levelResult = vasen.addExperience(expAmount);
                battleResult.expGained.push({
                    name: vasen.getDisplayName(),
                    amount: expAmount,
                    leveledUp: levelResult.leveledUp,
                    newLevel: levelResult.newLevel
                });

                ui.addCombatLog(`${vasen.getName()} gained ${expAmount} experience!`, 'exp');
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
            
            gameState.vasenCollection.push(newVasen);
            ui.addCombatLog(`${newVasen.getDisplayName()} has joined your party!`, 'tame');

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
    }

    // Handle guardian battle end
    handleGuardianBattleEnd(result, guardian) {
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

                let expMultiplier = 0.3;
                if (vasen.battleFlags.turnsOnField > 0) expMultiplier = 0.6;

                const expAmount = Math.floor(expYield * expMultiplier);
                if (expAmount > 0) {
                    const levelResult = vasen.addExperience(expAmount);

                    // Find existing entry or create new
                    let entry = battleResult.expGained.find(e => e.name === vasen.getDisplayName());
                    if (!entry) {
                        entry = { name: vasen.getDisplayName(), amount: 0, leveledUp: false, newLevel: vasen.level };
                        battleResult.expGained.push(entry);
                    }
                    entry.amount += expAmount;
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

        // Apply post-battle heal
        gameState.party.forEach(v => {
            if (v) {
                v.healPercent(GAME_CONFIG.POST_BATTLE_HEAL_PERCENT);
                v.currentMegin = v.maxMegin;
            }
        });

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
    }

    // End battle and return to exploration
    endBattle() {
        gameState.inCombat = false;

        // Apply post-battle healing (includes megin restore)
        gameState.applyPostBattleHealing();

        // Reset battle states
        gameState.party.forEach(v => {
            if (v) v.resetBattleState();
        });

        this.currentBattle = null;
        ui.hideCombatUI();
        this.refreshUI();
        gameState.saveGame();
    }

    // Heal vasen with item
    healVasenWithItem(vasenId, itemId) {
        const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
        const item = TAMING_ITEMS[itemId];

        if (!vasen || !item) return;

        // Use item
        if (!gameState.removeItem(itemId, 1)) {
            ui.showMessage('You don\'t have that item.', 'error');
            return;
        }

        // Calculate heal
        const isCorrectItem = vasen.species.tamingItem === itemId;
        const healPercent = isCorrectItem ? 0.8 : 0.5;
        const healed = vasen.healPercent(healPercent);

        ui.showMessage(`${vasen.getName()} health restored ${Math.round(healPercent * 100)}%. (+${healed} HP)`);
        this.refreshUI();
        gameState.saveGame();
    }
}

// Create global game instance
const game = new Game();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    game.init();

    // Global UI Lock  
    document.addEventListener('click', (e) => {
        if (gameState.uiLocked) {
            // Allow clicks inside any modal
            if (e.target.closest('.modal')) return;

            // Block everything else
            e.stopPropagation();
            e.preventDefault();
        }
    });

    // Set up global button handlers
    document.getElementById('explore-btn').addEventListener('click', () => game.explore());
    document.getElementById('challenge-btn').addEventListener('click', () => {
        // Check if we're in Ginnungagap for Endless Tower, otherwise challenge guardian
        if (gameState.currentZone === 'GINNUNGAGAP') {
            game.challengeEndlessTower();
        } else {
            game.challengeGuardian();
        }
    });

    // Combat action buttons
    document.getElementById('btn-swap').addEventListener('click', () => {
        document.getElementById('swap-options').classList.toggle('visible');
    });
    document.getElementById('btn-offer').addEventListener('click', () => game.showOfferModal());
    document.getElementById('btn-ask').addEventListener('click', () => game.handleAskItem());
    document.getElementById('btn-pass').addEventListener('click', () => game.handlePass());
    document.getElementById('btn-surrender').addEventListener('click', () => game.handleSurrender());
});
