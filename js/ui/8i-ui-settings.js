// =============================================================================
// 8i-ui-settings.js - Settings, Profile, and Game Guide
// =============================================================================

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

    UIController.prototype.showProfile = function() {
        this.profileModal.classList.add('active');
        this.renderProfile();
    };

    UIController.prototype.hideProfile = function() {
        // Auto-save name on close
        const nameInput = document.getElementById('profile-name-input');
        if (nameInput) {
            const newName = nameInput.value.trim();
            if (newName !== gameState.playerName) {
                gameState.playerName = newName;
                const displayName = newName || 'Väktare';
                this.playerNameDisplay.textContent = 'Player Profile: ' + displayName;
                gameState.saveGame();
            }
        }
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
                <div class="profile-name-input-wrapper">
                    <input type="text" id="profile-name-input" value="${gameState.playerName || ''}" placeholder="Väktare" maxlength="20" spellcheck="false" autocomplete="off">
                    <span id="profile-name-saved" class="profile-name-saved">Saved</span>
                </div>
            </div>

            <div class="profile-collection-section">
                <h4>Collection:</h4>
                <div class="achievement">
                    <div class="collection-stats">
                        <div class="collection-stat">
                            <span class="collection-label">Runes Collected</span>
                            <span class="collection-value">${gameState.collectedRunes.size} / ${RUNE_LIST.length}</span>
                        </div>
                        <div class="collection-stat">
                            <span class="collection-label">Zones Cleared</span>
                            <span class="collection-value">${gameState.defeatedGuardians.size} / ${ZONE_ORDER.filter(zoneId => ZONES[zoneId].guardian !== null).length}</span>
                        </div>
                        <div class="collection-stat">
                            <span class="collection-label">Väsen Types Tamed</span>
                            <span class="collection-value">${gameState.getUniqueSpeciesTamed()} / ${Object.keys(VASEN_SPECIES).length}</span>
                        </div>
                    </div>
                </div>
            </div>

            ${achievementsHtml}

            ${this.renderEndlessTowerRecord()}
        `;

        // Auto-save name helper
        const nameInput = document.getElementById('profile-name-input');
        const savedIndicator = document.getElementById('profile-name-saved');
        let savedTimeout = null;

        const saveName = () => {
            const newName = nameInput.value.trim();
            if (newName === gameState.playerName) return;
            gameState.playerName = newName;
            const displayName = newName || 'Väktare';
            this.playerNameDisplay.textContent = 'Player Profile: ' + displayName;
            gameState.saveGame();

            // Flash "Saved" indicator
            savedIndicator.classList.add('visible');
            clearTimeout(savedTimeout);
            savedTimeout = setTimeout(() => savedIndicator.classList.remove('visible'), 1500);
        };

        nameInput.addEventListener('blur', saveName);
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                nameInput.blur();
            }
        });
    };

    // Update player name display
    UIController.prototype.updatePlayerName = function() {
        const name = gameState.playerName || 'Väktare';
        this.playerNameDisplay.textContent = `Player Profile: ${name}`;
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
                        return rune ? `${rune.symbol} ${rune.name}` : '';
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
    };

    UIController.prototype.showCombatTips = function() {
        this.renderGameGuideContent();
        this.combatTipsModal.classList.add('active');
    };

    UIController.prototype.hideCombatTips = function() {
        this.combatTipsModal.classList.remove('active');
    };

    // Render dynamic Game Guide content (Element Matchups and Temperaments)
    UIController.prototype.renderGameGuideContent = function() {
        // Populate dynamic values from GAME_CONFIG
        this.populateGameGuideValues();

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
    };

    // Populate game guide values from GAME_CONFIG
    UIController.prototype.populateGameGuideValues = function() {
        // Helper function to set text content safely
        const setText = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        // Taming
        setText('guide-max-offers', GAME_CONFIG.MAX_OFFERS_PER_COMBAT);

        // Megin System
        setText('guide-megin-regen', `${Math.round(GAME_CONFIG.MEGIN_REGEN_RATE * 100)}%`);
        setText('guide-element-discount', `${Math.round(GAME_CONFIG.SAME_ELEMENT_MEGIN_DISCOUNT * 100)}%`);
        setText('guide-base-megin', GAME_CONFIG.BASE_MEGIN);
        setText('guide-megin-per-level', GAME_CONFIG.MEGIN_PER_LEVEL);

        // Healing
        setText('guide-post-battle-heal', `${Math.round(GAME_CONFIG.POST_BATTLE_HEAL_PERCENT * 100)}%`);
        setText('guide-sacred-well-heal', `${Math.round(GAME_CONFIG.SACRED_WELL_HEAL_PERCENT * 100)}%`);
        setText('guide-correct-item-heal', `${Math.round(GAME_CONFIG.CORRECT_ITEM_HEAL_PERCENT * 100)}%`);
        setText('guide-wrong-item-heal', `${Math.round(GAME_CONFIG.WRONG_ITEM_HEAL_PERCENT * 100)}%`);

        // Experience & Leveling
        setText('guide-max-level', GAME_CONFIG.MAX_LEVEL);
        setText('guide-exp-killing', `${Math.round(GAME_CONFIG.EXP_KILLING_BLOW * 100)}%`);
        setText('guide-exp-participated', `${Math.round(GAME_CONFIG.EXP_PARTICIPATED_ON_FIELD * 100)}%`);
        setText('guide-exp-party', `${Math.round(GAME_CONFIG.EXP_IN_PARTY_NOT_FIELDED * 100)}%`);

        // Runes (max level for 2 runes)
        setText('guide-max-level-runes', GAME_CONFIG.MAX_LEVEL);

        // Power & Damage
        setText('guide-damage-variance', `${Math.round(GAME_CONFIG.DAMAGE_RANGE_VARIANCE * 100)}%`);

        // Attribute Stages
        setText('guide-stage-modifier', `${Math.round(GAME_CONFIG.ATTRIBUTE_STAGE_MODIFIER * 100)}%`);
        setText('guide-min-stage', GAME_CONFIG.MIN_ATTRIBUTE_STAGE);
        setText('guide-max-stage', `+${GAME_CONFIG.MAX_ATTRIBUTE_STAGE}`);

        // Endless Tower
        setText('guide-endless-start', GAME_CONFIG.ENDLESS_TOWER_START_LEVEL);
        setText('guide-endless-heal', `${Math.round(GAME_CONFIG.ENDLESS_TOWER_HEAL_PERCENT * 100)}%`);
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

    // Generate Temperaments HTML from TEMPERAMENTS constant
    UIController.prototype.generateTemperamentsHTML = function() {
        let html = `<div class="temperament-list"><h4>Temperaments</h4>`;

        Object.values(TEMPERAMENTS).forEach(temperament => {
            html += `<p><strong>${temperament.name}</strong> +${temperament.modifier} ${capitalize(temperament.positive)}, -${temperament.modifier} ${capitalize(temperament.negative)}</p>`;
        });

        html += `<p class="temperament-note">Modifiers apply before other bonuses.</p></div>`;

        return html;
    };

