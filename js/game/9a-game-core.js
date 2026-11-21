// =============================================================================
// 9a-game-core.js - Game Class, Menu Flow, and Core Lifecycle
// =============================================================================

class Game {
    constructor() {
        this.currentCombat = null;
        this.pendingFirstTameMessage = false;
    }

    // Initialize the game
    init() {
        ui.init();

        // Check for existing save
        if (gameState.loadGame()) {
            // Reset tutorial on page load only if player has tamed at least one Vasen
            // This allows the first tutorial to persist until first tame, but prevents reload exploit after
            if (!gameState.firstCombatTutorialShown && gameState.vasenCollection.length > 1) {
                // Length > 1 because starter counts as 1
                gameState.firstCombatTutorialShown = true;
                gameState.saveGame();
            }

            // Same catch-up for the explore button tutorial glow: only stop
            // showing it once the player has actually tamed a väsen
            // (vasenCollection.length > 1, since the starter counts as 1).
            if (!gameState.firstExploreTutorialShown && gameState.vasenCollection.length > 1) {
                gameState.firstExploreTutorialShown = true;
                gameState.saveGame();
            }

            // Retroactively unlock all lore entries earned by existing progress
            gameState.retroactivelyUnlockLoreEntries();

            // Has save data - go to game screen
            this.showGameScreen();
        } else {
            // No save - show main menu
            this.showMainMenu();
        }

        // Remove loading class to reveal the correct screen
        document.body.classList.remove('loading');
    }

    // Show main menu
    showMainMenu() {
        ui.showScreen('mainMenu');

        document.getElementById('new-game-btn').onclick = () => this.showStarterSelection();
    }

    // Show starter selection
    showStarterSelection() {
        ui.showScreen('starterSelect');

        // Card rendering, card highlighting and the Confirm button live in the UI
        // layer; Game only decides what selecting and confirming mean.
        ui.renderStarterSelection(
            STARTER_VASEN,
            speciesName => this.selectStarter(speciesName),
            () => this.confirmStarter()
        );
    }

    // Select starter (the UI layer handles the card highlight and enables Confirm)
    selectStarter(speciesName) {
        this.selectedStarter = speciesName;
    }

    // Confirm starter selection
    confirmStarter() {
        if (!this.selectedStarter) return;

        // Store the selected starter temporarily (don't create anything yet)
        const selectedStarterName = this.selectedStarter;
        const selectedStarterSpecies = VASEN_SPECIES[selectedStarterName];

        // Roll the starter's temperament now so the same temperament shown in
        // the welcome dialogue is the one actually applied to the created väsen.
        const starterTemperamentKey = getRandomTemperament();
        const starterTemperament = TEMPERAMENTS[starterTemperamentKey];

        // Determine the starting items now so the same items shown in the
        // welcome dialogue are the ones actually granted when the player
        // clicks "Begin Journey" (mirrors the guardian defeat flow, which
        // rolls new-zone items before displaying them in the victory message).
        // Drawn from the taming items of every väsen that spawns in Zone 1 (Trollskogen).
        const zone1Items = getItemsForZone('ZONE1');

        // Copy + shuffle
        const shuffledZone1Items = [...zone1Items].sort(() => Math.random() - 0.5);

        // Guarantee one item desired by a common Nature väsen of Zone 1: the
        // first wild fights are Nature-only and the tutorial spawns väsen whose
        // desired item the player carries, so the first fight is always tamable.
        const guaranteedItem = this.pickTutorialStartingItem('ZONE1');
        const guaranteedIndex = shuffledZone1Items.indexOf(guaranteedItem);
        if (guaranteedIndex > 0) {
            shuffledZone1Items.splice(guaranteedIndex, 1);
            shuffledZone1Items.unshift(guaranteedItem);
        }

        // Take the first N unique items based on config
        const startingItems = shuffledZone1Items.slice(0, GAME_CONFIG.STARTING_ITEMS_AMOUNT);

        // Create the starter now (it is only added to the game in the callback)
        // so the starting rune can be rolled from the runes actually useful to it.
        const starter = new VasenInstance(selectedStarterName, GAME_CONFIG.STARTER_LEVEL, starterTemperamentKey);
        const runePool = getSoloValidRunesForVasen(starter);
        const starterRuneId = runePool.length > 0
            ? runePool[Math.floor(Math.random() * runePool.length)]
            : 'URUZ';

        // Show intro dialogue FIRST, before applying anything. The UI layer builds
        // the popup from exactly the values rolled above, so what the player sees
        // is what the callback below applies.
        ui.showWelcomeDialogue(
            selectedStarterSpecies,
            starterTemperament,
            startingItems,
            starterRuneId,
            () => {
                // initialize new game and create everything
                gameState.resetGame();

                // Give the rolled starting rune
                starter.equipRune(starterRuneId);
                starter.recalculateMaxMegin();

                // Add to collection and party
                gameState.vasenCollection.push(starter);
                gameState.party[0] = starter;

                // Add starting rune to collected
                gameState.collectedRunes.add(starterRuneId);

                // Give the starting taming items selected above (matches what
                // was shown in the welcome dialogue)
                startingItems.forEach(item => {
                    gameState.addItem(item, 1);
                });

                // Start the game for real
                gameState.gameStarted = true;
                gameState.saveGame();

                // Unlock standard lore entries and starter-specific entries
                gameState.unlockStandardLoreEntries();
                const starterSpecies = VASEN_SPECIES[selectedStarterName];
                if (starterSpecies) {
                    const speciesKey = findLoreEntryKey('vasen', selectedStarterName);
                    if (speciesKey) gameState.unlockLoreEntry(speciesKey);

                    const familyKey = findLoreEntryKey('family', starterSpecies.family);
                    if (familyKey) gameState.unlockLoreEntry(familyKey);
                }

                game.showGameScreen();

                // First pointer, shown once the game screen (and the glowing
                // Explore button) is actually visible
                if (ui.isBeginnerTutorialEnabled()) {
                    ui.showDialogue(
                        'Into the Wilds',
                        ui.getTutorialTipHTML('To start your journey - Press <strong>Explore</strong> to search for väsen to tame.'),
                        [{ text: 'Got it', callback: null }],
                        true,
                        null,
                        'compass'
                    );
                }
            }
        );
    }

    // Random taming item of a common Nature väsen spawning in the zone
    // (falls back to any Nature, then any spawn). null if the zone has none.
    pickTutorialStartingItem(zoneKey) {
        const zone = ZONES[zoneKey];
        if (!zone) return null;
        const spawns = (zone.spawns === 'ALL' ? VASEN_LIST : zone.spawns)
            .filter(name => VASEN_SPECIES[name]?.tamingItem);
        const isNature = name => VASEN_SPECIES[name].element === ELEMENTS.NATURE;
        const isCommon = name => VASEN_SPECIES[name].rarity === RARITIES.COMMON;

        const pools = [
            spawns.filter(n => isNature(n) && isCommon(n)),
            spawns.filter(isNature),
            spawns
        ];
        const pool = pools.find(p => p.length > 0);
        if (!pool) return null;
        return VASEN_SPECIES[pool[Math.floor(Math.random() * pool.length)]].tamingItem;
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

    // Wire the combat's UI callbacks; onEnd decides what happens when this combat type ends
    attachCombatCallbacks(onEnd) {
        const combat = this.currentCombat;
        combat.onLog = (msg, type) => ui.addCombatLog(msg, type);
        combat.onUpdate = () => ui.renderCombat(this.currentCombat);
        combat.onHit = (side, matchup) => ui.flashCombatant(side, matchup);
        combat.onAttack = (side, skillType) => ui.triggerAttackAnimation(side, skillType);
        combat.onKnockoutSwap = (callback) => ui.showKnockoutSwapModal(this.currentCombat, callback);
        combat.onEnd = onEnd;
    }

    // Unlock a lore entry and announce it; no-op for a missing or already unlocked key
    unlockLoreWithMessage(key) {
        if (key && gameState.unlockLoreEntry(key)) {
            ui.showLoreUnlockMessage(key);
        }
    }

    // After a loss or surrender, every party member is left at low health (at least 1 HP)
    leavePartyAtLowHealth() {
        gameState.party.forEach(v => {
            if (v) {
                v.currentHealth = Math.max(1, Math.floor(v.maxHealth * GAME_CONFIG.POST_COMBAT_HEAL_PERCENT));
            }
        });
    }

    restorePartyFully() {
        gameState.party.forEach(v => {
            if (v) v.restoreFully();
        });
    }

    // Small post-victory heal plus a full Megin refill
    applyVictoryHeal() {
        gameState.party.forEach(v => {
            if (v) {
                v.healPercent(GAME_CONFIG.POST_COMBAT_HEAL_PERCENT);
                v.currentMegin = v.maxMegin;
            }
        });
    }

    // End combat and return to exploration
    endCombat() {
        gameState.inCombat = false;

        // Stop showing tutorial when combat ends, but only if player has tamed at least one Vasen
        // This allows the first tutorial to persist across combats until first successful tame
        if (!gameState.firstCombatTutorialShown && gameState.vasenCollection.length > 1) {
            // Length > 1 because starter counts as 1
            gameState.firstCombatTutorialShown = true;
            gameState.saveGame();
        }

        // Likewise stop the explore button tutorial glow, but only once a väsen
        // has actually been tamed, so it persists through combats without a tame.
        if (!gameState.firstExploreTutorialShown && gameState.vasenCollection.length > 1) {
            gameState.firstExploreTutorialShown = true;
            gameState.saveGame();
            ui.updateExploreButton();
        }

        // Apply post-combat healing (includes megin restore)
        gameState.applyPostCombatHealing();

        // Reset combat states
        gameState.party.forEach(v => {
            if (v) v.resetCombatState();
        });

        this.currentCombat = null;
        ui.hideCombatUI();
        this.refreshUI();
        gameState.saveGame();

        // Show the first-tame guidance popup once, right after returning to
        // exploration (i.e. once the Victory dialogue's Continue button has
        // been clicked), mirroring the explore popups (title + confirm button).
        if (this.pendingGuardianHint) {
            this.pendingGuardianHint = false;
            const guardian = ZONES[gameState.currentZone]?.guardian;
            if (guardian && ui.isBeginnerTutorialEnabled() && gameState.defeatedGuardians.size === 0) {
                const guardianLevel = guardian.team[0].level;
                ui.showDialogue(
                    'A Full Party',
                    `<p>Three väsen now walk beside you. The forest feels a little less hostile.</p>
                     ${ui.getTutorialTipHTML(`Keep exploring until all of your väsen are <strong>Lvl ${guardianLevel}</strong> or higher, then press <strong>Challenge Guardian</strong> to face this land's guardian and open the way onward.`)}
                     <div class="tutorial-complete">
                         <div class="tutorial-complete-label">Tutorial complete</div>
                         <p>From here on, the path is yours. Trust your wits, Väktare.</p>
                     </div>`,
                    [{ text: `${uiIcon('compass')}Onward`, callback: null }],
                    false
                );
            }
        }

        if (this.pendingFirstTameMessage) {
            this.pendingFirstTameMessage = false;
            if (ui.isBeginnerTutorialEnabled()) {
                ui.showDialogue(
                    'First Tame!',
                    `<p>Well done! You've tamed your first väsen.</p>
                     <p>To tame more, try to <strong>interrogate</strong> wild väsen in combat, or read descriptions carefully to figure out what they desire.
                     <br>Then use the <strong>Offer Item</strong> button and defeat them.</p>
                     <p>You can find more tips in the <strong>Game Guide</strong>.</p>
                     ${ui.getTutorialTipHTML('Tame more väsen to fill your party.')}`,
                    [{ text: `${uiIcon('compass')}Onward`, callback: null }],
                    false
                );
            }
        }
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
        const healPercent = isCorrectItem ? GAME_CONFIG.CORRECT_ITEM_HEAL_PERCENT : GAME_CONFIG.WRONG_ITEM_HEAL_PERCENT;
        const healed = vasen.healPercent(healPercent);

        ui.showMessage(`${vasen.getName()} health restored <span style="font-weight: 700;">${Math.round(healPercent * 100)}%</span>. (+<span style="font-weight: 700;">${healed}</span> HP)`, 'success');
        this.refreshUI();
        gameState.saveGame();
    }
}
