// =============================================================================
// 8e-ui-party.js - Party Slot Management and Väsen Release
// =============================================================================

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
            }

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
                            <span class="combat-bar-text">HP: ${vasen.currentHealth} / ${vasen.maxHealth}</span>
                        </div>
                        <div class="combat-bar combat-bar-small megin-bar">
                            <div class="combat-bar-fill megin-fill" style="width: ${(vasen.currentMegin / vasen.maxMegin) * 100}%"></div>
                            <span class="combat-bar-text">MP: ${vasen.currentMegin} / ${vasen.maxMegin}</span>
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
        }

        // Update click handler for slot
        slot.onclick = () => this.handlePartySlotClick(index);
    });
};

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
        }

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

UIController.prototype.moveInParty = function(fromSlot, toSlot) {
        const temp = gameState.party[toSlot];
        gameState.party[toSlot] = gameState.party[fromSlot];
        gameState.party[fromSlot] = temp;

        this.renderParty();
        gameState.saveGame();
        this.showMessage(`${gameState.party[toSlot].getName()} is now the lead!`);
};

UIController.prototype.addToParty = function(vasenId, slotIndex = null) {
        if (gameState.inCombat) {
            this.showMessage('Cannot add Väsen during combat.', 'error');
            return;
        }

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

UIController.prototype.replaceInParty = function(vasenId, slotIndex) {
    if (gameState.inCombat) {
        this.showMessage('Cannot replace Väsen during combat.', 'error');
        return;
    }

    const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
    if (!vasen) {
        this.showMessage('Väsen not found.', 'error');
        return;
    }

    gameState.party[slotIndex] = vasen;

    this.renderParty();
    this.refreshCurrentTab();
    gameState.saveGame();

    this.showMessage(`${vasen.getName()} replaced the previous Väsen.`);
};

UIController.prototype.removeFromParty = function(vasenId) {
        if (gameState.inCombat) {
            this.showMessage('Cannot remove Väsen during combat.', 'error');
            return;
        }

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

UIController.prototype.showAddVasenMenu = function(slotIndex) {
    const modal = document.getElementById('add-vasen-modal');
    const list = document.getElementById('add-vasen-list');
    list.innerHTML = '';

    // Sort: favorites first, then highest level, then alphabetical
    const sorted = [...gameState.vasenCollection].sort((a, b) => {
        // Favorites first
        const aFav = gameState.isFavorite(a.id) ? 1 : 0;
        const bFav = gameState.isFavorite(b.id) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;

        // Highest level first
        if (a.level !== b.level) return b.level - a.level;

        // Alphabetical tiebreaker
        return a.getDisplayName().localeCompare(b.getDisplayName());
    });

    sorted.forEach(vasen => {
        const btn = document.createElement('button');
        btn.className = 'add-vasen-btn';
        const isFavorite = gameState.isFavorite(vasen.id);
        const isInParty = gameState.party.some(p => p && p.id === vasen.id);

        btn.innerHTML = `
            ${isFavorite ? '<span class="add-vasen-favorite-star">★</span>' : ''}
            ${this.createStandardVasenCardHTML(vasen, false)}
            ${isInParty ? '<span class="add-vasen-in-party-badge">In Party</span>' : ''}
        `;

        btn.onclick = () => {
            modal.classList.remove('active');
            ui.checkAndHideOverlay();
            this.addToParty(vasen.id, slotIndex);
        };

        list.appendChild(btn);
    });

    document.getElementById('close-add-vasen-modal').onclick = () => {
        modal.classList.remove('active');
        ui.checkAndHideOverlay();
        document.activeElement.blur();
    };
    ui.showModalOverlay();
    modal.classList.add('active');
};

UIController.prototype.showReplaceMenu = function(fromSlot) {
    const modal = document.getElementById('add-vasen-modal');
    const list = document.getElementById('add-vasen-list');
    list.innerHTML = '';

    // Show ALL väsen in collection, just like Add to Party
    // Sort: favorites first, then highest level, then alphabetical
    const sorted = [...gameState.vasenCollection].sort((a, b) => {
        const aFav = gameState.isFavorite(a.id) ? 1 : 0;
        const bFav = gameState.isFavorite(b.id) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;

        // Highest level first
        if (a.level !== b.level) return b.level - a.level;

        // Alphabetical tiebreaker
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
            ui.checkAndHideOverlay();

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

    document.getElementById('close-add-vasen-modal').onclick = () => {
        modal.classList.remove('active');
        ui.checkAndHideOverlay();
    };

    ui.showModalOverlay();
    modal.classList.add('active');
};

UIController.prototype.showSwapIntoPartyModal = function(vasenId) {
        if (gameState.inCombat) {
            this.showMessage('Cannot swap Väsen during combat.', 'error');
            return;
        }

        const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
        if (!vasen) {
            this.showMessage('Väsen not found.', 'error');
            return;
        }

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

UIController.prototype.releaseVasen = function(vasenId) {
    const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
    if (!vasen) {
        this.showMessage('Väsen not found.', 'error');
        return;
    }

    // Remove from party if present
    const partyIndex = gameState.party.findIndex(p => p && p.id === vasenId);
    if (partyIndex !== -1) {
        gameState.party[partyIndex] = null;
    }

    // Remove from collection
    gameState.vasenCollection = gameState.vasenCollection.filter(v => v.id !== vasenId);

    // Clear selection if it was selected
    if (this.selectedVasen && this.selectedVasen.id === vasenId) {
        this.selectedVasen = null;
        this.renderVasenDetails(null);
    }

    gameState.saveGame();
    this.refreshAll();
    this.showMessage(`${vasen.getName()} was released.`);
};

UIController.prototype.confirmReleaseVasen = function(vasenId) {
    if (gameState.inCombat) {
        this.showMessage("You cannot release a Väsen during combat.", "error");
        return;
    }

    const vasen = gameState.vasenCollection.find(v => v.id === vasenId);

    if (!vasen) {
        this.showMessage('Väsen not found.', 'error');
        return;
    }

    if (gameState.isFavorite(vasenId)) {
        this.showMessage("You cannot release a favorited Väsen. Remove it from favorites first.", "error");
        return;
    }

    if (gameState.vasenCollection.length <= 1) {
        this.showMessage("You cannot release your only Väsen!", "error");
        return;
    }

    this.showDialogue(
        `Release ${vasen.getName()}?`,
        `<p>Are you sure you want to release <strong>${vasen.getDisplayName()}</strong>?<br>
        This action cannot be undone.</p>`,
        [
            {
                text: 'Release',
                class: 'btn-danger',
                callback: () => this.releaseVasen(vasenId)
            },
            {
                text: 'Cancel',
                class: 'btn-secondary',
                callback: null
            }
        ]
    );
};
