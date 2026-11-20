// =============================================================================
// 8a-ui-core.js - UIController Class, Initialization, and Overlay Management
// =============================================================================

// UI RULE: no tooltips. Don't add `title` attributes (or other hover tooltips)
// to buttons, icons or other elements. Use aria-label for accessible names and
// visible text or the game's click popups when something needs explaining.

// =============================================================================
// UI icons - shared inline SVG set (Lucide-style: 24x24, 2px stroke, currentColor)
// Usage: uiIcon('runes') or uiIcon('heal', 14)  -> returns an SVG string
// =============================================================================
const UI_ICONS = {
    vasen:    '<path d="M5 3c0 4 1 6 3 7"/><path d="M19 3c0 4-1 6-3 7"/><path d="M8 10h8l1 5-5 6-5-6z"/><path d="M10 14h.01"/><path d="M14 14h.01"/>',
    runes:    '<path d="M8 3v18M8 8l8-5M8 14l8-5"/>',
    items:    '<path d="M8 7 7 3h10l-1 4"/><path d="M8 7c-3 3-4 6-4 9a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5c0-3-1-6-4-9"/><path d="M8 7h8"/>',
    sort:     '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
    heal:     '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    equip:    '<path d="M12 5v14M5 12h14"/>', // plus: add (a rune)
    trophy:   '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    book:     '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    gem:      '<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
    swords:   '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/>',
    compass:  '<circle cx="12" cy="12" r="9"/><polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5"/>',
    lock:     '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    upload:   '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
    trash:    '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    // Skill types:
    // strength - Mjölnir, Thor's hammer: the god of might (pairs with Odin's eye for wisdom)
    // wisdom   - Odin's eye: the eye he gave at Mímir's well in exchange for wisdom
    // mixed    - Gungnir, Odin's spear: a physical weapon wielded by the god of wisdom (Völuspá 24, the first war begins with his spear-cast)
    // utility  - sparks of galdr/seiðr: magic that blesses, curses and buffs rather than strikes
    strength: '<path d="M3 2.5h18l-1.5 3.75L21 10H3l1.5-3.75z"/><path d="M10 10v10a2 2 0 0 0 4 0V10"/><path d="M10 14.5h4M10 17.5h4"/>',
    wisdom:   '<path d="M2 12c3-5 6.5-7 10-7s7 2 10 7c-3 5-6.5 7-10 7s-7-2-10-7z"/><circle cx="12" cy="12" r="3"/>',
    mixed:    '<path d="M21 3l-1.6 4.8-4.1.9.9-4.1z"/><path d="M19.6 4.4 3 21"/><path d="m12.7 9.1 2.2 2.2"/>',
    utility:  '<path d="M10 3c.5 4 2 5.5 6 6.5-4 1-5.5 2.5-6 6.5-.5-4-2-5.5-6-6.5 4-1 5.5-2.5 6-6.5z"/><path d="M18 14c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3z"/>',

    // Elements: stone/mountain, seed/sprout, river/droplet, flame, storm/wind
    earth:  '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
    nature: '<path d="M12 22V11"/><path d="M12 13c-5 0-8-3-8-8 5 0 8 3 8 8z"/><path d="M12 11c0-4.5 3-7.5 8-7.5 0 4.5-3 7.5-8 7.5z"/>',
    water:  '<path d="M12 21.5a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 10.6 5 12.5 5 14.5a7 7 0 0 0 7 7z"/><path d="M8.5 14.5a3.5 3.5 0 0 0 3.5 3.5"/>',
    fire:   '<path d="M12 22c4.5 0 7.5-3 7.5-7 0-3.5-2-6-4-8 0 2.5-1 4-2.5 4.5C13.5 7 12 4 9 2c.5 3-1 5.5-2.5 7.5S4.5 13 4.5 15c0 4 3 7 7.5 7z"/><path d="M12 22c-2 0-3.2-1.4-3.2-3.2 0-1.6 1.2-3 2.2-4 .3 1 .8 1.5 1.5 1.7.2-1.2.8-2.2 1.7-3 .9 1.3 1.3 2.6 1.3 4.2 0 2.5-1.5 4.3-3.5 4.3z"/>',
    wind:   '<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>',

    // Statuses
    preparing: '<path d="M10 2h4"/><path d="m12 14 3-3"/><circle cx="12" cy="14" r="8"/>',

    // Actions and header/menu buttons
    swap:        '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
    interrogate: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    pass:        '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
    surrender:   '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
    shuffle:     '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
    profile:     '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    guide:       '<path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-2 2v1"/>',
    settings:    '<g transform="translate(4.1 1.8) scale(0.66)" stroke-width="3"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></g><path d="M4 22l16-5"/><path d="M20 22L4 17"/>'
};

// =============================================================================
// Player faces - selectable profile portraits (same 24x24, 2px stroke style).
// Every face shares the same round head; they differ by one facial feature.
// All faces share the same mouth, so the feature is the only difference.
// 'helmet' is the default. The header button keeps the person silhouette.
// =============================================================================
const FACE_HEAD = '<circle cx="12" cy="12" r="10"/>';
const FACE_MOUTH = '<path d="M9.5 16.5q2.5 1.5 5 0"/>';
const PLAYER_FACES = {
    helmet:    { name: 'Helmet',    paths: FACE_HEAD + '<path d="M2.5 9h19"/><path d="M12 2v7"/><path d="M12 9v5"/><path d="M8.5 11.5h.01M15.5 11.5h.01"/>' + FACE_MOUTH },
    glasses:   { name: 'Glasses',   paths: FACE_HEAD + '<circle cx="8.5" cy="10.5" r="2.2"/><circle cx="15.5" cy="10.5" r="2.2"/><path d="M10.7 10.5h2.6"/>' + FACE_MOUTH },
    moustache: { name: 'Moustache', paths: FACE_HEAD + '<path d="M9 10h.01M15 10h.01"/><path d="M7.5 14.5c1.5 0 2.5-2 4.5-1.5 2-.5 3 1.5 4.5 1.5"/>' + FACE_MOUTH },
    hair:      { name: 'Fringe',    paths: FACE_HEAD + '<path d="M3.3 8c2.2.6 4.4-.3 5.7-2.6 1.6 2.2 5.2 3.2 11.7 2.6"/><path d="M9 11.5h.01M15 11.5h.01"/>' + FACE_MOUTH },
    eyepatch:  { name: 'Eyepatch',  paths: FACE_HEAD + '<path d="M3 7l18 3.5"/><circle cx="15.5" cy="10.5" r="1.8"/><path d="M8.5 10.5h.01"/>' + FACE_MOUTH },
    hood:      { name: 'Hood',      paths: FACE_HEAD + '<path d="M5 19.5V11a7 7 0 0 1 14 0v8.5"/><path d="M9.5 12h.01M14.5 12h.01"/>' + FACE_MOUTH }
};

function getPlayerFaceId(faceId) {
    return PLAYER_FACES[faceId] ? faceId : 'helmet';
}

// size: a number (px) or any CSS length such as '1em'. extraClass is appended to "ui-icon".
function uiIcon(name, size = 16, extraClass = '') {
    const paths = UI_ICONS[name];
    if (!paths) return '';
    return `<svg class="ui-icon${extraClass ? ' ' + extraClass : ''}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

// Icon placed in front of a text label; sized to the surrounding font.
function inlineIcon(name) {
    return uiIcon(name, '1em', 'inline-icon');
}

// Skill type icon: Mjölnir = Strength, Odin's eye = Wisdom, Gungnir = Mixed, sparkles = Utility
const SKILL_TYPE_ICONS = {
    [ATTACK_TYPES.STRENGTH]: 'strength',
    [ATTACK_TYPES.WISDOM]:   'wisdom',
    [ATTACK_TYPES.MIXED]:    'mixed',
    [ATTACK_TYPES.UTILITY]:  'utility'
};

function skillTypeIcon(skill) {
    return skill ? inlineIcon(SKILL_TYPE_ICONS[skill.type]) : '';
}

// Lore Book categories that match an iconed concept (keys of LORE_CATEGORIES)
const LORE_CATEGORY_ICONS = {
    vasen: 'vasen',
    vasen_inaccessible: 'vasen',
    items: 'items'
};

// element: an ELEMENTS value ('Earth', 'Fire', ...)
function elementIcon(element) {
    return element ? inlineIcon(String(element).toLowerCase()) : '';
}

// Static markup in index.html uses <i data-ui-icon="name" data-size="16"></i>
// placeholders so every icon comes from UI_ICONS. Replace them with the SVG.
function hydrateStaticIcons(root = document) {
    root.querySelectorAll('[data-ui-icon]').forEach(el => {
        const size = el.dataset.size || '1em';
        const extra = el.dataset.size ? '' : 'inline-icon';
        el.outerHTML = uiIcon(el.dataset.uiIcon, size, extra);
    });
}
hydrateStaticIcons();

class UIController {
    constructor() {
        this.currentScreen = 'main-menu';
        this.currentTab = 'vasen';
        this.selectedVasen = null;
        this.selectedPartySlot = null;
        this.combatLogMessages = [];
        this.descriptionCollapsed = false; // Global state for väsen description fold
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

// Toggle a body-level popup anchored to `element`. Returns without opening when the
// same anchor is clicked again. `buildHtml` returns the popup content, or '' to skip.
function toggleBodyPopup(element, event, buildHtml, maxWidth = 240) {
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

    const html = buildHtml();
    if (!html) return;

    const popup = document.createElement('div');
    popup.className = 'temperament-popup';
    popup.innerHTML = html;
    document.body.appendChild(popup);
    temperamentPopupEl = popup;
    temperamentPopupAnchor = element;

    // Centered under the badge (above it if there is no room), kept inside the viewport
    const rect = element.getBoundingClientRect();
    const width = Math.min(maxWidth, window.innerWidth - 16);
    popup.style.width = width + 'px';
    popup.style.left = Math.max(8, Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 8)) + 'px';
    const fitsBelow = window.innerHeight - rect.bottom >= popup.offsetHeight + 8;
    popup.style.top = Math.max(8, fitsBelow ? rect.bottom + 4 : rect.top - popup.offsetHeight - 4) + 'px';
}

function toggleTemperamentDescription(element, event) {
    toggleBodyPopup(element, event, () => {
        const temperament = Object.values(TEMPERAMENTS).find(t => t.name === element.textContent);
        if (!temperament) return '';
        const { positive, negative, modifier, flavor } = temperament;
        const effect = `<span class="combat-buff">+${modifier} ${capitalize(positive)}</span><br><span class="combat-debuff">-${modifier} ${capitalize(negative)}</span>`;
        return `<p class="element-flavor-text"><strong>${temperament.name}</strong><br>${flavor}</p><hr style="margin: 6px 0; border: none; border-top: 1px solid var(--border-color);">${effect}`;
    });
}

// ── Clickable keywords ──────────────────────────────────────────────────────
// Glowing words (same look as temperaments, class .clickable-keyword) that open
// a body-level popup explaining a game term, rune or bindrune.

const KEYWORD_DEFINITIONS = {
    'initial-bonus': {
        title: 'Initial Bonus',
        get text() {
            return 'The first time a side uses this skill in a combat, it changes attributes by this many extra stages.<br>Later uses only apply the normal effect.';
        }
    },
    'empower': {
        title: 'Empower',
        get text() {
            return `Increases the damage of this väsen's next attack by ${Math.round(GAME_CONFIG.TIER1_ATTACK_SKILL_EMPOWERMENT * 100)}%.`;
        }
    },
    'debuffed': {
        title: 'Debuffed',
        get text() {
            return 'A väsen is debuffed while at least one of its attributes (strength, wisdom, defense or durability) is lowered below its normal stage.';
        }
    }
};

function toggleKeywordPopup(element, event, key) {
    toggleBodyPopup(element, event, () => {
        const def = KEYWORD_DEFINITIONS[key];
        if (!def) return '';
        return `<p><strong>${def.title}</strong><br>${def.text}</p>`;
    });
}

function toggleRunePopup(element, event, runeId) {
    toggleBodyPopup(element, event, () => {
        const rune = RUNES[runeId];
        if (!rune) return '';
        return `<p><strong>${rune.symbol} ${rune.name}</strong><br>${rune.effect}</p>`;
    }, 260);
}

function toggleItemPopup(element, event, itemId) {
    toggleBodyPopup(element, event, () => {
        const item = TAMING_ITEMS[itemId];
        if (!item) return '';
        return `<p><strong>${item.name}</strong><br>${ui.highlightItemKeywords(item.description)}</p>`;
    }, 260);
}

// Clickable taming item name (glowing word); clicking shows the item's description.
UIController.prototype.getItemTextHTML = function(itemId) {
    const item = TAMING_ITEMS[itemId];
    if (!item) return itemId;
    return `<span class="clickable-keyword item-keyword" onclick="toggleItemPopup(this, event, '${itemId}')">${inlineIcon('items')}${item.name}</span>`;
};

// Clickable rune name (glowing word) for a single rune id.
UIController.prototype.getRuneTextHTML = function(runeId) {
    const rune = RUNES[runeId];
    if (!rune) return runeId;
    return `<span class="clickable-keyword rune-keyword" onclick="toggleRunePopup(this, event, '${runeId}')">${rune.symbol} ${rune.name}</span>`;
};

function toggleBindRunePopup(element, event, runeA, runeB) {
    toggleBodyPopup(element, event, () => {
        const br = BIND_RUNES.find(b => b.runes.includes(runeA) && b.runes.includes(runeB));
        if (!br || !RUNES[runeA] || !RUNES[runeB]) return '';
        const symbols = RUNES[runeA].symbol + RUNES[runeB].symbol;
        return `<p><strong>${symbols} Bindrune</strong> (${RUNES[runeA].name} + ${RUNES[runeB].name})<br>${br.effectText}</p>`;
    }, 260);
}

// HTML for a väsen's equipped runes (+ active bindrune) as clickable words.
UIController.prototype.getRunesTextHTML = function(vasen, separator = ' ') {
    if (!vasen || !vasen.runes || vasen.runes.length === 0) return '';
    const parts = vasen.runes.map(id => {
        const rune = RUNES[id];
        return rune ? `<span class="clickable-keyword rune-keyword" onclick="toggleRunePopup(this, event, '${id}')">${rune.symbol} ${rune.name}</span>` : '';
    }).filter(Boolean);
    getActiveBindRunes(vasen).forEach(br => {
        const ids = vasen.runes.filter(r => br.runes.includes(r));
        parts.push(`<span class="clickable-keyword rune-keyword" onclick="toggleBindRunePopup(this, event, '${ids[0]}', '${ids[1]}')">${br.symbols} Bindrune</span>`);
    });
    return parts.join(separator);
};

UIController.prototype.getInitialBonusHTML = function(skill, className) {
    if (!skill.initialBonus) return '';
    return `<span class="${className}"><span class="clickable-keyword" onclick="toggleKeywordPopup(this, event, 'initial-bonus')">Initial Bonus</span>: ${skill.initialBonus}</span>`;
};

// Makes game terms inside a skill's mechanics text clickable.
UIController.prototype.linkifyKeywords = function(text) {
    if (!text) return '';
    return text
        .replace(/\bdebuffed\b/g, `<span class="clickable-keyword" onclick="toggleKeywordPopup(this, event, 'debuffed')">debuffed</span>`)
        .replace(/\bEmpowers\b/g, `<span class="clickable-keyword" onclick="toggleKeywordPopup(this, event, 'empower')">Empowers</span>`);
};

// Element / rarity / family badges on väsen inventory cards. The cards lift on hover
// (CSS transform), which would trap a fixed-position popup inside them, so these
// use the same body-level popup as temperaments.
function toggleCardBadgePopup(element, event, kind) {
    const value = element.textContent.trim();
    toggleBodyPopup(element, event, () => {
        const hr = '<hr style="margin: 8px 0; border: none; border-top: 1px solid var(--border-color);">';
        if (kind === 'element') {
            return ui.generateDefensiveMatchupsHTML(value);
        }
        if (kind === 'rarity') {
            return `<p><strong>${value}</strong><br>${RARITY_DESCRIPTIONS[value] || ''}</p>`;
        }
        if (kind === 'family') {
            const passive = FAMILY_PASSIVES[value];
            return `<p><strong>${value}</strong><br>${FAMILY_DESCRIPTIONS[value] || 'No description available.'}</p>`
                + (passive ? `${hr}<p><strong>Trait: ${passive.name}</strong><br>${passive.description}</p>` : '');
        }
        return '';
    }, 260);
}

// Close on any click outside a temperament word/popup (capture phase, so it also
// runs for clicks whose own handlers stop propagation), and on scroll/resize since
// the popup is positioned in viewport coordinates.
document.addEventListener('click', (e) => {
    if (e.target.closest('.clickable-temperament, .clickable-keyword, .card-badge-clickable, .temperament-popup')) return;
    closeTemperamentPopup();
}, true);
window.addEventListener('scroll', (e) => {
    if (temperamentPopupEl && !temperamentPopupEl.contains(e.target)) closeTemperamentPopup();
}, true);
window.addEventListener('resize', closeTemperamentPopup);

// Create global instance
const ui = new UIController();
