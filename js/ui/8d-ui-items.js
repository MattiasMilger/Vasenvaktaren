// =============================================================================
// 8d-ui-items.js - Item and Rune Inventory Management
// =============================================================================

UIController.prototype.renderRuneInventory = function() {
    const container = this.tabContents.runes;
    container.innerHTML = '';

    if (gameState.collectedRunes.size === 0) {
        container.innerHTML = '<p class="empty-message">You have no runes yet. Explore to find them.</p>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'rune-grid';

    RUNE_LIST.forEach(runeId => {
        if (!gameState.collectedRunes.has(runeId)) return;

        const rune = RUNES[runeId];
        const equippedTo = this.findRuneEquippedTo(runeId);

        const card = document.createElement('div');
        card.className = 'rune-card';
        card.innerHTML = `
            <span class="rune-card-symbol">${rune.symbol}</span>
            <div class="rune-card-info">
                <span class="rune-card-name">${rune.name}</span>
                <span class="rune-card-effect">${rune.effect}</span>
                ${equippedTo ? `<span class="rune-card-equipped">Equipped to ${equippedTo.getName()}</span>` : ''}
            </div>
        `;
        card.onclick = () => this.showRuneOptions(runeId);

        grid.appendChild(card);
    });

    container.appendChild(grid);
};

UIController.prototype.findRuneEquippedTo = function(runeId) {
    return gameState.vasenCollection.find(v => v.runes.includes(runeId));
};

UIController.prototype.renderItemInventory = function() {
    const container = this.tabContents.items;
    container.innerHTML = '';

    const itemEntries = Object.entries(gameState.itemInventory);
    if (itemEntries.length === 0) {
        container.innerHTML = '<p class="empty-message">You have no items. Explore to find some.</p>';
        return;
    }

    // Sort items alphabetically by name
    itemEntries.sort(([aId], [bId]) => {
        const aName = TAMING_ITEMS[aId]?.name || aId;
        const bName = TAMING_ITEMS[bId]?.name || bId;
        return aName.localeCompare(bName);
    });

    itemEntries.forEach(([itemId, count]) => {
        const item = TAMING_ITEMS[itemId];
        if (!item || count <= 0) return;

        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-info">
                <span class="item-name">${item.name}</span>
            </div>
            <span class="item-count">x${count}</span>
        `;
        card.onclick = () => this.showItemOptions(itemId);

        container.appendChild(card);
    });
};

UIController.prototype.highlightItemKeywords = function(description) {
    if (!description) return '';

    // Keywords/phrases that hint at specific väsen
    const keywords = [
        'guardian of the land',
        'bearded guardian',
        'house spirit',
        'shrieking raven',
        'infant spirit',
        'fire-aligned spirit',
        'drowned sailor',
        'white horse',
        'nocturnal grazer',
        'great wolf',
        'world\'s winds',
        'mountain-dwelling giant',
        'forest Troll',
        'changeling child',
        'mine warden',
        'warden of the forest',
        'water warden',
        'beings of the mist',
        'subterranean smiths',
        'beings of creation',
        'Elder Tree',
        'valiant warrior',
        'winged maiden',
        'ancient giants',
        'fiery elemental',
        'giants of ice',
        'wingless serpent',
        'avaricious drakes',
        'World Serpent',
        'world tree'
    ];

    let highlighted = description;

    // Sort by length (longest first) to avoid partial matches
    keywords.sort((a, b) => b.length - a.length);

    keywords.forEach(keyword => {
        // Case-insensitive replacement
        const regex = new RegExp(`(${keyword})`, 'gi');
        highlighted = highlighted.replace(regex, '<span class="item-keyword-highlight">$1</span>');
    });

    return highlighted;
};

UIController.prototype.showItemOptions = function(itemId) {
    const item = TAMING_ITEMS[itemId];
    if (!item) return;

    // Check if we can offer during combat
    const canGift = gameState.inCombat &&
                    game.currentBattle &&
                    game.currentBattle.isWildEncounter &&
                    game.currentBattle.waitingForPlayerAction &&
                    game.currentBattle.offersGiven <= GAME_CONFIG.MAX_OFFERS_PER_COMBAT &&
                    !game.currentBattle.correctItemGiven;

    const buttons = [
        {
            text: 'Heal a Väsen',
            callback: () => this.showHealVasenModal(itemId)
        }
    ];

    // Add Offer Item button if in combat with wild encounter
    if (canGift) {
        buttons.push({
            text: 'Offer Item',
            class: 'btn-primary',
            callback: () => game.handleOfferItem(itemId)
        });
    }

    buttons.push({
        text: 'Cancel',
        class: 'btn-secondary',
        callback: null
    });

    let desc = this.highlightItemKeywords(item.description);
    const escaped = item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    desc = desc.replace(new RegExp(escaped, 'i'), '<strong>$&</strong>');

    this.showDialogue(
        'Item',
        `<p>${desc}</p>`,
        buttons
    );
};

UIController.prototype.showHealVasenModal = function(itemId) {
    const modal = document.getElementById('heal-vasen-modal');
    const vasenList = document.getElementById('heal-vasen-list');
    vasenList.innerHTML = '';

    const healableVasen = gameState.vasenCollection.filter(v => {
        // Can't heal if in active combat
        if (gameState.inCombat && gameState.party.some(p => p && p.id === v.id)) {
            return false;
        }
        // Can't heal if at full health
        return v.currentHealth < v.maxHealth;
    });

    // Sort to show active party members first
    healableVasen.sort((a, b) => {
        const aInParty = gameState.party.some(p => p && p.id === a.id) ? 1 : 0;
        const bInParty = gameState.party.some(p => p && p.id === b.id) ? 1 : 0;
        return bInParty - aInParty;
    });

    if (healableVasen.length === 0) {
        vasenList.innerHTML = '<p class="empty-message">No Väsen need healing, or all are in active combat.</p>';
    } else {
        healableVasen.forEach(vasen => {
            const item = TAMING_ITEMS[itemId];
            const isCorrectItem = vasen.species.tamingItem === itemId;
            const healPercent = isCorrectItem ? 0.8 : 0.4;

            const vasenBtn = document.createElement('button');
            vasenBtn.className = 'heal-vasen-btn';
            vasenBtn.innerHTML = `
                ${this.createStandardVasenCardHTML(vasen, false)}
            `;
            vasenBtn.onclick = () => {
                modal.classList.remove('active');
                ui.checkAndHideOverlay();
                game.healVasenWithItem(vasen.id, itemId);
            };
            vasenList.appendChild(vasenBtn);
        });
    }

    document.getElementById('close-heal-modal').onclick = () => {
        modal.classList.remove('active');
        ui.checkAndHideOverlay();
    };
    ui.showModalOverlay();
    modal.classList.add('active');
};

UIController.prototype.showRuneOptions = function(runeId) {
    const rune = RUNES[runeId];
    const equippedTo = this.findRuneEquippedTo(runeId);

    let message = `<br><p class="rune-flavor">${rune.flavor}</p><br><p class="rune-effect">${rune.effect}</p>`;
    if (equippedTo) {
        message += `<p>Currently equipped to <strong>${equippedTo.getDisplayName()}</strong></p>`;
    }

    this.showDialogue(
        `${rune.symbol} ${rune.name}`,
        message,
        [
            {
                text: 'Equip to Väsen',
                callback: () => this.showRuneEquipToVasenModal(runeId)
            },
            {
                text: 'Cancel',
                class: 'btn-secondary',
                callback: null
            }
        ]
    );
};

UIController.prototype.showRuneEquipModal = function(vasenId, slotIndex = null) {
    const modal = document.getElementById('rune-equip-modal');
    const runeList = document.getElementById('rune-equip-list');
    runeList.innerHTML = '';

    const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
    if (!vasen) return;

    // Store which slot is being replaced
    modal.dataset.vasenId = vasenId;
    modal.dataset.slotIndex = slotIndex !== null ? slotIndex : '';

    const allRunes = RUNE_LIST.filter(runeId => gameState.collectedRunes.has(runeId));

    if (allRunes.length === 0) {
        runeList.innerHTML = '<p class="empty-message">No runes collected yet.</p>';
    } else {
        allRunes.forEach(runeId => {
            const rune = RUNES[runeId];
            const equippedTo = this.findRuneEquippedTo(runeId);
            const isOnThisVasen = vasen.runes.includes(runeId);
            const isOnOtherVasen = equippedTo && equippedTo.id !== vasenId;

            const runeBtn = document.createElement('button');
            runeBtn.className = `rune-equip-btn ${isOnThisVasen ? 'equipped-here' : ''} ${isOnOtherVasen ? 'equipped-elsewhere' : ''}`;

            let statusText = '';
            if (isOnThisVasen) {
                statusText = '<span class="rune-status current">(Equipped)</span>';
                runeBtn.disabled = true;
            } else if (isOnOtherVasen) {
                statusText = `<span class="rune-status other">(On ${equippedTo.getName()})</span>`;
            }

            runeBtn.innerHTML = `
                <span class="rune-symbol">${rune.symbol}</span>
                <span class="rune-name">${rune.name}</span>
                ${statusText}
                <span class="rune-effect">${rune.effect}</span>
            `;

            if (!isOnThisVasen) {
                runeBtn.onclick = () => {
                    modal.classList.remove('active');
                    ui.checkAndHideOverlay();
                    this.equipRune(vasenId, runeId, slotIndex);
                };
            }
            runeList.appendChild(runeBtn);
        });
    }

    document.getElementById('close-rune-modal').onclick = () => {
        modal.classList.remove('active');
        ui.checkAndHideOverlay();
    };
    ui.showModalOverlay();
    modal.classList.add('active');
};

UIController.prototype.showRuneEquipToVasenModal = function(runeId) {
    const modal = document.getElementById('rune-to-vasen-modal');
    const vasenList = document.getElementById('rune-to-vasen-list');
    vasenList.innerHTML = '';

    const currentOwner = gameState.findRuneOwner(runeId);

    // Show all väsen in collection (runes are bound to individual väsen, not party slots)
    const eligibleVasen = [...gameState.vasenCollection];

    // Sort to show active party members first
    eligibleVasen.sort((a, b) => {
        const aInParty = gameState.party.some(p => p && p.id === a.id) ? 1 : 0;
        const bInParty = gameState.party.some(p => p && p.id === b.id) ? 1 : 0;
        return bInParty - aInParty;
    });

    if (eligibleVasen.length === 0) {
        vasenList.innerHTML = '<p class="empty-message">No Väsen in your collection.</p>';
    } else {
        eligibleVasen.forEach(vasen => {
            const currentRunes = vasen.runes;
            const maxRunes = vasen.level >= GAME_CONFIG.MAX_LEVEL ? 2 : 1;
            const hasThisRune = currentRunes.includes(runeId);
            const isInParty = gameState.party.some(p => p && p.id === vasen.id);

            const vasenBtn = document.createElement('button');
            vasenBtn.className = `rune-to-vasen-btn ${hasThisRune ? 'current-owner' : ''}`;
            vasenBtn.disabled = hasThisRune;
            vasenBtn.innerHTML = `
                ${this.createStandardVasenCardHTML(vasen, false)}
                <div class="rune-status-overlay">
                    <span class="rune-status">${currentRunes.length}/${maxRunes} runes${hasThisRune ? ' (Current)' : ''}${isInParty ? ' ★' : ''}</span>
                </div>
            `;
            if (!hasThisRune) {
                vasenBtn.onclick = () => {
                    modal.classList.remove('active');
                    ui.checkAndHideOverlay();
                    this.equipRuneToVasen(vasen.id, runeId);
                };
            }
            vasenList.appendChild(vasenBtn);
        });
    }

    document.getElementById('close-rune-to-vasen-modal').onclick = () => {
        modal.classList.remove('active');
        ui.checkAndHideOverlay();
    };
    ui.showModalOverlay();
    modal.classList.add('active');
};

UIController.prototype.findRuneOwner = function(runeId) {
    return gameState.vasenCollection.find(v => v.runes.includes(runeId));
};

UIController.prototype.equipRune = function(vasenId, runeId, slotIndex = null) {
    // Find the väsen in collection
    const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
    if (!vasen) {
        this.showMessage('Väsen not found.', 'error');
        return;
    }

    const result = gameState.equipRune(runeId, vasenId, slotIndex);
    this.showMessage(result.message, result.success ? 'info' : 'error');
    this.refreshCurrentTab();
    this.renderParty(); // Update party display to show new rune
    if (this.selectedVasen && this.selectedVasen.id === vasenId) {
        this.renderVasenDetails(this.selectedVasen);
    }
};

UIController.prototype.unequipRune = function(vasenId, runeId) {
    // Find the väsen in collection
    const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
    if (!vasen) {
        this.showMessage('Väsen not found.', 'error');
        return;
    }

    const result = gameState.unequipRune(vasenId, runeId);
    this.showMessage(result.message, result.success ? 'info' : 'error');
    this.refreshCurrentTab();
    this.renderParty(); // Update party display
    if (this.selectedVasen && this.selectedVasen.id === vasenId) {
        this.renderVasenDetails(this.selectedVasen);
    }
};

UIController.prototype.equipRuneToVasen = function(vasenId, runeId) {
    // The new gameState.equipRune handles auto-unequipping from previous owner
    this.equipRune(vasenId, runeId);
};
