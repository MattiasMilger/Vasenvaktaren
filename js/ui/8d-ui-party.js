// =============================================================================
// 8d-ui-party.js - UI Controller Extension
// =============================================================================


UIController.prototype.renderItemInventory = function() {
        const container = this.tabContents.items;
        container.innerHTML = '';

        const itemEntries = Object.entries(gameState.itemInventory);
        if (itemEntries.length === 0) {
            container.innerHTML = '<p class="empty-message">You have no items. Explore to find some.</p>';
            return;
        };

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

    // Render party
UIController.prototype.renderParty = function() {
    gameState.party.forEach((vasen, index) => {
        const slot = this.partySlots[index];
        const slotContent = slot.querySelector('.slot-content');

        if (vasen) {
            slot.classList.add('filled');
            slotContent.classList.remove('empty');
            
            let stagesHtml = '';
            ['strength', 'wisdom', 'defense', 'durability'].forEach(attr => {
                const stage = vasen.attributeStages[attr];
                if (stage !== 0) {
                    const stageClass = stage > 0 ? 'positive' : 'negative';
                    const stageText = stage > 0 ? `+${stage}` : stage;
                    stagesHtml += `<span class="mini-stage ${stageClass}">${capitalize(attr).substring(0, 3)} ${stageText}</span>`;
                }
            });
            
            let runesHtml = '';
            if (vasen.runes.length > 0) {
                runesHtml = vasen.runes.map(runeId => {
                    const rune = RUNES[runeId];
                    return rune ? `<span class="mini-rune">${rune.symbol} ${rune.name}</span>` : '';
                }).join('');
            };

            slotContent.innerHTML = `
                <div class="party-vasen">
                    <div class="party-vasen-img-container holo-${vasen.species.rarity.toLowerCase()}">
                        <img src="${vasen.species.image}" alt="${vasen.species.name}" class="party-vasen-img">
                    </div>

                    <div class="party-vasen-info">
                        <span class="party-vasen-name">${vasen.getDisplayName()}</span>
                        <span class="party-vasen-level">Lvl ${vasen.level}</span>

                        <div class="party-vasen-tags">
                            <span 
                                class="element-badge element-${vasen.species.element.toLowerCase()}"
                            >
                                ${vasen.species.element}
                            </span>
                            <span class="rarity-badge rarity-${vasen.species.rarity.toLowerCase()}">
                                ${vasen.species.rarity}
                            </span>
                            <span class="family-badge">
                                ${vasen.species.family}
                            </span>
                        </div>
                    </div>

                    <div class="party-vasen-bars">
                        <div class="combat-bar combat-bar-small health-bar">
                            <div class="combat-bar-fill health-fill" style="width: ${(vasen.currentHealth / vasen.maxHealth) * 100}%"></div>
                            <span class="combat-bar-text">Health: ${vasen.currentHealth} / ${vasen.maxHealth}</span>
                        </div>
                        <div class="combat-bar combat-bar-small megin-bar">
                            <div class="combat-bar-fill megin-fill" style="width: ${(vasen.currentMegin / vasen.maxMegin) * 100}%"></div>
                            <span class="combat-bar-text">Megin: ${vasen.currentMegin} / ${vasen.maxMegin}</span>
                        </div>
                    </div>

                    <div class="party-vasen-attributes">
                        <span class="mini-attr"><span class="attr-label">STR</span> ${vasen.getAttribute('strength')}</span>
                        <span class="mini-attr"><span class="attr-label">WIS</span> ${vasen.getAttribute('wisdom')}</span>
                        <span class="mini-attr"><span class="attr-label">DEF</span> ${vasen.getAttribute('defense')}</span>
                        <span class="mini-attr"><span class="attr-label">DUR</span> ${vasen.getAttribute('durability')}</span>
                    </div>

                    ${stagesHtml ? `<div class="party-vasen-stages">${stagesHtml}</div>` : ''}
                    ${runesHtml ? `<div class="party-vasen-runes">${runesHtml}</div>` : ''}
                </div>
            `;
        } else {
            slot.classList.remove('filled');
            slotContent.classList.add('empty');
            slotContent.innerHTML = `
                <div class="party-empty">
                    <span>Empty</span>
                    <span class="party-hint">Click to add</span>
                </div>
            `;
        };

        // Update click handler for slot
        slot.onclick = () => this.handlePartySlotClick(index);
    });
};


    // Handle party slot click
UIController.prototype.handlePartySlotClick = function(slotIndex) {
    const vasen = gameState.party[slotIndex];

    if (vasen) {
        // If slot has väsen, show options
        const buttons = [
            {
                text: 'View Details',
                callback: () => {
                    this.switchTab('vasen');
                    this.selectVasen(vasen);
                }
            },
            {
                text: 'Replace',
                callback: () => {
                    this.showReplaceMenu(slotIndex);
                }
            },
            {
                text: 'Remove from Party',
                class: 'btn-danger',
                callback: () => {
                    this.removeFromParty(vasen.id);
                }
            }
        ];

        // Add move options if there are other slots
        if (slotIndex > 0) {
            buttons.splice(2, 0, {
                text: `Move to Lead`,
                callback: () => this.moveInParty(slotIndex, 0)
            });
        };

        buttons.push({
            text: 'Cancel',
            class: 'btn-secondary',
            callback: null
        });

        this.showDialogue(
            vasen.getName(),
            '',
            buttons,
            true,
            'move-vasen-dialogue'
        );

    } else {
        // If slot is empty, show add väsen menu
        this.showAddVasenMenu(slotIndex);
    }
};

    // Move väsen within party
UIController.prototype.moveInParty = function(fromSlot, toSlot) {
        const temp = gameState.party[toSlot];
        gameState.party[toSlot] = gameState.party[fromSlot];
        gameState.party[fromSlot] = temp;
        
        this.renderParty();
        gameState.saveGame();
        this.showMessage(`${gameState.party[toSlot].getName()} is now the lead!`);
    };

    // Add väsen to party
UIController.prototype.addToParty = function(vasenId, slotIndex = null) {
        if (gameState.inCombat) {
            this.showMessage('Cannot add Väsen during combat.', 'error');
            return;
        };

        const result = gameState.addToParty(vasenId, slotIndex);
        if (result.success) {
            this.showMessage(result.message);
            this.renderParty();
            this.refreshCurrentTab();
            if (this.selectedVasen && this.selectedVasen.id === vasenId) {
                this.renderVasenDetails(this.selectedVasen);
            }
        } else {
            this.showMessage(result.message, 'error');
        }
    };

    // Replace in party

UIController.prototype.replaceInParty = function(vasenId, slotIndex) {
    if (gameState.inCombat) {
        this.showMessage('Cannot replace Väsen during combat.', 'error');
        return;
    };

    const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
    if (!vasen) {
        this.showMessage('Väsen not found.', 'error');
        return;
    };

    gameState.party[slotIndex] = vasen;

    this.renderParty();
    this.refreshCurrentTab();
    gameState.saveGame();

    this.showMessage(`${vasen.getName()} replaced the previous Väsen.`);
};
    // Remove väsen from party
UIController.prototype.removeFromParty = function(vasenId) {
        if (gameState.inCombat) {
            this.showMessage('Cannot remove Väsen during combat.', 'error');
            return;
        };

        const result = gameState.removeFromPartyById(vasenId);
        if (result.success) {
            this.showMessage(result.message);
            this.renderParty();
            this.refreshCurrentTab();
            if (this.selectedVasen && this.selectedVasen.id === vasenId) {
                this.renderVasenDetails(this.selectedVasen);
            }
        } else {
            this.showMessage(result.message, 'error');
        }
    };

    // Replace Väsen
UIController.prototype.showReplaceMenu = function(fromSlot) {
    const modal = document.getElementById('add-vasen-modal');
    const list = document.getElementById('add-vasen-list');
    list.innerHTML = '';

    // Show ALL väsen in collection, just like Add to Party
    const sorted = [...gameState.vasenCollection].sort((a, b) => {
        const aFav = gameState.isFavorite(a.id) ? 1 : 0;
        const bFav = gameState.isFavorite(b.id) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;

        if (a.species.family !== b.species.family)
            return a.species.family.localeCompare(b.species.family);

        return a.getDisplayName().localeCompare(b.getDisplayName());
    });

    sorted.forEach(vasen => {
        const btn = document.createElement('button');
        btn.className = 'add-vasen-btn';

        const isInParty = gameState.party.some(p => p && p.id === vasen.id);

        btn.innerHTML = `
            ${this.createStandardVasenCardHTML(vasen, false)}
            <span class="add-vasen-in-party-badge">Replace with</span>
        `;

        btn.onclick = () => {
            modal.classList.remove('active');

            if (isInParty) {
                // Swap positions
                const toSlot = gameState.party.findIndex(p => p && p.id === vasen.id);
                this.moveInParty(fromSlot, toSlot);
            } else {
                // Replace with new väsen
                this.replaceInParty(vasen.id, fromSlot);
            }
        };

        list.appendChild(btn);
    });

    document.getElementById('close-add-vasen-modal').onclick = () =>
        modal.classList.remove('active');

    modal.classList.add('active');
};

UIController.prototype.releaseVasen = function(vasenId) {
    const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
    if (!vasen) {
        this.showMessage('Väsen not found.', 'error');
        return;
    };

    // Remove from party if present
    const partyIndex = gameState.party.findIndex(p => p && p.id === vasenId);
    if (partyIndex !== -1) {
        gameState.party[partyIndex] = null;
    };

    // Remove from collection
    gameState.vasenCollection = gameState.vasenCollection.filter(v => v.id !== vasenId);

    // Clear selection if it was selected
    if (this.selectedVasen && this.selectedVasen.id === vasenId) {
        this.selectedVasen = null;
        this.renderVasenDetails(null);
    };

    gameState.saveGame();
    this.refreshAll();
    this.showMessage(`${vasen.getName()} was released.`);
};


    // Show swap into party modal (when party is full)
UIController.prototype.showSwapIntoPartyModal = function(vasenId) {
        if (gameState.inCombat) {
            this.showMessage('Cannot swap Väsen during combat.', 'error');
            return;
        };

        const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
        if (!vasen) {
            this.showMessage('Väsen not found.', 'error');
            return;
        };

        // Create a temporary modal-like dialogue with standardized cards
        const buttons = [];

        gameState.party.forEach((partyVasen, index) => {
            if (partyVasen) {
                const slotLabel = index === 0 ? 'Lead' : `Slot ${index + 1}`;
                // Use standardized card HTML (with combat info since party shows current stats)
                buttons.push({
                    text: `
                        <div class="swap-party-card-wrapper">
                            <span class="swap-party-slot-label">${slotLabel}</span>
                            <div class="swap-party-card">
                                ${this.createStandardVasenCardHTML(partyVasen, true)}
                            </div>
                        </div>
                    `,
                    callback: () => {
                        const result = gameState.addToParty(vasenId, index);
                        if (result.success) {
                            this.showMessage(`${vasen.getName()} swapped in for ${partyVasen.getName()}.`);
                        } else {
                            this.showMessage(result.message, 'error');
                        }
                        this.renderParty();
                        this.refreshCurrentTab();
                        if (this.selectedVasen) {
                            this.renderVasenDetails(this.selectedVasen);
                        }
                    }
                });
            }
        });

        buttons.push({
            text: 'Cancel',
            class: 'btn-secondary',
            callback: null
        });

        this.showDialogue(
            `Add ${vasen.getName()} to Party`,
            '<p>Your party is full. Select a Väsen to replace:</p>',
            buttons,
            true,
            'swap-into-party-dialogue'
        );
    };

    // Render zones
UIController.prototype.renderZones = function() {
    this.zoneList.innerHTML = '';

    ZONE_ORDER.forEach(zoneId => {
        const zone = ZONES[zoneId];
        const isUnlocked = gameState.isZoneUnlocked(zoneId);
        const isSelected = gameState.currentZone === zoneId;
        const isCleared = gameState.defeatedGuardians.has(zoneId);

        // FIX: use zone-item instead of zone-btn
        const zoneBtn = document.createElement('button');
        zoneBtn.className = `zone-item ${isUnlocked ? '' : 'locked'} ${isSelected ? 'selected' : ''} ${isCleared ? 'cleared' : ''}`;
        zoneBtn.disabled = !isUnlocked;

        if (isUnlocked) {
            zoneBtn.innerHTML = `
                <span class="zone-name">${zone.name}</span>
                <span class="zone-level">Lvl ${zone.levelRange[0]}-${zone.levelRange[1]}</span>
                ${isCleared ? '<span class="zone-status cleared">Cleared</span>' : ''}
            `;
            zoneBtn.onclick = () => this.selectZone(zoneId);
        } else {
            const prevZone = this.getPreviousZone(zoneId);
            zoneBtn.innerHTML = `
                <span class="zone-name">${zone.name}</span>
                <span class="zone-status locked">Defeat ${prevZone ? ZONES[prevZone].guardian?.name || 'Guardian' : 'Guardian'} to unlock</span>
            `;
        };

        this.zoneList.appendChild(zoneBtn);
    });

    this.updateExploreButton();
};


    // Get previous zone
UIController.prototype.getPreviousZone = function(zoneId) {
        const index = ZONE_ORDER.indexOf(zoneId);
