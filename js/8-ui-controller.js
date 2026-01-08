// =============================================================================
// 8-ui-controller.js - UI Controller and Rendering
// =============================================================================

class UIController {
    constructor() {
        this.currentScreen = 'main-menu';
        this.currentTab = 'vasen';
        this.selectedVasen = null;
        this.selectedPartySlot = null;
        this.combatLogMessages = [];
        this.descriptionCollapsed = false; // Global state for väsen description fold
    }

    // Initialize UI elements
    init() {
        this.cacheElements();
        this.setupEventListeners();
    }

    // Cache DOM elements
    cacheElements() {
        // Screens
        this.screens = {
            mainMenu: document.getElementById('main-menu-screen'),
            starterSelect: document.getElementById('starter-select-screen'),
            game: document.getElementById('game-screen')
        };

        // Tabs
        this.tabs = {
            vasen: document.getElementById('tab-vasen'),
            runes: document.getElementById('tab-runes'),
            items: document.getElementById('tab-items')
        };
        this.tabContents = {
            vasen: document.getElementById('inventory-vasen'),
            runes: document.getElementById('inventory-runes'),
            items: document.getElementById('inventory-items')
        };

        // Party slots
        this.partySlots = [
            document.getElementById('party-slot-0'),
            document.getElementById('party-slot-1'),
            document.getElementById('party-slot-2')
        ];

        // Zone elements
        this.zoneList = document.getElementById('zone-list');
        this.exploreBtn = document.getElementById('explore-btn');
        this.challengeBtn = document.getElementById('challenge-btn');

        // Combat area
        this.combatArea = document.getElementById('combat-area');
        this.zoneDescription = document.getElementById('zone-description');
        this.combatUI = document.getElementById('combat-ui');
        this.combatLog = document.getElementById('combat-log');

        // Settings modal
        this.settingsModal = document.getElementById('settings-modal');
        this.combatTipsModal = document.getElementById('combat-tips-modal');

        // Player info
        this.playerNameDisplay = document.getElementById('player-name-display');
        this.profileModal = document.getElementById('profile-modal');

        // Vasen details
        this.vasenDetailsPanel = document.getElementById('vasen-details-panel');
    }

    // Setup event listeners
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Settings
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettings());
        document.getElementById('close-settings').addEventListener('click', () => this.hideSettings());
        document.getElementById('export-save-btn').addEventListener('click', () => this.exportSave());
        document.getElementById('import-save-btn').addEventListener('click', () => this.importSave());
        document.getElementById('reset-game-btn').addEventListener('click', () => this.confirmReset());

        // Combat tips
        document.getElementById('combat-tips-btn').addEventListener('click', () => this.showCombatTips());
        document.getElementById('close-combat-tips').addEventListener('click', () => this.hideCombatTips());

        // Profile
        document.getElementById('player-profile').addEventListener('click', () => this.showProfile());
        document.getElementById('close-profile').addEventListener('click', () => this.hideProfile());
        document.getElementById('change-name-btn').addEventListener('click', () => this.changeName());

        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    // Screen management
    showScreen(screenId) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        this.screens[screenId].classList.add('active');
        this.currentScreen = screenId;
    }

    // Tab management
    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        this.tabs[tabName].classList.add('active');

        Object.values(this.tabContents).forEach(content => content.classList.remove('active'));
        this.tabContents[tabName].classList.add('active');

        this.currentTab = tabName;
        this.refreshCurrentTab();
    }

    refreshCurrentTab() {
        switch (this.currentTab) {
            case 'vasen':
                this.renderVasenInventory();
                break;
            case 'runes':
                this.renderRuneInventory();
                break;
            case 'items':
                this.renderItemInventory();
                break;
        }
    }

    // Render Vasen inventory
    renderVasenInventory() {
        const container = this.tabContents.vasen;
        container.innerHTML = '';

        if (gameState.vasenCollection.length === 0) {
            container.innerHTML = '<p class="empty-message">You have no Väsen. Explore to find and tame your first.</p>';
            return;
        }

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
            familyHeader.title = FAMILIES[family] || '';
            familySection.appendChild(familyHeader);

            // Sort vasen in family alphabetically by species, then by temperament
            const sortedVasen = byFamily[family].sort((a, b) => {
                if (a.speciesName !== b.speciesName) {
                    return a.speciesName.localeCompare(b.speciesName);
                }
                return a.temperamentKey.localeCompare(b.temperamentKey);
            });

            sortedVasen.forEach(vasen => {
                const card = this.createVasenCard(vasen);
                familySection.appendChild(card);
            });

            container.appendChild(familySection);
        });
    }

    // Create a Vasen card
    createVasenCard(vasen, showActions = true) {
        const card = document.createElement('div');
        card.className = `vasen-card element-${vasen.species.element.toLowerCase()}`;
        card.dataset.vasenId = vasen.id;

        const isInParty = gameState.party.some(p => p && p.id === vasen.id);
        const hasEmptySlot = gameState.party.some(p => p === null);
        const canAdd = !isInParty && hasEmptySlot && !gameState.inCombat;

        card.innerHTML = `
            <div class="vasen-card-header">
                <img src="${vasen.species.image}" alt="${vasen.species.name}" class="vasen-thumb">
                <div class="vasen-card-info">
                    <span class="vasen-name">${vasen.getDisplayName()}</span>
                    <span class="vasen-level">Lvl ${vasen.level}</span>
                </div>
                ${canAdd ? `<button class="vasen-add-btn" onclick="event.stopPropagation(); ui.addToParty('${vasen.id}')" title="Add to party">+</button>` : ''}
            </div>
            <div class="vasen-card-details">
                <span class="element-badge element-${vasen.species.element.toLowerCase()}">${vasen.species.element}</span>
                <span class="rarity-badge rarity-${vasen.species.rarity.toLowerCase()}">${vasen.species.rarity}</span>
                ${isInParty ? '<span class="party-badge">In Party</span>' : ''}
            </div>
            <div class="vasen-card-health">
                <div class="mini-health-bar">
                    <div class="mini-health-fill" style="width: ${(vasen.currentHealth / vasen.maxHealth) * 100}%"></div>
                </div>
                <span class="mini-health-text">${vasen.currentHealth}/${vasen.maxHealth}</span>
            </div>
        `;

        card.addEventListener('click', () => this.selectVasen(vasen));

        return card;
    }

    // Select a Väsen to show details
    selectVasen(vasen) {
        this.selectedVasen = vasen;
        this.renderVasenDetails(vasen);
    }

    // Toggle description collapsed state
    toggleDescription() {
        this.descriptionCollapsed = !this.descriptionCollapsed;
        if (this.selectedVasen) {
            this.renderVasenDetails(this.selectedVasen);
        }
    }

    // Render Vasen details panel
    renderVasenDetails(vasen) {
        const panel = this.vasenDetailsPanel;
        if (!vasen) {
            panel.innerHTML = '<p class="empty-message">Select a Väsen to view details</p>';
            return;
        }

        const isInParty = gameState.party.some(p => p && p.id === vasen.id);
        const runeSlots = vasen.level >= 30 ? 2 : 1;
        const expProgress = vasen.getExpProgress();
        const defensiveTooltip = this.getDefensiveMatchupTooltip(vasen.species.element);
        const familyDescription = FAMILIES[vasen.species.family] || 'No description available';

        panel.innerHTML = `
            <div class="details-header">
                <img src="${vasen.species.image}" alt="${vasen.species.name}" class="details-image">
                <div class="details-identity">
                    <h3 class="details-name">${vasen.getDisplayName()}</h3>
                    <div class="details-meta">
                        <span class="element-badge element-${vasen.species.element.toLowerCase()}" title="${defensiveTooltip}">${vasen.species.element}</span>
                        <span class="rarity-badge rarity-${vasen.species.rarity.toLowerCase()}">${vasen.species.rarity}</span>
                        <span class="family-badge" title="${familyDescription}">${vasen.species.family}</span>
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
                    <span class="toggle-icon">${this.descriptionCollapsed ? '▶' : '▼'}</span>
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
                <div class="resource-bar health-bar-container">
                    <span class="resource-label">Health</span>
                    <div class="resource-bar-bg">
                        <div class="resource-bar-fill health-fill" style="width: ${(vasen.currentHealth / vasen.maxHealth) * 100}%"></div>
                    </div>
                    <span class="resource-value">${vasen.currentHealth} / ${vasen.maxHealth}</span>
                </div>
                <div class="resource-bar megin-bar-container">
                    <span class="resource-label">Megin</span>
                    <div class="resource-bar-bg">
                        <div class="resource-bar-fill megin-fill" style="width: ${(vasen.currentMegin / vasen.maxMegin) * 100}%"></div>
                    </div>
                    <span class="resource-value">${vasen.currentMegin} / ${vasen.maxMegin}</span>
                </div>
            </div>

            <div class="details-attributes">
                <h4>Attributes</h4>
                <div class="attribute-grid">
                    <div class="attribute-item" title="Damage modifier for Strength Attacks">
                        <span class="attr-name">Strength</span>
                        <span class="attr-value">${vasen.calculateAttribute('strength')}</span>
                    </div>
                    <div class="attribute-item" title="Damage modifier for Wisdom Attacks">
                        <span class="attr-name">Wisdom</span>
                        <span class="attr-value">${vasen.calculateAttribute('wisdom')}</span>
                    </div>
                    <div class="attribute-item" title="Reduces damage from Strength Attacks">
                        <span class="attr-name">Defense</span>
                        <span class="attr-value">${vasen.calculateAttribute('defense')}</span>
                    </div>
                    <div class="attribute-item" title="Reduces damage from Wisdom Attacks">
                        <span class="attr-name">Durability</span>
                        <span class="attr-value">${vasen.calculateAttribute('durability')}</span>
                    </div>
                </div>
            </div>

            <div class="details-temperament">
                <h4>Temperament</h4>
                <span class="temperament-name" title="+${vasen.temperament.modifier} ${capitalize(vasen.temperament.positive)} / -${vasen.temperament.modifier} ${capitalize(vasen.temperament.negative)}">
                    ${vasen.temperament.name}
                </span>
            </div>

            <div class="details-abilities">
                <h4>Abilities</h4>
                <div class="abilities-list">
                    ${this.renderAbilitiesList(vasen)}
                </div>
            </div>

            <div class="details-actions">
                ${isInParty ? 
                    `<button class="btn btn-danger" onclick="ui.removeFromParty('${vasen.id}')">Remove from Party</button>` :
                    `<button class="btn btn-primary" onclick="ui.addToParty('${vasen.id}')">Add to Party</button>`
                }
            </div>
        `;
    }

    // Render rune slots for details panel
    renderRuneSlots(vasen) {
        const maxSlots = vasen.level >= 30 ? 2 : 1;
        let html = '';

        for (let i = 0; i < maxSlots; i++) {
            const runeId = vasen.runes[i];
            if (runeId && RUNES[runeId]) {
                const rune = RUNES[runeId];
                html += `
                    <div class="rune-slot filled" title="${rune.name}: ${rune.effect}" onclick="ui.showRuneOptions('${runeId}')">
                        <span class="rune-symbol">${rune.symbol}</span>
                        <span class="rune-name">${rune.name}</span>
                    </div>
                `;
            } else {
                html += `
                    <div class="rune-slot empty" onclick="ui.showRuneEquipModal('${vasen.id}')">
                        <span class="rune-placeholder">+ Equip Rune</span>
                    </div>
                `;
            }
        }

        if (maxSlots < 2) {
            html += `<div class="rune-slot locked" title="Reach level 30 to unlock second rune slot">
                <span class="rune-placeholder">Locked</span>
            </div>`;
        }

        return html;
    }

    // Render abilities list
    renderAbilitiesList(vasen) {
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
            const elementTooltip = this.getElementMatchupTooltip(abilityElement);

            html += `
                <div class="ability-item ${isLearned ? 'learned' : 'locked'}">
                    <div class="ability-header">
                        <span class="ability-name">${ability.name}</span>
                        <span class="ability-type-tag">${ability.type}</span>
                    </div>
                    <div class="ability-stats">
                        <span class="ability-element element-${abilityElement.toLowerCase()}" title="${elementTooltip}">${abilityElement}</span>
                        ${ability.power ? `<span class="ability-power">Power: ${ability.power}</span>` : ''}
                        <span class="ability-cost">Megin: ${meginCost}</span>
                    </div>
                    <p class="ability-description">${ability.description}</p>
                    ${!isLearned ? `<span class="learn-level">Learns at Lvl ${learnLevel}</span>` : ''}
                </div>
            `;
        });

        return html;
    }

    // Render element matchups
    renderElementMatchups(element) {
        const matchups = ELEMENT_MATCHUPS[element];
        let attackHtml = '<div class="matchup-section"><h5>Attacks:</h5><div class="matchup-grid">';
        let defenseHtml = '<div class="matchup-section"><h5>Defends:</h5><div class="matchup-grid">';

        Object.values(ELEMENTS).forEach(targetElement => {
            const effectivenessType = matchups[targetElement];
            const effectiveness = DAMAGE_MULTIPLIERS[effectivenessType];
            const effectClass = effectivenessType.toLowerCase();
            const effectText = effectivenessType === 'POTENT' ? 'Potent' : effectivenessType === 'WEAK' ? 'Weak' : 'Neutral';

            attackHtml += `
                <div class="matchup-item ${effectClass}">
                    <span class="matchup-element element-${targetElement.toLowerCase()}">${targetElement}</span>
                    <span class="matchup-result">${effectText} (${effectiveness}x)</span>
                </div>
            `;

            // For defense, check what hits this element
            const incomingMatchupType = ELEMENT_MATCHUPS[targetElement][element];
            const incomingMatchup = DAMAGE_MULTIPLIERS[incomingMatchupType];
            const incomingClass = incomingMatchupType === 'POTENT' ? 'weak' : incomingMatchupType === 'WEAK' ? 'potent' : 'neutral';
            const incomingText = incomingMatchupType === 'POTENT' ? 'Weak' : incomingMatchupType === 'WEAK' ? 'Resists' : 'Neutral';

            defenseHtml += `
                <div class="matchup-item ${incomingClass}">
                    <span class="matchup-element element-${targetElement.toLowerCase()}">${targetElement}</span>
                    <span class="matchup-result">${incomingText} (${incomingMatchup}x)</span>
                </div>
            `;
        });

        attackHtml += '</div></div>';
        defenseHtml += '</div></div>';

        return attackHtml + defenseHtml;
    }

    // Render Rune inventory
    renderRuneInventory() {
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

            const runeCard = document.createElement('div');
            runeCard.className = `rune-card ${equippedTo ? 'equipped' : ''}`;
            runeCard.innerHTML = `
                <span class="rune-symbol">${rune.symbol}</span>
                <span class="rune-name">${rune.name}</span>
                <p class="rune-effect">${rune.effect}</p>
                ${equippedTo ? `<span class="equipped-to">Equipped to ${equippedTo.getName()}</span>` : ''}
            `;

            runeCard.addEventListener('click', () => this.showRuneOptions(runeId));
            grid.appendChild(runeCard);
        });

        container.appendChild(grid);
    }

    // Find which Vasen has a rune equipped
    findRuneEquippedTo(runeId) {
        for (const vasen of gameState.vasenCollection) {
            if (vasen.runes.includes(runeId)) {
                return vasen;
            }
        }
        return null;
    }

    // Render Item inventory
    renderItemInventory() {
        const container = this.tabContents.items;
        container.innerHTML = '';

        const itemEntries = Object.entries(gameState.itemInventory);
        if (itemEntries.length === 0) {
            container.innerHTML = '<p class="empty-message">You have no items. Explore to find them.</p>';
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'item-grid';

        itemEntries.forEach(([itemId, count]) => {
            const item = TAMING_ITEMS[itemId];
            if (!item) return;

            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            itemCard.innerHTML = `
                <div class="item-header">
                    <span class="item-name">${item.name}</span>
                    <span class="item-count">x${count}</span>
                </div>
            `;

            itemCard.addEventListener('click', () => this.showItemOptions(itemId));
            grid.appendChild(itemCard);
        });

        container.appendChild(grid);
    }

    // Render party slots
    renderParty() {
        this.partySlots.forEach((slot, index) => {
            const vasen = gameState.party[index];
            if (vasen) {
                slot.innerHTML = `
                    <div class="party-vasen element-${vasen.species.element.toLowerCase()}">
                        <img src="${vasen.species.image}" alt="${vasen.species.name}" class="party-vasen-img">
                        <div class="party-vasen-info">
                            <span class="party-vasen-name">${vasen.getDisplayName()}</span>
                            <span class="party-vasen-level">Lvl ${vasen.level}</span>
                        </div>
                        <div class="party-vasen-bars">
                            <div class="mini-bar health">
                                <div class="mini-bar-fill" style="width: ${(vasen.currentHealth / vasen.maxHealth) * 100}%"></div>
                            </div>
                            <div class="mini-bar megin">
                                <div class="mini-bar-fill" style="width: ${(vasen.currentMegin / vasen.maxMegin) * 100}%"></div>
                            </div>
                        </div>
                        <div class="party-vasen-runes">
                            ${vasen.runes.map(r => RUNES[r] ? `<span class="mini-rune" title="${RUNES[r].name}: ${RUNES[r].effect}">${RUNES[r].symbol}</span>` : '').join('')}
                        </div>
                        ${!gameState.inCombat ? `
                        <div class="party-slot-actions">
                            <button class="party-action-btn move-btn" onclick="event.stopPropagation(); ui.showMoveVasenOptions(${index})" title="Move to another slot">⇄</button>
                            <button class="party-action-btn remove-btn" onclick="event.stopPropagation(); ui.removeFromParty('${vasen.id}')" title="Remove from party">✕</button>
                        </div>
                        ` : ''}
                    </div>
                `;
                slot.classList.add('filled');
                slot.classList.remove('empty');
            } else {
                slot.innerHTML = `
                    <div class="party-empty">
                        <span>Empty Slot</span>
                        <span class="party-hint">${index === 0 ? 'Lead' : 'Backup'}</span>
                    </div>
                `;
                slot.classList.remove('filled');
                slot.classList.add('empty');
            }

            slot.onclick = () => this.handlePartySlotClick(index);
        });
    }

    // Show move väsen options
    showMoveVasenOptions(fromSlot) {
        if (gameState.inCombat) {
            this.showMessage('Cannot move Väsen during combat.', 'error');
            return;
        }

        const vasen = gameState.party[fromSlot];
        if (!vasen) return;

        const buttons = [];
        
        for (let i = 0; i < 3; i++) {
            if (i === fromSlot) continue;
            
            const targetVasen = gameState.party[i];
            const slotLabel = i === 0 ? 'Lead' : `Slot ${i + 1}`;
            
            buttons.push({
                text: targetVasen ? `Swap with ${targetVasen.getName()} (${slotLabel})` : `Move to ${slotLabel} (Empty)`,
                callback: () => {
                    gameState.swapPartySlots(fromSlot, i);
                    this.renderParty();
                    this.showMessage(`Moved ${vasen.getName()} to ${slotLabel}.`);
                }
            });
        }

        buttons.push({
            text: 'Cancel',
            class: 'btn-secondary',
            callback: null
        });

        this.showDialogue(
            `Move ${vasen.getName()}`,
            '<p>Select a slot to move to:</p>',
            buttons
        );
    }

    // Handle party slot click
    handlePartySlotClick(slotIndex) {
        if (gameState.inCombat) return;

        const vasen = gameState.party[slotIndex];
        if (vasen) {
            this.selectVasen(vasen);
        } else if (this.selectedVasen) {
            this.addToParty(this.selectedVasen.id, slotIndex);
        }
    }

    // Add Vasen to party
    addToParty(vasenId, preferredSlot = null) {
        if (gameState.inCombat) {
            this.showMessage('Cannot add Väsen during combat.', 'error');
            return;
        }
        
        // If no slot specified, find first available
        let slotIndex = preferredSlot;
        if (slotIndex === null) {
            slotIndex = gameState.party.findIndex(p => p === null);
            if (slotIndex === -1) {
                this.showMessage('No empty party slots available.', 'error');
                return;
            }
        }
        
        const result = gameState.addToParty(vasenId, slotIndex);
        if (result.success) {
            this.showMessage(result.message);
            this.renderParty();
            this.refreshCurrentTab();
            if (this.selectedVasen) {
                this.renderVasenDetails(this.selectedVasen);
            }
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    // Remove Vasen from party
    removeFromParty(vasenId) {
        if (gameState.inCombat) {
            this.showMessage('Cannot remove Väsen during combat.', 'error');
            return;
        }
        
        // Find the slot index for this vasen
        const slotIndex = gameState.party.findIndex(v => v && v.id === vasenId);
        if (slotIndex === -1) {
            this.showMessage('Väsen not found in party.', 'error');
            return;
        }
        
        const result = gameState.removeFromParty(slotIndex);
        if (result.success) {
            this.showMessage(result.message);
            this.renderParty();
            this.refreshCurrentTab();
            if (this.selectedVasen) {
                this.renderVasenDetails(this.selectedVasen);
            }
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    // Render zones
    renderZones() {
        this.zoneList.innerHTML = '';

        ZONE_ORDER.forEach(zoneId => {
            const zone = ZONES[zoneId];
            const isUnlocked = gameState.isZoneUnlocked(zoneId);
            const isSelected = gameState.currentZone === zoneId;
            const isCleared = gameState.defeatedGuardians.has(zoneId);

            const zoneBtn = document.createElement('button');
            zoneBtn.className = `zone-btn ${isUnlocked ? '' : 'locked'} ${isSelected ? 'selected' : ''} ${isCleared ? 'cleared' : ''}`;
            zoneBtn.disabled = !isUnlocked;

            if (isUnlocked) {
                zoneBtn.innerHTML = `
                    <span class="zone-name">${zone.name}</span>
                    <span class="zone-levels">Lvl ${zone.levelRange[0]}-${zone.levelRange[1]}</span>
                    ${isCleared ? '<span class="zone-cleared-badge">Cleared</span>' : ''}
                `;
                zoneBtn.onclick = () => this.selectZone(zoneId);
            } else {
                const prevZone = this.getPreviousZone(zoneId);
                zoneBtn.innerHTML = `
                    <span class="zone-name">${zone.name}</span>
                    <span class="zone-locked">Defeat ${prevZone ? ZONES[prevZone].guardian?.name || 'Guardian' : 'Guardian'} to unlock</span>
                `;
            }

            this.zoneList.appendChild(zoneBtn);
        });

        // Add Endless Tower if unlocked
        if (gameState.endlessTowerUnlocked) {
            const divider = document.createElement('div');
            divider.className = 'zone-divider';
            divider.textContent = 'Endless Tower';
            this.zoneList.appendChild(divider);

            ['endless-wild', 'endless-guardian'].forEach(mode => {
                const btn = document.createElement('button');
                btn.className = `zone-btn endless ${gameState.currentZone === mode ? 'selected' : ''}`;
                btn.innerHTML = `
                    <span class="zone-name">${mode === 'endless-wild' ? 'Wild Challenge' : 'Guardian Challenge'}</span>
                    <span class="zone-levels">Lvl 30+</span>
                `;
                btn.onclick = () => this.selectZone(mode);
                this.zoneList.appendChild(btn);
            });
        }

        this.updateExploreButton();
    }

    // Get previous zone
    getPreviousZone(zoneId) {
        const index = ZONE_ORDER.indexOf(zoneId);
        return index > 0 ? ZONE_ORDER[index - 1] : null;
    }

    // Select zone
    selectZone(zoneId) {
        gameState.currentZone = zoneId;
        this.renderZones();
        this.updateZoneDescription();
        this.updateExploreButton();
        gameState.saveGame();
    }

    // Update zone description
    updateZoneDescription() {
        const zone = ZONES[gameState.currentZone];
        if (!zone) {
            if (gameState.currentZone === 'endless-wild') {
                this.zoneDescription.innerHTML = `
                    <h3>Endless Tower - Wild</h3>
                    <p>Each floor brings stronger wild Vasen. Levels increase with every victory. Taming is disabled and attribute changes persist between floors.</p>
                `;
            } else if (gameState.currentZone === 'endless-guardian') {
                this.zoneDescription.innerHTML = `
                    <h3>Endless Tower - Guardian</h3>
                    <p>Each floor brings a stronger Guardian. Health and attribute changes are reset between floors.</p>
                `;
            }
            return;
        }

        this.zoneDescription.innerHTML = `
            <h3>${zone.name}</h3>
            <p>${zone.description}</p>
            <div class="zone-meta">
                <span>Level Range: ${zone.levelRange[0]} - ${zone.levelRange[1]}</span>
                ${zone.guardian ? `<span>Guardian: ${zone.guardian.name} (Lvl ${zone.guardian.team[0].level})</span>` : ''}
            </div>
        `;
    }

    // Update explore button
    updateExploreButton() {
        const zone = ZONES[gameState.currentZone];
        const hasParty = gameState.party.some(p => p !== null);

        // Check if it's endless tower mode
        if (gameState.currentZone === 'endless-wild' || gameState.currentZone === 'endless-guardian') {
            this.exploreBtn.textContent = 'Enter Tower';
            this.exploreBtn.disabled = !hasParty || gameState.inCombat;
            this.challengeBtn.style.display = 'none';
            return;
        }

        if (zone) {
            this.exploreBtn.innerHTML = `Explore <span class="btn-hint">(Lvl ${zone.levelRange[0]}-${zone.levelRange[1]})</span>`;
            this.exploreBtn.disabled = !hasParty || gameState.inCombat;

            // Show/hide challenge button
            if (zone.guardian && !gameState.currentZone.startsWith('endless')) {
                this.challengeBtn.style.display = 'block';
                this.challengeBtn.innerHTML = `Challenge Guardian <span class="btn-hint">(Lvl ${zone.guardian.team[0].level})</span>`;
                this.challengeBtn.disabled = !hasParty || gameState.inCombat;
            } else {
                this.challengeBtn.style.display = 'none';
            }
        }
    }

    // Show message
    showMessage(text, type = 'info') {
        const messageContainer = document.getElementById('message-container');
        const message = document.createElement('div');
        message.className = `game-message ${type}`;
        message.textContent = text;
        messageContainer.appendChild(message);

        setTimeout(() => {
            message.classList.add('fade-out');
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }

    // Combat UI methods
    showCombatUI() {
        this.zoneDescription.style.display = 'none';
        this.combatArea.style.display = 'flex';
        this.combatUI.style.display = 'flex';
        this.combatUI.classList.add('active');
        this.combatLogMessages = [];
        this.combatLog.innerHTML = '';
    }

    hideCombatUI() {
        this.combatArea.style.display = 'none';
        this.combatUI.style.display = 'none';
        this.combatUI.classList.remove('active');
        this.zoneDescription.style.display = 'block';
    }

    // Render combat state
    renderCombat(battle) {
        if (!battle) return;

        // Update turn counter
        document.getElementById('turn-counter').textContent = `Turn ${battle.turnCount}`;

        // Render player side
        this.renderCombatantPanel('player', battle.playerTeam[battle.playerActiveIndex], battle);

        // Render enemy side
        this.renderCombatantPanel('enemy', battle.enemyTeam[battle.enemyActiveIndex], battle);

        // Render swap options
        this.renderSwapOptions(battle);

        // Render action buttons
        this.renderActionButtons(battle);

        // Update party display
        this.renderParty();
    }

    // Render combatant panel
    renderCombatantPanel(side, vasen, battle) {
        const panel = document.getElementById(`${side}-panel`);
        if (!vasen) return;

        const healthPercent = (vasen.currentHealth / vasen.maxHealth) * 100;
        const meginPercent = (vasen.currentMegin / vasen.maxMegin) * 100;

        // Build runes HTML with "Rune:" label
        const runesHtml = vasen.runes.length > 0 
            ? `<span class="runes-label">Rune:</span> ${vasen.runes.map(r => RUNES[r] ? `<span class="combat-rune" title="${RUNES[r].name}: ${RUNES[r].effect}">${RUNES[r].symbol} ${RUNES[r].name}</span>` : '').join('')}`
            : '<span class="runes-label">Rune:</span> <span class="no-rune">None</span>';

        const defensiveTooltip = this.getDefensiveMatchupTooltip(vasen.species.element);
        const temperamentTooltip = `${vasen.temperament.name}: +${vasen.temperament.modifier} ${capitalize(vasen.temperament.positive)} / -${vasen.temperament.modifier} ${capitalize(vasen.temperament.negative)}`;

        panel.innerHTML = `
            <div class="combatant-header">
                <h4 class="combatant-name">${vasen.getDisplayName()}</h4>
                <span class="combatant-level">Lvl ${vasen.level}</span>
            </div>
            <div class="combatant-image-container">
                <img src="${vasen.species.image}" alt="${vasen.species.name}" class="combatant-image ${vasen.isKnockedOut() ? 'knocked-out' : ''}">
                ${vasen.battleFlags.hasSwapSickness ? '<span class="status-icon swap-sickness" title="Swap Sickness: Cannot Act">Preparing</span>' : ''}
            </div>
            <div class="combatant-bars">
                <div class="combat-bar health-bar">
                    <div class="combat-bar-fill health-fill" style="width: ${healthPercent}%"></div>
                    <span class="combat-bar-text">${vasen.currentHealth} / ${vasen.maxHealth}</span>
                </div>
                <div class="combat-bar megin-bar">
                    <div class="combat-bar-fill megin-fill" style="width: ${meginPercent}%"></div>
                    <span class="combat-bar-text">${vasen.currentMegin} / ${vasen.maxMegin}</span>
                </div>
            </div>
            <div class="combatant-info">
                <span class="element-badge element-${vasen.species.element.toLowerCase()}" title="${defensiveTooltip}">${vasen.species.element}</span>
                <span class="temperament-badge" title="${temperamentTooltip}">${vasen.temperament.name}</span>
            </div>
            <div class="combatant-attributes">
                <div class="combat-attr" title="Damage modifier for Strength Attacks">
                    <span class="combat-attr-name">Str</span>
                    <span class="combat-attr-value">${vasen.calculateAttribute('strength')}</span>
                </div>
                <div class="combat-attr" title="Damage modifier for Wisdom Attacks">
                    <span class="combat-attr-name">Wis</span>
                    <span class="combat-attr-value">${vasen.calculateAttribute('wisdom')}</span>
                </div>
                <div class="combat-attr" title="Reduces damage from Strength Attacks">
                    <span class="combat-attr-name">Def</span>
                    <span class="combat-attr-value">${vasen.calculateAttribute('defense')}</span>
                </div>
                <div class="combat-attr" title="Reduces damage from Wisdom Attacks">
                    <span class="combat-attr-name">Dur</span>
                    <span class="combat-attr-value">${vasen.calculateAttribute('durability')}</span>
                </div>
            </div>
            <div class="combatant-runes">
                ${runesHtml}
            </div>
            <div class="combatant-stages">
                ${this.renderAttributeStages(vasen)}
            </div>
            <div class="combatant-attack-elements">
                <span class="elements-label">Attack Elements:</span>
                ${vasen.getAttackElements().map(e => `<span class="element-mini element-${e.toLowerCase()}" title="${this.getElementMatchupTooltip(e)}">${e}</span>`).join('')}
            </div>
        `;
    }

    // Render attribute stages
    renderAttributeStages(vasen) {
        const stages = vasen.attributeStages;
        let html = '';

        ['strength', 'wisdom', 'defense', 'durability'].forEach(attr => {
            const stage = stages[attr];
            if (stage !== 0) {
                const stageClass = stage > 0 ? 'positive' : 'negative';
                const stageText = stage > 0 ? `+${stage}` : stage;
                html += `<span class="stage-indicator ${stageClass}" title="${capitalize(attr)}: ${stageText} ${Math.abs(stage) === 1 ? 'stage' : 'stages'}">${capitalize(attr).substring(0, 3)} ${stageText}</span>`;
            }
        });

        return html || '<span class="no-stages">No attribute changes</span>';
    }

    // Render swap options
    renderSwapOptions(battle) {
        const swapContainer = document.getElementById('swap-options');
        swapContainer.innerHTML = '';

        battle.playerTeam.forEach((vasen, index) => {
            if (index === battle.playerActiveIndex || vasen.isKnockedOut()) return;

            const btn = document.createElement('button');
            btn.className = 'swap-btn';
            btn.innerHTML = `
                <img src="${vasen.species.image}" alt="${vasen.species.name}" class="swap-thumb">
                <span>${vasen.getName()}</span>
                <span class="swap-health">${vasen.currentHealth}/${vasen.maxHealth}</span>
            `;
            btn.onclick = () => game.handleSwap(index);
            swapContainer.appendChild(btn);
        });
    }

    // Render action buttons
    renderActionButtons(battle) {
        const actionsContainer = document.getElementById('ability-buttons');
        actionsContainer.innerHTML = '';

        const activeVasen = battle.playerTeam[battle.playerActiveIndex];
        if (!activeVasen || activeVasen.isKnockedOut()) return;

        const abilities = activeVasen.getAvailableAbilities();

        abilities.forEach(abilityName => {
            const ability = ABILITIES[abilityName];
            if (!ability) return;

            const meginCost = activeVasen.getAbilityMeginCost(abilityName);
            const canUse = activeVasen.canUseAbility(abilityName) && !activeVasen.battleFlags.hasSwapSickness;
            
            // Handle Basic Strike's null element - use Väsen's element
            const abilityElement = ability.element || activeVasen.species.element;
            const elementTooltip = this.getElementMatchupTooltip(abilityElement);

            const btn = document.createElement('button');
            btn.className = `ability-btn element-${abilityElement.toLowerCase()} ${canUse ? '' : 'disabled'}`;
            btn.disabled = !canUse || !battle.waitingForPlayerAction;
            btn.innerHTML = `
                <span class="ability-btn-name">${ability.name}</span>
                <span class="ability-btn-type">${ability.type}</span>
                <span class="ability-btn-stats">
                    <span class="ability-btn-element element-${abilityElement.toLowerCase()}" title="${elementTooltip}">${abilityElement}</span>
                    ${ability.power ? `<span class="ability-btn-power">Power: ${ability.power}</span>` : ''}
                    <span class="ability-btn-cost">Megin: ${meginCost}</span>
                </span>
                <span class="ability-btn-desc">${ability.description}</span>
            `;
            btn.onclick = () => game.handleAbilityUse(abilityName);
            actionsContainer.appendChild(btn);
        });

        // Update other action buttons
        document.getElementById('btn-swap').disabled = !battle.waitingForPlayerAction || activeVasen.battleFlags.hasSwapSickness;
        document.getElementById('btn-gift').disabled = !battle.waitingForPlayerAction || !battle.isWildEncounter || battle.giftsGiven >= GAME_CONFIG.MAX_GIFTS_PER_COMBAT || battle.correctItemGiven;
        document.getElementById('btn-ask').disabled = !battle.waitingForPlayerAction || !battle.isWildEncounter || activeVasen.battleFlags.hasSwapSickness;
        document.getElementById('btn-pass').disabled = !battle.waitingForPlayerAction;
        document.getElementById('btn-surrender').disabled = false;
    }

    // Add combat log message
    addCombatLog(message, type = 'normal') {
        const logEntry = document.createElement('div');
        logEntry.className = `combat-log-entry ${type}`;
        logEntry.textContent = message;

        this.combatLog.appendChild(logEntry);
        this.combatLogMessages.push({ message, type });

        // Cap at max messages
        while (this.combatLogMessages.length > GAME_CONFIG.MAX_BATTLE_LOG) {
            this.combatLogMessages.shift();
            this.combatLog.removeChild(this.combatLog.firstChild);
        }

        // Scroll to bottom
        this.combatLog.scrollTop = this.combatLog.scrollHeight;
    }

    // Clear combat log
    clearCombatLog() {
        this.combatLog.innerHTML = '';
        this.combatLogMessages = [];
    }

    // Flash combatant (when hit)
    flashCombatant(side) {
        const panel = document.getElementById(`${side}-panel`);
        const image = panel.querySelector('.combatant-image');
        if (image) {
            image.classList.add('hit-flash');
            setTimeout(() => image.classList.remove('hit-flash'), 200);
        }
    }

    // Get element matchup tooltip (offensive - what this element hits)
    getElementMatchupTooltip(element) {
        const matchups = ELEMENT_MATCHUPS[element];
        let text = `${element} Attacks:\n`;
        ELEMENT_LIST.forEach(e => {
            const matchupType = matchups[e];
            const multiplier = DAMAGE_MULTIPLIERS[matchupType];
            const result = matchupType === 'POTENT' ? 'Potent' : matchupType === 'WEAK' ? 'Weak' : 'Neutral';
            text += `vs ${e}: ${result} (${multiplier}x)\n`;
        });
        return text;
    }

    // Get defensive matchup tooltip (what hits this element)
    getDefensiveMatchupTooltip(element) {
        let text = `${element} Defense:\n`;
        ELEMENT_LIST.forEach(attackingElement => {
            const matchupType = ELEMENT_MATCHUPS[attackingElement][element];
            const multiplier = DAMAGE_MULTIPLIERS[matchupType];
            const result = matchupType === 'POTENT' ? 'Weak to' : matchupType === 'WEAK' ? 'Resists' : 'Neutral vs';
            text += `${result} ${attackingElement} (${multiplier}x)\n`;
        });
        return text;
    }

    // Show dialogue modal
    showDialogue(title, message, buttons = [{ text: 'Confirm', callback: null }]) {
        const modal = document.getElementById('dialogue-modal');
        document.getElementById('dialogue-title').textContent = title;
        document.getElementById('dialogue-message').innerHTML = message;

        const btnContainer = document.getElementById('dialogue-buttons');
        btnContainer.innerHTML = '';

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `btn ${btn.class || 'btn-primary'}`;
            button.textContent = btn.text;
            button.onclick = () => {
                modal.classList.remove('active');
                if (btn.callback) btn.callback();
            };
            btnContainer.appendChild(button);
        });

        modal.classList.add('active');
    }

    // Show gift item modal
    showGiftModal(battle) {
        const modal = document.getElementById('gift-modal');
        const itemList = document.getElementById('gift-item-list');
        itemList.innerHTML = '';

        const items = Object.entries(gameState.itemInventory);
        if (items.length === 0) {
            itemList.innerHTML = '<p class="empty-message">You have no items to gift.</p>';
        } else {
            items.forEach(([itemId, count]) => {
                const item = TAMING_ITEMS[itemId];
                if (!item) return;

                const itemBtn = document.createElement('button');
                itemBtn.className = 'gift-item-btn';
                itemBtn.innerHTML = `
                    <span class="gift-item-name">${item.name}</span>
                    <span class="gift-item-count">x${count}</span>
                `;
                itemBtn.onclick = () => {
                    modal.classList.remove('active');
                    game.handleGiftItem(itemId);
                };
                itemList.appendChild(itemBtn);
            });
        }

        document.getElementById('close-gift-modal').onclick = () => modal.classList.remove('active');
        modal.classList.add('active');
    }

    // Show rune equip modal
    showRuneEquipModal(vasenId) {
        const modal = document.getElementById('rune-equip-modal');
        const runeList = document.getElementById('rune-equip-list');
        runeList.innerHTML = '';

        const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
        if (!vasen) return;

        const availableRunes = Array.from(gameState.collectedRunes).filter(runeId => {
            // Check if already equipped to this vasen
            if (vasen.runes.includes(runeId)) return false;
            // Check if equipped to another vasen
            const equippedTo = this.findRuneEquippedTo(runeId);
            return !equippedTo;
        });

        if (availableRunes.length === 0) {
            runeList.innerHTML = '<p class="empty-message">No available runes to equip.</p>';
        } else {
            availableRunes.forEach(runeId => {
                const rune = RUNES[runeId];
                const runeBtn = document.createElement('button');
                runeBtn.className = 'rune-equip-btn';
                runeBtn.innerHTML = `
                    <span class="rune-symbol">${rune.symbol}</span>
                    <span class="rune-name">${rune.name}</span>
                    <span class="rune-effect">${rune.effect}</span>
                `;
                runeBtn.onclick = () => {
                    modal.classList.remove('active');
                    this.equipRune(vasenId, runeId);
                };
                runeList.appendChild(runeBtn);
            });
        }

        document.getElementById('close-rune-equip-modal').onclick = () => modal.classList.remove('active');
        modal.classList.add('active');
    }

    // Equip rune
    equipRune(vasenId, runeId) {
        // Find the party slot index for this vasen
        const partySlotIndex = gameState.party.findIndex(v => v && v.id === vasenId);
        if (partySlotIndex === -1) {
            this.showMessage('No Väsen can equip this rune.', 'error');
            return;
        }
        
        // Find available rune slot (0 or 1 if level 30+)
        const vasen = gameState.party[partySlotIndex];
        let runeSlotIndex = 0;
        
        // Check if slot 0 is occupied
        if (gameState.partyRuneSlots[partySlotIndex][0] !== null) {
            // If level 30+ and slot 1 is empty, use slot 1
            if (vasen.level >= GAME_CONFIG.MAX_LEVEL && gameState.partyRuneSlots[partySlotIndex][1] === null) {
                runeSlotIndex = 1;
            } else {
                // Swap: unequip existing rune in slot 0 first
                gameState.unequipRune(partySlotIndex, 0);
                runeSlotIndex = 0;
            }
        }
        
        const result = gameState.equipRune(runeId, partySlotIndex, runeSlotIndex);
        this.showMessage(result.message, result.success ? 'info' : 'error');
        this.refreshCurrentTab();
        this.renderParty(); // Update party display to show new rune
        if (this.selectedVasen && this.selectedVasen.id === vasenId) {
            this.renderVasenDetails(this.selectedVasen);
        }
    }

    // Unequip rune
    unequipRune(vasenId, runeId) {
        // Find the party slot index for this vasen
        const partySlotIndex = gameState.party.findIndex(v => v && v.id === vasenId);
        if (partySlotIndex === -1) {
            this.showMessage('Väsen not found in party.', 'error');
            return;
        }
        
        // Find which rune slot has this rune
        const runeSlotIndex = gameState.partyRuneSlots[partySlotIndex].indexOf(runeId);
        if (runeSlotIndex === -1) {
            this.showMessage('Rune not found on this Väsen.', 'error');
            return;
        }
        
        const result = gameState.unequipRune(partySlotIndex, runeSlotIndex);
        this.showMessage(result.message, result.success ? 'info' : 'error');
        this.refreshCurrentTab();
        this.renderParty(); // Update party display
        if (this.selectedVasen && this.selectedVasen.id === vasenId) {
            this.renderVasenDetails(this.selectedVasen);
        }
    }

    // Show item options
    showItemOptions(itemId) {
        const item = TAMING_ITEMS[itemId];
        if (!item) return;

        // Check if we can gift during combat
        const canGift = gameState.inCombat && 
                        game.currentBattle && 
                        game.currentBattle.isWildEncounter && 
                        game.currentBattle.waitingForPlayerAction &&
                        game.currentBattle.giftsGiven < GAME_CONFIG.MAX_GIFTS_PER_COMBAT &&
                        !game.currentBattle.correctItemGiven;

        const buttons = [
            {
                text: 'Heal a Väsen',
                callback: () => this.showHealVasenModal(itemId)
            }
        ];

        // Add Gift Item button if in combat with wild encounter
        if (canGift) {
            buttons.push({
                text: 'Gift Item',
                class: 'btn-primary',
                callback: () => game.handleGiftItem(itemId)
            });
        }

        buttons.push({
            text: 'Cancel',
            class: 'btn-secondary',
            callback: null
        });

        this.showDialogue(
            item.name,
            `<p>${item.description}</p>`,
            buttons
        );
    }

    // Show heal vasen modal
    showHealVasenModal(itemId) {
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
                    <img src="${vasen.species.image}" alt="${vasen.species.name}" class="heal-vasen-img">
                    <div class="heal-vasen-info">
                        <span class="heal-vasen-name">${vasen.getDisplayName()}</span>
                        <span class="heal-vasen-health">${vasen.currentHealth}/${vasen.maxHealth} HP</span>
                        <span class="heal-amount">+${Math.floor(vasen.maxHealth * healPercent)} HP</span>
                    </div>
                `;
                vasenBtn.onclick = () => {
                    modal.classList.remove('active');
                    game.healVasenWithItem(vasen.id, itemId);
                };
                vasenList.appendChild(vasenBtn);
            });
        }

        document.getElementById('close-heal-modal').onclick = () => modal.classList.remove('active');
        modal.classList.add('active');
    }

    // Show rune options
    showRuneOptions(runeId) {
        const rune = RUNES[runeId];
        const equippedTo = this.findRuneEquippedTo(runeId);

        let message = `<p class="rune-flavor">${rune.flavor}</p><p class="rune-effect">${rune.effect}</p>`;
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
    }

    // Show rune equip to vasen modal
    showRuneEquipToVasenModal(runeId) {
        const modal = document.getElementById('rune-to-vasen-modal');
        const vasenList = document.getElementById('rune-to-vasen-list');
        vasenList.innerHTML = '';

        const currentOwner = this.findRuneEquippedTo(runeId);

        // Show all party members (can equip to any, will auto-unequip from current)
        const eligibleVasen = gameState.party.filter(v => v !== null);

        if (eligibleVasen.length === 0) {
            vasenList.innerHTML = '<p class="empty-message">No Väsen in your party. Add a Väsen to your party first.</p>';
        } else {
            eligibleVasen.forEach(vasen => {
                const partySlotIndex = gameState.party.indexOf(vasen);
                const currentRunes = gameState.partyRuneSlots[partySlotIndex].filter(r => r !== null);
                const maxRunes = vasen.level >= GAME_CONFIG.MAX_LEVEL ? 2 : 1;
                const hasThisRune = currentRunes.includes(runeId);
                
                const vasenBtn = document.createElement('button');
                vasenBtn.className = `rune-to-vasen-btn ${hasThisRune ? 'current-owner' : ''}`;
                vasenBtn.disabled = hasThisRune;
                vasenBtn.innerHTML = `
                    <img src="${vasen.species.image}" alt="${vasen.species.name}" class="rune-vasen-img">
                    <div class="rune-vasen-info">
                        <span class="rune-vasen-name">${vasen.getDisplayName()}</span>
                        <span class="rune-vasen-level">Lvl ${vasen.level}</span>
                        <span class="rune-vasen-slots">${currentRunes.length}/${maxRunes} runes${hasThisRune ? ' (Current)' : ''}</span>
                    </div>
                `;
                if (!hasThisRune) {
                    vasenBtn.onclick = () => {
                        modal.classList.remove('active');
                        this.equipRuneToVasen(vasen.id, runeId);
                    };
                }
                vasenList.appendChild(vasenBtn);
            });
        }

        document.getElementById('close-rune-to-vasen-modal').onclick = () => modal.classList.remove('active');
        modal.classList.add('active');
    }

    // Equip rune to väsen (with auto-unequip from previous owner)
    equipRuneToVasen(vasenId, runeId) {
        // First, unequip from current owner if any
        const currentOwner = this.findRuneEquippedTo(runeId);
        if (currentOwner) {
            const currentOwnerSlot = gameState.party.findIndex(v => v && v.id === currentOwner.id);
            if (currentOwnerSlot !== -1) {
                const runeSlotIndex = gameState.partyRuneSlots[currentOwnerSlot].indexOf(runeId);
                if (runeSlotIndex !== -1) {
                    gameState.unequipRune(currentOwnerSlot, runeSlotIndex);
                }
            }
        }

        // Now equip to new owner
        this.equipRune(vasenId, runeId);
    }

    // Settings methods
    showSettings() {
        this.settingsModal.classList.add('active');
    }

    hideSettings() {
        this.settingsModal.classList.remove('active');
    }

    exportSave() {
        const saveData = gameState.exportSave();
        navigator.clipboard.writeText(saveData).then(() => {
            this.showMessage('Progress exported to clipboard!');
        }).catch(() => {
            // Fallback: show in textarea
            const textarea = document.getElementById('import-save-data');
            textarea.value = saveData;
            this.showMessage('Copy the save data from the text area.');
        });
    }

    importSave() {
        const saveData = document.getElementById('import-save-data').value.trim();
        if (!saveData) {
            this.showMessage('Please paste save data first.', 'error');
            return;
        }

        const result = gameState.importSave(saveData);
        if (result.success) {
            this.showMessage(result.message);
            this.hideSettings();
            game.refreshUI();
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    confirmReset() {
        this.showDialogue(
            'Reset Game',
            'Reset all progress? All caught Väsen, runes, and zone progress will be lost permanently. Confirm to proceed.',
            [
                {
                    text: 'Reset',
                    class: 'btn-danger',
                    callback: () => {
                        gameState.resetGame();
                        // Clear game controller combat state
                        game.currentBattle = null;
                        game.endlessTowerMode = null;
                        game.endlessTowerFloor = 0;
                        // Hide combat UI if visible
                        this.hideCombatUI();
                        this.hideSettings();
                        game.showStarterSelection();
                        this.showMessage('Progress reset. You awaken again in the strange forest.');
                    }
                },
                {
                    text: 'Cancel',
                    class: 'btn-secondary',
                    callback: null
                }
            ]
        );
    }

    // Combat tips
    showCombatTips() {
        this.combatTipsModal.classList.add('active');
    }

    hideCombatTips() {
        this.combatTipsModal.classList.remove('active');
    }

    // Profile
    showProfile() {
        this.profileModal.classList.add('active');
        this.renderProfile();
    }

    hideProfile() {
        this.profileModal.classList.remove('active');
    }

    renderProfile() {
        const content = document.getElementById('profile-content');

        // Achievements
        let achievementsHtml = '<div class="achievements-section"><h4>Achievements</h4><div class="achievements-grid">';
        Object.values(ACHIEVEMENTS).forEach(achievement => {
            // Check if achievement is earned
            const earned = gameState.achievements[achievement.id] === true;
            achievementsHtml += `
                <div class="achievement ${earned ? 'earned' : 'locked'}">
                    <span class="achievement-name">${achievement.name}</span>
                    <span class="achievement-desc">${achievement.description}</span>
                </div>
            `;
        });
        achievementsHtml += '</div></div>';

        // Endless Tower records
        let recordsHtml = '<div class="records-section"><h4>Endless Tower Records</h4>';

        if (gameState.endlessTowerRecords.wild.floor > 0) {
            const wild = gameState.endlessTowerRecords.wild;
            recordsHtml += `
                <div class="record-entry">
                    <span class="record-mode">Wild: Floor ${wild.floor}</span>
                    <span class="record-team">${wild.team.map(t => `Lvl ${t.level} ${t.temperament} ${t.species} ${t.runes.map(r => RUNES[r]?.symbol || '').join('')}`).join(', ')}</span>
                </div>
            `;
        } else {
            recordsHtml += '<p class="no-record">No Wild record yet</p>';
        }

        if (gameState.endlessTowerRecords.guardian.floor > 0) {
            const guardian = gameState.endlessTowerRecords.guardian;
            recordsHtml += `
                <div class="record-entry">
                    <span class="record-mode">Guardian: Floor ${guardian.floor}</span>
                    <span class="record-team">${guardian.team.map(t => `Lvl ${t.level} ${t.temperament} ${t.species} ${t.runes.map(r => RUNES[r]?.symbol || '').join('')}`).join(', ')}</span>
                </div>
            `;
        } else {
            recordsHtml += '<p class="no-record">No Guardian record yet</p>';
        }

        recordsHtml += '</div>';

        content.innerHTML = `
            <div class="profile-name-section">
                <label for="profile-name-input">Player Name:</label>
                <input type="text" id="profile-name-input" value="${gameState.playerName || ''}" placeholder="Väktare" maxlength="20">
                <button id="save-name-btn" class="btn btn-small">Save</button>
            </div>
            <div class="profile-stats">
                <p>Väsen Variants Caught: ${gameState.vasenCollection.length} / ${GAME_CONFIG.MAX_INVENTORY_SIZE}</p>
                <p>Runes Collected: ${gameState.collectedRunes.size} / ${RUNE_LIST.length}</p>
                <p>Zones Cleared: ${gameState.defeatedGuardians.size} / ${ZONE_ORDER.length}</p>
            </div>
            ${achievementsHtml}
            ${recordsHtml}
        `;
        
        // Add save name listener
        document.getElementById('save-name-btn').addEventListener('click', () => {
            const newName = document.getElementById('profile-name-input').value.trim();
            gameState.playerName = newName;
            const displayName = newName || 'Väktare';
            this.playerNameDisplay.textContent = `Player Profile: ${displayName}`;
            gameState.saveGame();
            this.showMessage('Name saved!');
        });
    }

    changeName() {
        const newName = prompt('Enter new name:', gameState.playerName);
        if (newName && newName.trim()) {
            gameState.playerName = newName.trim();
            this.playerNameDisplay.textContent = gameState.playerName;
            gameState.saveGame();
            this.showMessage('Name changed successfully!');
        }
    }

    // Update player name display
    updatePlayerName() {
        const name = gameState.playerName || 'Väktare';
        this.playerNameDisplay.textContent = `Player Profile: ${name}`;
    }

    // Show knockout swap modal
    showKnockoutSwapModal(battle, callback) {
        const modal = document.getElementById('knockout-swap-modal');
        const vasenList = document.getElementById('knockout-swap-list');
        vasenList.innerHTML = '';

        const availableVasen = battle.playerTeam.filter((v, i) => i !== battle.playerActiveIndex && !v.isKnockedOut());

        if (availableVasen.length === 0) {
            // No one to swap to - battle lost
            modal.classList.remove('active');
            callback(null);
            return;
        }

        availableVasen.forEach((vasen, idx) => {
            const actualIndex = battle.playerTeam.indexOf(vasen);
            const vasenBtn = document.createElement('button');
            vasenBtn.className = 'knockout-swap-btn';
            vasenBtn.innerHTML = `
                <img src="${vasen.species.image}" alt="${vasen.species.name}" class="swap-img">
                <div class="swap-info">
                    <span class="swap-name">${vasen.getDisplayName()}</span>
                    <span class="swap-health">${vasen.currentHealth}/${vasen.maxHealth} HP</span>
                </div>
            `;
            vasenBtn.onclick = () => {
                modal.classList.remove('active');
                callback(actualIndex);
            };
            vasenList.appendChild(vasenBtn);
        });

        // Auto-select if only one option
        if (availableVasen.length === 1) {
            const actualIndex = battle.playerTeam.indexOf(availableVasen[0]);
            modal.classList.remove('active');
            callback(actualIndex);
            return;
        }

        modal.classList.add('active');
    }

    // Show encounter result
    showEncounterResult(result) {
        switch (result.type) {
            case 'vasen':
                this.showDialogue(
                    'Wild Encounter!',
                    `<p>A wild <strong>${result.vasen.getDisplayName()}</strong> appears!</p>`,
                    [{ text: 'Battle!', callback: () => game.startBattle(result.vasen) }]
                );
                break;

            case 'item':
                this.showDialogue(
                    'Item Found!',
                    `<p>${result.dialogue}</p>`,
                    [{ text: 'Confirm', callback: null }]
                );
                break;

            case 'well':
                this.showDialogue(
                    'Sacred Well',
                    `<p>${result.dialogue}</p>`,
                    [{ text: 'Confirm', callback: null }]
                );
                break;

            case 'rune':
                this.showDialogue(
                    'Rune Discovered!',
                    `<p>${result.dialogue}</p><p class="rune-reveal"><span class="rune-symbol large">${RUNES[result.runeId].symbol}</span> ${RUNES[result.runeId].name}</p>`,
                    [{ text: 'Confirm', callback: null }]
                );
                break;
        }
    }

    // Show battle result
    showBattleResult(result) {
        let message = '';
        let buttons = [{ text: 'Continue', callback: () => game.endBattle() }];

        if (result.victory) {
            message = '<p>Your party triumphs!</p>';

            if (result.tamed) {
                message += `<p><strong>${result.tamedVasen.getDisplayName()}</strong> has joined your party!</p>`;
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

        this.showDialogue(result.victory ? 'Victory!' : 'Defeat', message, buttons);
    }

    // Show endless tower result
    showEndlessTowerResult(result) {
        let message = `<p>Run ended. Reached floor ${result.floor} in Endless Tower ${result.mode === 'wild' ? 'Wild' : 'Guardian'}.</p>`;

        if (result.newRecord) {
            message += `<p class="new-record">New Record!</p>`;
        }

        this.showDialogue('Endless Tower', message, [{ text: 'Return', callback: () => game.exitEndlessTower() }]);
    }

    // Refresh all UI
    refreshAll() {
        this.renderParty();
        this.renderZones();
        this.updateZoneDescription();
        this.refreshCurrentTab();
        this.updatePlayerName();

        if (this.selectedVasen) {
            const updatedVasen = gameState.vasenCollection.find(v => v.id === this.selectedVasen.id);
            if (updatedVasen) {
                this.selectedVasen = updatedVasen;
                this.renderVasenDetails(updatedVasen);
            }
        }
    }
}

// Helper function
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Create global instance
const ui = new UIController();
