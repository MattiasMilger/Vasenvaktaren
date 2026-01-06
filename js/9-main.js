// =============================================================================
// 9-main.js - Main Game Controller and Initialization
// =============================================================================

class Game {
    constructor() {
        this.currentBattle = null;
        this.endlessTowerMode = null;
        this.endlessTowerFloor = 0;
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

        // Save and show game
        gameState.saveGame();

        // Show intro dialogue
        ui.showDialogue(
            'Welcome, Väktare',
            `<p>The first rune has revealed itself to you: <span class="rune-symbol">${RUNES.URUZ.symbol}</span> ${RUNES.URUZ.name}</p>
             <p class="rune-hint">${RUNES.URUZ.effect}</p>
             <p>Your <strong>${starter.getDisplayName()}</strong> stands ready at your side, equipped with the rune's power.</p>`,
            [{ text: 'Begin Journey', callback: () => this.showGameScreen() }]
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

        // Check for endless tower modes
        if (gameState.currentZone === 'endless-wild') {
            this.startEndlessTower('wild');
            return;
        }
        if (gameState.currentZone === 'endless-guardian') {
            this.startEndlessTower('guardian');
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

        ui.showDialogue(
            guardian.name,
            `<p>${isRematch ? guardian.dialogue.rematch : guardian.dialogue.challenge}</p>`,
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
            ]
        );
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
        ui.addCombatLog('Turn 1 begins.', 'turn');
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
        ui.addCombatLog('Turn 1 begins.', 'turn');
    }

    // Handle ability use
    handleAbilityUse(abilityName) {
        if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
        this.currentBattle.executePlayerAction({ type: 'ability', abilityName });
    }

    // Handle swap
    handleSwap(targetIndex) {
        if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
        this.currentBattle.executePlayerAction({ type: 'swap', targetIndex });
    }

    // Handle gift item
    handleGiftItem(itemId) {
        if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
        if (!this.currentBattle.isWildEncounter) return;

        // Use item from inventory
        if (!gameState.removeItem(itemId, 1)) {
            ui.showMessage('You don\'t have that item.', 'error');
            return;
        }

        this.currentBattle.executePlayerAction({ type: 'gift', itemId });
    }

    // Handle ask about item
    handleAskItem() {
        if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
        if (!this.currentBattle.isWildEncounter) return;

        this.currentBattle.executePlayerAction({ type: 'ask' });
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

    // Show gift modal
    showGiftModal() {
        if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
        if (!this.currentBattle.isWildEncounter) return;
        ui.showGiftModal(this.currentBattle);
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
                [{ text: 'Continue', callback: () => this.endBattle() }]
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
            
            // Heal to full before adding to collection
            newVasen.currentHealth = newVasen.maxHealth;
            newVasen.currentMegin = newVasen.maxMegin;
            
            gameState.vasenCollection.push(newVasen);  // ← Now it's healed when added
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
                [{ text: 'Continue', callback: () => this.endBattle() }]
            );
            return;
        }

        // Victory!
        const wasFirstClear = !gameState.defeatedGuardians.has(gameState.currentZone);

        // Mark zone as cleared
        gameState.defeatedGuardians.add(gameState.currentZone);

        // Unlock next zone
        const currentIndex = ZONE_ORDER.indexOf(gameState.currentZone);
        if (currentIndex < ZONE_ORDER.length - 1) {
            gameState.unlockedZones.add(ZONE_ORDER[currentIndex + 1]);
        }

        // Check if this was the final guardian (Gylfe)
        if (gameState.currentZone === 'varldens-ande' && wasFirstClear) {
            gameState.endlessTowerUnlocked = true;
            ui.addCombatLog('Endless Tower unlocked: Wild and Guardian modes available.', 'unlock');
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

        if (wasFirstClear && currentIndex < ZONE_ORDER.length - 1) {
            const nextZone = ZONES[ZONE_ORDER[currentIndex + 1]];
            message += `<p><strong>${nextZone.name}</strong> unlocked!</p>`;
        }

        if (gameState.currentZone === 'varldens-ande' && wasFirstClear) {
            message += '<p><strong>Endless Tower</strong> unlocked!</p>';
        }

        ui.showDialogue('Victory!', message, [{ text: 'Continue', callback: () => this.endBattle() }]);

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
        const healPercent = isCorrectItem ? 0.8 : 0.4;
        const healed = vasen.healPercent(healPercent);

        ui.showMessage(`${vasen.getName()} health restored ${Math.round(healPercent * 100)}%. (+${healed} HP)`);
        this.refreshUI();
        gameState.saveGame();
    }

    // Start endless tower
    startEndlessTower(mode) {
        this.endlessTowerMode = mode;
        this.endlessTowerFloor = 1;

        ui.showDialogue(
            `Endless Tower - ${mode === 'wild' ? 'Wild' : 'Guardian'}`,
            mode === 'wild' ?
                '<p>Each floor brings stronger wild Väsen. Levels increase with every victory. Taming is disabled and attribute changes persist between floors. Prepare your party carefully.</p>' :
                '<p>Each floor brings a stronger Guardian. Health and attribute changes are reset between floors.</p>',
            [
                {
                    text: 'Enter',
                    callback: () => this.startEndlessTowerFloor()
                },
                {
                    text: 'Cancel',
                    class: 'btn-secondary',
                    callback: () => {
                        this.endlessTowerMode = null;
                        this.endlessTowerFloor = 0;
                    }
                }
            ]
        );
    }

    // Start endless tower floor
    startEndlessTowerFloor() {
        gameState.inCombat = true;

        const level = 29 + this.endlessTowerFloor; // Starts at 30

        // Get player team
        const playerTeam = gameState.party.filter(p => p !== null);

        if (this.endlessTowerMode === 'wild') {
            // Create random wild vasen
            const speciesName = getRandomSpawnFromZone('GINNUNGAGAP');
            const enemyVasen = createWildVasen(speciesName, level);
            enemyVasen.resetBattleState();

            // Don't reset player battle state in wild mode (persists)
            if (this.endlessTowerFloor === 1) {
                playerTeam.forEach(v => v.resetBattleState());
            }

            this.currentBattle = new Battle(playerTeam, [enemyVasen], BATTLE_TYPES.ENDLESS_WILD);
            this.currentBattle.isEndlessTower = true;
            this.currentBattle.endlessTowerMode = 'wild';
        } else {
            // Create random guardian team
            const enemyTeam = createRandomGuardianTeam(level);
            enemyTeam.forEach(v => v.resetBattleState());
            playerTeam.forEach(v => {
                v.resetBattleState();
                v.currentHealth = v.maxHealth;
                v.currentMegin = v.maxMegin;
            });

            this.currentBattle = new Battle(playerTeam, enemyTeam, BATTLE_TYPES.ENDLESS_GUARDIAN);
            this.currentBattle.isEndlessTower = true;
            this.currentBattle.endlessTowerMode = 'guardian';
            this.currentBattle.guardianName = ENDLESS_TOWER_NAMES[Math.floor(Math.random() * ENDLESS_TOWER_NAMES.length)];
        }

        this.currentBattle.onLog = (msg, type) => ui.addCombatLog(msg, type);
        this.currentBattle.onUpdate = () => ui.renderCombat(this.currentBattle);
        this.currentBattle.onHit = (side) => ui.flashCombatant(side);
        this.currentBattle.onKnockoutSwap = (callback) => ui.showKnockoutSwapModal(this.currentBattle, callback);
        this.currentBattle.onEnd = (result) => this.handleEndlessTowerBattleEnd(result);

        ui.showCombatUI();
        ui.clearCombatLog();
        ui.renderCombat(this.currentBattle);
        ui.addCombatLog(`Floor ${this.endlessTowerFloor}`, 'floor');

        if (this.endlessTowerMode === 'wild') {
            ui.addCombatLog(`A wild ${this.currentBattle.enemyTeam[0].getDisplayName()} appears!`, 'encounter');
        } else {
            ui.addCombatLog(`${this.currentBattle.guardianName} challenges you!`, 'encounter');
        }
        ui.addCombatLog('Turn 1 begins.', 'turn');
    }

    // Handle endless tower battle end
    handleEndlessTowerBattleEnd(result) {
        if (result.surrendered || !result.victory) {
            // Record the run
            const teamData = gameState.party.filter(p => p !== null).map(v => ({
                species: v.speciesName,
                level: v.level,
                temperament: v.temperament.name,
                runes: v.runes.slice()
            }));

            const recordKey = this.endlessTowerMode;
            const currentRecord = gameState.endlessTowerRecords[recordKey];
            const isNewRecord = this.endlessTowerFloor > currentRecord.floor;

            if (isNewRecord) {
                gameState.endlessTowerRecords[recordKey] = {
                    floor: this.endlessTowerFloor,
                    team: teamData
                };
                gameState.saveGame();
            }

            // Heal party
            gameState.party.forEach(v => {
                if (v) {
                    v.currentHealth = v.maxHealth;
                    v.currentMegin = v.maxMegin;
                    v.resetBattleState();
                }
            });

            ui.showEndlessTowerResult({
                floor: this.endlessTowerFloor,
                mode: this.endlessTowerMode,
                newRecord: isNewRecord
            });

            return;
        }

        // Victory - continue to next floor
        this.endlessTowerFloor++;

        // Check for max floor
        if (this.endlessTowerFloor > 999) {
            // Record and exit
            const teamData = gameState.party.filter(p => p !== null).map(v => ({
                species: v.speciesName,
                level: v.level,
                temperament: v.temperament.name,
                runes: v.runes.slice()
            }));

            gameState.endlessTowerRecords[this.endlessTowerMode] = {
                floor: 999,
                team: teamData
            };

            gameState.party.forEach(v => {
                if (v) {
                    v.currentHealth = v.maxHealth;
                    v.currentMegin = v.maxMegin;
                    v.resetBattleState();
                }
            });

            ui.showEndlessTowerResult({
                floor: 999,
                mode: this.endlessTowerMode,
                newRecord: true
            });

            gameState.saveGame();
            return;
        }

        ui.addCombatLog(`Floor ${this.endlessTowerFloor - 1} cleared.`, 'victory');

        // For guardian mode, heal between floors
        if (this.endlessTowerMode === 'guardian') {
            gameState.party.forEach(v => {
                if (v) {
                    v.currentHealth = v.maxHealth;
                    v.currentMegin = v.maxMegin;
                }
            });
        }

        // Small delay then start next floor
        setTimeout(() => {
            ui.addCombatLog(`Preparing floor ${this.endlessTowerFloor}...`, 'system');
            setTimeout(() => this.startEndlessTowerFloor(), 500);
        }, 1000);
    }

    // Exit endless tower
    exitEndlessTower() {
        this.endlessTowerMode = null;
        this.endlessTowerFloor = 0;
        this.currentBattle = null;
        gameState.inCombat = false;

        ui.hideCombatUI();
        ui.showMessage('Your party is fully healed.');
        this.refreshUI();
    }
}

// Create global game instance
const game = new Game();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    game.init();

    // Set up global button handlers
    document.getElementById('explore-btn').addEventListener('click', () => game.explore());
    document.getElementById('challenge-btn').addEventListener('click', () => game.challengeGuardian());

    // Combat action buttons
    document.getElementById('btn-swap').addEventListener('click', () => {
        document.getElementById('swap-options').classList.toggle('visible');
    });
    document.getElementById('btn-gift').addEventListener('click', () => game.showGiftModal());
    document.getElementById('btn-ask').addEventListener('click', () => game.handleAskItem());
    document.getElementById('btn-pass').addEventListener('click', () => game.handlePass());
    document.getElementById('btn-surrender').addEventListener('click', () => game.handleSurrender());
});
