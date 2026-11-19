// =============================================================================
// 8a-ui-core.js - UIController Class, Initialization, and Overlay Management
// =============================================================================

// =============================================================================
// UI icons - shared inline SVG set (Lucide-style: 24x24, 2px stroke, currentColor)
// Usage: uiIcon('runes') or uiIcon('heal', 14)  -> returns an SVG string
// =============================================================================
const UI_ICONS = {
    vasen:    '<path d="M5 3c0 4 1 6 3 7"/><path d="M19 3c0 4-1 6-3 7"/><path d="M8 10h8l1 5-5 6-5-6z"/><path d="M10 14h.01"/><path d="M14 14h.01"/>',
    runes:    '<path d="M8 3v18M8 8l8-5M8 14l8-5"/>',
    items:    '<path d="M8 7 7 3h10l-1 4"/><path d="M8 7c-3 3-4 6-4 9a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5c0-3-1-6-4-9"/><path d="M8 7h8"/>',
    offer:    '<path d="M3 5c0 9 7 15 18 14C14 18 11 13 11 4"/><path d="M3 5c3-2 6-2 8-1"/>',
    sort:     '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
    heal:     '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    equip:    '<path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/><path d="m18 15-4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/>',
    trophy:   '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    book:     '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    tower:    '<path d="M7 22V9L6 7V3h3v2h2V3h2v2h2V3h3v4l-1 2v13"/><path d="M4 22h16"/><path d="M10 22v-4a2 2 0 0 1 4 0v4"/>',
    swords:   '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/>',
    compass:  '<circle cx="12" cy="12" r="9"/><polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5"/>',
    lock:     '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    upload:   '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
    trash:    '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>'
};

function uiIcon(name, size = 16) {
    const paths = UI_ICONS[name];
    if (!paths) return '';
    return `<svg class="ui-icon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

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
        const savedVasenSortBy = localStorage.getItem('vasenSortBy');
        this.vasenSortBy = savedVasenSortBy !== null ? savedVasenSortBy : 'level'; // Sort option for väsen inventory: level, family, health, defense, durability, strength, wisdom, rarity
        const savedUnlockAllInfo = localStorage.getItem('unlockAllInfo');
        this.unlockAllInfoEnabled = savedUnlockAllInfo !== null ? savedUnlockAllInfo === 'true' : false;
    }

    // Initialize UI elements
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.restoreCombatLogState();
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
        this.combatVersus = document.querySelector('.combat-versus');

        // Settings modal
        this.settingsModal = document.getElementById('settings-modal');
        this.combatTipsModal = document.getElementById('combat-tips-modal');

        // Lore modal
        this.loreModal = document.getElementById('lore-modal');

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

// Unlock All Info toggle (Lore Book)
const unlockAllInfoToggle = document.getElementById('unlock-all-info-toggle');
if (unlockAllInfoToggle) {
    unlockAllInfoToggle.checked = this.unlockAllInfoEnabled;
    unlockAllInfoToggle.addEventListener('change', () => {
        this.toggleUnlockAllInfo(unlockAllInfoToggle.checked);
    });
}

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

// Lore book
document.getElementById('lore-btn').addEventListener('click', () => this.showLore());
document.getElementById('close-lore').addEventListener('click', () => this.hideLore());

// Lore info modal (Additional Info)
document.getElementById('close-lore-info').addEventListener('click', () => this.hideLoreInfoModal());
document.getElementById('close-lore-info-btn').addEventListener('click', () => this.hideLoreInfoModal());

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

// Combat log toggle for mobile
const combatLogToggleBtn = document.getElementById('combat-log-toggle-btn');
if (combatLogToggleBtn) {
    combatLogToggleBtn.addEventListener('click', () => this.toggleCombatLog());
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

        // Lock background scroll on mobile
        document.body.classList.add('modal-open');
    }

    // Check if any modals are active and hide overlay if none are
    checkAndHideOverlay() {
        // Clear any existing timeout
        if (this.overlayHideTimeout) {
            clearTimeout(this.overlayHideTimeout);
        }

        // Add a small delay before hiding to prevent flash when transitioning between modals
        this.overlayHideTimeout = setTimeout(() => {
            const activeModals = document.querySelectorAll('.modal.active:not(#settings-modal):not(#profile-modal):not(#combat-tips-modal):not(#lore-modal)');
            if (activeModals.length === 0 && this.modalOverlay) {
                this.modalOverlay.classList.remove('active');
            }

            // Only remove scroll lock when no modals at all are active
            const anyActiveModal = document.querySelectorAll('.modal.active');
            if (anyActiveModal.length === 0) {
                document.body.classList.remove('modal-open');
            }

            this.overlayHideTimeout = null;
        }, 50); // 50ms delay - enough to prevent flash but not noticeable to user
    }

    // Force hide overlay (for special cases)
    hideModalOverlay() {
        if (this.modalOverlay) {
            this.modalOverlay.classList.remove('active');
        }

        // Remove scroll lock
        document.body.classList.remove('modal-open');
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
    const panel = trigger.closest('.combatant-panel') || trigger.closest('.vasen-details-panel');
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
        // In a combatant card or vasen details panel the popup is clipped by overflow - use fixed positioning instead
        if (parent.closest('.combatant-panel') || parent.closest('.vasen-details-panel')) {
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
        // In a combatant card or vasen details panel the popup is clipped by overflow - use fixed positioning instead
        if (parent.closest('.combatant-panel') || parent.closest('.vasen-details-panel')) {
            const popup = parent.querySelector('.family-description-popup');
            if (popup) positionPopupForCombatCard(popup, element);
        }
    }
}

// Temperament popup. Unlike the other badge popups it is rendered on document.body
// instead of inside the clicked word's parent: party slots sit in an overflow-clipped,
// hover-transformed container, and combat panels are re-rendered constantly.
let temperamentPopupEl = null;
let temperamentPopupAnchor = null;

function closeTemperamentPopup() {
    if (temperamentPopupEl) temperamentPopupEl.remove();
    temperamentPopupEl = null;
    temperamentPopupAnchor = null;
}

function toggleTemperamentDescription(element, event) {
    if (event) {
        event.stopPropagation();
    }

    const wasOpenHere = temperamentPopupAnchor === element;
    closeTemperamentPopup();
    if (wasOpenHere) return;

    // Mutually exclusive with the element / rarity / family popups
    document.querySelectorAll('.element-matchup-collapsible.open, .element-guide-collapsible.open, .family-matchup-collapsible.open, .family-guide-collapsible.open').forEach(el => {
        el.classList.remove('open');
    });
    clearCombatCardPopupStyles();

    const temperament = Object.values(TEMPERAMENTS).find(t => t.name === element.textContent);
    if (!temperament) return;
    const { positive, negative, modifier, flavor } = temperament;
    const effect = `<span class="combat-buff">+${modifier} ${capitalize(positive)}</span><br><span class="combat-debuff">-${modifier} ${capitalize(negative)}</span>`;

    const popup = document.createElement('div');
    popup.className = 'temperament-popup';
    popup.innerHTML = `<p class="element-flavor-text"><strong>${temperament.name}</strong><br>${flavor}</p><hr style="margin: 6px 0; border: none; border-top: 1px solid var(--border-color);">${effect}`;
    document.body.appendChild(popup);
    temperamentPopupEl = popup;
    temperamentPopupAnchor = element;

    // Centered under the badge (above it if there is no room), kept inside the viewport
    const rect = element.getBoundingClientRect();
    const width = Math.min(240, window.innerWidth - 16);
    popup.style.width = width + 'px';
    popup.style.left = Math.max(8, Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 8)) + 'px';
    const fitsBelow = window.innerHeight - rect.bottom >= popup.offsetHeight + 8;
    popup.style.top = Math.max(8, fitsBelow ? rect.bottom + 4 : rect.top - popup.offsetHeight - 4) + 'px';
}

// Close on any click outside a temperament word/popup (capture phase, so it also
// runs for clicks whose own handlers stop propagation), and on scroll/resize since
// the popup is positioned in viewport coordinates.
document.addEventListener('click', (e) => {
    if (e.target.closest('.clickable-temperament') || e.target.closest('.temperament-popup')) return;
    closeTemperamentPopup();
}, true);
window.addEventListener('scroll', (e) => {
    if (temperamentPopupEl && !temperamentPopupEl.contains(e.target)) closeTemperamentPopup();
}, true);
window.addEventListener('resize', closeTemperamentPopup);

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
