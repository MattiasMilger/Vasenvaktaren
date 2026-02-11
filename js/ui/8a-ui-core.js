// =============================================================================
// 8a-ui-core.js - UIController Class, Initialization, and Overlay Management
// =============================================================================

class UIController {
    constructor() {
        this.currentScreen = 'main-menu';
        this.currentTab = 'vasen';
        this.selectedVasen = null;
        this.selectedPartySlot = null;
        this.combatLogMessages = [];
        this.descriptionCollapsed = false; // Global state for väsen description fold
        const savedRunes = localStorage.getItem('combatRunesVisible');
        this.runeDescriptionsVisible = savedRunes !== null ? savedRunes === 'true' : false;
        const savedDesc = localStorage.getItem('combatDescriptionVisible');
        this.combatDescriptionVisible = savedDesc !== null ? savedDesc === 'true' : false;
        const savedCards = localStorage.getItem('combatCardsMinimized');
        this.combatCardsMinimized = savedCards !== null ? savedCards === 'true' : false;
        this.vasenSortBy = 'level'; // Sort option for väsen inventory: level, family, health, defense, durability, strength, wisdom, rarity
    }

    // Initialize UI elements
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.restoreInventoryState();
        this.restoreBattleLogState();
        this.restoreCombatCardsState();
    }

    // Cache DOM elements
    cacheElements() {
        // Modal overlay
        this.modalOverlay = document.getElementById('modal-overlay');

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

        // Tutorial state for explore button
        this.exploreTutorialActive = false;

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
                this.checkAndHideOverlay();
            }
        }
    });
});

// Close modals and overlay on overlay click (only if dismissible)
if (this.modalOverlay) {
    this.modalOverlay.addEventListener('click', () => {
        // Check if any active modal is dismissible
        const activeModals = document.querySelectorAll('.modal.active');
        activeModals.forEach(modal => {
            const isDismissible = modal.dataset.dismissible !== 'false';
            if (isDismissible) {
                modal.classList.remove('active');
            }
        });
        this.checkAndHideOverlay();
    });
}

// Inventory toggle for mobile
const inventoryToggleBtn = document.getElementById('inventory-toggle-btn');
if (inventoryToggleBtn) {
    inventoryToggleBtn.addEventListener('click', () => this.toggleInventory());
}

// Battle log toggle for mobile
const battleLogToggleBtn = document.getElementById('battle-log-toggle-btn');
if (battleLogToggleBtn) {
    battleLogToggleBtn.addEventListener('click', () => this.toggleBattleLog());
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

    // Show modal overlay (called when any modal opens)
    showModalOverlay() {
        // Clear any pending hide timeout to prevent flash
        if (this.overlayHideTimeout) {
            clearTimeout(this.overlayHideTimeout);
            this.overlayHideTimeout = null;
        }

        if (this.modalOverlay) {
            this.modalOverlay.classList.add('active');
        }
    }

    // Check if any modals are active and hide overlay if none are
    checkAndHideOverlay() {
        // Clear any existing timeout
        if (this.overlayHideTimeout) {
            clearTimeout(this.overlayHideTimeout);
        }

        // Add a small delay before hiding to prevent flash when transitioning between modals
        this.overlayHideTimeout = setTimeout(() => {
            const activeModals = document.querySelectorAll('.modal.active');
            if (activeModals.length === 0 && this.modalOverlay) {
                this.modalOverlay.classList.remove('active');
            }
            this.overlayHideTimeout = null;
        }, 50); // 50ms delay - enough to prevent flash but not noticeable to user
    }

    // Force hide overlay (for special cases)
    hideModalOverlay() {
        if (this.modalOverlay) {
            this.modalOverlay.classList.remove('active');
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

// Toggle rune descriptions globally for both combatant panels
function toggleRuneDescriptions() {
    ui.runeDescriptionsVisible = !ui.runeDescriptionsVisible;
    localStorage.setItem('combatRunesVisible', ui.runeDescriptionsVisible ? 'true' : 'false');
    document.querySelectorAll('.rune-collapsible').forEach(el => {
        // Only toggle rune collapsibles inside combatant-runes, not description collapsibles
        if (el.closest('.combatant-runes')) {
            el.classList.toggle('open', ui.runeDescriptionsVisible);
        }
    });
}

// Toggle combat descriptions globally for both combatant panels
function toggleCombatDescriptions() {
    ui.combatDescriptionVisible = !ui.combatDescriptionVisible;
    localStorage.setItem('combatDescriptionVisible', ui.combatDescriptionVisible ? 'true' : 'false');
    document.querySelectorAll('.combatant-description .rune-collapsible').forEach(el => {
        el.classList.toggle('open', ui.combatDescriptionVisible);
    });
}

// Create global instance
const ui = new UIController();
