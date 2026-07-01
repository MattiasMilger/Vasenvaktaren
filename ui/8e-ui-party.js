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

    // Inject the Auto Equip Runes button into the party section (once)
    this._ensureAutoRunesButton();
    this._ensureAutoHealButton();
};

// Inject the Auto Equip Runes button after the party slots if it doesn't exist yet
UIController.prototype._ensureAutoRunesButton = function() {
    if (document.getElementById('auto-equip-runes-btn')) return;

    const partySection = document.querySelector('.party-section');
    if (!partySection) return;

    const btn = document.createElement('button');
    btn.id = 'auto-equip-runes-btn';
    btn.className = 'btn btn-auto-runes';
    btn.textContent = 'Auto Equip Runes';
    btn.onclick = () => this.autoEquipRunes();

    partySection.appendChild(btn);
};

// Auto-equip valid runes to all party members.
// Builds a shared pool from collected runes, then for each party väsen (in slot
// order) picks up to maxRunes valid runes at random, removing them from the pool
// so the same rune cannot land on two different väsen.
//
// For väsen with 2 rune slots, a completable bindrune pair (both runes valid for
// this väsen, both still unassigned, and the pair's bindrune viability condition
// met) is treated as a single candidate in the same random pool as individual
// runes - giving it roughly the same odds as landing any one solo rune, rather
// than requiring two lucky solo picks in a row to land a matching pair.
UIController.prototype.autoEquipRunes = function() {
    if (gameState.inCombat) {
        this.showMessage('Cannot change runes during combat.', 'error');
        return;
    }

    if (gameState.collectedRunes.size === 0) {
        this.showMessage('You have no runes to equip.', 'error');
        return;
    }

    // Build the shared rune pool (all collected runes)
    const runePool = Array.from(gameState.collectedRunes);

    // Fisher-Yates shuffle the pool so selection order is random
    for (let i = runePool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [runePool[i], runePool[j]] = [runePool[j], runePool[i]];
    }

    const partyVasen = gameState.party.filter(v => v !== null);

    if (partyVasen.length === 0) {
        this.showMessage('Your party is empty.', 'error');
        return;
    }

    // Track which runes have been assigned this round
    const assigned = new Set();

    partyVasen.forEach(vasen => {
        // Unequip all current runes from this väsen directly
        // (bypasses gameState.unequipRune to avoid per-call saves)
        const oldRunes = vasen.runes.slice();
        vasen.runes = [];

        // Recalculate megin in case Uruz was removed
        if (oldRunes.includes('URUZ')) {
            vasen.maxMegin = vasen.calculateMaxMegin();
            vasen.currentMegin = Math.min(vasen.currentMegin, vasen.maxMegin);
        }

        // Determine slot count for this väsen
        const maxRunes = vasen.level >= GAME_CONFIG.TWO_RUNE_LEVEL ? 2 : 1;

        // Get valid runes for this väsen that are collected and still available in the pool
        const validForThis = getValidRunesForVasen(vasen).filter(
            runeId => gameState.collectedRunes.has(runeId) && !assigned.has(runeId)
        );

        let selectedRunes = [];

        if (maxRunes === 2) {
            // Determine which bindrune pairs are viable for this väsen at all
            // (element requirements, utility skill presence, low-cost skill presence, etc.)
            const bindRuneEligible = getBindRuneEligibleRunes(vasen);

            // A pair candidate requires: the pair is bindrune-viable for this väsen,
            // AND both runes in the pair are currently in validForThis (collected,
            // still unassigned this round, and individually valid for this väsen).
            const viablePairs = BIND_RUNES.filter(br =>
                br.runes.every(r => bindRuneEligible.has(r) && validForThis.includes(r))
            );

            // Build a combined candidate pool: each solo rune is one candidate,
            // each viable pair is one candidate (equal weighting between the two kinds).
            const candidates = [
                ...validForThis.map(runeId => ({ type: 'solo', runes: [runeId] })),
                ...viablePairs.map(br => ({ type: 'pair', runes: br.runes.slice() }))
            ];

            // Shuffle the combined candidate pool
            for (let i = candidates.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
            }

            // Walk the shuffled candidates, picking the first that still fits
            // (its runes must still be unselected and unassigned at the time it's reached).
            for (const candidate of candidates) {
                if (selectedRunes.length >= maxRunes) break;

                const fits = candidate.runes.every(r =>
                    !selectedRunes.includes(r) && !assigned.has(r)
                ) && (selectedRunes.length + candidate.runes.length) <= maxRunes;

                if (fits) {
                    selectedRunes.push(...candidate.runes);
                }
            }
        } else {
            // Single-slot väsen: shuffle the valid pool and take the first one
            // (bindrunes are impossible with only one slot)
            const shuffled = validForThis.slice();
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            if (shuffled.length > 0) {
                selectedRunes.push(shuffled[0]);
            }
        }

        // Assign the selected runes
        selectedRunes.forEach(runeId => {
            vasen.runes.push(runeId);
            assigned.add(runeId);

            // Strip this rune from any other väsen in the entire collection
            gameState.vasenCollection.forEach(other => {
                if (other.id !== vasen.id && other.runes.includes(runeId)) {
                    other.unequipRune(runeId);
                }
            });
        });

        // Recalculate megin if Uruz was newly assigned
        if (vasen.hasRune('URUZ')) {
            vasen.maxMegin = vasen.calculateMaxMegin();
            vasen.currentMegin = vasen.maxMegin;
        }
    });

    gameState.saveGame();
    this.renderParty();
    this.refreshCurrentTab();

    // Update vasen details panel if a party member is selected
    if (this.selectedVasen && partyVasen.some(v => v.id === this.selectedVasen.id)) {
        this.renderVasenDetails(this.selectedVasen);
    }

    this.showMessage('Runes auto-equipped to party.');
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
                // Use standardized card HTML (with combat info since party shows current attributes)
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

UIController.prototype._ensureAutoHealButton = function() {
    if (document.getElementById('auto-heal-btn')) return;

    const partySection = document.querySelector('.party-section');
    if (!partySection) return;

    const btn = document.createElement('button');
    btn.id = 'auto-heal-btn';
    btn.className = 'btn btn-auto-runes';
    btn.textContent = 'Auto Heal';
    btn.onclick = () => this.confirmAutoHeal();

    partySection.appendChild(btn);
};

UIController.prototype.confirmAutoHeal = function() {
    this.showDialogue(
        'Auto Heal Party?',
        '<p>WARNING: This will consume taming items that could otherwise be used for taming väsen.</p>',
        [
            {
                text: 'Heal',
                class: 'btn-primary',
                callback: () => this.autoHealParty()
            },
            {
                text: 'Cancel',
                class: 'btn-secondary',
                callback: null
            }
        ]
    );
};

UIController.prototype.autoHealParty = function() {
    if (gameState.inCombat) {
        this.showMessage('Cannot heal during combat.', 'error');
        return;
    }

    const partyVasenToHeal = gameState.party.filter(v => v && v.currentHealth < v.maxHealth);

    if (partyVasenToHeal.length === 0) {
        this.showMessage('All party väsen are at full health.', 'info');
        return;
    }

    let vasenHealedCount = 0;

    partyVasenToHeal.forEach(vasen => {
        let itemToUse = null;

        // 1. Prefer associated item
        const associatedItem = vasen.species.tamingItem;
        if (associatedItem && gameState.getItemCount(associatedItem) > 0) {
            itemToUse = associatedItem;
        } else {
            // 2. Otherwise, use most plentiful taming item
            const availableTamingItems = Object.keys(gameState.itemInventory)
                .filter(itemName => gameState.getItemCount(itemName) > 0 && TAMING_ITEMS[itemName])
                .sort((a, b) => gameState.getItemCount(b) - gameState.getItemCount(a));

            if (availableTamingItems.length > 0) {
                itemToUse = availableTamingItems[0];
            }
        }

        if (itemToUse) {
            const result = gameState.useItemOnVasen(itemToUse, vasen);
            if (result.success) {
                vasenHealedCount++;
                this.showMessage(result.message, 'success');
            }
        }
    });

    if (vasenHealedCount > 0) {
        gameState.saveGame();
        this.renderParty();
        this.refreshCurrentTab();

        if (this.selectedVasen && gameState.party.some(v => v && v.id === this.selectedVasen.id)) {
            this.renderVasenDetails(this.selectedVasen);
        }
    } else {
        this.showMessage('No taming items available to heal.', 'error');
    }
};