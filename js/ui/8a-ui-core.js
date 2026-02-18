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
        this.combatDescriptionVisible = savedDesc !== null ? savedDesc === 'true' : true;
        const savedCards = localStorage.getItem('combatCardsMinimized');
        this.combatCardsMinimized = savedCards !== null ? savedCards === 'true' : false;
        this.vasenSortBy = 'level'; // Sort option for väsen inventory: level, family, health, defense, durability, strength, wisdom, rarity
    }

    // Initialize UI elements
    init() {
        this.cacheElements();
        this.setupEventListeners();
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
        clearCombatCardPopupStyles();
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
            const activeModals = document.querySelectorAll('.modal.active:not(#settings-modal):not(#profile-modal):not(#combat-tips-modal)');
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

// Clear fixed-position inline styles from all combatant card popups
function clearCombatCardPopupStyles() {
    document.querySelectorAll('.combatant-panel .matchup-details, .combatant-panel .family-description-popup').forEach(popup => {
        popup.style.cssText = '';
    });
}

// Position a popup using fixed viewport coords so it escapes overflow:hidden on the panel.
// Horizontally centered on the panel; opens in whichever vertical direction has more room.
function positionPopupForCombatCard(popup, trigger) {
    const panel = trigger.closest('.combatant-panel');
    if (!panel) return;

    const panelRect  = panel.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    // Center on the panel so the popup is never left-edge clamped on small screens
    const popupWidth = Math.min(260, window.innerWidth - 16);
    let left = panelRect.left + panelRect.width / 2 - popupWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - popupWidth - 8));

    // Always open toward whichever side has more space; cap height to that space
    const showBelow = spaceBelow >= spaceAbove;
    const availableSpace = showBelow ? spaceBelow : spaceAbove;
    const maxHeight = Math.max(Math.min(availableSpace - 4, 260), 80);

    popup.style.position = 'fixed';
    popup.style.left     = left + 'px';
    popup.style.width    = popupWidth + 'px';
    popup.style.maxWidth = 'none';       // override CSS max-width rules
    popup.style.transform = 'none';      // override CSS translateX(-50%) on family popup
    popup.style.maxHeight = maxHeight + 'px';
    popup.style.overflowY = 'auto';
    popup.style.overflowX = 'hidden';
    popup.style.overscrollBehavior = 'contain';
    popup.style.zIndex = '99999';

    // Use 'auto' not '' so CSS bottom/top values can't leak back in
    if (showBelow) {
        popup.style.top    = (triggerRect.bottom + 4) + 'px';
        popup.style.bottom = 'auto';
    } else {
        popup.style.top    = 'auto';
        popup.style.bottom = (window.innerHeight - triggerRect.top + 4) + 'px';
    }
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

    clearCombatCardPopupStyles();

    // If we're opening this one, add the open class
    if (isOpening) {
        parent.classList.add('open');
        // In a combatant card the popup is clipped by overflow:hidden — use fixed positioning instead
        if (parent.closest('.combatant-panel')) {
            const popup = parent.querySelector('.matchup-details');
            if (popup) positionPopupForCombatCard(popup, element);
        }
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

    clearCombatCardPopupStyles();

    // If we're opening this one, add the open class
    if (isOpening) {
        parent.classList.add('open');
        // In a combatant card the popup is clipped by overflow:hidden — use fixed positioning instead
        if (parent.closest('.combatant-panel')) {
            const popup = parent.querySelector('.family-description-popup');
            if (popup) positionPopupForCombatCard(popup, element);
        }
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
