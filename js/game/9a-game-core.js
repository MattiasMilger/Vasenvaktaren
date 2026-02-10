// =============================================================================
// 9a-game-core.js - Game Class, Menu Flow, and Core Lifecycle
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
            // NEW: Reset tutorial on page load only if player has tamed at least one Vasen
            // This allows the first tutorial to persist until first tame, but prevents reload exploit after
            if (!gameState.firstCombatTutorialShown && gameState.vasenCollection.length > 1) {
                // Length > 1 because starter counts as 1
                gameState.firstCombatTutorialShown = true;
                gameState.saveGame();
            }

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
                    <span class="element-badge element-${species.element.toLowerCase()}">${species.element}</span>
                    <span class="rarity-badge rarity-${species.rarity.toLowerCase()}">${species.rarity}</span>
                    <span class="family-badge">${species.family}</span>
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

        // Show intro dialogue FIRST, before creating anything
        ui.showDialogue(
    'Welcome, Väktare',
    `
        <p>The first rune has revealed itself to you:
            <span class="rune-symbol">${RUNES.URUZ.symbol}</span> ${RUNES.URUZ.name}
        </p>
        <p class="rune-hint">${RUNES.URUZ.effect}</p>
        <p>Your chosen companion stands ready at your side,
           equipped with the rune's power.</p>
        <p>You will also find items to help you tame new Väsen.</p>
    `,
    [
        {
            text: 'Begin Journey',
            class: 'btn-primary',
            callback: () => {
                // NOW initialize new game and create everything
                gameState.resetGame();

                // Create starter Vasen at starter level
                const starter = new VasenInstance(selectedStarterName, GAME_CONFIG.STARTER_LEVEL);

                // Give starting rune (Uruz)
                starter.equipRune('URUZ');
                starter.maxMegin = starter.calculateMaxMegin();
                starter.currentMegin = starter.maxMegin;

                // Add to collection and party
                gameState.vasenCollection.push(starter);
                gameState.party[0] = starter;

                // Add starting rune to collected
                gameState.collectedRunes.add('URUZ');

                // Give starting taming items from zone 1
const zone1Items = [
  'Mossy Bark',
  'Shed Antlers',
  'Elderflower Sprig',
  'Morning Dew',
  'Shedded Scale',
  'Festive Midsommarkrans'
];

// Copy + shuffle
const shuffled = [...zone1Items].sort(() => Math.random() - 0.5);

// Take the first N unique items based on config
const startingItems = shuffled.slice(0, GAME_CONFIG.STARTING_ITEMS_AMOUNT);

// Add one of each
startingItems.forEach(item => {
  gameState.addItem(item, 1);
});


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

    // End battle and return to exploration
    endBattle() {

        gameState.inCombat = false;

        // NEW: Stop showing tutorial when battle ends, but only if player has tamed at least one Vasen
        // This allows the first tutorial to persist across battles until first successful tame
        if (!gameState.firstCombatTutorialShown && gameState.vasenCollection.length > 1) {
            // Length > 1 because starter counts as 1
            gameState.firstCombatTutorialShown = true;
            gameState.saveGame();
        }

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

        ui.showMessage(`${vasen.getName()} health restored <span style="color: #a2ba92; font-weight: 700;">${Math.round(healPercent * 100)}%</span>. (+<span style="color: #a2ba92; font-weight: 700;">${healed}</span> HP)`);
        this.refreshUI();
        gameState.saveGame();
    }
}
