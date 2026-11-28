// =============================================================================
// 9f-game-init.js - Bootstrap and Event Bindings
// =============================================================================

// Create global game instance
const game = new Game();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    game.init();

    // Global UI lock: while any modal is open, nothing behind it can be used.
    // Runs in the capture phase, before the buttons' own handlers, so it also
    // stops a keyboard press on a button focused behind the modal (Tab + Enter),
    // which would otherwise skip a wild encounter or act during the knockout
    // swap prompt. Based on what is on screen rather than a flag, so a modal
    // closed by its backdrop can never leave the game locked.
    document.addEventListener('click', (e) => {
        if (!e.isTrusted) return; // the game's own clicks (e.g. a download link)
        if (!document.querySelector('.modal.active')) return;
        // Allowed: the open modal, its backdrop, info popups and messages
        if (e.target.closest('.modal.active, #modal-overlay, .temperament-popup, #message-container')) return;
        e.stopPropagation();
        e.preventDefault();
    }, true);

    // Global click listener to close element and family popups when clicking outside
    document.addEventListener('click', (e) => {
        // Check if click is outside any element matchup or family collapsible
        const clickedElement = e.target.closest('.clickable-element');
        const clickedFamily = e.target.closest('.clickable-family');

        // If we didn't click on an element or family badge, close all popups
        if (!clickedElement && !clickedFamily) {
            document.querySelectorAll('.element-matchup-collapsible.open, .element-guide-collapsible.open').forEach(el => {
                el.classList.remove('open');
            });
            document.querySelectorAll('.family-matchup-collapsible.open, .family-guide-collapsible.open').forEach(el => {
                el.classList.remove('open');
            });
            clearCombatCardPopupStyles();
        }
    });

    // Set up global button handlers
    document.getElementById('explore-btn').addEventListener('click', () => game.explore());
    document.getElementById('challenge-btn').addEventListener('click', () => {
        // Check if we're in Ginnungagap for Endless Tower, otherwise challenge guardian
        if (gameState.currentZone === 'ZONE7') {
            game.challengeEndlessTower();
        } else {
            game.challengeGuardian();
        }
    });

    // Combat action buttons
    document.getElementById('btn-offer').addEventListener('click', () => game.showOfferModal());
    document.getElementById('btn-interrogate').addEventListener('click', () => game.handleInterrogate());
    document.getElementById('btn-pass').addEventListener('click', () => game.handlePass());
    document.getElementById('btn-surrender').addEventListener('click', () => game.handleSurrender()); // "Flee" 
    document.getElementById('btn-auto-combat').addEventListener('click', () => game.handleAutoBattle());
});