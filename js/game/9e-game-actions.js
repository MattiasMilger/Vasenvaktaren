// =============================================================================
// 9e-game-actions.js - Combat Action Handlers
// =============================================================================

// Handle ability use
Game.prototype.handleAbilityUse = function(abilityName) {
    if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;

    // Check if ability requires ally targeting
    if (abilityRequiresAllyTarget(abilityName)) {
        ui.showAllySelectionModal(this.currentBattle, abilityName, (allyIndex) => {
            // Execute the ability on the selected ally
            this.currentBattle.executePlayerAction({
                type: 'ability',
                abilityName: abilityName,
                targetAllyIndex: allyIndex
            });
        });
        return;
    }

    this.currentBattle.executePlayerAction({ type: 'ability', abilityName });
};

// Handle swap
Game.prototype.handleSwap = function(targetIndex) {
    if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
    this.currentBattle.executePlayerAction({ type: 'swap', targetIndex });
};

// Handle offer item
Game.prototype.handleOfferItem = function(itemId) {
    if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
    if (!this.currentBattle.isWildEncounter) return;

    // Use item from inventory
    if (!gameState.removeItem(itemId, 1)) {
        ui.showMessage('You don\'t have that item.', 'error');
        return;
    }

    // NEW: Mark tutorial as shown when player offers an item
    if (!gameState.firstCombatTutorialShown && this.currentBattle.isWildEncounter) {
        gameState.firstCombatTutorialShown = true;
        gameState.saveGame();
    }

    this.currentBattle.executePlayerAction({ type: 'offer', itemId });
};

// Handle ask about item confirmation
Game.prototype.handleAskItem = function() {
    if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
    if (!this.currentBattle.isWildEncounter) return;

    // Show the confirmation dialog
    ui.showDialogue(
        'Ask About Item',
        '<p>Beware, this action will cost a turn.</p>',
        [
            {
                text: 'Confirm',
                class: 'btn-primary',
                callback: () => {
                    // NEW: Trigger tutorial by resetting the flag when asking about item
                    if (this.currentBattle.isWildEncounter) {
                        gameState.firstCombatTutorialShown = false;
                        gameState.saveGame();
                    }
                    // Execute the action if confirmed
                    this.currentBattle.executePlayerAction({ type: 'ask' });
                }
            },
            {
                text: 'Close',
                class: 'btn-secondary',
                // callback: null will close the modal without executing the action
            }
        ]
    );
};

// Handle pass
Game.prototype.handlePass = function() {
    if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
    this.currentBattle.executePlayerAction({ type: 'pass' });
};

// Handle surrender
Game.prototype.handleSurrender = function() {
    if (!this.currentBattle) return;

    ui.showDialogue(
        'Surrender?',
        '<p>Are you sure you want to surrender? Your party will be left at very low health.</p>',
        [
            {
                text: 'Surrender',
                class: 'btn-danger',
                callback: () => {
                    this.currentBattle.executePlayerAction({ type: 'surrender' });
                }
            },
            {
                text: 'Continue Fighting',
                class: 'btn-secondary',
                callback: null
            }
        ]
    );
};

// Show offer modal
Game.prototype.showOfferModal = function() {
    if (!this.currentBattle || !this.currentBattle.waitingForPlayerAction) return;
    if (!this.currentBattle.isWildEncounter) return;
    ui.showOfferModal(this.currentBattle);
};
