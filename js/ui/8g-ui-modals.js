// =============================================================================
// 8g-ui-modals.js - UI Controller Extension (Modals Only)
// =============================================================================


UIController.prototype.showDialogue = function(title, message, buttons = [{ text: 'Confirm', callback: null }], dismissible = true, extraClass = null) {
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
        };

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
};

modal.classList.add('active');

const firstButton = btnContainer.querySelector('button:not([disabled])');
if (firstButton) firstButton.focus();

};



    // Confirm Releasing Väsen

UIController.prototype.confirmReleaseVasen = function(vasenId) {
    if (gameState.inCombat) {
        this.showMessage("You cannot release a Väsen during combat.", "error");
        return;
    };

    const vasen = gameState.vasenCollection.find(v => v.id === vasenId);

    if (!vasen) {
        this.showMessage('Väsen not found.', 'error');
        return;
    };

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
};

    // Show offer item modal
UIController.prototype.showOfferModal = function(battle) {
        const modal = document.getElementById('offer-modal');
        const itemList = document.getElementById('offer-item-list');
        itemList.innerHTML = '';

        const items = Object.entries(gameState.itemInventory);
        if (items.length === 0) {
            itemList.innerHTML = '<p class="empty-message">You have no items to offer.</p>';
        } else {
            // NEW: Check which item is correct for tutorial highlighting
            const enemySpecies = battle.enemyActive.speciesName;
            const correctItem = VASEN_SPECIES[enemySpecies]?.tamingItem;
            const shouldShowTutorial = !gameState.firstCombatTutorialShown && battle.isWildEncounter;
            
            items.forEach(([itemId, count]) => {
                const item = TAMING_ITEMS[itemId];
                if (!item) return;

                const itemBtn = document.createElement('button');
                itemBtn.className = 'offer-item-btn';
                
                // NEW: Add tutorial class if this is the correct item
                if (shouldShowTutorial && itemId === correctItem) {
                    itemBtn.classList.add('tutorial-blink');
                }
                
                itemBtn.innerHTML = `
                    <div class="offer-item-header">
                        <span class="offer-item-name">${item.name}</span>
                        <span class="offer-item-count">x${count}</span>
                    </div>
                    <p class="offer-item-description">${this.highlightItemKeywords(item.description)}</p>
                `;
                itemBtn.onclick = () => {
                    modal.classList.remove('active');
                    game.handleOfferItem(itemId);
                };
                itemList.appendChild(itemBtn);
            });
        };

        document.getElementById('close-offer-modal').onclick = () => modal.classList.remove('active');
        modal.classList.add('active');
    };

    // Show ally select modal (for target selection)
UIController.prototype.showAllySelectionModal = function(battle, abilityName, callback) {
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
    };

    // Find rune owner helper
UIController.prototype.findRuneOwner = function(runeId) {
        return gameState.vasenCollection.find(v => v.runes.includes(runeId));
    };

    // Show rune equip modal
UIController.prototype.showRuneEquipModal = function(vasenId) {
        const modal = document.getElementById('rune-equip-modal');
        const runeList = document.getElementById('rune-equip-list');
        runeList.innerHTML = '';

        const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
        if (!vasen) return;

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
                };
                
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
                };
                
                runeList.appendChild(runeBtn);
            });
        };

        document.getElementById('close-rune-equip-modal').onclick = () => modal.classList.remove('active');
        modal.classList.add('active');
    };

// Settings modal
UIController.prototype.showSettings = function() {
    this.settingsModal.classList.add('active');
};

UIController.prototype.hideSettings = function() {
    this.settingsModal.classList.remove('active');
};

// Combat tips modal
UIController.prototype.showCombatTips = function() {
    this.combatTipsModal.classList.add('active');
};

UIController.prototype.hideCombatTips = function() {
    this.combatTipsModal.classList.remove('active');
};

// Profile modal
UIController.prototype.showProfile = function() {
    this.updateProfileAchievements();
    this.profileModal.classList.add('active');
};

UIController.prototype.hideProfile = function() {
    this.profileModal.classList.remove('active');
};

UIController.prototype.updateProfileAchievements = function() {
    const list = document.getElementById('achievement-list');
    list.innerHTML = '';

    // Get all achievements and sort them
    const achievements = Object.entries(ACHIEVEMENTS).map(([key, achievement]) => {
        const unlocked = gameState.achievements.has(key);
        return { key, achievement, unlocked };
    }).sort((a, b) => {
        // Sort: unlocked first, then by order defined
        if (a.unlocked && !b.unlocked) return -1;
        if (!a.unlocked && b.unlocked) return 1;
        return 0;
    });

    achievements.forEach(({ key, achievement, unlocked }) => {
        const item = document.createElement('div');
        item.className = `achievement-item ${unlocked ? 'unlocked' : 'locked'}`;
        
        let achievementHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
        `;

        // Add rune info if achievement unlocks a rune
        if (achievement.unlocksRune) {
            const rune = RUNES[achievement.unlocksRune];
            if (rune) {
                achievementHTML += `
                    <div class="achievement-rune-info">
                        <span class="rune-symbol-small">${rune.symbol}</span>
                        <span class="rune-unlock-text">Unlocks: ${rune.name}</span>
                    </div>
                `;
            }
        }

        achievementHTML += `</div>`;
        item.innerHTML = achievementHTML;
        list.appendChild(item);
    });
};

UIController.prototype.changeName = function() {
    const newName = prompt('Enter new player name:', gameState.playerName);
    if (newName && newName.trim()) {
        gameState.playerName = newName.trim();
        this.updatePlayerName();
        gameState.save();
    }
};

// Show move Väsen dialogue
UIController.prototype.showMoveVasenDialogue = function(vasenId, fromParty) {
    const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
    if (!vasen) return;

    const isInParty = gameState.isVasenInParty(vasenId);
    
    if (fromParty && isInParty) {
        // Moving FROM party TO collection
        this.showDialogue(
            'Remove from Party?',
            `<p>Move <strong>${vasen.getDisplayName()}</strong> to your collection?</p>`,
            [
                {
                    text: 'Move to Collection',
                    class: 'btn-primary',
                    callback: () => {
                        gameState.removeFromParty(vasenId);
                        this.refreshAll();
                        this.showMessage(`${vasen.getName()} moved to collection.`, 'success');
                    }
                },
                {
                    text: 'Cancel',
                    class: 'btn-secondary',
                    callback: null
                }
            ],
            true,
            'move-vasen-dialogue'
        );
    } else if (!fromParty && !isInParty) {
        // Moving FROM collection TO party
        if (gameState.party.length >= GAME_CONFIG.MAX_PARTY_SIZE) {
            this.showSwapIntoPartyDialogue(vasenId);
        } else {
            this.showDialogue(
                'Add to Party?',
                `<p>Add <strong>${vasen.getDisplayName()}</strong> to your party?</p>`,
                [
                    {
                        text: 'Add to Party',
                        class: 'btn-primary',
                        callback: () => {
                            gameState.addToParty(vasenId);
                            this.refreshAll();
                            this.showMessage(`${vasen.getName()} added to party.`, 'success');
                        }
                    },
                    {
                        text: 'Cancel',
                        class: 'btn-secondary',
                        callback: null
                    }
                ],
                true,
                'move-vasen-dialogue'
            );
        }
    }
};

// Show swap into party dialogue (when party is full)
UIController.prototype.showSwapIntoPartyDialogue = function(vasenId) {
    const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
    if (!vasen) return;

    const modal = document.getElementById('dialogue-modal');
    document.getElementById('dialogue-title').textContent = 'Party is Full';
    
    let message = `<p>Your party is full. Select a Väsen to swap with <strong>${vasen.getDisplayName()}</strong>:</p>`;
    message += '<div class="swap-party-list">';
    
    gameState.party.forEach(partyVasenId => {
        const partyVasen = gameState.vasenCollection.find(v => v.id === partyVasenId);
        if (!partyVasen) return;
        
        message += `
            <button class="swap-party-btn" onclick="ui.performPartySwap('${vasenId}', '${partyVasenId}')">
                ${this.createStandardVasenCardHTML(partyVasen, false)}
            </button>
        `;
    });
    
    message += '</div>';
    
    document.getElementById('dialogue-message').innerHTML = message;
    
    const btnContainer = document.getElementById('dialogue-buttons');
    btnContainer.innerHTML = '';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => {
        modal.classList.remove('active', 'swap-into-party-dialogue');
        gameState.uiLocked = false;
    };
    btnContainer.appendChild(cancelBtn);
    
    modal.classList.add('active', 'swap-into-party-dialogue');
    gameState.uiLocked = true;
    modal.dataset.dismissible = 'true';
};

// Perform party swap
UIController.prototype.performPartySwap = function(incomingVasenId, outgoingVasenId) {
    const modal = document.getElementById('dialogue-modal');
    modal.classList.remove('active', 'swap-into-party-dialogue');
    gameState.uiLocked = false;
    
    const incomingVasen = gameState.vasenCollection.find(v => v.id === incomingVasenId);
    const outgoingVasen = gameState.vasenCollection.find(v => v.id === outgoingVasenId);
    
    if (!incomingVasen || !outgoingVasen) return;
    
    // Get the index of the outgoing Väsen in the party
    const partyIndex = gameState.party.indexOf(outgoingVasenId);
    
    // Remove the outgoing Väsen
    gameState.removeFromParty(outgoingVasenId);
    
    // Add the incoming Väsen at the same position
    if (partyIndex !== -1 && partyIndex < gameState.party.length) {
        gameState.party.splice(partyIndex, 0, incomingVasenId);
    } else {
        gameState.addToParty(incomingVasenId);
    }
    
    this.refreshAll();
    this.showMessage(`${incomingVasen.getName()} swapped with ${outgoingVasen.getName()}.`, 'success');
};

// Show confirm reset dialogue
UIController.prototype.confirmReset = function() {
    this.showDialogue(
        'Reset Game?',
        '<p>Are you sure you want to reset the game?<br>All progress will be lost!</p>',
        [
            {
                text: 'Reset',
                class: 'btn-danger',
                callback: () => {
                    gameState.reset();
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
};

// Export save
UIController.prototype.exportSave = function() {
    const saveData = gameState.exportSave();
    
    // Copy to clipboard
    navigator.clipboard.writeText(saveData).then(() => {
        this.showMessage('Save data copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback: show in a text area
        const textarea = document.createElement('textarea');
        textarea.value = saveData;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showMessage('Save data copied to clipboard!', 'success');
    });
};

// Import save
UIController.prototype.importSave = function() {
    const textarea = document.getElementById('import-save-data');
    const saveData = textarea.value.trim();
    
    if (!saveData) {
        this.showMessage('Please paste save data first.', 'error');
        return;
    }
    
    const success = gameState.importSave(saveData);
    
    if (success) {
        this.showMessage('Save data imported successfully!', 'success');
        textarea.value = '';
        textarea.style.display = 'none';
        document.getElementById('confirm-import-btn').style.display = 'none';
        this.hideSettings();
        
        // Reload the page to apply imported data
        setTimeout(() => location.reload(), 500);
    } else {
        this.showMessage('Invalid save data. Please check and try again.', 'error');
    }
};

// Show knockout swap modal (forced swap during combat)
UIController.prototype.showKnockoutSwapModal = function(battle, callback) {
    const modal = document.getElementById('knockout-swap-modal');
    const vasenList = document.getElementById('knockout-swap-list');
    vasenList.innerHTML = '';

    GameState.uiLocked = true;

    // Filter alive Väsen that aren't the active one
    const availableVasen = battle.playerTeam.filter(v => 
        !v.isKnockedOut() && v.id !== battle.playerActive.id
    );

    // If no Väsen available → you lose
    if (availableVasen.length === 0) {
        modal.classList.remove('active');
        GameState.uiLocked = false;
        callback(null);
        return;
    };

    // If only one ally is alive → auto swap (your existing logic)
    if (availableVasen.length === 1) {
        const actualIndex = battle.playerTeam.indexOf(availableVasen[0]);
        modal.classList.remove('active');
        GameState.uiLocked = false;
        callback(actualIndex);
        return;
    };

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
};
