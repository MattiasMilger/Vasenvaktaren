// =============================================================================
// 8c-ui-vasen.js - UI Controller Extension
// =============================================================================


UIController.prototype.handleVasenSortChange = function(sortBy) {
        this.vasenSortBy = sortBy;
        this.renderVasenInventory();
    };

    // Get sorted väsen collection based on current sort option
UIController.prototype.getSortedVasenCollection = function() {
        const collection = [...gameState.vasenCollection];
        
        // Rarity order for sorting (higher index = rarer)
        const rarityOrder = {
            'Common': 0,
            'Uncommon': 1,
            'Rare': 2,
            'Mythical': 3
        };

        // Helper to compare favorites first, then by secondary criteria
        const compareFavorites = (a, b) => {
            const aFav = gameState.isFavorite(a.id) ? 1 : 0;
            const bFav = gameState.isFavorite(b.id) ? 1 : 0;
            return bFav - aFav; // Favorites first
        };

        // Alphabetical tiebreaker used across all sort modes
        const alphabetical = (a, b) => a.getDisplayName().localeCompare(b.getDisplayName());

        switch (this.vasenSortBy) {
            case 'level':
                return collection.sort((a, b) => {
                    const favDiff = compareFavorites(a, b);
                    if (favDiff !== 0) return favDiff;
                    const diff = b.level - a.level;
                    return diff !== 0 ? diff : alphabetical(a, b);
                });
            case 'health':
                return collection.sort((a, b) => {
                    const favDiff = compareFavorites(a, b);
                    if (favDiff !== 0) return favDiff;
                    const diff = b.maxHealth - a.maxHealth;
                    return diff !== 0 ? diff : alphabetical(a, b);
                });
            case 'defense':
                return collection.sort((a, b) => {
                    const favDiff = compareFavorites(a, b);
                    if (favDiff !== 0) return favDiff;
                    const diff = b.calculateAttribute('defense') - a.calculateAttribute('defense');
                    return diff !== 0 ? diff : alphabetical(a, b);
                });
            case 'durability':
                return collection.sort((a, b) => {
                    const favDiff = compareFavorites(a, b);
                    if (favDiff !== 0) return favDiff;
                    const diff = b.calculateAttribute('durability') - a.calculateAttribute('durability');
                    return diff !== 0 ? diff : alphabetical(a, b);
                });
            case 'strength':
                return collection.sort((a, b) => {
                    const favDiff = compareFavorites(a, b);
                    if (favDiff !== 0) return favDiff;
                    const diff = b.calculateAttribute('strength') - a.calculateAttribute('strength');
                    return diff !== 0 ? diff : alphabetical(a, b);
                });
            case 'wisdom':
                return collection.sort((a, b) => {
                    const favDiff = compareFavorites(a, b);
                    if (favDiff !== 0) return favDiff;
                    const diff = b.calculateAttribute('wisdom') - a.calculateAttribute('wisdom');
                    return diff !== 0 ? diff : alphabetical(a, b);
                });
            case 'rarity':
                return collection.sort((a, b) => {
                    const favDiff = compareFavorites(a, b);
                    if (favDiff !== 0) return favDiff;
                    const rarityDiff = rarityOrder[b.species.rarity] - rarityOrder[a.species.rarity];
                    if (rarityDiff !== 0) return rarityDiff;
                    // Secondary sort by level, then alphabetical
                    const levelDiff = b.level - a.level;
                    return levelDiff !== 0 ? levelDiff : alphabetical(a, b);
                });
            case 'family':
            default:
                return null; // Return null to indicate family grouping should be used
        }
    };

    // Render Vasen inventory
UIController.prototype.renderVasenInventory = function() {
        const container = this.tabContents.vasen;
        container.innerHTML = '';

        if (gameState.vasenCollection.length === 0) {
            container.innerHTML = '<p class="empty-message">You have no Väsen. Explore to find and tame your first.</p>';
            return;
        };

        // Add sort controls
        const sortControls = document.createElement('div');
        sortControls.className = 'vasen-sort-controls';
        sortControls.innerHTML = `
            <label for="vasen-sort-select">Sort:</label>
            <select id="vasen-sort-select" class="vasen-sort-select">
                <option value="level" ${this.vasenSortBy === 'level' ? 'selected' : ''}>Level</option>
                <option value="rarity" ${this.vasenSortBy === 'rarity' ? 'selected' : ''}>Rarity</option>
                <option value="health" ${this.vasenSortBy === 'health' ? 'selected' : ''}>Health</option>
                <option value="defense" ${this.vasenSortBy === 'defense' ? 'selected' : ''}>Defense</option>
                <option value="durability" ${this.vasenSortBy === 'durability' ? 'selected' : ''}>Durability</option>
                <option value="strength" ${this.vasenSortBy === 'strength' ? 'selected' : ''}>Strength</option>
                <option value="wisdom" ${this.vasenSortBy === 'wisdom' ? 'selected' : ''}>Wisdom</option>
                <option value="family" ${this.vasenSortBy === 'family' ? 'selected' : ''}>Family</option>
            </select>
        `;
        container.appendChild(sortControls);

        // Add event listener for sort select
        const sortSelect = sortControls.querySelector('#vasen-sort-select');
        sortSelect.addEventListener('change', (e) => this.handleVasenSortChange(e.target.value));

        const sortedCollection = this.getSortedVasenCollection();

        if (sortedCollection === null) {
            // Family grouping (original behavior)
            this.renderVasenByFamily(container);
        } else {
            // Flat list sorted by selected attribute
            this.renderVasenFlat(container, sortedCollection);
        }
    };

    // Render väsen grouped by family (original behavior)
UIController.prototype.renderVasenByFamily = function(container) {
        // Group by family
        const byFamily = {};
        gameState.vasenCollection.forEach(vasen => {
            const family = vasen.species.family;
            if (!byFamily[family]) byFamily[family] = [];
            byFamily[family].push(vasen);
        });

        // Sort families alphabetically
        const sortedFamilies = Object.keys(byFamily).sort();

        sortedFamilies.forEach(family => {
            const familySection = document.createElement('div');
            familySection.className = 'family-section';
            const familyHeader = document.createElement('h4');
            familyHeader.className = 'family-header';
            familyHeader.textContent = family;
            familySection.appendChild(familyHeader);

            // Sort vasen in family: favorites first, then alphabetically by species, then by temperament
            const sortedVasen = byFamily[family].sort((a, b) => {
                // Favorites first
                const aFav = gameState.isFavorite(a.id) ? 1 : 0;
                const bFav = gameState.isFavorite(b.id) ? 1 : 0;
                if (aFav !== bFav) return bFav - aFav;
                
                // Then by species name
                if (a.speciesName !== b.speciesName) {
                    return a.speciesName.localeCompare(b.speciesName);
                }
                return a.temperamentKey.localeCompare(b.temperamentKey);
            });

            sortedVasen.forEach(vasen => {
                const card = this.createVasenCard(vasen);
                // Highlight if currently selected
                if (this.selectedVasen && this.selectedVasen.id === vasen.id) {
                    card.classList.add('selected');
                }
                familySection.appendChild(card);
            });

            container.appendChild(familySection);
        });
    };

    // Render väsen as flat sorted list
UIController.prototype.renderVasenFlat = function(container, sortedCollection) {
        const vasenListSection = document.createElement('div');
        vasenListSection.className = 'vasen-list-section';

        sortedCollection.forEach(vasen => {
            const card = this.createVasenCard(vasen);
            // Highlight if currently selected
            if (this.selectedVasen && this.selectedVasen.id === vasen.id) {
                card.classList.add('selected');
            }
            vasenListSection.appendChild(card);
        });

        container.appendChild(vasenListSection);
    };

    // Create a Väsen card
UIController.prototype.createVasenCard = function(vasen, showActions = true) {
        const card = document.createElement('div');
        card.className = `vasen-card element-${vasen.species.element.toLowerCase()}`;
        card.dataset.vasenId = vasen.id;

        const isInParty = gameState.party.some(p => p && p.id === vasen.id);
        const hasEmptySlot = gameState.party.some(p => p === null);
        const canAdd = !isInParty && hasEmptySlot && !gameState.inCombat;
        const canSwap = !isInParty && !hasEmptySlot && !gameState.inCombat;
        const isFavorite = gameState.isFavorite(vasen.id);

        card.innerHTML = `
            <div class="vasen-card-header">
                <button class="vasen-favorite-btn ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); ui.toggleFavorite('${vasen.id}')">
                    ${isFavorite ? '★' : '☆'}
                </button>
                <div class="vasen-thumb-container holo-${vasen.species.rarity.toLowerCase()}">
                    <img src="${vasen.species.image}" alt="${vasen.species.name}" class="vasen-thumb">
                </div>
                <div class="vasen-card-info">
                    <span class="vasen-name">${vasen.getDisplayName()}</span>
                    <span class="vasen-level">Lvl ${vasen.level}</span>
                </div>
                ${canAdd ? `<button class="vasen-add-btn" onclick="event.stopPropagation(); ui.addToParty('${vasen.id}')">+</button>` : ''}
                ${canSwap ? `<button class="vasen-add-btn" onclick="event.stopPropagation(); ui.showSwapIntoPartyModal('${vasen.id}')">+</button>` : ''}
            </div>
            <div class="vasen-card-details">
                <span 
                    class="element-badge element-${vasen.species.element.toLowerCase()}"
                >
                    ${vasen.species.element}
                </span>
                <span class="rarity-badge rarity-${vasen.species.rarity.toLowerCase()}">${vasen.species.rarity}</span>
                <span class="family-badge">${vasen.species.family}</span>
                ${isInParty ? '<span class="party-badge">In Party</span>' : ''}
            </div>
            <div class="vasen-card-health">
                <div class="combat-bar combat-bar-small health-bar">
                    <div class="combat-bar-fill health-fill" style="width: ${(vasen.currentHealth / vasen.maxHealth) * 100}%"></div>
                    <span class="combat-bar-text">Health: ${vasen.currentHealth} / ${vasen.maxHealth}</span>
                </div>
            </div>
            <div class="vasen-card-megin">
                <div class="combat-bar combat-bar-small megin-bar">
                    <div class="combat-bar-fill megin-fill" style="width: ${(vasen.currentMegin / vasen.maxMegin) * 100}%"></div>
                    <span class="combat-bar-text">Megin: ${vasen.currentMegin} / ${vasen.maxMegin}</span>
                </div>
            </div>
            <div class="vasen-card-attributes">
                <span class="mini-attr"><span class="attr-label">STR</span> ${vasen.calculateAttribute('strength')}</span>
                <span class="mini-attr"><span class="attr-label">WIS</span> ${vasen.calculateAttribute('wisdom')}</span>
                <span class="mini-attr"><span class="attr-label">DEF</span> ${vasen.calculateAttribute('defense')}</span>
                <span class="mini-attr"><span class="attr-label">DUR</span> ${vasen.calculateAttribute('durability')}</span>
            </div>
            ${vasen.runes && vasen.runes.length > 0 ? `
            <div class="vasen-card-runes">
                ${vasen.runes.map(runeId => {
                    const rune = RUNES[runeId];
                    return rune ? `<span class="mini-rune">${rune.symbol} ${rune.name}</span>` : '';
                }).join('')}
            </div>
            ` : ''}
        `;

        card.addEventListener('click', () => this.selectVasen(vasen));

        return card;
    };

    // Select a Väsen to show details
UIController.prototype.selectVasen = function(vasen) {
        if (this.selectedVasen && this.selectedVasen.id === vasen.id) {
            // If the same väsen is clicked again, deselect it
            this.selectedVasen = null;
        } else {
            // Otherwise, select the new väsen
            this.selectedVasen = vasen;
        };
        
        this.renderVasenDetails(this.selectedVasen);
        this.renderVasenInventory(); // Rerender inventory to update 'selected' class
    };

    // Toggle favorite status for a väsen
UIController.prototype.toggleFavorite = function(vasenId) {
        const isFavorite = gameState.toggleFavorite(vasenId);
        const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
        const name = vasen ? vasen.getDisplayName() : 'Väsen';
        
        if (isFavorite) {
            this.showMessage(`${name} added to favorites.`);
        } else {
            this.showMessage(`${name} removed from favorites.`);
        };
        
        this.renderVasenInventory();
        if (this.selectedVasen && this.selectedVasen.id === vasenId) {
            this.renderVasenDetails(this.selectedVasen);
        }
    };

        // Close the väsen details panel
UIController.prototype.closeVasenDetails = function() {
        this.selectedVasen = null;
        this.renderVasenDetails(null);
        this.renderVasenInventory(); // Rerender inventory to update 'selected' class
    };

    // Toggle description collapsed state
UIController.prototype.toggleDescription = function() {
        this.descriptionCollapsed = !this.descriptionCollapsed;
        if (this.selectedVasen) {
            this.renderVasenDetails(this.selectedVasen);
        }
    };

    // Helper: Generate attacking matchups HTML for an element
UIController.prototype.generateAttackingMatchupsHTML = function(element) {
        const matchups = ELEMENT_MATCHUPS[element];
        if (!matchups) return '';

        let potent = [];
        let neutral = [];
        let weak = [];

        Object.entries(matchups).forEach(([defElement, matchupType]) => {
            if (matchupType === 'POTENT') potent.push(defElement);
            else if (matchupType === 'WEAK') weak.push(defElement);
            else neutral.push(defElement);
        });

        let html = '<div class="matchup-details">';
        if (potent.length > 0) {
            html += `<div class="matchup-row potent"><span class="matchup-label">Potent vs:</span> ${potent.map(e => `<span class="element-mini element-${e.toLowerCase()}">${e}</span>`).join(' ')}</div>`;
        }
        if (neutral.length > 0) {
            html += `<div class="matchup-row neutral"><span class="matchup-label">Neutral vs:</span> ${neutral.map(e => `<span class="element-mini element-${e.toLowerCase()}">${e}</span>`).join(' ')}</div>`;
        }
        if (weak.length > 0) {
            html += `<div class="matchup-row weak"><span class="matchup-label">Weak vs:</span> ${weak.map(e => `<span class="element-mini element-${e.toLowerCase()}">${e}</span>`).join(' ')}</div>`;
        }
        html += '</div>';
        return html;
    };

    // Helper: Generate defensive matchups HTML for an element
UIController.prototype.generateDefensiveMatchupsHTML = function(element) {
        let resists = [];   // Takes less damage from (attacker is WEAK against this defender)
        let neutral = [];
        let vulnerable = []; // Takes more damage from (attacker is POTENT against this defender)

        Object.entries(ELEMENT_MATCHUPS).forEach(([attackerElement, matchups]) => {
            const matchupType = matchups[element];
            if (matchupType === 'POTENT') vulnerable.push(attackerElement);
            else if (matchupType === 'WEAK') resists.push(attackerElement);
            else neutral.push(attackerElement);
        });

        let html = '<div class="matchup-details">';
        if (vulnerable.length > 0) {
            html += `<div class="matchup-row vulnerable"><span class="matchup-label">Vulnerable to:</span> ${vulnerable.map(e => `<span class="element-mini element-${e.toLowerCase()}">${e}</span>`).join(' ')}</div>`;
        }
        if (neutral.length > 0) {
            html += `<div class="matchup-row neutral"><span class="matchup-label">Neutral against:</span> ${neutral.map(e => `<span class="element-mini element-${e.toLowerCase()}">${e}</span>`).join(' ')}</div>`;
        }
        if (resists.length > 0) {
            html += `<div class="matchup-row resists"><span class="matchup-label">Resists:</span> ${resists.map(e => `<span class="element-mini element-${e.toLowerCase()}">${e}</span>`).join(' ')}</div>`;
        }
        html += '</div>';
        return html;
    };


    // Render Vasen details panel
UIController.prototype.renderVasenDetails = function(vasen) {
    const panel = this.vasenDetailsPanel;
    if (!vasen) {
        panel.innerHTML = '<p class="empty-message">Select a Väsen to view details</p>';
        return;
    };

    // Party logic (safe)
    const isInParty = gameState.party.some(p => p && p.id === vasen.id);
    const hasEmptySlot = gameState.party.some(p => p === null);
    const canAdd = !isInParty && hasEmptySlot && !gameState.inCombat;
    const canSwap = !isInParty && !hasEmptySlot && !gameState.inCombat;
    const isFavorite = gameState.isFavorite(vasen.id);

    const runeSlots = vasen.level >= 30 ? 2 : 1;
    const expProgress = vasen.getExpProgress();

    panel.innerHTML = `
        <button class="details-close-btn" onclick="ui.closeVasenDetails()">×</button>
        <div class="details-header">
            <div class="details-image-container holo-${vasen.species.rarity.toLowerCase()}">
                <img src="${vasen.species.image}" alt="${vasen.species.name}" class="details-image">
            </div>
            <div class="details-identity">
                <div class="details-name-row">
                    <h3 class="details-name">${vasen.getDisplayName()}</h3>
                    <button class="details-favorite-btn ${isFavorite ? 'active' : ''}" onclick="ui.toggleFavorite('${vasen.id}')">
                        ${isFavorite ? '★' : '☆'}
                    </button>
                </div>
                <div class="details-meta">
                    <div class="element-matchup-collapsible">
                        <span class="element-badge element-${vasen.species.element.toLowerCase()} clickable-element" onclick="toggleElementMatchup(this, event)">${vasen.species.element}</span>
                        ${this.generateDefensiveMatchupsHTML(vasen.species.element)}
                    </div>
                    <span class="rarity-badge rarity-${vasen.species.rarity.toLowerCase()}">${vasen.species.rarity}</span>
                    <div class="family-matchup-collapsible">
                        <span class="family-badge clickable-family" onclick="toggleFamilyDescription(this, event)">${vasen.species.family}</span>
                        <div class="family-description-popup">
                            ${FAMILY_PASSIVES[vasen.species.family] ? `
                                <p><strong>Passive: ${FAMILY_PASSIVES[vasen.species.family].name}</strong><br>
                                ${FAMILY_PASSIVES[vasen.species.family].description}</p>
                                <hr style="margin: 8px 0; border: none; border-top: 1px solid var(--border-color);">
                            ` : ''}
                            <p>${FAMILY_DESCRIPTIONS[vasen.species.family] || 'No description available.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="details-runes">
            <h4>Runes (${vasen.runes.length}/${runeSlots})</h4>
            <div class="rune-slots">
                ${this.renderRuneSlots(vasen)}
            </div>
        </div>

        <div class="details-description">
            <h4 class="description-toggle" onclick="ui.toggleDescription()">
                <span class="toggle-icon">${this.descriptionCollapsed ? '»' : '«'}</span>
                Description
            </h4>
            <div class="description-content ${this.descriptionCollapsed ? 'collapsed' : ''}">
                <p>${vasen.species.description}</p>
            </div>
        </div>

        <div class="details-level">
            <span>Level ${vasen.level}</span>
            ${vasen.level < GAME_CONFIG.MAX_LEVEL ? `
                <div class="exp-bar">
                    <div class="exp-fill" style="width: ${expProgress.percent}%"></div>
                </div>
                <span class="exp-text">${expProgress.current} / ${expProgress.required} EXP</span>
            ` : '<span class="max-level-badge">MAX LEVEL</span>'}
        </div>

        <div class="details-resources">
            <div class="combat-bar health-bar">
                <div class="combat-bar-fill health-fill" style="width: ${(vasen.currentHealth / vasen.maxHealth) * 100}%"></div>
                <span class="combat-bar-text">Health: ${vasen.currentHealth} / ${vasen.maxHealth}</span>
            </div>
            <div class="combat-bar megin-bar">
                <div class="combat-bar-fill megin-fill" style="width: ${(vasen.currentMegin / vasen.maxMegin) * 100}%"></div>
                <span class="combat-bar-text">Megin: ${vasen.currentMegin} / ${vasen.maxMegin}</span>
            </div>
        </div>

        <div class="details-attributes">
            <h4>Attributes</h4>
            <div class="attribute-grid">
                <div class="attribute-item">
                    <span class="attr-name">Strength</span>
                    <span class="attr-value">${vasen.calculateAttribute('strength')}</span>
                </div>
                <div class="attribute-item">
                    <span class="attr-name">Wisdom</span>
                    <span class="attr-value">${vasen.calculateAttribute('wisdom')}</span>
                </div>
                <div class="attribute-item">
                    <span class="attr-name">Defense</span>
                    <span class="attr-value">${vasen.calculateAttribute('defense')}</span>
                </div>
                <div class="attribute-item">
                    <span class="attr-name">Durability</span>
                    <span class="attr-value">${vasen.calculateAttribute('durability')}</span>
                </div>
            </div>
        </div>

        <div class="details-temperament">
            <h4>Temperament</h4>
            <span class="temperament-info">
                ${vasen.temperament.name}
            </span>
            <span class="temperament-details">
                +${vasen.temperament.modifier} ${capitalize(vasen.temperament.positive)} /
                -${vasen.temperament.modifier} ${capitalize(vasen.temperament.negative)}
            </span>
        </div>

        <div class="details-taming-item">
            <h4>Taming Item</h4>
            <span class="taming-item-name">${vasen.species.tamingItem}</span>
        </div>
        <br>

        <div class="details-abilities">
            <h4>Abilities</h4>
            <div class="abilities-list">
                ${this.renderAbilitiesList(vasen)}
            </div>
        </div>

        <div class="details-actions">
            ${
                isInParty
                    ? `<button class="btn btn-danger" onclick="ui.removeFromParty('${vasen.id}')">Remove from Party</button>`
                    : canAdd
                        ? `<button class="btn btn-primary" onclick="ui.addToParty('${vasen.id}')">Add to Party</button>`
                        : canSwap
                            ? `<button class="btn btn-primary" onclick="ui.showSwapIntoPartyModal('${vasen.id}')">Swap Into Party</button>`
                            : ''
            };

            <button class="btn btn-danger release-btn" onclick="ui.confirmReleaseVasen('${vasen.id}')">
                Release
            </button>
        </div>
    `;

    // Auto-scroll to details panel on mobile
    if (window.innerWidth <= 768) {
        // Use setTimeout to ensure the content is rendered before scrolling
        setTimeout(() => {
            this.vasenDetailsPanel.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    }
};

    // Render rune slots for details panel
UIController.prototype.renderRuneSlots = function(vasen) {
        const maxSlots = vasen.level >= 30 ? 2 : 1;
        let html = '';

        for (let i = 0; i < maxSlots; i++) {
            const runeId = vasen.runes[i];
            if (runeId && RUNES[runeId]) {
                const rune = RUNES[runeId];
                html += `
                    <div class="rune-slot filled" onclick="ui.showRuneEquipModal('${vasen.id}')">
                        <span class="rune-symbol">${rune.symbol}</span>
                        <span class="rune-name">${rune.name}</span>
                        <span class="rune-effect">${rune.effect}</span>
                    </div>
                `;
            } else {
                html += `
                    <div class="rune-slot empty" onclick="ui.showRuneEquipModal('${vasen.id}')">
                        <span class="rune-placeholder">+ Equip Rune</span>
                    </div>
                `;
            }
        };

        if (maxSlots < 2) {
            html += `<div class="rune-slot locked">
                <span class="rune-placeholder">Locked</span>
            </div>`;
        };

        return html;
    };

    // Render abilities list (väsen details: flavor + mechanics)
UIController.prototype.renderAbilitiesList = function(vasen) {
        const allAbilities = vasen.getAllAbilityNames();
        const availableAbilities = vasen.getAvailableAbilities();
        let html = '';

        allAbilities.forEach((abilityName, index) => {
            const ability = ABILITIES[abilityName];
            if (!ability) return;

            const learnLevel = ABILITY_LEARN_LEVELS[index];
            const isLearned = availableAbilities.includes(abilityName);
            const meginCost = vasen.getAbilityMeginCost(abilityName);

            // Handle Basic Strike's null element - use Väsen's element
            const abilityElement = ability.element || vasen.species.element;

            html += `
                <div class="ability-item ${isLearned ? 'learned' : 'locked'}">
                    <div class="ability-header">
                        <span class="ability-name">${ability.name}</span>
                        <span class="ability-type-tag">${ability.type}</span>
                    </div>
                    <div class="ability-stats">
                        <div class="element-matchup-collapsible">
                            <span class="ability-element element-${abilityElement.toLowerCase()} clickable-element" onclick="event.stopPropagation(); toggleElementMatchup(this, event)">${abilityElement}</span>
                            ${this.generateAttackingMatchupsHTML(abilityElement)}
                        </div>
                        ${ability.power ? `<span class="ability-power">Power: ${getAbilityPower(abilityName, vasen.species.family)}</span>` : ''}
                        <span class="ability-cost">Megin: ${meginCost}</span>
                    </div>
                    <p class="ability-description">${ability.flavorDescription} ${ability.mechanicsDescription}</p>
                    ${!isLearned ? `<span class="learn-level">Learns at Lvl ${learnLevel}</span>` : ''}
                </div>
            `;
        });

        return html;
    };


    // Render Rune inventory
UIController.prototype.renderRuneInventory = function() {
        const container = this.tabContents.runes;
        container.innerHTML = '';

        if (gameState.collectedRunes.size === 0) {
            container.innerHTML = '<p class="empty-message">You have no runes yet. Explore to find them.</p>';
            return;
        };

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

    // Find which Väsen has a rune equipped
UIController.prototype.findRuneEquippedTo = function(runeId) {
        return gameState.vasenCollection.find(v => v.runes.includes(runeId));
    };

