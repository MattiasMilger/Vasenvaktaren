// =============================================================================
// 8h-ui-modals.js - Dialogue System, Welcome Dialogue, Offer Flow, and Encounter Results
// =============================================================================

// Stable id for a tip from its text: tags and numbers stripped, then hashed
function getTipId(text) {
    const plain = String(text).replace(/<[^>]*>/g, '').replace(/[0-9]+/g, '#').trim();
    let hash = 0;
    for (let i = 0; i < plain.length; i++) hash = (hash * 31 + plain.charCodeAt(i)) | 0;
    return 't' + (hash >>> 0).toString(36);
}

// Minimize or restore a tip (every copy on screen), remembered per save
function toggleTipMinimized(button) {
    const tip = button.closest('.tutorial-tip');
    if (!tip) return;
    const id = tip.dataset.tipId;
    const minimize = !tip.classList.contains('minimized');
    if (minimize) gameState.minimizedTips.add(id); else gameState.minimizedTips.delete(id);
    document.querySelectorAll(`.tutorial-tip[data-tip-id="${id}"]`).forEach(el => {
        el.classList.toggle('minimized', minimize);
        const btn = el.querySelector('.tutorial-tip-title');
        btn.setAttribute('aria-expanded', String(!minimize));
        btn.title = minimize ? 'Show this tip' : 'Minimize this tip';
    });
    gameState.saveGame();
}

    // Show dialogue modal
UIController.prototype.showDialogue = function(title, message, buttons = [{ text: 'Confirm', callback: null }], dismissible = true, extraClass = null, icon = null) {
    const modal = document.getElementById('dialogue-modal');
    const titleEl = document.getElementById('dialogue-title');
    titleEl.textContent = title;
    if (icon) titleEl.insertAdjacentHTML('afterbegin', uiIcon(icon, 20));
    document.getElementById('dialogue-message').innerHTML = message;

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


};

    // Short hint box for dialogues (styled by .tutorial-tip). Callers check
    // areTipsEnabled() first, so tips stay hidden when Disable Tutorial is on.
    // Clicking the "Tip" header minimizes the tip to a small pill; the choice
    // is kept per save (gameState.minimizedTips) and clicking again restores it.
    // tipId defaults to one derived from the text (tags and numbers ignored, so
    // a tip with a changing level or count keeps the same id).
    UIController.prototype.getTipHTML = function(text, tipId = getTipId(text)) {
        const minimized = !!(gameState.minimizedTips && gameState.minimizedTips.has(tipId));
        return `<div class="tutorial-tip${minimized ? ' minimized' : ''}" data-tip-id="${tipId}">
            <button type="button" class="tutorial-tip-title" onclick="toggleTipMinimized(this)" aria-expanded="${!minimized}" title="${minimized ? 'Show this tip' : 'Minimize this tip'}">Tip<span class="tutorial-tip-chevron" aria-hidden="true"></span></button>
            <p>${text}</p>
        </div>`;
    };

    // Show the "Welcome, Väktare" dialogue shown when a new game is confirmed.
    // Pure UI: Game rolls the temperament and starting items before calling this,
    // so what is displayed here is exactly what the caller goes on to apply.
    //   species:       the chosen starter's species data (VASEN_SPECIES entry)
    //   temperament:   the rolled temperament data (TEMPERAMENTS entry)
    //   startingItems: array of taming item ids the player will receive
    //   runeId:        the rolled starting rune id (RUNES key)
    //   modes:         the save modes chosen on the New Journey screen
    //   onBegin:       called when "Begin Journey" is clicked
    // The dialogue is non-dismissible; "Cancel" closes it and returns to the
    // starter selection screen, which was never left.
    // Temperament, rune and item names are clickable words that open info popups.
    UIController.prototype.showWelcomeDialogue = function(species, temperament, startingItems, runeId, modes, onBegin) {
        const itemsMessage = startingItems.length > 0
            ? `<p>You received: ${startingItems.map(id => `<strong>${this.getItemTextHTML(id)}</strong>`).join(', ')}</p>`
            : '';

        const vasenMessage = species
            ? `<p>Your <strong>${species.name}</strong>'s temperament is ${this.getTemperamentTextHTML(temperament)}.</p>
               <p>Your <strong>${species.name}</strong> equipped a ${this.getRuneTextHTML(runeId)} rune.</p>`
            : '';

        this.showDialogue(
    'Welcome, Väktare',
    `
        <p><em>The old paths stir once more, and the väsen await one who can earn their trust.</em></p>
        ${vasenMessage}
        ${itemsMessage}
        ${this.getWelcomeModesHTML(modes)}
    `,
    [
        {
            text: `${uiIcon('compass')}Begin Journey`,
            class: 'btn-primary',
            callback: onBegin
        },
        {
            text: 'Cancel',
            class: 'btn-secondary',
            callback: () => {
                // Close popup and return to starter selection
                this.hideModalOverlay();
            }
        }
    ],
    false // non-dismissible
);
    };

    // Show offer item modal
    UIController.prototype.showOfferModal = function(combat) {
        const modal = document.getElementById('offer-modal');
        const itemList = document.getElementById('offer-item-list');
        const closeBtn = document.getElementById('close-offer-modal');
        itemList.innerHTML = '';

        // Free-action tip, kept outside the scrolling list (hidden when Disable Tutorial is on)
        const max = GAME_CONFIG.MAX_OFFERS_PER_COMBAT;
        document.getElementById('offer-modal-tip').innerHTML = this.areTipsEnabled()
            ? this.getTipHTML(`Offering is a free action. You can offer up to ${max} item${max === 1 ? '' : 's'} per combat, but once the väsen gets the item it desires, it won't take any more.`)
            : '';

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
            // Check which item is correct for tutorial highlighting
            const enemySpecies = combat.enemyActive.speciesName;
            const correctItem = VASEN_SPECIES[enemySpecies]?.tamingItem;
            const shouldShowTutorial = game.getCombatTutorialStage(combat) === 'offer';

            let correctItemBtn = null;

            items.forEach(([itemId, count]) => {
                const item = TAMING_ITEMS[itemId];
                if (!item) return;

                const itemBtn = document.createElement('button');
                itemBtn.className = 'offer-item-btn';

                // Add tutorial class if this is the correct item
                if (shouldShowTutorial && itemId === correctItem) {
                    itemBtn.classList.add('tutorial-blink');
                    correctItemBtn = itemBtn;
                }

                itemBtn.innerHTML = `
                    <span class="offer-item-name">${inlineIcon('items')}${item.name}</span>
                    <span class="offer-item-count">x${count}</span>
                `;
                itemBtn.onclick = () => {
                    this.showOfferConfirmation(combat, itemId);
                };
                itemList.appendChild(itemBtn);
            });

            // Auto-scroll to the correct (glowing) item after the modal is visible
            if (correctItemBtn) {
                requestAnimationFrame(() => {
                    correctItemBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                });
            }
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
    UIController.prototype.showOfferConfirmation = function(combat, itemId) {
        const modal = document.getElementById('offer-modal');
        const itemList = document.getElementById('offer-item-list');
        const closeBtn = document.getElementById('close-offer-modal');
        const item = TAMING_ITEMS[itemId];

        // Hide the original close button since we have our own buttons
        closeBtn.style.display = 'none';

        let offerDesc = this.highlightItemKeywords(item.description);
        const escaped = item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        offerDesc = offerDesc.replace(new RegExp(escaped, 'i'), '<strong>$&</strong>');

        // Highlight the Offer button only if this is the correct taming item during the first combat tutorial
        const enemySpecies = combat.enemyActive.speciesName;
        const correctItem = VASEN_SPECIES[enemySpecies]?.tamingItem;
        const isCorrectItem = itemId === correctItem;
        const confirmClass = game.getCombatTutorialStage(combat) === 'offer' && isCorrectItem
            ? 'btn btn-primary tutorial-blink'
            : 'btn btn-primary';

        itemList.innerHTML = `
            <div class="offer-confirmation">
                <p class="offer-item-description">${offerDesc}</p>
                <div class="offer-confirmation-buttons">
                    <button class="${confirmClass}" onclick="ui.confirmOfferItem('${itemId}')">${uiIcon('items')}Offer</button>
                    <button class="btn btn-secondary" onclick="ui.showOfferModal(game.currentCombat)">Cancel</button>
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
    UIController.prototype.showAllySelectionModal = function(combat, skillName, callback) {
        const modal = document.getElementById('ally-select-modal');
        const skill = ABILITIES[skillName];
        document.getElementById('ally-select-skill-name').textContent = skill ? skill.name : skillName;

        const list = document.getElementById('ally-select-list');
        list.innerHTML = '';

        if (!combat) return;

        combat.playerTeam.forEach((vasen, index) => {
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
UIController.prototype.showKnockoutSwapModal = function(combat, callback) {

    const modal = document.getElementById('knockout-swap-modal');
    modal.dataset.dismissible = 'false'; // cannot skip

    const vasenList = document.getElementById('knockout-swap-list');
    vasenList.innerHTML = '';

    const availableVasen = combat.playerTeam.filter((v, i) =>
        i !== combat.playerActiveIndex && !v.isKnockedOut()
    );

    // No available allies -> combat ends or whatever your logic is
    if (availableVasen.length === 0) {
        modal.classList.remove('active');
        ui.checkAndHideOverlay();
        callback(null);
        return;
    }

    // Only one ally left alive: swap it in automatically
    if (availableVasen.length === 1) {
        const actualIndex = combat.playerTeam.indexOf(availableVasen[0]);
        modal.classList.remove('active');
        ui.checkAndHideOverlay();
        callback(actualIndex);
        return;
    }

    // Build buttons for each available Vasen
    availableVasen.forEach(vasen => {
        const actualIndex = combat.playerTeam.indexOf(vasen);

        const vasenBtn = document.createElement('button');
        vasenBtn.className = 'knockout-swap-btn';
        vasenBtn.innerHTML = this.createStandardVasenCardHTML(vasen, true); // true = show combat info

        // Click handler
        vasenBtn.onclick = () => {
            modal.classList.remove('active');
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
        const tutorialActive = !gameState.firstExploreTutorialShown && this.areTipsEnabled();
        const nextClass = tutorialActive ? 'btn-primary tutorial-blink' : 'btn-primary';

        // Non-combat finds: confirm, or explore again straight away
        const confirmOrNextButtons = () => [
            { text: 'Confirm', callback: null, class: 'btn-primary' },
            { text: `${uiIcon('compass')}Next`, callback: () => game.explore(), class: nextClass }
        ];

        switch (result.type) {
            case 'vasen': {
                // New-player hint, shown until the first väsen has been tamed
                let encounterTip = '';
                if (!gameState.firstCombatTutorialShown && this.areTipsEnabled()) {
                    const desiredItem = VASEN_SPECIES[result.vasen.speciesName]?.tamingItem;
                    encounterTip = desiredItem && gameState.itemInventory[desiredItem] > 0
                        ? this.getTipHTML('You may carry something this väsen desires. <strong>Interrogate</strong> it to find out.')
                        : this.getTipHTML('You carry nothing this väsen desires. Defeat it to gain experience, and keep exploring to find more items.');
                }
                this.showDialogue(
                    'Wild Encounter!',
                    `<p>A wild <strong>${result.vasen.getDisplayName()}</strong> appears!</p>${encounterTip}`,
                    [{ text: `${uiIcon('swords')}Combat!`, callback: () => game.startCombat(result.vasen), class: nextClass }],
                    false, // Not dismissible: the encounter must be fought
                    null,
                    'vasen'
                );
                break;
            }

            case 'item': {
                let itemDialogue = this.highlightItemKeywords(result.dialogue);
                const itemName = TAMING_ITEMS[result.itemId]?.name;
                if (itemName) {
                    // Item name becomes a clickable word showing the item's description
                    const escaped = itemName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    itemDialogue = itemDialogue.replace(new RegExp(escaped, 'i'),
                        `<strong><span class="clickable-keyword item-keyword" onclick="toggleItemPopup(this, event, '${result.itemId}')">$&</span></strong>`);
                }
                this.showDialogue('Item Found!', `<p>${itemDialogue}</p>`, confirmOrNextButtons(), false, null, 'items');
                break;
            }

            case 'well':
                this.showDialogue('Sacred Well', `<p>${result.dialogue}</p>`, confirmOrNextButtons(), false, null, 'heal');
                break;

            case 'rune': {
                const rune = RUNES[result.runeId];
                const runeTip = this.isRuneEquipTutorialActive()
                    ? this.getTipHTML('Your väsen have a free rune slot. Open the <strong>Runes</strong> tab to equip this rune.')
                    : '';
                this.showDialogue(
                    'Rune Discovered!',
                    `<p>${result.dialogue}</p><p class="rune-reveal"><span class="rune-symbol large">${rune.symbol}</span> ${rune.name}</p><p class="rune-effect">${rune.effect}</p>${runeTip}`,
                    confirmOrNextButtons(),
                    false,
                    null,
                    'runes'
                );
                break;
            }
        }
    };

    // Show combat result
    UIController.prototype.showCombatResult = function(result) {
        let message = '';
        let buttons = [{
            text: 'Continue (2)',
            callback: () => game.endCombat(),
            disabled: true // Initially disabled to prevent spam clicking
        }];

        if (result.victory) {
            message = '<p>Your party triumphs!</p>';

            if (result.tamed) {
                message += `<p><strong>${this.getDisplayNameHTML(result.tamedVasen)}</strong> has joined you!</p>`;
            }

            if (result.expGained && result.expGained.length > 0) {
                message += '<div class="exp-results">';
                result.expGained.forEach(exp => {
                    // nameHTML has the temperament word clickable; name is the plain fallback
                    message += `<p>${exp.nameHTML || exp.name} gained ${exp.amount} experience!`;
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

        if (result.tip) message += this.getTipHTML(result.tip);

        this.showDialogue(result.victory ? 'Victory!' : 'Defeat', message, buttons, false, null, 'swords');

        // Countdown timer for the button
        let remainingSeconds = Math.ceil(GAME_CONFIG.COMBAT_RESULT_BUTTON_DELAY / 1000);
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
        }, GAME_CONFIG.COMBAT_RESULT_BUTTON_DELAY);
    };
