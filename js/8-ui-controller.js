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
        this.vasenSortBy = 'level'; // Sort option for väsen inventory: level, family, health, defense, durability, strength, wisdom, rarity
    }

    // Initialize UI elements
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.restoreInventoryState();
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

// Inventory toggle for mobile
const inventoryToggleBtn = document.getElementById('inventory-toggle-btn');
if (inventoryToggleBtn) {
    inventoryToggleBtn.addEventListener('click', () => this.toggleInventory());
}

// Close element and family collapsibles when clicking anywhere outside them
document.addEventListener('click', (e) => {
    // Check if the click was on a clickable element/family badge or inside a collapsible
    const isClickableElement = e.target.closest('.clickable-element');
    const isClickableFamily = e.target.closest('.clickable-family');
    const isInsideCollapsible = e.target.closest('.element-matchup-collapsible, .element-guide-collapsible, .family-matchup-collapsible, .family-guide-collapsible');
    
    // If the click was not on a clickable badge and not inside any collapsible, close all
    if (!isClickableElement && !isClickableFamily && !isInsideCollapsible) {
        document.querySelectorAll('.element-matchup-collapsible.open, .element-guide-collapsible.open, .family-matchup-collapsible.open, .family-guide-collapsible.open').forEach(el => {
            el.classList.remove('open');
        });
    }
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

    // Handle väsen sort change
    handleVasenSortChange(sortBy) {
        this.vasenSortBy = sortBy;
        this.renderVasenInventory();
    }

    // Get sorted väsen collection based on current sort option
    getSortedVasenCollection() {
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

        switch (this.vasenSortBy) {
            case 'level':
                return collection.sort((a, b) => {
                    const favDiff = compareFavorites(a, b);
                    if (favDiff !== 0) return favDiff;
                    return b.level - a.level;
                });
            case 'health':
                return collection.sort((a, b) => {
                    const favDiff = compareFavorites(a, b);
                    if (favDiff !== 0) return favDiff;
                    return b.maxHealth - a.maxHealth;
                });
            case 'defense':
                return collection.sort((a, b) => {
                    const favDiff = compareFavorites(a, b);
                    if (favDiff !== 0) return favDiff;
                    return b.calculateAttribute('defense') - a.calculateAttribute('defense');
                });
            case 'durability':
                return collection.sort((a, b) => {
                    const favDiff = compareFavorites(a, b);
                    if (favDiff !== 0) return favDiff;
                    return b.calculateAttribute('durability') - a.calculateAttribute('durability');
                });
            case 'strength':
                return collection.sort((a, b) => {
                    const favDiff = compareFavorites(a, b);
                    if (favDiff !== 0) return favDiff;
                    return b.calculateAttribute('strength') - a.calculateAttribute('strength');
                });
            case 'wisdom':
                return collection.sort((a, b) => {
                    const favDiff = compareFavorites(a, b);
                    if (favDiff !== 0) return favDiff;
                    return b.calculateAttribute('wisdom') - a.calculateAttribute('wisdom');
                });
            case 'rarity':
                return collection.sort((a, b) => {
                    const favDiff = compareFavorites(a, b);
                    if (favDiff !== 0) return favDiff;
                    const rarityDiff = rarityOrder[b.species.rarity] - rarityOrder[a.species.rarity];
                    if (rarityDiff !== 0) return rarityDiff;
                    // Secondary sort by level if same rarity
                    return b.level - a.level;
                });
            case 'family':
            default:
                return null; // Return null to indicate family grouping should be used
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
    }

    // Render väsen grouped by family (original behavior)
    renderVasenByFamily(container) {
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
    }

    // Render väsen as flat sorted list
    renderVasenFlat(container, sortedCollection) {
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
                    <span class="combat-bar-text">HP: ${vasen.currentHealth} / ${vasen.maxHealth}</span>
                </div>
            </div>
            <div class="vasen-card-megin">
                <div class="combat-bar combat-bar-small megin-bar">
                    <div class="combat-bar-fill megin-fill" style="width: ${(vasen.currentMegin / vasen.maxMegin) * 100}%"></div>
                    <span class="combat-bar-text">MP: ${vasen.currentMegin} / ${vasen.maxMegin}</span>
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

    // Toggle favorite status for a väsen
    toggleFavorite(vasenId) {
        const isFavorite = gameState.toggleFavorite(vasenId);
        const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
        const name = vasen ? vasen.getDisplayName() : 'Väsen';
        
        if (isFavorite) {
            this.showMessage(`${name} added to favorites.`);
        } else {
            this.showMessage(`${name} removed from favorites.`);
        }
        
        this.renderVasenInventory();
        if (this.selectedVasen && this.selectedVasen.id === vasenId) {
            this.renderVasenDetails(this.selectedVasen);
        }
    }

        // Close the väsen details panel
    closeVasenDetails() {
        this.selectedVasen = null;
        this.renderVasenDetails(null);
        this.renderVasenInventory(); // Rerender inventory to update 'selected' class
    }

    // Toggle description collapsed state
    toggleDescription() {
        this.descriptionCollapsed = !this.descriptionCollapsed;
        if (this.selectedVasen) {
            this.renderVasenDetails(this.selectedVasen);
        }
    }

    // Helper: Generate attacking matchups HTML for an element
    generateAttackingMatchupsHTML(element) {
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
    }

    // Helper: Generate defensive matchups HTML for an element
    generateDefensiveMatchupsHTML(element) {
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
    }


    // Render Vasen details panel
renderVasenDetails(vasen) {
    const panel = this.vasenDetailsPanel;
    if (!vasen) {
        panel.innerHTML = '<p class="empty-message">Select a Väsen to view details</p>';
        return;
    }

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
            <div class="combat-bar health-bar">
                <div class="combat-bar-fill health-fill" style="width: ${(vasen.currentHealth / vasen.maxHealth) * 100}%"></div>
                <span class="combat-bar-text">HP: ${vasen.currentHealth} / ${vasen.maxHealth}</span>
            </div>
            <div class="combat-bar megin-bar">
                <div class="combat-bar-fill megin-fill" style="width: ${(vasen.currentMegin / vasen.maxMegin) * 100}%"></div>
                <span class="combat-bar-text">MP: ${vasen.currentMegin} / ${vasen.maxMegin}</span>
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
            }

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
                    <div class="rune-slot filled" onclick="ui.showRuneEquipModal('${vasen.id}', ${i})">
                        <span class="rune-symbol">${rune.symbol}</span>
                        <span class="rune-name">${rune.name}</span>
                        <span class="rune-effect">${rune.effect}</span>
                    </div>
                `;
            } else {
                html += `
                    <div class="rune-slot empty" onclick="ui.showRuneEquipModal('${vasen.id}', ${i})">
                        <span class="rune-placeholder">+ Equip Rune</span>
                    </div>
                `;
            }
        }

        if (maxSlots < 2) {
            html += `<div class="rune-slot locked">
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

        // Helper function to highlight key phrases in ability descriptions
        const highlightDescription = (desc) => {
            if (!desc) return '';
            
            // Patterns to highlight (case insensitive)
            const patterns = [
                // Stage changes
                /(\d+\s+stages?)/gi,
                /(raises?|lowers?|increases?|decreases?)\s+[^.]+?(\d+\s+stages?)/gi,
                // Damage/healing percentages
                /(\d+%\s+(?:more|less|of)\s+(?:damage|health|healing))/gi,
                // Attribute changes
                /((?:raises?|lowers?|increases?|decreases?)\s+(?:their|its|your|enemy|opponent|allies?|all)\s+[^.]+?attributes?[^.]*)/gi,
                // Specific attribute mentions with modifications
                /((?:raises?|lowers?|increases?|decreases?)\s+(?:their|its|your|enemy|opponent)\s+(?:strength|wisdom|defense|durability|health)[^.]*)/gi,
                // Status effects
                /(blocks?|prevents?|removes?|drains?|restores?)[^.]+?(?:megin|health|attributes?|stages?)/gi,
            ];
            
            let highlighted = desc;
            patterns.forEach(pattern => {
                highlighted = highlighted.replace(pattern, (match) => {
                    return `<span class="ability-highlight">${match}</span>`;
                });
            });
            
            return highlighted;
        };

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
                    <p class="ability-description">${highlightDescription(ability.description)}</p>
                    ${!isLearned ? `<span class="learn-level">Learns at Lvl ${learnLevel}</span>` : ''}
                </div>
            `;
        });

        return html;
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
    }

    // Find which Väsen has a rune equipped
    findRuneEquippedTo(runeId) {
        return gameState.vasenCollection.find(v => v.runes.includes(runeId));
    }

    // Render Item inventory
    renderItemInventory() {
        const container = this.tabContents.items;
        container.innerHTML = '';

        const itemEntries = Object.entries(gameState.itemInventory);
        if (itemEntries.length === 0) {
            container.innerHTML = '<p class="empty-message">You have no items. Explore to find some.</p>';
            return;
        }

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
    }

    // Render party
renderParty() {
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
}


    // Handle party slot click
handlePartySlotClick(slotIndex) {
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
}

    // Move väsen within party
    moveInParty(fromSlot, toSlot) {
        const temp = gameState.party[toSlot];
        gameState.party[toSlot] = gameState.party[fromSlot];
        gameState.party[fromSlot] = temp;
        
        this.renderParty();
        gameState.saveGame();
        this.showMessage(`${gameState.party[toSlot].getName()} is now the lead!`);
    }

    // Add väsen to party
    addToParty(vasenId, slotIndex = null) {
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
    }

    // Replace in party

    replaceInParty(vasenId, slotIndex) {
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
}
    // Remove väsen from party
    removeFromParty(vasenId) {
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
    }

    // Replace Väsen
    showReplaceMenu(fromSlot) {
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
}

    releaseVasen(vasenId) {
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
            ${zone.image ? `<img src="${zone.image}" alt="${zone.name}" class="zone-image">` : ''}
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
            } else if (gameState.currentZone === 'GINNUNGAGAP') {
                // Show Endless Tower button in Ginnungagap
                this.challengeBtn.style.display = 'block';
                this.challengeBtn.innerHTML = `Challenge Endless Tower <span class="btn-hint">(Starts at Lvl 30)</span>`;
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

        // Render player side
        this.renderCombatantPanel('player', battle.playerTeam[battle.playerActiveIndex], battle);

        // Render enemy side
        this.renderCombatantPanel('enemy', battle.enemyTeam[battle.enemyActiveIndex], battle);

        // Render Endless Tower floor display if applicable
        const versusDiv = document.querySelector('.combat-versus');
        if (battle.isEndlessTower && battle.currentFloor) {
            versusDiv.innerHTML = `
                <div class="endless-tower-floor">Floor ${battle.currentFloor}</div>
                <div>VS</div>
            `;
        } else {
            versusDiv.innerHTML = 'VS';
        }

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

    // Sort: favorites first, then by family, then name
    const sorted = [...gameState.vasenCollection].sort((a, b) => {
        // Favorites first
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
        const isFavorite = gameState.isFavorite(vasen.id);
        const isInParty = gameState.party.some(p => p && p.id === vasen.id);

        btn.innerHTML = `
            ${isFavorite ? '<span class="add-vasen-favorite-star">★</span>' : ''}
            ${this.createStandardVasenCardHTML(vasen, false)}
            ${isInParty ? '<span class="add-vasen-in-party-badge">In Party</span>' : ''}
        `;

        btn.onclick = () => {
            modal.classList.remove('active');
            this.addToParty(vasen.id, slotIndex);
        };

        list.appendChild(btn);
    });

    document.getElementById('close-add-vasen-modal').onclick = () => {
        modal.classList.remove('active');
        document.activeElement.blur();
    };
    modal.classList.add('active');
}

    // Render combatant panel
renderCombatantPanel(side, vasen, battle) {
    const panel = document.getElementById(`${side}-panel`);
    if (!vasen) return;

    const healthPercent = (vasen.currentHealth / vasen.maxHealth) * 100;
    const meginPercent = (vasen.currentMegin / vasen.maxMegin) * 100;

    // Get party members (excluding active)
    const team = side === 'player' ? battle.playerTeam : battle.enemyTeam;
    const activeIndex = side === 'player' ? battle.playerActiveIndex : battle.enemyActiveIndex;
    
    // Get party member portraits (member 2 on left, member 3 on right)
    const partyPortraits = {
        left: null,
        right: null
    };
    
    // Find the two other team members
    const otherMembers = team.map((member, index) => ({ member, index }))
        .filter(({index}) => index !== activeIndex);
    
    if (otherMembers.length >= 1) {
        partyPortraits.left = otherMembers[0].member;
    }
    if (otherMembers.length >= 2) {
        partyPortraits.right = otherMembers[1].member;
    }

    // Helper function to create party portrait HTML
    const createPartyPortraitHTML = (member, position) => {
        if (!member) return '';
        
        const hpPercent = (member.currentHealth / member.maxHealth) * 100;
        const meginPercent = (member.currentMegin / member.maxMegin) * 100;
        
        return `
            <div class="party-portrait ${position} ${member.isKnockedOut() ? 'knocked-out' : ''}">
                <img src="${member.species.image}" 
                     alt="${member.species.name}" 
                     class="party-portrait-image">
                <div class="party-portrait-hp-bar">
                    <div class="party-portrait-hp-fill" style="width: ${hpPercent}%"></div>
                </div>
                <div class="party-portrait-megin-bar">
                    <div class="party-portrait-megin-fill" style="width: ${meginPercent}%"></div>
                </div>
            </div>
        `;
    };

    // Build runes HTML with "Rune:" label
    const runesHtml = vasen.runes.length > 0
        ? `<span class="runes-label">Rune:</span>
           ${vasen.runes.map(r => {
                const rune = RUNES[r];
                if (!rune) return '';

                return `
                    <div class="rune-collapsible open">
                        <div class="rune-collapsible-header" onclick="this.parentElement.classList.toggle('open')">
                            ${rune.symbol} ${rune.name}
                        </div>
                        <div class="rune-collapsible-body">
                            ${rune.effect}
                        </div>
                    </div>
                `;
           }).join('')}`
        : '<span class="runes-label">Rune:</span> <span class="no-rune">None</span>';

    // Build attacking matchups for attack elements
    const attackElements = vasen.getAttackElements();
    const attackElementsHtml = attackElements.map(e => {
        return `
            <div class="element-matchup-collapsible inline-collapsible">
                <span class="element-mini element-${e.toLowerCase()} clickable-element" onclick="toggleElementMatchup(this, event)">${e}</span>
                ${this.generateAttackingMatchupsHTML(e)}
            </div>
        `;
    }).join('');

    // Build combatant panel
    panel.innerHTML = `
        <div class="combatant-header">
            <h4 class="combatant-name">${vasen.getDisplayName()}</h4>
            <span class="combatant-level">Lvl ${vasen.level}</span>
        </div>

        <div class="combatant-image-wrapper">
            ${createPartyPortraitHTML(partyPortraits.left, 'left')}
            
            <div class="combatant-image-container ${vasen.isKnockedOut() ? '' : 'holo-' + vasen.species.rarity.toLowerCase()}">
                <img src="${vasen.species.image}" alt="${vasen.species.name}" 
                     class="combatant-image ${vasen.isKnockedOut() ? 'knocked-out' : ''}">
                ${vasen.battleFlags.hasSwapSickness ? '<span class="status-icon swap-sickness">Preparing</span>' : ''}
            </div>
            
            ${createPartyPortraitHTML(partyPortraits.right, 'right')}
        </div>

        <div class="combatant-bars">
            <div class="combat-bar health-bar">
                <div class="combat-bar-fill health-fill" style="width: ${healthPercent}%"></div>
                <span class="combat-bar-text">HP: ${vasen.currentHealth} / ${vasen.maxHealth}</span>
            </div>
            <div class="combat-bar megin-bar">
                <div class="combat-bar-fill megin-fill" style="width: ${meginPercent}%"></div>
                <span class="combat-bar-text">MP: ${vasen.currentMegin} / ${vasen.maxMegin}</span>
            </div>
        </div>

        <div class="combatant-info">
            <div class="element-matchup-collapsible">

                <span class="element-badge element-${vasen.species.element.toLowerCase()} clickable-element"
                      onclick="toggleElementMatchup(this, event)">
                    ${vasen.species.element}
                </span>

                <span class="rarity-badge rarity-${vasen.species.rarity.toLowerCase()}">
                    ${vasen.species.rarity}
                </span>

                ${this.generateDefensiveMatchupsHTML(vasen.species.element)}
            </div>
            
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

        <div class="combatant-attributes">
            <div class="combat-attr"><span class="combat-attr-name">Str</span><span class="combat-attr-value">${vasen.getAttribute('strength')}</span></div>
            <div class="combat-attr"><span class="combat-attr-name">Wis</span><span class="combat-attr-value">${vasen.getAttribute('wisdom')}</span></div>
            <div class="combat-attr"><span class="combat-attr-name">Def</span><span class="combat-attr-value">${vasen.getAttribute('defense')}</span></div>
            <div class="combat-attr"><span class="combat-attr-name">Dur</span><span class="combat-attr-value">${vasen.getAttribute('durability')}</span></div>
        </div>

        <div class="combatant-runes">
            ${runesHtml}
        </div>

        <div class="combatant-stages">
            ${this.renderAttributeStages(vasen)}
        </div>

        <div class="combatant-attack-elements">
            <span class="elements-label">Attack Elements:</span>
            ${attackElementsHtml}
        </div>

        <div class="combatant-description">
            <div class="rune-collapsible">
                <div class="rune-collapsible-header" onclick="this.parentElement.classList.toggle('open')">
                    <span class="toggle-icon">▶</span>
                    Description
                </div>
                <div class="rune-collapsible-body">
                    ${vasen.species.description}
                </div>
            </div>
        </div>
    `;
    
    // Reapply any active animations after re-render
    this.reapplyAnimations(side);
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
                html += `<span class="stage-indicator ${stageClass}">${capitalize(attr).substring(0, 3)} ${stageText}</span>`;
            }
        });

        return html || '<span class="no-stages">No attribute changes</span>';
    }

    // Create standardized väsen card info HTML
    // showCombatInfo: if true, uses current combat stats (with stages) and shows stage indicators
    //                 if false, uses base stats (with runes only, no stages)
    createStandardVasenCardHTML(vasen, showCombatInfo = false) {
        // Build runes HTML
        let runesHtml = '';
        if (vasen.runes && vasen.runes.length > 0) {
            runesHtml = vasen.runes.map(runeId => {
                const rune = RUNES[runeId];
                return rune ? `<span class="mini-rune">${rune.symbol} ${rune.name}</span>` : '';
            }).join('');
        }

        // Build attribute stages HTML (only for combat info)
        let stagesHtml = '';
        if (showCombatInfo) {
            ['strength', 'wisdom', 'defense', 'durability'].forEach(attr => {
                const stage = vasen.attributeStages[attr];
                if (stage !== 0) {
                    const stageClass = stage > 0 ? 'positive' : 'negative';
                    const stageText = stage > 0 ? `+${stage}` : stage;
                    stagesHtml += `<span class="mini-stage ${stageClass}">${capitalize(attr).substring(0, 3)} ${stageText}</span>`;
                }
            });
        }

        // For combat displays, use getAttribute (includes stages)
        // For non-combat displays, use calculateAttribute (base + runes only)
        const getAttrValue = (attr) => showCombatInfo ? vasen.getAttribute(attr) : vasen.calculateAttribute(attr);

        return `
            <div class="standard-vasen-img-container holo-${vasen.species.rarity.toLowerCase()}">
                <img src="${vasen.species.image}" alt="${vasen.species.name}" class="standard-vasen-img">
            </div>
            <div class="standard-vasen-info">
                <div class="standard-vasen-header">
                    <span class="standard-vasen-name">${vasen.getDisplayName()}</span>
                    <span class="standard-vasen-level">Lvl ${vasen.level}</span>
                </div>
                <div class="standard-vasen-badges">
                    <span class="element-badge element-${vasen.species.element.toLowerCase()}">${vasen.species.element}</span>
                    <span class="rarity-badge rarity-${vasen.species.rarity.toLowerCase()}">${vasen.species.rarity}</span>
                    <span class="family-badge">${vasen.species.family}</span>
                </div>
                <div class="standard-vasen-bars">
                    <div class="combat-bar combat-bar-small health-bar">
                        <div class="combat-bar-fill health-fill" style="width: ${(vasen.currentHealth / vasen.maxHealth) * 100}%"></div>
                        <span class="combat-bar-text">HP: ${vasen.currentHealth} / ${vasen.maxHealth}</span>
                    </div>
                    <div class="combat-bar combat-bar-small megin-bar">
                        <div class="combat-bar-fill megin-fill" style="width: ${(vasen.currentMegin / vasen.maxMegin) * 100}%"></div>
                        <span class="combat-bar-text">MP: ${vasen.currentMegin} / ${vasen.maxMegin}</span>
                    </div>
                </div>
                <div class="standard-vasen-attributes">
                    <span class="mini-attr"><span class="attr-label">STR</span> ${getAttrValue('strength')}</span>
                    <span class="mini-attr"><span class="attr-label">WIS</span> ${getAttrValue('wisdom')}</span>
                    <span class="mini-attr"><span class="attr-label">DEF</span> ${getAttrValue('defense')}</span>
                    <span class="mini-attr"><span class="attr-label">DUR</span> ${getAttrValue('durability')}</span>
                </div>
                ${stagesHtml ? `<div class="standard-vasen-stages">${stagesHtml}</div>` : ''}
                ${runesHtml ? `<div class="standard-vasen-runes">${runesHtml}</div>` : ''}
            </div>
        `;
    }

    // Render swap options
renderSwapOptions(battle) {
    const modal = document.getElementById('swap-modal');
    const list = document.getElementById('swap-modal-list');

    list.innerHTML = '';

    battle.playerTeam.forEach((vasen, index) => {
        if (index === battle.playerActiveIndex || vasen.isKnockedOut()) return;

        const btn = document.createElement('button');
        btn.className = 'swap-modal-btn';
        btn.innerHTML = this.createStandardVasenCardHTML(vasen, true); // true = show combat info

        btn.onclick = () => {
            modal.classList.remove('active');
            // Prevent focus issues
            if (document.activeElement) {
                document.activeElement.blur();
            }
            // Focus on a non-input element to prevent cursor
            document.body.focus();
            setTimeout(() => document.body.blur(), 0);
            game.handleSwap(index);
        };

        list.appendChild(btn);
    });

    document.getElementById('close-swap-modal').onclick =
        () => {
            modal.classList.remove('active');
            if (document.activeElement) {
                document.activeElement.blur();
            }
            document.body.focus();
            setTimeout(() => document.body.blur(), 0);
        };

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

        // Helper function to highlight key phrases in ability descriptions
        const highlightDescription = (desc) => {
            if (!desc) return '';
            
            // Patterns to highlight (case insensitive)
            const patterns = [
                // Stage changes
                /(\d+\s+stages?)/gi,
                /(raises?|lowers?|increases?|decreases?)\s+[^.]+?(\d+\s+stages?)/gi,
                // Damage/healing percentages
                /(\d+%\s+(?:more|less|of)\s+(?:damage|health|healing))/gi,
                // Attribute changes
                /((?:raises?|lowers?|increases?|decreases?)\s+(?:their|its|your|enemy|opponent|allies?|all)\s+[^.]+?attributes?[^.]*)/gi,
                // Specific attribute mentions with modifications
                /((?:raises?|lowers?|increases?|decreases?)\s+(?:their|its|your|enemy|opponent)\s+(?:strength|wisdom|defense|durability|health)[^.]*)/gi,
                // Status effects
                /(blocks?|prevents?|removes?|drains?|restores?)[^.]+?(?:megin|health|attributes?|stages?)/gi,
            ];
            
            let highlighted = desc;
            patterns.forEach(pattern => {
                highlighted = highlighted.replace(pattern, (match) => {
                    return `<span class="ability-highlight">${match}</span>`;
                });
            });
            
            return highlighted;
        };

        const btn = document.createElement('button');
        btn.className = `ability-btn element-${abilityElement.toLowerCase()} ${canUse ? '' : 'disabled'}`;
        btn.disabled = !canUse || !battle.waitingForPlayerAction;
        btn.innerHTML = `
            <span class="ability-btn-name">${ability.name}</span>
            <span class="ability-btn-type">${ability.type}</span>
            <span class="ability-btn-stats">
                <span class="ability-btn-element element-${abilityElement.toLowerCase()}">${abilityElement}</span>
                ${ability.power ? `<span class="ability-btn-power">Power: ${getAbilityPower(abilityName, activeVasen.species.family)}</span>` : ''}
                <span class="ability-btn-cost">Megin: ${meginCost}</span>
            </span>
            <span class="ability-btn-desc">${highlightDescription(ability.description)}</span>
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
        logEntry.className = `combat-log-entry combat-log-${type}`;
        logEntry.innerHTML = message;

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
flashCombatant(side, matchup = 'NEUTRAL') {
    const panel = document.getElementById(`${side}-panel`);
    if (!panel) return;
    
    // Determine the hit class based on matchup
    let hitClass = 'hit-neutral';
    let animationDuration = 400;
    
    if (matchup === 'KNOCKOUT') {
        hitClass = 'hit-knockout';
        animationDuration = 180; // Very fast for knockout
    } else if (matchup === 'POTENT') {
        hitClass = 'hit-potent';
    } else if (matchup === 'WEAK') {
        hitClass = 'hit-weak';
    }
    
    // Don't clear attack animations - allow hit flash to play simultaneously with attack movement
    
    panel.dataset.hitAnimation = 'true';
    panel.dataset.hitAnimationTime = Date.now();
    panel.dataset.hitAnimationClass = hitClass;
    panel.dataset.animationPriority = '1';
    
    const imageContainer = panel.querySelector('.combatant-image-container');
    if (imageContainer) {
        imageContainer.classList.add(hitClass);
    }
    
    // ⭐ Only shake on POTENT hits
    if (matchup === 'POTENT') {
        panel.classList.remove('hit-shake');
        void panel.offsetWidth; // restart animation
        panel.classList.add('hit-shake');
    }

    setTimeout(() => {
        const panel = document.getElementById(`${side}-panel`);
        if (panel) {
            delete panel.dataset.hitAnimation;
            delete panel.dataset.hitAnimationTime;
            delete panel.dataset.hitAnimationClass;
            delete panel.dataset.animationPriority;
            
            const imageContainer = panel.querySelector('.combatant-image-container');
            if (imageContainer) {
                imageContainer.classList.remove('hit-potent', 'hit-neutral', 'hit-weak', 'hit-knockout');
            }

            // Always remove shake after duration
            panel.classList.remove('hit-shake');
        }
    }, animationDuration);
}

    
    // Trigger attack animation
    triggerAttackAnimation(side, abilityType) {
        const panel = document.getElementById(`${side}-panel`);
        if (!panel) return;
        
        // Check if higher priority animation is playing
        const currentPriority = parseInt(panel.dataset.animationPriority || '999');
        const newPriority = (abilityType === ATTACK_TYPES.UTILITY) ? 3 : 2;
        
        // Block if higher or equal priority animation is playing
        if (currentPriority <= newPriority) {
            return; // Don't play this animation
        }
        
        // Don't clear animations - allow attack to play alongside hit flash
        
        // Determine animation type based on ability type
        let animationClass = '';
        let duration = 0;
        
        if (abilityType === ATTACK_TYPES.UTILITY) {
            animationClass = 'using-utility';
            duration = 600;
        } else if (abilityType === ATTACK_TYPES.STRENGTH || 
                   abilityType === ATTACK_TYPES.WISDOM || 
                   abilityType === ATTACK_TYPES.MIXED) {
            animationClass = side === 'player' ? 'attacking-player' : 'attacking-enemy';
            duration = 500;
        } else {
            // No animation for non-ability actions (pass, offer, ask, surrender)
            return;
        }
        
        // Store animation state with priority
        panel.dataset.attackAnimation = 'true';
        panel.dataset.attackAnimationTime = Date.now();
        panel.dataset.attackAnimationClass = animationClass;
        panel.dataset.animationPriority = newPriority.toString();
        
        const imageContainer = panel.querySelector('.combatant-image-container');
        if (imageContainer) {
            imageContainer.classList.add(animationClass);
        }
        
        setTimeout(() => {
            const panel = document.getElementById(`${side}-panel`);
            if (panel) {
                delete panel.dataset.attackAnimation;
                delete panel.dataset.attackAnimationTime;
                const storedClass = panel.dataset.attackAnimationClass;
                delete panel.dataset.attackAnimationClass;
                delete panel.dataset.animationPriority;
                const imageContainer = panel.querySelector('.combatant-image-container');
                if (imageContainer && storedClass) {
                    imageContainer.classList.remove(storedClass);
                }
            }
        }, duration);
    }
    
    // Clear all animations from a panel
clearAllAnimations(panel) {
    if (!panel) return;
    
    const imageContainer = panel.querySelector('.combatant-image-container');
    if (imageContainer) {
        imageContainer.classList.remove('hit-potent', 'hit-neutral', 'hit-weak');
    }

    // Remove shake from panel
    panel.classList.remove('hit-shake');

    delete panel.dataset.hitAnimation;
    delete panel.dataset.hitAnimationTime;
    delete panel.dataset.hitAnimationClass;
    delete panel.dataset.attackAnimation;
    delete panel.dataset.attackAnimationTime;
    delete panel.dataset.attackAnimationClass;
    delete panel.dataset.animationPriority;
}

    
    // Reapply active animations after panel re-render
reapplyAnimations(side) {
    const panel = document.getElementById(`${side}-panel`);
    if (!panel) return;
    
    const now = Date.now();
    const imageContainer = panel.querySelector('.combatant-image-container');
    if (!imageContainer) return;

    // Hit animation
    if (panel.dataset.hitAnimation === 'true') {
        const elapsed = now - parseInt(panel.dataset.hitAnimationTime || 0);
        if (elapsed < 400) {
            const hitClass = panel.dataset.hitAnimationClass || 'hit-neutral';
            imageContainer.classList.add(hitClass);
        }
    }

    // Attack animation
    if (panel.dataset.attackAnimation === 'true') {
        const elapsed = now - parseInt(panel.dataset.attackAnimationTime || 0);
        if (elapsed < 400) {
            const attackClass = panel.dataset.attackAnimationClass;
            if (attackClass) {
                imageContainer.classList.add(attackClass);
            }
        }
    }
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
        
        // Handle disabled state
        if (btn.disabled) {
            button.disabled = true;
            button.classList.add('disabled');
        }

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

const firstButton = btnContainer.querySelector('button:not([disabled])');
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
        const closeBtn = document.getElementById('close-offer-modal');
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
                itemBtn.innerHTML = `
                    <span class="offer-item-name">${item.name}</span>
                    <span class="offer-item-count">x${count}</span>
                `;
                itemBtn.onclick = () => {
                    this.showOfferConfirmation(battle, itemId);
                };
                itemList.appendChild(itemBtn);
            });
        }

        // Show the close button when displaying item list
        closeBtn.style.display = 'block';
        closeBtn.onclick = () => modal.classList.remove('active');
        modal.classList.add('active');
    }

    // Show offer confirmation
    showOfferConfirmation(battle, itemId) {
        const modal = document.getElementById('offer-modal');
        const itemList = document.getElementById('offer-item-list');
        const closeBtn = document.getElementById('close-offer-modal');
        const item = TAMING_ITEMS[itemId];

        // Hide the original close button since we have our own buttons
        closeBtn.style.display = 'none';

        itemList.innerHTML = `
            <div class="offer-confirmation">
                <h4 class="offer-item-title">${item.name}</h4>
                <p class="offer-item-description">${this.highlightItemKeywords(item.description)}</p>
                <div class="offer-confirmation-buttons">
                    <button class="btn btn-secondary" onclick="ui.showOfferModal(game.battle)">Cancel</button>
                    <button class="btn btn-primary" onclick="ui.confirmOfferItem('${itemId}')">Confirm</button>
                </div>
            </div>
        `;
    }

    // Confirm offer item
    confirmOfferItem(itemId) {
        const modal = document.getElementById('offer-modal');
        modal.classList.remove('active');
        game.handleOfferItem(itemId);
    }

    // Show ally select modal (for target selection)
    showAllySelectionModal(battle, abilityName, callback) {
        const modal = document.getElementById('ally-select-modal');
        const ability = ABILITIES[abilityName];
        document.getElementById('ally-select-ability-name').textContent = ability ? ability.name : abilityName;

        const list = document.getElementById('ally-select-list');
        list.innerHTML = '';

        if (!battle) return;

        battle.playerTeam.forEach((vasen, index) => {
            if (vasen.isKnockedOut()) return;

            const btn = document.createElement('button');
            btn.className = 'ally-select-btn';
            btn.innerHTML = this.createStandardVasenCardHTML(vasen, true); // true = show combat info
            btn.onclick = () => {
                modal.classList.remove('active');
                callback(index);
            };
            list.appendChild(btn);
        });

        document.getElementById('close-ally-select-modal').onclick = () => {
            modal.classList.remove('active');
            document.activeElement.blur();
        };
        modal.classList.add('active');
    }

    // Find rune owner helper
    findRuneOwner(runeId) {
        return gameState.vasenCollection.find(v => v.runes.includes(runeId));
    }

    // Show rune equip modal
    showRuneEquipModal(vasenId, slotIndex = null) {
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
                        this.equipRune(vasenId, runeId, slotIndex);
                    };
                }
                runeList.appendChild(runeBtn);
            });
        }

        document.getElementById('close-rune-modal').onclick = () => modal.classList.remove('active');
        modal.classList.add('active');
    }

    // Equip rune
    equipRune(vasenId, runeId, slotIndex = null) {
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
    // Helper function to highlight väsen hints in item descriptions
    highlightItemKeywords(description) {
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
            'creator of the world\'s winds',
            'mountain-dwelling giant',
            'forest Troll',
            'changeling child',
            'spirit who guards the deep veins of ore',
            'spirit of the forest',
            'water spirit',
            'tiny, dancing beings of the mist',
            'subterranean smiths',
            'light-aligned beings of creation',
            'spirit of the Elder Tree',
            'valiant warrior from Valhalla',
            'winged maiden',
            'ancient giants',
            'fiery elemental being',
            'primordial giants of ice and mist',
            'massive, wingless serpent',
            'avaricious drakes',
            'World Serpent',
            'world tree itself',
            'world tree',
            'legendary boar Särimner',
            'Särimner',
            'Valhalla',
            'winged maiden who chooses the worthy slain',
            'worthy slain',
            'creatures driven by greed'
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
    }

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
            `<p>${this.highlightItemKeywords(item.description)}</p>`,
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
                    <div class="heal-amount-overlay">
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
    }

    // Show rune equip to vasen modal
    showRuneEquipToVasenModal(runeId) {
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
                        this.hideCombatUI();
                        location.reload();
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

    showCombatTips() {
        this.renderGameGuideContent();
        this.combatTipsModal.classList.add('active');
    }

    hideCombatTips() {
        this.combatTipsModal.classList.remove('active');
    }

    // Toggle inventory visibility (mobile only)
    toggleInventory() {
        const toggleBtn = document.getElementById('inventory-toggle-btn');
        const collapsible = document.getElementById('inventory-collapsible');
        const toggleText = toggleBtn.querySelector('.toggle-text');
        
        if (collapsible.classList.contains('collapsed')) {
            // Expand
            collapsible.classList.remove('collapsed');
            toggleBtn.classList.remove('collapsed');
            toggleText.textContent = 'Hide Inventory';
            localStorage.setItem('inventoryCollapsed', 'false');
        } else {
            // Collapse
            collapsible.classList.add('collapsed');
            toggleBtn.classList.add('collapsed');
            toggleText.textContent = 'Show Inventory';
            localStorage.setItem('inventoryCollapsed', 'true');
        }
    }

    // Restore inventory collapsed state from localStorage
    restoreInventoryState() {
        const toggleBtn = document.getElementById('inventory-toggle-btn');
        const collapsible = document.getElementById('inventory-collapsible');
        const toggleText = toggleBtn ? toggleBtn.querySelector('.toggle-text') : null;
        
        // Only restore state if elements exist (mobile only)
        if (!toggleBtn || !collapsible || !toggleText) return;
        
        const isCollapsed = localStorage.getItem('inventoryCollapsed') === 'true';
        
        if (isCollapsed) {
            collapsible.classList.add('collapsed');
            toggleBtn.classList.add('collapsed');
            toggleText.textContent = 'Show Inventory';
        } else {
            collapsible.classList.remove('collapsed');
            toggleBtn.classList.remove('collapsed');
            toggleText.textContent = 'Hide Inventory';
        }
    }

    // Render dynamic Game Guide content (Element Matchups and Temperaments)
    renderGameGuideContent() {
        // Render Element Matchups
        const elementMatchupsContainer = document.getElementById('dynamic-element-matchups');
        if (elementMatchupsContainer) {
            elementMatchupsContainer.innerHTML = this.generateElementMatchupsHTML();
        }

        // Render Families
        const familiesContainer = document.getElementById('dynamic-families');
        if (familiesContainer) {
            familiesContainer.innerHTML = this.generateFamiliesHTML();
        }

        // Render Temperaments
        const temperamentsContainer = document.getElementById('dynamic-temperaments');
        if (temperamentsContainer) {
            temperamentsContainer.innerHTML = this.generateTemperamentsHTML();
        }
    }

    // Generate Element Matchups HTML from ELEMENT_MATCHUPS constant
    generateElementMatchupsHTML() {
        const elements = Object.keys(ELEMENT_MATCHUPS);
        
        let html = `
            <h4>Element Matchups</h4>
            <div class="element-guide-list">
        `;

        // Create a collapsible for each element
        elements.forEach(element => {
            html += `
                <div class="element-guide-collapsible">
                    <span class="element-badge element-${element.toLowerCase()} clickable-element" onclick="toggleElementMatchup(this, event)">${element}</span>
                    <div class="element-guide-details">
                        <div class="guide-matchup-section">
                            <strong>Attacking:</strong>
                            ${this.generateAttackingMatchupsHTML(element)}
                        </div>
                        <div class="guide-matchup-section">
                            <strong>Defending:</strong>
                            ${this.generateDefensiveMatchupsHTML(element)}
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;

        return html;
    }

    // Generate Temperaments HTML from TEMPERAMENTS constant
    generateTemperamentsHTML() {
        let html = `<div class="temperament-list"><h4>Temperaments</h4>`;

        Object.values(TEMPERAMENTS).forEach(temperament => {
            html += `<p><strong>${temperament.name}</strong> +${temperament.modifier} ${capitalize(temperament.positive)}, -${temperament.modifier} ${capitalize(temperament.negative)}</p>`;
        });

        html += `</div>`;

        return html;
    }

    // Generate Families HTML from FAMILIES and FAMILY_DESCRIPTIONS constants
    generateFamiliesHTML() {
        let html = `
            <h4>Families</h4>
            <div class="family-guide-list">
        `;

        const families = Object.values(FAMILIES);
        const halfPoint = Math.ceil(families.length / 2); // Split in half (5 and 4)

        families.forEach((family, index) => {
            const description = FAMILY_DESCRIPTIONS[family] || 'No description available.';
            const passive = FAMILY_PASSIVES[family];
            html += `
                <div class="family-guide-collapsible">
                    <span class="family-badge clickable-family" onclick="toggleFamilyDescription(this, event)">${family}</span>
                    <div class="family-description-popup">
                        ${passive ? `
                            <p><strong>Passive: ${passive.name}</strong><br>
                            ${passive.description}</p>
                            <hr style="margin: 8px 0; border: none; border-top: 1px solid var(--border-color);">
                        ` : ''}
                        <p>${description}</p>
                    </div>
                </div>
            `;
            
            // Add a line break after the first half
            if (index === halfPoint - 1) {
                html += `
            </div>
            <div class="family-guide-list">
                `;
            }
        });

        html += `</div>`; 

        return html;
    }

    // Profile
    // Render Endless Tower record
    renderEndlessTowerRecord() {
        const record = gameState.endlessTowerRecord;
        const hasRecord = record && record.highestFloor > 0;
        
        if (!hasRecord) {
            return `
                <div class="endless-tower-record locked">
                    <h4>Endless Tower Record</h4>
                    <p class="record-placeholder">Challenge the Endless Tower in Ginnungagap to set a record</p>
                </div>
            `;
        }
        
        let teamHtml = '';
        if (record.team && record.team.length > 0) {
            teamHtml = '<div class="record-team">';
            record.team.forEach(member => {
                const species = VASEN_SPECIES[member.speciesName];
                const temperament = TEMPERAMENTS[member.temperamentKey];
                if (species && temperament) {
                    const runesHtml = member.runes.map(runeId => {
                        const rune = RUNES[runeId];
                        return rune ? `${rune.symbol}` : '';
                    }).join(' ');
                    
                    teamHtml += `
                        <div class="record-vasen">
                            <span class="record-vasen-name">${temperament.name} ${species.name}</span>
                            <span class="record-vasen-level">Lvl ${member.level}</span>
                            ${runesHtml ? `<span class="record-vasen-runes">${runesHtml}</span>` : ''}
                        </div>
                    `;
                }
            });
            teamHtml += '</div>';
        }
        
        const dateStr = record.timestamp 
            ? new Date(record.timestamp).toLocaleDateString()
            : 'Unknown';
        
        return `
            <div class="endless-tower-record achieved">
                <h4>Endless Tower Record</h4>
                <p class="record-floor">Highest Floor: <strong>${record.highestFloor}</strong></p>
                <p class="record-date">Achieved: ${dateStr}</p>
                ${teamHtml}
            </div>
        `;
    }

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
    const earned = gameState.achievements[achievement.id] === true;
    achievementsHtml += `
        <div class="achievement ${earned ? 'earned' : 'locked'}">
            <div class="achievement-content">
                <span class="achievement-name">${achievement.name}</span>
                <span class="achievement-desc">${achievement.description}</span>
            </div>
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
    <p>Zones Cleared: ${gameState.defeatedGuardians.size} / ${ZONE_ORDER.filter(zoneId => ZONES[zoneId].guardian !== null).length}</p>
    <p>Väsen Types Tamed: ${gameState.getUniqueSpeciesTamed()} / ${Object.keys(VASEN_SPECIES).length}</p>
    <br>
</div>

            ${achievementsHtml}
            
            ${this.renderEndlessTowerRecord()}
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
        vasenBtn.innerHTML = this.createStandardVasenCardHTML(vasen, true); // true = show combat info

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
    `<p>${this.highlightItemKeywords(result.dialogue)}</p>`,
    [
        { text: 'Confirm', callback: null, class: 'btn-primary' },
        { text: 'Next', callback: () => game.explore(), class: 'btn-primary' }
    ],
    false
);
                break;

            case 'well':
                this.showDialogue(
    'Sacred Well',
    `<p>${result.dialogue}</p>`,
    [
        { text: 'Confirm', callback: null, class: 'btn-primary' },
        { text: 'Next', callback: () => game.explore(), class: 'btn-primary' }
    ],
    false
);

                break;

            case 'rune':
                this.showDialogue(
    'Rune Discovered!',
    `<p>${result.dialogue}</p><p class="rune-reveal"><span class="rune-symbol large">${RUNES[result.runeId].symbol}</span> ${RUNES[result.runeId].name}</p><p class="rune-effect">${RUNES[result.runeId].effect}</p>`,  
    [
        { text: 'Confirm', callback: null, class: 'btn-primary' },
        { text: 'Next', callback: () => game.explore(), class: 'btn-primary' }
    ],
    false
);

        }
    }

    // Show battle result
    showBattleResult(result) {
        let message = '';
        let buttons = [{ 
            text: 'Continue (2)', 
            callback: () => game.endBattle(),
            disabled: true // Initially disabled to prevent spam clicking
        }];

        if (result.victory) {
            message = '<p>Your party triumphs!</p>';

            if (result.tamed) {
                message += `<p><strong>${result.tamedVasen.getDisplayName()}</strong> has joined you!</p>`;
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
        
        // Countdown timer for the button
        let remainingSeconds = Math.ceil(GAME_CONFIG.BATTLE_RESULT_BUTTON_DELAY / 1000);
        const countdownInterval = setInterval(() => {
            remainingSeconds--;
            const dialogueButtons = document.querySelectorAll('#dialogue-buttons button');
            dialogueButtons.forEach(btn => {
                if (btn.textContent.startsWith('Continue')) {
                    if (remainingSeconds > 0) {
                        btn.textContent = `Continue (${remainingSeconds})`;
                    }
                }
            });
        }, 1000);
        
        // Enable the continue button after a delay to prevent spam clicking
        setTimeout(() => {
            clearInterval(countdownInterval);
            const dialogueButtons = document.querySelectorAll('#dialogue-buttons button');
            dialogueButtons.forEach(btn => {
                if (btn.textContent.startsWith('Continue')) {
                    btn.disabled = false;
                    btn.classList.remove('disabled');
                    btn.textContent = 'Continue';
                }
            });
        }, GAME_CONFIG.BATTLE_RESULT_BUTTON_DELAY);
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

// Helper function to toggle element matchup collapsibles (closes others when one opens)
function toggleElementMatchup(element, event) {
    // Stop propagation to prevent global click handler from closing immediately
    if (event) {
        event.stopPropagation();
    }
    
    const parent = element.parentElement;
    const isOpening = !parent.classList.contains('open');
    
    // Close all element matchup collapsibles (both types)
    document.querySelectorAll('.element-matchup-collapsible.open, .element-guide-collapsible.open').forEach(el => {
        el.classList.remove('open');
    });
    
    // Close all family collapsibles to make them mutually exclusive
    document.querySelectorAll('.family-matchup-collapsible.open, .family-guide-collapsible.open').forEach(el => {
        el.classList.remove('open');
    });
    
    // If we're opening this one, add the open class
    if (isOpening) {
        parent.classList.add('open');
    }
}

// Helper function to toggle family description collapsibles
function toggleFamilyDescription(element, event) {
    // Stop propagation to prevent global click handler from closing immediately
    if (event) {
        event.stopPropagation();
    }
    
    const parent = element.parentElement;
    const isOpening = !parent.classList.contains('open');
    
    // Close all family collapsibles (both types)
    document.querySelectorAll('.family-matchup-collapsible.open, .family-guide-collapsible.open').forEach(el => {
        el.classList.remove('open');
    });
    
    // Close all element collapsibles to make them mutually exclusive
    document.querySelectorAll('.element-matchup-collapsible.open, .element-guide-collapsible.open').forEach(el => {
        el.classList.remove('open');
    });
    
    // If we're opening this one, add the open class
    if (isOpening) {
        parent.classList.add('open');
    }
}

// Create global instance
const ui = new UIController();
