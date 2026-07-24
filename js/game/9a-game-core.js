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

        const starterOptions = document.getElementById('starter-options');
        starterOptions.innerHTML = '';

        STARTER_VASEN.forEach(speciesName => {
            const species = VASEN_SPECIES[speciesName];
            if (!species) return;

            const card = document.createElement('div');
            card.className = 'starter-card';
            card.innerHTML = `
                <div class="starter-image-container holo-${species.rarity.toLowerCase()}">
                    <img src="${species.image}" alt="${species.name}" class="starter-image">
                </div>
                <h3 class="starter-name">${species.name}</h3>
                <div class="starter-badges">
                    <div class="element-matchup-collapsible">
                        <span class="element-badge element-${species.element.toLowerCase()} clickable-element" onclick="toggleElementMatchup(this, event)">${species.element}</span>
                        ${ui.generateDefensiveMatchupsHTML(species.element)}
                    </div>
                    <div class="rarity-matchup-collapsible family-matchup-collapsible">
                        <span class="rarity-badge rarity-${species.rarity.toLowerCase()} clickable-rarity" onclick="toggleRarityDescription(this, event)">${species.rarity}</span>
                        <div class="rarity-description-popup">
                            <p><strong>${species.rarity}</strong><br>
                            ${RARITY_DESCRIPTIONS[species.rarity] || ''}</p>
                        </div>
                    </div>
                    <div class="family-matchup-collapsible">
                        <span class="family-badge clickable-family" onclick="toggleFamilyDescription(this, event)">${species.family}</span>
                        <div class="family-description-popup">
                            <p><strong>${species.family}</strong><br>
                            ${FAMILY_DESCRIPTIONS[species.family] || 'No description available.'}</p>
                            ${FAMILY_PASSIVES[species.family] ? `
                                <hr style="margin: 8px 0; border: none; border-top: 1px solid var(--border-color);">
                                <p><strong>Passive: ${FAMILY_PASSIVES[species.family].name}</strong><br>
                                ${FAMILY_PASSIVES[species.family].description}</p>
                            ` : ''}
                        </div>
                    </div>
                </div>
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
        const zone1Items = [
            'Mossy Bark',
            'Shed Antlers',
            'Elderflower Sprig',
            'Morning Dew',
            'Shedded Scale',
            'Festive Midsommarkrans'
        ];

        // Copy + shuffle
        const shuffledZone1Items = [...zone1Items].sort(() => Math.random() - 0.5);

        // Take the first N unique items based on config
        const startingItems = shuffledZone1Items.slice(0, GAME_CONFIG.STARTING_ITEMS_AMOUNT);

        let startingItemsMessage = '';
        startingItems.forEach(itemId => {
            const itemName = TAMING_ITEMS[itemId]?.name || itemId;
            startingItemsMessage += `<p>You received: <strong>${itemName}</strong>!</p>`;
        });

        const temperamentMessage = selectedStarterSpecies
            ? `<p>Your <strong>${selectedStarterSpecies.name}</strong> has a <strong>${starterTemperament.name}</strong> temperament
               (+${starterTemperament.modifier} ${capitalize(starterTemperament.positive)} / -${starterTemperament.modifier} ${capitalize(starterTemperament.negative)}).</p>`
            : '';

        // Show intro dialogue FIRST, before creating anything
        ui.showDialogue(
    'Welcome, Väktare',
    `
        <p>The first rune has revealed itself to you:
            <span class="rune-symbol">${RUNES.URUZ.symbol}</span> ${RUNES.URUZ.name}
        </p>
        <p class="rune-hint">${RUNES.URUZ.effect}</p>
        ${temperamentMessage}
        ${startingItemsMessage}
    `,
    [
        {
            text: 'Begin Journey',
            class: 'btn-primary',
            callback: () => {
                // initialize new game and create everything
                gameState.resetGame();

                // Create starter Vasen at starter level with the pre-rolled temperament
                const starter = new VasenInstance(selectedStarterName, GAME_CONFIG.STARTER_LEVEL, starterTemperamentKey);

                // Give starting rune (Uruz)
                starter.equipRune('URUZ');
                starter.maxMegin = starter.calculateMaxMegin();
                starter.currentMegin = starter.maxMegin;

                // Add to collection and party
                gameState.vasenCollection.push(starter);
                gameState.party[0] = starter;

                // Add starting rune to collected
                gameState.collectedRunes.add('URUZ');

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
                    // Starter väsen species entry
                    const speciesKey = LORE_ENTRY_KEYS.find(k =>
                        LORE_ENTRIES[k].unlockType === 'vasen' &&
                        LORE_ENTRIES[k].unlockKey === selectedStarterName
                    );
                    if (speciesKey) gameState.unlockLoreEntry(speciesKey);

                    // Starter family entry (always Vätte)
                    const familyKey = LORE_ENTRY_KEYS.find(k =>
                        LORE_ENTRIES[k].unlockType === 'family' &&
                        LORE_ENTRIES[k].unlockKey === starterSpecies.family
                    );
                    if (familyKey) gameState.unlockLoreEntry(familyKey);
                }

                game.showGameScreen();
            }
        },
        {
            text: 'Cancel',
            class: 'btn-secondary',
            callback: () => {
                // Close popup and return to starter selection
                ui.hideModalOverlay();
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
        if (this.pendingFirstTameMessage) {
            this.pendingFirstTameMessage = false;
            ui.showDialogue(
                'First Tame!',
                `<p>Well done! You've tamed your first väsen.</p>
                 <p>To tame more, try to <strong>interrogate</strong> wild väsen in combat, or read their item descriptions carefully to figure out what they desire.</p>
                 <p>You can find more tips in the <strong>Game Guide</strong>.</p>`,
                [{ text: 'Confirm', callback: null }],
                false
            );
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
