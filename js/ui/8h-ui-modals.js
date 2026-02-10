// =============================================================================
// 8h-ui-modals.js - Dialogue System, Offer Flow, and Encounter Results
// =============================================================================

    // Show dialogue modal
UIController.prototype.showDialogue = function(title, message, buttons = [{ text: 'Confirm', callback: null }], dismissible = true, extraClass = null) {
    const modal = document.getElementById('dialogue-modal');
    document.getElementById('dialogue-title').textContent = title;
    document.getElementById('dialogue-message').innerHTML = message;

    gameState.uiLocked = true;
    modal.dataset.dismissible = dismissible ? 'true' : 'false';

    const btnContainer = document.getElementById('dialogue-buttons');
    btnContainer.innerHTML = '';

    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `btn ${btn.class || 'btn-primary'}`;
        button.innerHTML = btn.text;

        // Handle disabled state
        if (btn.disabled) {
            button.disabled = true;
            button.classList.add('disabled');
        }

        button.onclick = () => {
            modal.classList.remove('active');
            if (extraClass) modal.classList.remove(extraClass);
            gameState.uiLocked = false;
            ui.checkAndHideOverlay();

            const exploreBtn = document.getElementById('explore-btn');
            if (exploreBtn) exploreBtn.focus();

            if (btn.callback) btn.callback();
        };

        btnContainer.appendChild(button);
    });

    const exploreBtn = document.getElementById('explore-btn');
if (exploreBtn) exploreBtn.blur();

// Always reset old dialogue classes
modal.classList.remove(
    'move-vasen-dialogue',
    'swap-into-party-dialogue'
);

// Add new class if provided
if (extraClass) {
    modal.classList.add(extraClass);
}

ui.showModalOverlay();
modal.classList.add('active');

const firstButton = btnContainer.querySelector('button:not([disabled])');
if (firstButton) firstButton.focus();

};

    // Show offer item modal
    UIController.prototype.showOfferModal = function(battle) {
        const modal = document.getElementById('offer-modal');
        const itemList = document.getElementById('offer-item-list');
        const closeBtn = document.getElementById('close-offer-modal');
        itemList.innerHTML = '';

        const items = Object.entries(gameState.itemInventory);
        // Sort items alphabetically by name
        items.sort(([aId], [bId]) => {
            const aName = TAMING_ITEMS[aId]?.name || aId;
            const bName = TAMING_ITEMS[bId]?.name || bId;
            return aName.localeCompare(bName);
        });

        if (items.length === 0) {
            itemList.innerHTML = '<p class="empty-message">You have no items to offer.</p>';
        } else {
            // NEW: Check which item is correct for tutorial highlighting
            const enemySpecies = battle.enemyActive.speciesName;
            const correctItem = VASEN_SPECIES[enemySpecies]?.tamingItem;
            const shouldShowTutorial = !gameState.firstCombatTutorialShown && battle.isWildEncounter;

            items.forEach(([itemId, count]) => {
                const item = TAMING_ITEMS[itemId];
                if (!item) return;

                const itemBtn = document.createElement('button');
                itemBtn.className = 'offer-item-btn';

                // NEW: Add tutorial class if this is the correct item
                if (shouldShowTutorial && itemId === correctItem) {
                    itemBtn.classList.add('tutorial-blink');
                }

                itemBtn.innerHTML = `
                    <span class="offer-item-name">${item.name}</span>
                    <span class="offer-item-count">x${count}</span>
                `;
                itemBtn.onclick = () => {
                    this.showOfferConfirmation(battle, itemId);
                };
                itemList.appendChild(itemBtn);
            });
        }

        // Show the close button when displaying item list
        closeBtn.style.display = 'block';
        closeBtn.onclick = () => {
            modal.classList.remove('active');
            ui.checkAndHideOverlay();
        };
        ui.showModalOverlay();
        modal.classList.add('active');
    };

    // Show offer confirmation
    UIController.prototype.showOfferConfirmation = function(battle, itemId) {
        const modal = document.getElementById('offer-modal');
        const itemList = document.getElementById('offer-item-list');
        const closeBtn = document.getElementById('close-offer-modal');
        const item = TAMING_ITEMS[itemId];

        // Hide the original close button since we have our own buttons
        closeBtn.style.display = 'none';

        itemList.innerHTML = `
            <div class="offer-confirmation">
                <h4 class="offer-item-title">${item.name}</h4>
                <p class="offer-item-description">${this.highlightItemKeywords(item.description)}</p>
                <div class="offer-confirmation-buttons">
                    <button class="btn btn-secondary" onclick="ui.showOfferModal(game.currentBattle)">Cancel</button>
                    <button class="btn btn-primary" onclick="ui.confirmOfferItem('${itemId}')">Confirm</button>
                </div>
            </div>
        `;
    };

    // Confirm offer item
    UIController.prototype.confirmOfferItem = function(itemId) {
        const modal = document.getElementById('offer-modal');
        modal.classList.remove('active');
        ui.checkAndHideOverlay();
        game.handleOfferItem(itemId);
    };

    // Show ally select modal (for target selection)
    UIController.prototype.showAllySelectionModal = function(battle, abilityName, callback) {
        const modal = document.getElementById('ally-select-modal');
        const ability = ABILITIES[abilityName];
        document.getElementById('ally-select-ability-name').textContent = ability ? ability.name : abilityName;

        const list = document.getElementById('ally-select-list');
        list.innerHTML = '';

        if (!battle) return;

        battle.playerTeam.forEach((vasen, index) => {
            if (vasen.isKnockedOut()) return;

            const btn = document.createElement('button');
            btn.className = 'ally-select-btn';
            btn.innerHTML = this.createStandardVasenCardHTML(vasen, true); // true = show combat info
            btn.onclick = () => {
                modal.classList.remove('active');
                ui.checkAndHideOverlay();
                callback(index);
            };
            list.appendChild(btn);
        });

        document.getElementById('close-ally-select-modal').onclick = () => {
            modal.classList.remove('active');
            ui.checkAndHideOverlay();
            document.activeElement.blur();
        };
        ui.showModalOverlay();
        modal.classList.add('active');
    };

    // Show knockout swap modal
UIController.prototype.showKnockoutSwapModal = function(battle, callback) {
    GameState.uiLocked = true;

    const modal = document.getElementById('knockout-swap-modal');
    modal.dataset.dismissible = 'false'; // cannot skip

    const vasenList = document.getElementById('knockout-swap-list');
    vasenList.innerHTML = '';

    const availableVasen = battle.playerTeam.filter((v, i) =>
        i !== battle.playerActiveIndex && !v.isKnockedOut()
    );

    // No available allies -> battle ends or whatever your logic is
    if (availableVasen.length === 0) {
        modal.classList.remove('active');
        GameState.uiLocked = false;
        ui.checkAndHideOverlay();
        callback(null);
        return;
    }

    // If only one ally is alive -> auto swap (your existing logic)
    if (availableVasen.length === 1) {
        const actualIndex = battle.playerTeam.indexOf(availableVasen[0]);
        modal.classList.remove('active');
        GameState.uiLocked = false;
        ui.checkAndHideOverlay();
        callback(actualIndex);
        return;
    }

    // Build buttons for each available Vasen
    availableVasen.forEach(vasen => {
        const actualIndex = battle.playerTeam.indexOf(vasen);

        const vasenBtn = document.createElement('button');
        vasenBtn.className = 'knockout-swap-btn';
        vasenBtn.innerHTML = this.createStandardVasenCardHTML(vasen, true); // true = show combat info

        // Click handler
        vasenBtn.onclick = () => {
            modal.classList.remove('active');
            GameState.uiLocked = false;
            ui.checkAndHideOverlay();
            callback(actualIndex);
        };

        vasenList.appendChild(vasenBtn);
    });

    ui.showModalOverlay();
    modal.classList.add('active');
};

    // Show encounter result
    UIController.prototype.showEncounterResult = function(result) {
        switch (result.type) {
            case 'vasen':
                this.showDialogue(
    'Wild Encounter!',
    `<p>A wild <strong>${result.vasen.getDisplayName()}</strong> appears!</p>`,
    [{ text: 'Battle!', callback: () => game.startBattle(result.vasen) }],
    false // <-- non-dismissible
);
                break;

            case 'item':
                this.showDialogue(
    'Item Found!',
    `<p>${this.highlightItemKeywords(result.dialogue)}</p>`,
    [
        { text: 'Confirm', callback: null, class: 'btn-primary' },
        { text: 'Next', callback: () => game.explore(), class: 'btn-primary' }
    ],
    false
);
                break;

            case 'well':
                this.showDialogue(
    'Sacred Well',
    `<p>${result.dialogue}</p>`,
    [
        { text: 'Confirm', callback: null, class: 'btn-primary' },
        { text: 'Next', callback: () => game.explore(), class: 'btn-primary' }
    ],
    false
);

                break;

            case 'rune':
                this.showDialogue(
    'Rune Discovered!',
    `<p>${result.dialogue}</p><p class="rune-reveal"><span class="rune-symbol large">${RUNES[result.runeId].symbol}</span> ${RUNES[result.runeId].name}</p><p class="rune-effect">${RUNES[result.runeId].effect}</p>`,
    [
        { text: 'Confirm', callback: null, class: 'btn-primary' },
        { text: 'Next', callback: () => game.explore(), class: 'btn-primary' }
    ],
    false
);

        }
    };

    // Show battle result
    UIController.prototype.showBattleResult = function(result) {
        let message = '';
        let buttons = [{
            text: 'Continue (2)',
            callback: () => game.endBattle(),
            disabled: true // Initially disabled to prevent spam clicking
        }];

        if (result.victory) {
            message = '<p>Your party triumphs!</p>';

            if (result.tamed) {
                message += `<p><strong>${result.tamedVasen.getDisplayName()}</strong> has joined you!</p>`;
            }

            if (result.expGained && result.expGained.length > 0) {
                message += '<div class="exp-results">';
                result.expGained.forEach(exp => {
                    message += `<p>${exp.name} gained ${exp.amount} experience!`;
                    if (exp.leveledUp) {
                        message += ` <strong>Level up! Now Lvl ${exp.newLevel}!</strong>`;
                    }
                    message += '</p>';
                });
                message += '</div>';
            }
        } else {
            message = `<p>${result.message}</p>`;
        }

        this.showDialogue(result.victory ? 'Victory!' : 'Defeat', message, buttons, false);

        // Countdown timer for the button
        let remainingSeconds = Math.ceil(GAME_CONFIG.BATTLE_RESULT_BUTTON_DELAY / 1000);
        const countdownInterval = setInterval(() => {
            remainingSeconds--;
            const dialogueButtons = document.querySelectorAll('#dialogue-buttons button');
            dialogueButtons.forEach(btn => {
                if (btn.textContent.startsWith('Continue')) {
                    if (remainingSeconds > 0) {
                        btn.textContent = `Continue (${remainingSeconds})`;
                    }
                }
            });
        }, 1000);

        // Enable the continue button after a delay to prevent spam clicking
        setTimeout(() => {
            clearInterval(countdownInterval);
            const dialogueButtons = document.querySelectorAll('#dialogue-buttons button');
            dialogueButtons.forEach(btn => {
                if (btn.textContent.startsWith('Continue')) {
                    btn.disabled = false;
                    btn.classList.remove('disabled');
                    btn.textContent = 'Continue';
                }
            });
        }, GAME_CONFIG.BATTLE_RESULT_BUTTON_DELAY);
    };
