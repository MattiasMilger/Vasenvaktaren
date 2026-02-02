// =============================================================================
// 8g-ui-modals.js - UI Controller Extension
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
            items.forEach(([itemId, count]) => {
                const item = TAMING_ITEMS[itemId];
                if (!item) return;

                const itemBtn = document.createElement('button');
                itemBtn.className = 'offer-item-btn';
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
                }
                runeList.appendChild(runeBtn);
            });
        };

        document.getElementById('close-rune-modal').onclick = () => modal.classList.remove('active');
        modal.classList.add('active');
    };

    // Equip rune
UIController.prototype.equipRune = function(vasenId, runeId) {
        // Find the väsen in collection
        const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
        if (!vasen) {
            this.showMessage('Väsen not found.', 'error');
            return;
        };
        
        const result = gameState.equipRune(runeId, vasenId);
        this.showMessage(result.message, result.success ? 'info' : 'error');
        this.refreshCurrentTab();
        this.renderParty(); // Update party display to show new rune
        if (this.selectedVasen && this.selectedVasen.id === vasenId) {
            this.renderVasenDetails(this.selectedVasen);
        }
    };

    // Unequip rune
UIController.prototype.unequipRune = function(vasenId, runeId) {
        // Find the väsen in collection
        const vasen = gameState.vasenCollection.find(v => v.id === vasenId);
        if (!vasen) {
            this.showMessage('Väsen not found.', 'error');
            return;
        };
        
        const result = gameState.unequipRune(vasenId, runeId);
        this.showMessage(result.message, result.success ? 'info' : 'error');
        this.refreshCurrentTab();
        this.renderParty(); // Update party display
        if (this.selectedVasen && this.selectedVasen.id === vasenId) {
            this.renderVasenDetails(this.selectedVasen);
        }
    };

    // Show item options
UIController.prototype.showItemOptions = function(itemId) {
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
        };

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
    };

    // Show heal vasen modal
UIController.prototype.showHealVasenModal = function(itemId) {
        const modal = document.getElementById('heal-vasen-modal');
        const vasenList = document.getElementById('heal-vasen-list');
        vasenList.innerHTML = '';

        const healableVasen = gameState.vasenCollection.filter(v => {
            // Can't heal if in active combat
            if (gameState.inCombat && gameState.party.some(p => p && p.id === v.id)) {
                return false;
            };
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
        };

        document.getElementById('close-heal-modal').onclick = () => modal.classList.remove('active');
        modal.classList.add('active');
    };


    // Show rune options
UIController.prototype.showRuneOptions = function(runeId) {
        const rune = RUNES[runeId];
        const equippedTo = this.findRuneEquippedTo(runeId);

        let message = `<br><p class="rune-flavor">${rune.flavor}</p><br><p class="rune-effect">${rune.effect}</p>`;
        if (equippedTo) {
            message += `<p>Currently equipped to <strong>${equippedTo.getDisplayName()}</strong></p>`;
        };

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
    };

    // Show rune equip to vasen modal
UIController.prototype.showRuneEquipToVasenModal = function(runeId) {
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
        };

        document.getElementById('close-rune-to-vasen-modal').onclick = () => modal.classList.remove('active');
        modal.classList.add('active');
    };

    // Equip rune to väsen (with auto-unequip from previous owner - handled by gameState.equipRune)
UIController.prototype.equipRuneToVasen = function(vasenId, runeId) {
        // The new gameState.equipRune handles auto-unequipping from previous owner
        this.equipRune(vasenId, runeId);
    };

    // Settings methods
UIController.prototype.showSettings = function() {
        this.settingsModal.classList.add('active');
    };

UIController.prototype.hideSettings = function() {
        this.settingsModal.classList.remove('active');
    };

UIController.prototype.exportSave = function() {
        const saveData = gameState.exportSave();
        navigator.clipboard.writeText(saveData).then(() => {
            this.showMessage('Progress exported to clipboard!');
        }).catch(() => {
            // Fallback: show in textarea
            const textarea = document.getElementById('import-save-data');
            textarea.value = saveData;
            this.showMessage('Copy the save data from the text area.');
        });
    };

UIController.prototype.importSave = function() {
    const saveData = document.getElementById('import-save-data').value.trim();
    if (!saveData) {
        this.showMessage('Please paste save data first.', 'error');
        return;
    };

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
};

UIController.prototype.confirmReset = function() {
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
    };

UIController.prototype.showCombatTips = function() {
        this.renderGameGuideContent();
        this.combatTipsModal.classList.add('active');
    };

UIController.prototype.hideCombatTips = function() {
        this.combatTipsModal.classList.remove('active');
    };

    // Toggle inventory visibility (mobile only)
UIController.prototype.toggleInventory = function() {
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
    };

    // Restore inventory collapsed state from localStorage
UIController.prototype.restoreInventoryState = function() {
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
    };

    // Render dynamic Game Guide content (Element Matchups and Temperaments)
UIController.prototype.renderGameGuideContent = function() {
        // Render Element Matchups
        const elementMatchupsContainer = document.getElementById('dynamic-element-matchups');
        if (elementMatchupsContainer) {
            elementMatchupsContainer.innerHTML = this.generateElementMatchupsHTML();
        };

        // Render Families
        const familiesContainer = document.getElementById('dynamic-families');
        if (familiesContainer) {
            familiesContainer.innerHTML = this.generateFamiliesHTML();
        };

        // Render Temperaments
        const temperamentsContainer = document.getElementById('dynamic-temperaments');
        if (temperamentsContainer) {
            temperamentsContainer.innerHTML = this.generateTemperamentsHTML();
        }
    };

    // Generate Element Matchups HTML from ELEMENT_MATCHUPS constant
UIController.prototype.generateElementMatchupsHTML = function() {
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
    };

    // Generate Temperaments HTML from TEMPERAMENTS constant
UIController.prototype.generateTemperamentsHTML = function() {
        let html = `<div class="temperament-list"><h4>Temperaments</h4>`;

        Object.values(TEMPERAMENTS).forEach(temperament => {
            html += `<p><strong>${temperament.name}</strong> +${temperament.modifier} ${capitalize(temperament.positive)}, -${temperament.modifier} ${capitalize(temperament.negative)}</p>`;
        });

        html += `</div>`;

        return html;
    };

    // Generate Families HTML from FAMILIES and FAMILY_DESCRIPTIONS constants
UIController.prototype.generateFamiliesHTML = function() {
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
    };

    // Profile
    // Render Endless Tower record
UIController.prototype.renderEndlessTowerRecord = function() {
        const record = gameState.endlessTowerRecord;
        const hasRecord = record && record.highestFloor > 0;
        
        if (!hasRecord) {
            return `
                <div class="endless-tower-record locked">
                    <h4>Endless Tower Record</h4>
                    <p class="record-placeholder">Challenge the Endless Tower in Ginnungagap to set a record</p>
                </div>
            `;
        };
        
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
        };
        
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
    };

UIController.prototype.showProfile = function() {
        this.profileModal.classList.add('active');
        this.renderProfile();
    };

UIController.prototype.hideProfile = function() {
        this.profileModal.classList.remove('active');
    };

UIController.prototype.renderProfile = function() {
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
    };

UIController.prototype.changeName = function() {
        const newName = prompt('Enter new name:', gameState.playerName);
        if (newName && newName.trim()) {
            gameState.playerName = newName.trim();
            this.playerNameDisplay.textContent = gameState.playerName;
            gameState.saveGame();
            this.showMessage('Name changed successfully!');
        }
    };

    // Update player name display
UIController.prototype.updatePlayerName = function() {
        const name = gameState.playerName || 'Väktare';
        this.playerNameDisplay.textContent = `Player Profile: ${name}`;
    };

    // Show knockout swap modal
UIController.prototype.showKnockoutSwapModal = function(battle, callback) {
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


    // Show encounter result
UIController.prototype.showEncounterResult = function(result) {
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
    `<p>${result.dialogue}</p><p class="rune-reveal"><span class="rune-symbol large">${RUNES[result.runeId].symbol}</span> ${RUNES[result.runeId].name}</p><p class="rune-effect">${RUNES[result.runeId].effect}</p>`,  
    [{ text: 'Confirm', callback: null }],
    false
);

        }
    };

    // Show battle result
UIController.prototype.showBattleResult = function(result) {
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
            };

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
        };

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
    };

    // Refresh all UI
UIController.prototype.refreshAll = function() {
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
};

// Helper function
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Helper function to toggle element matchup collapsibles (closes others when one opens)
function toggleElementMatchup(element, event) {
    // Stop propagation to prevent global click handler from closing immediately
    if (event) {
        event.stopPropagation();
    };
    
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
};

// Helper function to toggle family description collapsibles
function toggleFamilyDescription(element, event) {
    // Stop propagation to prevent global click handler from closing immediately
    if (event) {
        event.stopPropagation();
    };
    
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
};

// Create global instance
const ui = new UIController();
