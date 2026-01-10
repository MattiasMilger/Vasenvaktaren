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

// IMPORT SAVE
const importTextarea = document.getElementById('import-save-data');
const confirmImportBtn = document.getElementById('confirm-import-btn');

document.getElementById('import-save-btn').addEventListener('click', () => {
    const isHidden = importTextarea.style.display === 'none';

    importTextarea.style.display = isHidden ? 'block' : 'none';
    confirmImportBtn.style.display = isHidden ? 'block' : 'none';

    if (isHidden) {
        importTextarea.focus();
    }
});

// Ctrl+Enter or Cmd+Enter to import
importTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        this.importSave();
    }
});

// Click "Import Now" button
confirmImportBtn.addEventListener('click', () => {
    this.importSave();
});

document.getElementById('reset-game-btn').addEventListener('click', () => this.confirmReset());

// Combat tips
document.getElementById('combat-tips-btn').addEventListener('click', () => this.showCombatTips());
document.getElementById('close-combat-tips').addEventListener('click', () => this.hideCombatTips());

// Profile
document.getElementById('player-profile').addEventListener('click', () => this.showProfile());
document.getElementById('close-profile').addEventListener('click', () => this.hideProfile());
document.getElementById('change-name-btn').addEventListener('click', () => this.changeName());

// Close modals on backdrop click (only if dismissible)
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            const isDismissible = modal.dataset.dismissible !== 'false';
            if (isDismissible) {
                modal.classList.remove('active');
            }
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
            familyHeader.title = FAMILY_DESCRIPTIONS[family] || 'No description available';
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
                // Highlight if currently selected
                if (this.selectedVasen && this.selectedVasen.id === vasen.id) {
                    card.classList.add('selected');
                }
                familySection.appendChild(card);
            });

            container.appendChild(familySection);
        });
    }

    // Create a Väsen card
    createVasenCard(vasen, showActions = true) {
        const card = document.createElement('div');
        card.className = `vasen-card element-${vasen.species.element.toLowerCase()}`;
        card.dataset.vasenId = vasen.id;

        const isInParty = gameState.party.some(p => p && p.id === vasen.id);
        const hasEmptySlot = gameState.party.some(p => p === null);
        const canAdd = !isInParty && hasEmptySlot && !gameState.inCombat;
        const canSwap = !isInParty && !hasEmptySlot && !gameState.inCombat;

        card.innerHTML = `
            <div class="vasen-card-header">
                <img src="${vasen.species.image}" alt="${vasen.species.name}" class="vasen-thumb">
                <div class="vasen-card-info">
                    <span class="vasen-name">${vasen.getDisplayName()}</span>
                    <span class="vasen-level">Lvl ${vasen.level}</span>
                </div>
                ${canAdd ? `<button class="vasen-add-btn" onclick="event.stopPropagation(); ui.addToParty('${vasen.id}')" title="Add to party">+</button>` : ''}
                ${canSwap ? `<button class="vasen-add-btn" onclick="event.stopPropagation(); ui.showSwapIntoPartyModal('${vasen.id}')" title="Swap with party member">+</button>` : ''}
            </div>
            <div class="vasen-card-details">
                <span 
                    class="element-badge element-${vasen.species.element.toLowerCase()}"
                    title="${this.getDefensiveMatchupTooltip(vasen.species.element)}"
                >
                    ${vasen.species.element}
                </span>
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
        if (this.selectedVasen && this.selectedVasen.id === vasen.id) {
            // If the same väsen is clicked again, deselect it
            this.selectedVasen = null;
        } else {
            // Otherwise, select the new väsen
            this.selectedVasen = vasen;
        }
        
        this.renderVasenDetails(this.selectedVasen);
        this.renderVasenInventory(); // Rerender inventory to update 'selected' class
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
            // Clear the panel if no väsen is selected
            panel.innerHTML = '<p class="empty-message">Select a Väsen to view details</p>';
            return;
        }

        const isInParty = gameState.party.some(p => p && p.id === vasen.id);
        const runeSlots = vasen.level >= 30 ? 2 : 1;
        const expProgress = vasen.getExpProgress();
        const defensiveTooltip = this.getDefensiveMatchupTooltip(vasen.species.element);
        const familyDescription = FAMILY_DESCRIPTIONS[vasen.species.family] || 'No description available';

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

    <button class="btn btn-danger release-btn" onclick="ui.confirmReleaseVasen('${vasen.id}')">
    Release
</button>

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
                    <div class="rune-slot filled" title="${rune.name}: ${rune.effect}" onclick="ui.showRuneEquipModal('${vasen.id}')">
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
            runeCard.title = rune.flavor;
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
            // Note: This relies on TAMING_ITEMS, ensure your item data is in that object.
            const item = TAMING_ITEMS[itemId]; 
            if (!item) return;

            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            
            // Description Tooltip
            itemCard.title = item.description; 
            
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
                // Show stat stages during combat
                const stagesHtml = gameState.inCombat ? `
                    <div class="party-vasen-stages">
                        ${this.renderMiniAttributeStages(vasen)}
                    </div>
                ` : '';
                
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
                        ${stagesHtml}
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

    // Render mini attribute stages for party display
    renderMiniAttributeStages(vasen) {
        const stages = vasen.attributeStages;
        let html = '';

        ['strength', 'wisdom', 'defense', 'durability'].forEach(attr => {
            const stage = stages[attr];
            if (stage !== 0) {
                const stageClass = stage > 0 ? 'positive' : 'negative';
                const stageText = stage > 0 ? `+${stage}` : stage;
                const abbrev = attr.substring(0, 3).toUpperCase();
                html += `<span class="mini-stage ${stageClass}" title="${capitalize(attr)}: ${stageText}">${abbrev}${stageText}</span>`;
            }
        });

        return html || '';
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
    text: targetVasen ? `
        <div class="swap-option">
            <img src="${targetVasen.species.image}" alt="${targetVasen.getName()}">
            <span>Swap with ${targetVasen.getName()} (${slotLabel})</span>
        </div>
    ` : `
    <div class="swap-option">
        <span>Move to ${slotLabel} (Empty)</span>
    </div>
`,

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
    buttons,
    true,
    'move-vasen-dialogue'
);
    }

// Handle party slot click
handlePartySlotClick(slotIndex) {
    const vasen = gameState.party[slotIndex];

    if (vasen) {
        // Allow selecting a väsen to view its details, regardless of combat state
        this.selectVasen(vasen);
    }

    // If in combat, stop here to prevent other actions (like adding to an empty slot)
    if (gameState.inCombat) return;

    // Non-combat logic: empty slot behavior
    if (!vasen) {
        // Always open the choose-a-väsen menu
        this.showAddVasenMenu(slotIndex);
        return;
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
        // Party is full → open swap modal
        this.showSwapIntoPartyModal(vasenId);
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

    // Release Väsen from inventory
    releaseVasen(vasenId) {
    // Remove from party if present
    gameState.party = gameState.party.map(p => p && p.id === vasenId ? null : p);

    // Remove from collection
    gameState.vasenCollection = gameState.vasenCollection.filter(v => v.id !== vasenId);

    // Clear selection
    this.selectedVasen = null;

    // Clear selection and reset tab
this.selectedVasen = null;
this.currentTab = 'vasen';

// Full UI rebuild
this.switchTab('vasen');   // <-- forces full re-render of inventory + details
this.renderParty();        // <-- re-renders party slots

// Save AFTER UI is stable
gameState.saveGame();

this.showMessage('Väsen released.', 'info');

}

    // Show swap into party modal (when party is full)
    showSwapIntoPartyModal(vasenId) {
        if (gameState.inCombat) {
            this.showMessage('Cannot swap Väsen during combat.', 'error');
            return;
        }

        const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
        if (!vasen) {
            this.showMessage('Väsen not found.', 'error');
            return;
        }

        const buttons = [];

        gameState.party.forEach((partyVasen, index) => {
            if (partyVasen) {
                const slotLabel = index === 0 ? 'Lead' : `Slot ${index + 1}`;
                buttons.push({
    text: `
        <div class="swap-option">
            <img src="${partyVasen.species.image}" alt="${partyVasen.getName()}">
            <span>Replace ${partyVasen.getName()} (${slotLabel})</span>
        </div>
    `,
    callback: () => {
        gameState.removeFromParty(index);
        gameState.addToParty(vasenId, index);
        this.showMessage(`${vasen.getName()} swapped in for ${partyVasen.getName()}.`);
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
    }

    // Render zones
renderZones() {
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
        }

        this.zoneList.appendChild(zoneBtn);
    });

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

        if (zone) {
            this.exploreBtn.innerHTML = `Explore <span class="btn-hint">(Lvl ${zone.levelRange[0]}-${zone.levelRange[1]})</span>`;
            this.exploreBtn.disabled = !hasParty || gameState.inCombat;

            // Show/hide challenge button
            if (zone.guardian) {
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

        // Render action buttons
        this.renderActionButtons(battle);

        // Update party display
        this.renderParty();
    }

    // Show väsen menu
    showAddVasenMenu(slotIndex) {
    const modal = document.getElementById('add-vasen-modal');
    const list = document.getElementById('add-vasen-list');
    list.innerHTML = '';

    // Sort like inventory: by family, then name
    const sorted = [...gameState.vasenCollection].sort((a, b) => {
        if (a.species.family !== b.species.family)
            return a.species.family.localeCompare(b.species.family);
        return a.getDisplayName().localeCompare(b.getDisplayName());
    });

    sorted.forEach(vasen => {
        const btn = document.createElement('button');
        btn.className = 'rune-to-vasen-btn';

        btn.innerHTML = `
            <div class="swap-option">
                <img src="${vasen.species.image}" alt="${vasen.getDisplayName()}" class="rune-vasen-img">
                <div class="rune-vasen-info">
                    <span class="rune-vasen-name">${vasen.getDisplayName()}</span>
                    <span class="rune-vasen-level">Lvl ${vasen.level}</span>
                </div>
            </div>
        `;

        btn.onclick = () => {
            modal.classList.remove('active');
            this.addToParty(vasen.id, slotIndex);
        };

        list.appendChild(btn);
    });

    document.getElementById('close-add-vasen-modal').onclick = () => modal.classList.remove('active');
    modal.classList.add('active');
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
                    <span class="combat-attr-value">${vasen.getAttribute('strength')}</span>
                </div>
                <div class="combat-attr" title="Damage modifier for Wisdom Attacks">
                    <span class="combat-attr-name">Wis</span>
                    <span class="combat-attr-value">${vasen.getAttribute('wisdom')}</span>
                </div>
                <div class="combat-attr" title="Reduces damage from Strength Attacks">
                    <span class="combat-attr-name">Def</span>
                    <span class="combat-attr-value">${vasen.getAttribute('defense')}</span>
                </div>
                <div class="combat-attr" title="Reduces damage from Wisdom Attacks">
                    <span class="combat-attr-name">Dur</span>
                    <span class="combat-attr-value">${vasen.getAttribute('durability')}</span>
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
    const modal = document.getElementById('swap-modal');
    const list = document.getElementById('swap-modal-list');

    list.innerHTML = '';

    battle.playerTeam.forEach((vasen, index) => {
        if (index === battle.playerActiveIndex || vasen.isKnockedOut()) return;

        const btn = document.createElement('button');
        btn.className = 'ally-select-btn';

        const img = document.createElement('img');
        img.className = 'ally-select-img';
        img.src = vasen.species.image;

        const info = document.createElement('div');
        info.className = 'ally-select-info';

        const name = document.createElement('div');
        name.className = 'ally-select-name';
        name.textContent = vasen.getName();

        const hp = document.createElement('div');
        hp.className = 'ally-select-health';
        hp.textContent = `${vasen.currentHealth}/${vasen.maxHealth} Health`;

        const megin = document.createElement('div');
        megin.className = 'swap-megin';
        megin.textContent = `Megin: ${vasen.currentMegin}/${vasen.maxMegin}`;
        const stages = document.createElement('div');
        stages.className = 'swap-stages';
        stages.innerHTML = this.renderAttributeStages(vasen);

        info.appendChild(name);
        info.appendChild(hp);
        info.appendChild(megin);
        info.appendChild(stages);
        btn.appendChild(img);
        btn.appendChild(info);

        btn.onclick = () => {
            modal.classList.remove('active');
            game.handleSwap(index);
        };

        list.appendChild(btn);
    });

    document.getElementById('close-swap-modal').onclick =
        () => modal.classList.remove('active');

    modal.classList.add('active');
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
    document.getElementById('btn-swap').disabled =
        !battle.waitingForPlayerAction || activeVasen.battleFlags.hasSwapSickness;
    document.getElementById('btn-offer').disabled =
        !battle.waitingForPlayerAction || !battle.isWildEncounter ||
        battle.offersGiven >= GAME_CONFIG.MAX_OFFERS_PER_COMBAT || battle.correctItemGiven;
    document.getElementById('btn-ask').disabled =
        !battle.waitingForPlayerAction || !battle.isWildEncounter ||
        activeVasen.battleFlags.hasSwapSickness;
    document.getElementById('btn-pass').disabled = !battle.waitingForPlayerAction;
    document.getElementById('btn-surrender').disabled = false;

    // Swap button opens the modal
    document.getElementById('btn-swap').onclick = () => {
        if (!battle.waitingForPlayerAction || activeVasen.battleFlags.hasSwapSickness) return;
        this.renderSwapOptions(battle);
    };
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
showDialogue(title, message, buttons = [{ text: 'Confirm', callback: null }], dismissible = true, extraClass = null) {
    const modal = document.getElementById('dialogue-modal');
    document.getElementById('dialogue-title').textContent = title;
    document.getElementById('dialogue-message').innerHTML = message;

    gameState.uiLocked = true;
    modal.dataset.dismissible = dismissible ? 'true' : 'false';

    const btnContainer = document.getElementById('dialogue-buttons');
    btnContainer.innerHTML = '';

    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `btn ${btn.class || 'btn-primary'}`;
        button.innerHTML = btn.text;

        button.onclick = () => {
            modal.classList.remove('active');
            if (extraClass) modal.classList.remove(extraClass);
            gameState.uiLocked = false;

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

modal.classList.add('active');

const firstButton = btnContainer.querySelector('button');
if (firstButton) firstButton.focus();

}



    // Confirm Releasing Väsen

    confirmReleaseVasen(vasenId) {
    if (gameState.inCombat) {
        this.showMessage("You cannot release a Väsen during combat.", "error");
        return;
    }

    const vasen = gameState.vasenCollection.find(v => v.id === vasenId);

    if (!vasen) {
        this.showMessage('Väsen not found.', 'error');
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
}

    // Show offer item modal
    showOfferModal(battle) {
        const modal = document.getElementById('offer-modal');
        const itemList = document.getElementById('offer-item-list');
        itemList.innerHTML = '';

        const items = Object.entries(gameState.itemInventory);
        if (items.length === 0) {
            itemList.innerHTML = '<p class="empty-message">You have no items to offer.</p>';
        } else {
            items.forEach(([itemId, count]) => {
                const item = TAMING_ITEMS[itemId];
                if (!item) return;

                const itemBtn = document.createElement('button');
                itemBtn.className = 'offer-item-btn';
                itemBtn.title = item.description;
                itemBtn.innerHTML = `
                    <span class="offer-item-name">${item.name}</span>
                    <span class="offer-item-count">x${count}</span>
                `;
                itemBtn.onclick = () => {
                    modal.classList.remove('active');
                    game.handleOfferItem(itemId);
                };
                itemList.appendChild(itemBtn);
            });
        }

        document.getElementById('close-offer-modal').onclick = () => modal.classList.remove('active');
        modal.classList.add('active');
    }

    // Show ally selection modal for ally-targeting abilities
    showAllySelectionModal(battle, abilityName, callback) {
        const ability = ABILITIES[abilityName];
        if (!ability) {
            console.error('Ability not found:', abilityName);
            return;
        }
        
        const modal = document.getElementById('ally-select-modal');
        if (!modal) {
            console.error('ally-select-modal element not found in HTML');
            // Fallback: just target self (active väsen)
            callback(battle.playerActiveIndex);
            return;
        }
        
        const allyList = document.getElementById('ally-select-list');
        const abilityNameSpan = document.getElementById('ally-select-ability-name');
        
        if (abilityNameSpan) {
            abilityNameSpan.textContent = ability.name;
        }
        
        allyList.innerHTML = '';

        // Show all non-knocked-out allies (including the active one - you can buff yourself)
        battle.playerTeam.forEach((vasen, index) => {
            if (!vasen || vasen.isKnockedOut()) return;

            const allyBtn = document.createElement('button');
            allyBtn.className = 'ally-select-btn';
            allyBtn.innerHTML = `
                <img src="${vasen.species.image}" alt="${vasen.species.name}" class="ally-select-img">
                <div class="ally-select-info">
                    <span class="ally-select-name">${vasen.getDisplayName()}</span>
                    <span class="ally-select-health">${vasen.currentHealth}/${vasen.maxHealth} Health</span>
                    <span class="ally-select-megin">${vasen.currentMegin}/${vasen.maxMegin} Megin</span>
                    <div class="ally-select-stages">${this.renderAttributeStages(vasen)}</div>
                </div>
            `;
            allyBtn.onclick = () => {
                modal.classList.remove('active');
                callback(index);
            };
            allyList.appendChild(allyBtn);
        });

        document.getElementById('close-ally-select-modal').onclick = () => modal.classList.remove('active');
        modal.classList.add('active');
    }

    // Show rune equip modal
    showRuneEquipModal(vasenId) {
        const modal = document.getElementById('rune-equip-modal');
        const runeList = document.getElementById('rune-equip-list');
        runeList.innerHTML = '';

        const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
        if (!vasen) return;

        const maxRunes = vasen.level >= GAME_CONFIG.MAX_LEVEL ? 2 : 1;
        const canEquipMore = vasen.runes.length < maxRunes;

        // Show ALL collected runes (including those equipped to other väsen)
        const allRunes = Array.from(gameState.collectedRunes);

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
                        this.equipRune(vasenId, runeId);
                    };
                }
                runeList.appendChild(runeBtn);
            });
        }

        document.getElementById('close-rune-equip-modal').onclick = () => modal.classList.remove('active');
        modal.classList.add('active');
    }

    // Equip rune
    equipRune(vasenId, runeId) {
        // Find the väsen in collection
        const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
        if (!vasen) {
            this.showMessage('Väsen not found.', 'error');
            return;
        }
        
        const result = gameState.equipRune(runeId, vasenId);
        this.showMessage(result.message, result.success ? 'info' : 'error');
        this.refreshCurrentTab();
        this.renderParty(); // Update party display to show new rune
        if (this.selectedVasen && this.selectedVasen.id === vasenId) {
            this.renderVasenDetails(this.selectedVasen);
        }
    }

    // Unequip rune
    unequipRune(vasenId, runeId) {
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
    }

    // Show item options
    showItemOptions(itemId) {
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
                        <span class="heal-vasen-health">${vasen.currentHealth}/${vasen.maxHealth} Health</span>
                        <span class="heal-amount">+${Math.floor(vasen.maxHealth * healPercent)} Health</span>
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

        const currentOwner = gameState.findRuneOwner(runeId);

        // Show all väsen in collection (runes are bound to individual väsen, not party slots)
        const eligibleVasen = gameState.vasenCollection;

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
                    <img src="${vasen.species.image}" alt="${vasen.species.name}" class="rune-vasen-img">
                    <div class="rune-vasen-info">
                        <span class="rune-vasen-name">${vasen.getDisplayName()}${isInParty ? ' ★' : ''}</span>
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

    // Equip rune to väsen (with auto-unequip from previous owner - handled by gameState.equipRune)
    equipRuneToVasen(vasenId, runeId) {
        // The new gameState.equipRune handles auto-unequipping from previous owner
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

    const success = gameState.importSave(saveData);

    if (success) {
        this.showMessage('Save imported successfully!');
        this.hideSettings();

        // Clear combat state
        game.currentBattle = null;
        this.hideCombatUI();

        // Reinitialize UI exactly like Game.init()
        ui.init();
        game.showGameScreen();   // <-- THIS is the correct call
        
    } else {
        this.showMessage('Invalid or corrupted save data.', 'error');
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

        let achievementsHtml = '<div class="achievements-section"><h4>Achievements:</h4><div class="achievements-grid">';
        
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

        content.innerHTML = `
            <div class="profile-name-section">
                <label for="profile-name-input">Player Name:</label>
                <input type="text" id="profile-name-input" value="${gameState.playerName || ''}" placeholder="Väktare" maxlength="20">
                <button id="save-name-btn" class="btn btn-small">Save</button>
            </div>
<div class="profile-stats">
    <br>
    <p>Runes Collected: ${gameState.collectedRunes.size} / ${RUNE_LIST.length}</p>
    <p>Zones Cleared: ${gameState.defeatedGuardians.size} / ${ZONE_ORDER.length}</p>
    <p>Väsen Types Tamed: ${gameState.getUniqueSpeciesTamed()} / ${Object.keys(VASEN_SPECIES).length}</p>
    <br>
</div>

            ${achievementsHtml}
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
    GameState.uiLocked = true;

    const modal = document.getElementById('knockout-swap-modal');
    modal.dataset.dismissible = 'false'; // cannot skip

    const vasenList = document.getElementById('knockout-swap-list');
    vasenList.innerHTML = '';

    const availableVasen = battle.playerTeam.filter((v, i) =>
        i !== battle.playerActiveIndex && !v.isKnockedOut()
    );

    // No available allies → battle ends or whatever your logic is
    if (availableVasen.length === 0) {
        modal.classList.remove('active');
        GameState.uiLocked = false;
        callback(null);
        return;
    }

    // If only one ally is alive → auto swap (your existing logic)
    if (availableVasen.length === 1) {
        const actualIndex = battle.playerTeam.indexOf(availableVasen[0]);
        modal.classList.remove('active');
        GameState.uiLocked = false;
        callback(actualIndex);
        return;
    }

    // Build buttons for each available Väsen
    availableVasen.forEach(vasen => {
        const actualIndex = battle.playerTeam.indexOf(vasen);

        const vasenBtn = document.createElement('button');
        vasenBtn.className = 'knockout-swap-btn';

        // IMAGE
        const img = document.createElement('img');
        img.src = vasen.species.image;
        img.alt = vasen.species.name;
        img.className = 'swap-img';

        // INFO CONTAINER
        const info = document.createElement('div');
        info.className = 'swap-info';

        // NAME
        const name = document.createElement('span');
        name.className = 'swap-name';
        name.textContent = vasen.getDisplayName();

        // HEALTH
        const health = document.createElement('span');
        health.className = 'swap-health';
        health.textContent = `Health: ${vasen.currentHealth}/${vasen.maxHealth}`;

        // MEGIN
        const megin = document.createElement('span');
        megin.className = 'swap-megin';
        megin.textContent = `Megin: ${vasen.currentMegin}/${vasen.maxMegin}`;

        // attribute changes
        const stages = document.createElement('div');
        stages.className = 'swap-stages';
        stages.innerHTML = this.renderAttributeStages(vasen);


        // Assemble info block
        info.appendChild(name);
        info.appendChild(health);
        info.appendChild(megin);
        info.appendChild(stages);
        
        // Assemble button
        vasenBtn.appendChild(img);
        vasenBtn.appendChild(info);

        // Click handler
        vasenBtn.onclick = () => {
            modal.classList.remove('active');
            GameState.uiLocked = false;
            callback(actualIndex);
        };

        vasenList.appendChild(vasenBtn);
    });

    modal.classList.add('active');
}


    // Show encounter result
    showEncounterResult(result) {
        switch (result.type) {
            case 'vasen':
                this.showDialogue(
    'Wild Encounter!',
    `<p>A wild <strong>${result.vasen.getDisplayName()}</strong> appears!</p>`,
    [{ text: 'Battle!', callback: () => game.startBattle(result.vasen) }],
    false // <— non‑dismissible
);
                break;

            case 'item':
                this.showDialogue(
    'Item Found!',
    `<p>${result.dialogue}</p>`,
    [{ text: 'Confirm', callback: null }],
    false
);
                break;

            case 'well':
                this.showDialogue(
    'Sacred Well',
    `<p>${result.dialogue}</p>`,
    [{ text: 'Confirm', callback: null }],
    false
);

                break;

            case 'rune':
                this.showDialogue(
    'Rune Discovered!',
    `<p>${result.dialogue}</p><p class="rune-reveal"><span class="rune-symbol large">${RUNES[result.runeId].symbol}</span> ${RUNES[result.runeId].name}</p>`,
    [{ text: 'Confirm', callback: null }],
    false
);

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

        this.showDialogue(result.victory ? 'Victory!' : 'Defeat', message, buttons, false);
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
                // Ensure selectedVasen always points to the live object
                this.selectedVasen = updatedVasen; 
                this.renderVasenDetails(updatedVasen);
            } else {
                 // The selected väsen might have been removed (e.g., reset)
                 this.selectedVasen = null;
                 this.renderVasenDetails(null);
            }
        } else {
            this.renderVasenDetails(null);
        }
    }
}

// Helper function
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Create global instance
const ui = new UIController();