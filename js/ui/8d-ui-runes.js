// =============================================================================
// 8d-ui-runes.js - Rune Inventory Management
// =============================================================================

UIController.prototype.renderRuneInventory = function() {
    const container = this.tabContents.runes;
    container.innerHTML = '';

    if (gameState.collectedRunes.size === 0) {
        container.innerHTML = '<p class="empty-message">You have no runes yet. Explore to find them.</p>';
        return;
    }

    if (!this.runeSortOrder) {
        this.runeSortOrder = 'futhark';
    }

    const sortMenu = document.createElement('div');
    sortMenu.className = 'vasen-sort-controls'; // Re-use vasen style
    sortMenu.innerHTML = `
        <label for="rune-sort-select">Sort:</label>
        <select id="rune-sort-select" class="vasen-sort-select">
            <option value="futhark" ${this.runeSortOrder === 'futhark' ? 'selected' : ''}>Futhark</option>
            <option value="equipped" ${this.runeSortOrder === 'equipped' ? 'selected' : ''}>Equipped</option>
        </select>
    `;
    container.appendChild(sortMenu);

    sortMenu.querySelector('#rune-sort-select').onchange = (e) => {
        this.runeSortOrder = e.target.value;
        this.renderRuneInventory();
    };

    let runesToRender = RUNE_LIST.filter(runeId => gameState.collectedRunes.has(runeId));
    
    if (!gameState.favoriteRunes) gameState.favoriteRunes = new Set();

    runesToRender.sort((a, b) => {
        const aFav = gameState.favoriteRunes.has(a) ? 1 : 0;
        const bFav = gameState.favoriteRunes.has(b) ? 1 : 0;
        if (bFav !== aFav) return bFav - aFav;

        if (this.runeSortOrder === 'equipped') {
            const aEquipped = this.findRuneEquippedTo(a) ? 1 : 0;
            const bEquipped = this.findRuneEquippedTo(b) ? 1 : 0;
            if (bEquipped !== aEquipped) {
                return bEquipped - aEquipped;
            }
        }

        return RUNE_LIST.indexOf(a) - RUNE_LIST.indexOf(b);
    });

    const grid = document.createElement('div');
    grid.className = 'rune-grid';

    runesToRender.forEach(runeId => {
        const rune = RUNES[runeId];
        const equippedTo = this.findRuneEquippedTo(runeId);
        const isFavorite = gameState.favoriteRunes.has(runeId);

        const card = document.createElement('div');
        card.className = 'rune-card';
        card.innerHTML = `
            <button class="favorite-toggle ${isFavorite ? 'active' : ''}">${isFavorite ? '★' : '☆'}</button>
            <span class="rune-card-symbol">${rune.symbol}</span>
            <div class="rune-card-info">
                <span class="rune-card-name">${rune.name}</span>
                <span class="rune-card-effect">${rune.effect}</span>
                ${equippedTo ? `<span class="rune-card-equipped">Equipped to ${equippedTo.getDisplayName()}</span>` : ''}
            </div>
        `;

        card.querySelector('.favorite-toggle').onclick = (e) => {
            e.stopPropagation();
            if (gameState.favoriteRunes.has(runeId)) {
                gameState.favoriteRunes.delete(runeId);
            } else {
                gameState.favoriteRunes.add(runeId);
            }
            this.renderRuneInventory();
        };

        card.onclick = () => this.showRuneOptions(runeId);

        grid.appendChild(card);
    });

    container.appendChild(grid);
};

UIController.prototype.findRuneEquippedTo = function(runeId) {
    return gameState.vasenCollection.find(v => v.runes.includes(runeId));
};

UIController.prototype.showRuneOptions = function(runeId) {
    const rune = RUNES[runeId];
    const equippedTo = this.findRuneEquippedTo(runeId);

    let message = `<p class="rune-flavor">${rune.flavor}</p><hr class="rune-divider"><p class="rune-effect">${rune.effect}</p>`;
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
                statusText = `<span class="rune-status other">(On ${equippedTo.getDisplayName()})</span>`;
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
            const maxRunes = vasen.level >= GAME_CONFIG.TWO_RUNE_LEVEL ? 2 : 1;
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
