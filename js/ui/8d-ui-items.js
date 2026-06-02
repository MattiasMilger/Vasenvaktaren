// =============================================================================
// 8d-ui-items.js - Item and Rune Inventory Management
// =============================================================================

UIController.prototype.renderItemInventory = function() {
    const container = this.tabContents.items;
    container.innerHTML = '';

    let itemEntries = Object.entries(gameState.itemInventory);
    if (itemEntries.length === 0) {
        container.innerHTML = '<p class="empty-message">You have no items. Explore to find some.</p>';
        return;
    }

    if (!gameState.favoriteItems) gameState.favoriteItems = new Set();

    itemEntries.sort(([aId], [bId]) => {
        const aFav = gameState.favoriteItems.has(aId) ? 1 : 0;
        const bFav = gameState.favoriteItems.has(bId) ? 1 : 0;
        if (bFav !== aFav) return bFav - aFav;
        
        const aName = TAMING_ITEMS[aId]?.name || aId;
        const bName = TAMING_ITEMS[bId]?.name || bId;
        return aName.localeCompare(bName);
    });

    itemEntries.forEach(([itemId, count]) => {
        const item = TAMING_ITEMS[itemId];
        if (!item || count <= 0) return;

        const isFavorite = gameState.favoriteItems.has(itemId);

        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <button class="favorite-toggle ${isFavorite ? 'active' : ''}">${isFavorite ? '★' : '☆'}</button>
            <div class="item-info">
                <span class="item-name">${item.name}</span>
            </div>
            <span class="item-count">x${count}</span>
        `;
        
        card.querySelector('.favorite-toggle').onclick = (e) => {
            e.stopPropagation();
            if (gameState.favoriteItems.has(itemId)) {
                gameState.favoriteItems.delete(itemId);
            } else {
                gameState.favoriteItems.add(itemId);
            }
            this.renderItemInventory();
        };

        card.onclick = () => this.showItemOptions(itemId);

        container.appendChild(card);
    });
};

UIController.prototype.highlightItemKeywords = function(description) {
    if (!description) return '';

    // Keywords/phrases that hint at specific väsen — specific association + family keyword
    const keywords = [
        // Oknytt (Prankster)
        'land prankster',
        'garden prankster',
        'house prankster',
        'well prankster',
        'loft prankster',
        // Vålnad (Phantom)
        'raven phantom',
        'grave phantom',
        'bog phantom',
        'shore phantom',
        'mound phantom',
        // Odjur (Beast)
        'river beast',
        'nocturnal beast',
        'thieving beast',
        'wolf beast',
        'sky beast',
        // Troll (Troll)
        'mountain troll',
        'forest troll',
        'cradle troll',
        'petrified troll',
        'bridge troll',
        // Rå (Warden)
        'mine warden',
        'forest warden',
        'river warden',
        'dream warden',
        'charred warden',
        // Alv (elf)
        'twilight elf',
        'mist elf',
        'cavern elf',
        'forge elf',
        'light elf',
        // Ande (Spirit)
        'tree spirit',
        'warrior spirit',
        'winged spirit',
        'flame spirit',
        'weaving spirit',
        // Jätte (Giant)
        'primordial giant',
        'fire giant',
        'frost giant',
        'iron forest giant',
        'storm giant',
        // Drake (Serpent)
        'forest serpent',
        'hoard serpent',
        'pale serpent',
        'world serpent',
        'gnawing serpent'
    ];

    let highlighted = description;

    // Sort by length (longest first) to avoid partial matches
    keywords.sort((a, b) => b.length - a.length);

    keywords.forEach(keyword => {
        // Case-sensitive replacement to preserve capitalisation
        const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
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
            const healPercent = isCorrectItem ? GAME_CONFIG.CORRECT_ITEM_HEAL_PERCENT : 0.4;

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
