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

            // Bind Rune: add a compact indicator badge for any active bind rune pair
            const activeBindRunes = getActiveBindRunes(vasen);
            if (activeBindRunes.length > 0) {
                runesHtml += activeBindRunes.map(br =>
                    `<span class="mini-rune mini-bind-rune">${br.symbols} Bindrune</span>`
                ).join('');
            }

            const isFavorite = gameState.isFavorite(vasen.id);

            slotContent.innerHTML = `
                <div class="party-vasen">
                    <button class="vasen-favorite-btn ${isFavorite ? 'active' : ''}" style="position: absolute; top: var(--spacing-xs); right: var(--spacing-xs); z-index: 2;" onclick="event.stopPropagation(); ui.toggleFavorite('${vasen.id}')">
                        ${isFavorite ? '★' : '☆'}
                    </button>
                    <div class="party-vasen-img-container holo-${vasen.species.rarity.toLowerCase()}">
                        <img src="${vasen.species.image}" alt="${vasen.species.name}" class="party-vasen-img">
                    </div>

                    <div class="party-vasen-info">
                        <span class="party-vasen-name">${vasen.getDisplayName()}</span>
                        <span class="party-vasen-level">Lvl ${this.getLevelText(vasen.level)}</span>

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

    // Inject the auto action buttons (Auto Equip Runes, Auto Heal, Auto Team) into the party section (once)
    this._ensureAutoRunesButton();
    this._ensureAutoHealButton();
    this._ensureAutoTeamButton();
};

// Get (or create) the shared row that holds the auto action buttons below the party slots
UIController.prototype._getAutoActionsContainer = function() {
    let container = document.getElementById('party-auto-actions');
    if (container) return container;

    const partySection = document.querySelector('.party-section');
    if (!partySection) return null;

    container = document.createElement('div');
    container.id = 'party-auto-actions';
    container.className = 'party-auto-actions';
    partySection.appendChild(container);
    return container;
};

// Inject the Auto Equip Runes button into the auto actions row if it doesn't exist yet
UIController.prototype._ensureAutoRunesButton = function() {
    if (document.getElementById('auto-equip-runes-btn')) return;

    const container = this._getAutoActionsContainer();
    if (!container) return;

    const btn = document.createElement('button');
    btn.id = 'auto-equip-runes-btn';
    btn.className = 'btn btn-auto-runes';
    btn.title = 'Auto Equip Runes';
    btn.setAttribute('aria-label', 'Auto Equip Runes');
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v18M8 8l8-5M8 14l8-5"/></svg>
        <span>Auto Runes</span>
    `;
    btn.onclick = () => this.autoEquipRunes();

    container.appendChild(btn);
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
//
// Solo candidates are drawn strictly from getSoloValidRunesForVasen(), NOT from
// getValidRunesForVasen(). The latter also includes runes that are only useful
// as half of a bindrune pair (e.g. KAUNAN for a väsen with no Fire attacks, which
// is only worthwhile alongside ALGIZ's Nature->Fire conversion) - equipping one
// of those runes alone does nothing for the väsen, so they must only ever be
// picked together with their bindrune partner, never as a standalone pick.
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

        // Get valid runes for this väsen that are collected and still available in the pool.
        // This broader (solo OR bind-eligible) set is used ONLY to check whether both
        // members of a bindrune pair are usable in some capacity for this väsen - it is
        // never used to pick a rune to equip alone.
        const validForThis = getValidRunesForVasen(vasen).filter(
            runeId => gameState.collectedRunes.has(runeId) && !assigned.has(runeId)
        );

        // Strictly solo-usable runes for this väsen - the only pool solo candidates
        // may ever be drawn from (see function doc comment above).
        const soloValidForThis = getSoloValidRunesForVasen(vasen).filter(
            runeId => gameState.collectedRunes.has(runeId) && !assigned.has(runeId)
        );

        let selectedRunes = [];

        if (maxRunes === 2) {
            // Determine which bindrune pairs are viable for this väsen at all
            // (element requirements, utility skill presence, low-cost skill presence, etc.)
            const bindRuneEligible = getBindRuneEligibleRunes(vasen);

            // A pair candidate requires: the pair is bindrune-viable for this väsen,
            // AND both runes in the pair are currently in validForThis (collected,
            // still unassigned this round, and individually valid for this väsen -
            // solo or bind-only).
            const viablePairs = BIND_RUNES.filter(br =>
                br.runes.every(r => bindRuneEligible.has(r) && validForThis.includes(r))
            );

            // Build a combined candidate pool: each SOLO-VALID rune is one candidate,
            // each viable pair is one candidate (equal weighting between the two kinds).
            const candidates = [
                ...soloValidForThis.map(runeId => ({ type: 'solo', runes: [runeId] })),
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
            // Single-slot väsen: shuffle the strictly solo-valid pool and take the first one
            // (bindrunes are impossible with only one slot, so bind-only-eligible runes
            // must never be picked here)
            const shuffled = soloValidForThis.slice();
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

    const container = this._getAutoActionsContainer();
    if (!container) return;

    const btn = document.createElement('button');
    btn.id = 'auto-heal-btn';
    btn.className = 'btn btn-auto-runes';
    btn.title = 'Auto Heal';
    btn.setAttribute('aria-label', 'Auto Heal');
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
        <span>Auto Heal</span>
    `;
    btn.onclick = () => this.confirmAutoHeal();

    container.appendChild(btn);
};

UIController.prototype._ensureAutoTeamButton = function() {
    if (document.getElementById('auto-team-btn')) return;

    const container = this._getAutoActionsContainer();
    if (!container) return;

    const btn = document.createElement('button');
    btn.id = 'auto-team-btn';
    btn.className = 'btn btn-auto-runes';
    btn.title = 'Auto Team';
    btn.setAttribute('aria-label', 'Auto Team');
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
        <span>Auto Team</span>
    `;
    btn.onclick = () => this.autoTeam();

    container.appendChild(btn);
};

// Randomize the active party from the whole collection, following the same
// party rules enforced by gameState.addToParty(): no duplicate species and
// at most one mythical väsen. Fills as many slots as the rules allow.
UIController.prototype.autoTeam = function() {
    if (gameState.inCombat) {
        this.showMessage('Cannot change party during combat.', 'error');
        return;
    }

    // Fisher-Yates shuffle of a copy of the whole collection
    const pool = [...gameState.vasenCollection];
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const newParty = [];
    const usedSpecies = new Set();
    let hasMythical = false;

    for (const vasen of pool) {
        if (newParty.length >= GAME_CONFIG.MAX_TEAM_SIZE) break;
        if (usedSpecies.has(vasen.speciesName)) continue;

        const isMythical = vasen.species.rarity === RARITIES.MYTHICAL;
        if (isMythical && hasMythical) continue;

        newParty.push(vasen);
        usedSpecies.add(vasen.speciesName);
        if (isMythical) hasMythical = true;
    }

    // Write into the existing party array slot by slot (unfilled slots become null)
    for (let i = 0; i < GAME_CONFIG.MAX_TEAM_SIZE; i++) {
        gameState.party[i] = newParty[i] || null;
    }

    gameState.saveGame();
    this.renderParty();
    this.refreshCurrentTab();

    // Details panel shows party-dependent buttons (add/remove/swap), so refresh it
    if (this.selectedVasen) {
        this.renderVasenDetails(this.selectedVasen);
    }

    this.showMessage('Party randomized.');
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
        // Keep using items on this väsen until it's fully healed or no
        // taming items remain (e.g. the wrong item only heals WRONG_ITEM_HEAL_PERCENT,
        // so a second item may be needed to reach full health).
        while (vasen.currentHealth < vasen.maxHealth) {
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

            if (!itemToUse) break; // No items left to use on this väsen

            const result = gameState.useItemOnVasen(itemToUse, vasen);
            if (result.success) {
                vasenHealedCount++;
                this.showMessage(result.message, 'success');
            } else {
                break; // Avoid an infinite loop if the item couldn't be used
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
