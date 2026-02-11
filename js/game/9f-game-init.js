// =============================================================================
// 9f-game-init.js - Bootstrap and Event Bindings
// =============================================================================

// Create global game instance
const game = new Game();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    game.init();

    // Global UI Lock
    document.addEventListener('click', (e) => {
        if (gameState.uiLocked) {
            // Allow clicks inside any modal
            if (e.target.closest('.modal')) return;

            // Block everything else
            e.stopPropagation();
            e.preventDefault();
        }
    });

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
        }
    });

    // Set up global button handlers
    document.getElementById('explore-btn').addEventListener('click', () => game.explore());
    document.getElementById('challenge-btn').addEventListener('click', () => {
        // Check if we're in Ginnungagap for Endless Tower, otherwise challenge guardian
        if (gameState.currentZone === 'GINNUNGAGAP') {
            game.challengeEndlessTower();
        } else {
            game.challengeGuardian();
        }
    });

    // Combat action buttons
    document.getElementById('btn-offer').addEventListener('click', () => game.showOfferModal());
    document.getElementById('btn-ask').addEventListener('click', () => game.handleAskItem());
    document.getElementById('btn-pass').addEventListener('click', () => game.handlePass());
    document.getElementById('btn-surrender').addEventListener('click', () => game.handleSurrender());
    document.getElementById('btn-auto-battle').addEventListener('click', () => game.handleAutoBattle());
});
