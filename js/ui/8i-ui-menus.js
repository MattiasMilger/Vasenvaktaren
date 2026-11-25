// =============================================================================
// 8i-ui-menus.js - Settings, Profile, and Game Guide
// =============================================================================

    // Settings methods
    UIController.prototype.showSettings = function() {
        this.renderSettingsSaveInfo();
        this.settingsModal.classList.add('active');
    };

    UIController.prototype.hideSettings = function() {
        this.settingsModal.classList.remove('active');
    };

    // Toggle the Disable Tips setting (persisted via localStorage under the
    // 'disableBeginnerTutorial' key, so the choice carries over from saves made
    // when the setting was called Disable Beginner Tutorial).
    // Hides the guidance: tip boxes in dialogues (new-player hints and reminders
    // such as the turn cost of Interrogating), tutorial glows, the free
    // interrogation turn and guidance popups. Confirmation dialogues still open;
    // only their tip boxes are hidden. Action-driven glows such as Offer Item
    // after interrogating are unaffected. Off by default.
    UIController.prototype.toggleTips = function(disabled) {
        this.tipsDisabled = disabled;
        localStorage.setItem('disableBeginnerTutorial', disabled ? 'true' : 'false');
        this.updateExploreButton();
        this.updateLoreButtonGlow();
    };

    UIController.prototype.areTipsEnabled = function() {
        return !this.tipsDisabled;
    };

    // Toggle the Lore Book Unlock All Info setting (persisted via localStorage,
    // like the other UI display toggles). When on, every "i" info popup in the
    // Lore Book shows its full details without having to be discovered in-game
    // first (a wiki-style view). Off by default.
    UIController.prototype.toggleUnlockAllInfo = function(enabled) {
        this.unlockAllInfoEnabled = enabled;
        localStorage.setItem('unlockAllInfo', this.unlockAllInfoEnabled ? 'true' : 'false');

        // If the Lore Book is currently open, re-render immediately so the
        // info buttons update without requiring the modal to be closed.
        if (this.loreModal && this.loreModal.classList.contains('active')) {
            this.renderLore();
        }
    };

    // Suggested save file name: vasenvaktaren-<player>-<rules>-<date>.json, so
    // several backups can be told apart. Characters not allowed in file names
    // are dropped. data: the save's data (a save slot's contents).
    UIController.prototype.getSaveFileName = function(data) {
        const date = new Date().toISOString().slice(0, 10);
        const player = (data.playerName || '')
            .replace(/[\\/:*?"<>|\u0000-\u001F]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .slice(0, 40);
        const modes = getActiveModeIds(normalizeModes(data.modes)).join('-');
        return `vasenvaktaren-${player ? player + '-' : ''}${modes ? modes + '-' : ''}${date}.json`;
    };

    // Write save text to a .json file (main menu > Save File)
    UIController.prototype.downloadSaveFile = function(saveText, fileName) {
        return this.downloadTextFile(saveText, fileName, {
            description: 'Väsenväktaren save', mime: 'application/json', ext: '.json', doneMessage: 'Game saved to file!'
        });
    };

    // Write text to a file. Where the browser supports it (desktop Chrome/Edge)
    // this opens a real "Save As" dialog so the player can pick the name and
    // folder; elsewhere it falls back to a normal download.
    UIController.prototype.downloadTextFile = async function(text, fileName, options) {
        const { description, mime, ext, doneMessage } = options;
        if (typeof window.showSaveFilePicker === 'function') {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{ description, accept: { [mime]: [ext] } }]
                });
                const writable = await handle.createWritable();
                await writable.write(text);
                await writable.close();
                this.showMessage(doneMessage);
                return;
            } catch (e) {
                if (e && e.name === 'AbortError') return; // player cancelled the dialog
                console.warn('Save As dialog failed, falling back to download:', e);
            }
        }

        const blob = new Blob([text], { type: mime });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.showMessage(ext === '.json' ? 'Save file downloaded!' : 'Summary downloaded!');
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
                this.playerNameDisplay.textContent = displayName;
                gameState.saveGame();
            }
        }
        this.profileModal.classList.remove('active');
    };

    UIController.prototype.renderProfile = function() {
        const content = document.getElementById('profile-content');

        // Achievements
let achievementsHtml = '<div class="achievements-section"><h4>' + uiIcon('trophy', 14) + 'Achievements:</h4><div class="achievements-grid">';

Object.values(ACHIEVEMENTS).forEach(achievement => {
    const earned = gameState.achievements[achievement.id] === true;
    const rewardFace = Object.values(PLAYER_FACES).find(face => face.unlockedBy === achievement.id);
    achievementsHtml += `
        <div class="achievement ${earned ? 'earned' : 'locked'}">
            <div class="achievement-content">
                <span class="achievement-name">${uiIcon(earned ? 'trophy' : 'lock', 14)}${achievement.name}</span>
                <span class="achievement-desc">${achievement.description}</span>
                ${rewardFace ? `<span class="achievement-reward"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${rewardFace.paths}</svg>Face: ${rewardFace.name}</span>` : ''}
            </div>
        </div>
    `;
});
achievementsHtml += '</div></div>';

        // Face picker options
        // Faces unlock per save through its achievements; locked ones are greyed out
        const currentFace = getPlayerFaceId(gameState.playerFace, gameState.achievements);
        const faceOptionsHtml = Object.entries(PLAYER_FACES).map(([id, face]) => {
            const unlocked = isPlayerFaceUnlocked(id, gameState.achievements);
            const achievement = face.unlockedBy ? getAchievementById(face.unlockedBy) : null;
            const label = unlocked ? face.name : `${face.name} (locked, unlocked by ${achievement ? achievement.name : 'an achievement'})`;
            return `
            <button type="button" class="profile-face-option${id === currentFace ? ' selected' : ''}${unlocked ? '' : ' locked'}" data-face="${id}" aria-label="${label}" aria-pressed="${id === currentFace}"${unlocked ? '' : ' aria-disabled="true"'}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${face.paths}</svg>
                ${unlocked ? '' : `<span class="profile-face-lock">${uiIcon('lock', 10)}</span>`}
            </button>`;
        }).join('');

        content.innerHTML = `
            <div class="profile-name-section">
                <div class="profile-identity-row">
                    <div class="profile-portrait-field">
                        <label for="profile-portrait-btn">Face:</label>
                        <button type="button" id="profile-portrait-btn" class="profile-portrait" title="Change face" aria-label="Change face" aria-expanded="false" aria-controls="profile-face-picker"><svg class="profile-portrait-face" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${PLAYER_FACES[currentFace].paths}</svg></button>
                    </div>
                    <div class="profile-name-fields">
                        <label for="profile-name-input">Player Name:</label>
                        <div class="profile-name-input-wrapper">
                            <input type="text" id="profile-name-input" value="${gameState.playerName || ''}" placeholder="Väktare" maxlength="20" spellcheck="false" autocomplete="off" title="Click to change your name">                            <span id="profile-name-saved" class="profile-name-saved">Saved</span>
                        </div>
                    </div>
                </div>
                <div id="profile-face-picker-wrap" hidden>
                    <div id="profile-face-picker" class="profile-face-picker">
                        ${faceOptionsHtml}
                    </div>
                    <p id="profile-face-hint" class="profile-face-hint">Earn achievements to unlock more faces.</p>
                </div>
            </div>

            <div class="profile-collection-section">
                <h4>${uiIcon('gem', 14)}Collection:</h4>
                <div class="achievement">
                    <div class="collection-attributes">
                        <div class="collection-stat">
                            <span class="collection-label">${uiIcon('runes', 14)}Runes Collected</span>
                            <span class="collection-value">${gameState.getFoundRuneCount()} / ${RUNE_LIST.length}</span>
                        </div>
                        <div class="collection-stat">
                            <span class="collection-label">${uiIcon('book', 14)}Lore Entries Collected</span>
                            <span class="collection-value">${gameState.unlockedLoreEntries.size} / ${LORE_TOTAL}</span>
                        </div>
                        <div class="collection-stat">
                            <span class="collection-label">${uiIcon('swords', 14)}Zones Cleared</span>
                            <span class="collection-value">${gameState.defeatedGuardians.size} / ${ZONE_ORDER.filter(zoneId => ZONES[zoneId].guardian !== null).length}</span>
                        </div>
                        <div class="collection-stat">
                            <span class="collection-label">${uiIcon('vasen', 14)}Väsen Types Tamed</span>
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
            this.playerNameDisplay.textContent = displayName;
            gameState.saveGame();

            // Flash "Saved" indicator
            savedIndicator.classList.add('visible');
            clearTimeout(savedTimeout);
            savedTimeout = setTimeout(() => savedIndicator.classList.remove('visible'), 1500);
        };

        // Face picker: portrait toggles the grid, picking a face saves and closes it
        const portraitBtn = document.getElementById('profile-portrait-btn');
        const facePickerWrap = document.getElementById('profile-face-picker-wrap');
        const facePicker = document.getElementById('profile-face-picker');
        const faceHint = document.getElementById('profile-face-hint');
        const defaultHint = faceHint.textContent;
        portraitBtn.addEventListener('click', () => {
            facePickerWrap.hidden = !facePickerWrap.hidden;
            faceHint.textContent = defaultHint;
            portraitBtn.setAttribute('aria-expanded', String(!facePickerWrap.hidden));
        });
        facePicker.addEventListener('click', (e) => {
            const option = e.target.closest('.profile-face-option');
            if (!option) return;
            // Locked: say which achievement unlocks it instead of picking it
            if (!isPlayerFaceUnlocked(option.dataset.face, gameState.achievements)) {
                const face = PLAYER_FACES[option.dataset.face];
                const achievement = face && getAchievementById(face.unlockedBy);
                faceHint.innerHTML = achievement
                    ? `${uiIcon('lock', 12)}<strong>${face.name}</strong>: unlocked by <strong>${achievement.name}</strong> (${achievement.description.charAt(0).toLowerCase() + achievement.description.slice(1)}).`
                    : defaultHint;
                return;
            }
            const faceId = getPlayerFaceId(option.dataset.face, gameState.achievements);
            gameState.playerFace = faceId;
            gameState.saveGame();
            portraitBtn.querySelector('.profile-portrait-face').innerHTML = PLAYER_FACES[faceId].paths;
            facePicker.querySelectorAll('.profile-face-option').forEach(btn => {
                const isSelected = btn === option;
                btn.classList.toggle('selected', isSelected);
                btn.setAttribute('aria-pressed', String(isSelected));
            });
            facePickerWrap.hidden = true;
            portraitBtn.setAttribute('aria-expanded', 'false');
        });

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
        this.playerNameDisplay.textContent = name;
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
                    <h4>${uiIcon('lock', 14)}Endless Tower Record</h4>
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
                            <span class="record-vasen-level">Lvl ${this.getLevelText(member.level)}</span>
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
                <h4>${uiIcon('trophy', 14)}Endless Tower Record</h4>
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
        const container = document.querySelector('.tips-content');

        // Capture currently collapsed categories before the dynamic sections
        // below get regenerated, so re-opening/refreshing the guide doesn't
        // reset categories the player already collapsed.
        const collapsedCats = new Set();
        if (container) {
            container.querySelectorAll('.guide-category[data-cat]').forEach(el => {
                if (el.classList.contains('guide-category-collapsed')) collapsedCats.add(el.dataset.cat);
            });
        }

        // Populate dynamic values from GAME_CONFIG
        this.populateGameGuideValues();

        // Render Element Matchups
        const elementMatchupsContainer = document.getElementById('dynamic-elements');
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

        // Render Level Milestones
        const levelMilestonesContainer = document.getElementById('guide-level-milestones');
        if (levelMilestonesContainer) {
            levelMilestonesContainer.innerHTML = this.generateLevelMilestonesHTML();
        }

        // Restore collapsed state on both the static and freshly re-rendered
        // dynamic categories
        if (container) {
            container.querySelectorAll('.guide-category[data-cat]').forEach(el => {
                el.classList.toggle('guide-category-collapsed', collapsedCats.has(el.dataset.cat));
            });
        }

        // Reorder categories so favorited ones appear first (preserving the
        // regular order otherwise), then sync each category's favorite star
        // to reflect the current favorite state.
        this._reorderGuideCategories(container);
        this._syncGuideFavoriteStars(container);

        this._setupGuideCategoryHandlers(container);
        this._setupGuideFavoriteHandlers(container);
    };

    // Move category "units" so favorited categories appear first, followed
    // by the rest in their regular order. A unit is a direct child of
    // #guide-categories-container: either a .guide-category itself (static
    // categories), or the placeholder wrapper div that contains one
    // (dynamic categories, e.g. #dynamic-elements). Crucially, this
    // only ever moves the WRAPPER for dynamic categories, never the
    // .guide-category node nested inside it - reaching inside and moving
    // the nested node out would leave the wrapper empty, causing the next
    // innerHTML-based re-render to create a brand new duplicate category
    // while the moved-out original lingers as an orphan.
    UIController.prototype._reorderGuideCategories = function(container) {
        if (!container) return;
        const catContainer = document.getElementById('guide-categories-container') || container;
        if (!gameState.favoriteGuideCategories) gameState.favoriteGuideCategories = new Set();

        const getCatKey = (unit) => {
            if (unit.classList && unit.classList.contains('guide-category')) return unit.dataset.cat;
            const inner = unit.querySelector(':scope > .guide-category');
            return inner ? inner.dataset.cat : null;
        };

        const units = Array.from(catContainer.children);

        // Assign a stable "original order" index to each unit the first
        // time it's seen. Units (both static .guide-category elements and
        // the dynamic placeholder wrappers) persist across re-renders even
        // though their inner content may be regenerated, so this index is
        // only ever set once - without it, "rest" would be derived from
        // whatever the current (already-reordered) DOM order happens to be,
        // meaning un-favoriting a category wouldn't restore its natural
        // position until the page was reloaded.
        units.forEach((unit, index) => {
            if (unit.dataset.originalOrder === undefined) {
                unit.dataset.originalOrder = index;
            }
        });

        const byOriginalOrder = (a, b) => Number(a.dataset.originalOrder) - Number(b.dataset.originalOrder);

        const favorited = units.filter(u => gameState.favoriteGuideCategories.has(getCatKey(u))).sort(byOriginalOrder);
        const rest = units.filter(u => !gameState.favoriteGuideCategories.has(getCatKey(u))).sort(byOriginalOrder);
        const ordered = [...favorited, ...rest];

        ordered.forEach(el => catContainer.appendChild(el));

        // Keep the "first category" top-margin fix in sync with whichever
        // category now ends up first after reordering.
        catContainer.querySelectorAll('.guide-category').forEach(el => el.classList.remove('guide-category-first'));
        if (ordered.length > 0) {
            const firstUnit = ordered[0];
            const firstCat = firstUnit.classList.contains('guide-category')
                ? firstUnit
                : firstUnit.querySelector(':scope > .guide-category');
            if (firstCat) firstCat.classList.add('guide-category-first');
        }
    };

    // Sync each category's favorite star icon/active state to match
    // gameState.favoriteGuideCategories.
    UIController.prototype._syncGuideFavoriteStars = function(container) {
        if (!container) return;
        if (!gameState.favoriteGuideCategories) gameState.favoriteGuideCategories = new Set();
        container.querySelectorAll('.guide-category').forEach(cat => {
            const btn = cat.querySelector('.guide-favorite-btn');
            if (!btn) return;
            const isFav = gameState.favoriteGuideCategories.has(cat.dataset.cat);
            btn.classList.toggle('active', isFav);
            btn.textContent = isFav ? '★' : '☆';
        });
    };

    // Wire up the click handler for Game Guide category favorite stars.
    // Toggles the category's favorite state and fully re-renders the guide
    // so the reordering takes effect immediately.
    UIController.prototype._setupGuideFavoriteHandlers = function(container) {
        if (!container) return;
        if (this._guideFavoriteClickHandler) {
            container.removeEventListener('click', this._guideFavoriteClickHandler);
        }
        this._guideFavoriteClickHandler = (e) => {
            const btn = e.target.closest('.guide-favorite-btn');
            if (!btn) return;
            const cat = btn.closest('.guide-category');
            if (!cat) return;
            const catKey = cat.dataset.cat;
            if (!gameState.favoriteGuideCategories) gameState.favoriteGuideCategories = new Set();
            if (gameState.favoriteGuideCategories.has(catKey)) {
                gameState.favoriteGuideCategories.delete(catKey);
            } else {
                gameState.favoriteGuideCategories.add(catKey);
            }
            gameState.saveGame();
            this.renderGameGuideContent();
        };
        container.addEventListener('click', this._guideFavoriteClickHandler);
    };

    // Wire up click handlers for the Game Guide's collapsible categories and
    // the Collapse/Expand Categories button. Safe to call on every render:
    // the category click handler is delegated (removed and re-added each
    // time), and the button handler is bound only once via a dataset flag
    // since the button itself is static markup that never gets replaced.
    UIController.prototype._setupGuideCategoryHandlers = function(container) {
        if (!container) return;

        if (this._guideClickHandler) {
            container.removeEventListener('click', this._guideClickHandler);
        }
        this._guideClickHandler = (e) => {
            // Clicking the favorite star should never toggle collapse state.
            if (e.target.closest('.guide-favorite-btn')) return;
            const title = e.target.closest('.guide-category-title');
            if (!title) return;
            const category = title.closest('.guide-category');
            if (category) {
                category.classList.toggle('guide-category-collapsed');
            }
        };
        container.addEventListener('click', this._guideClickHandler);

        const collapseBtn = container.querySelector('.guide-collapse-btn');
        if (collapseBtn && !collapseBtn.dataset.bound) {
            collapseBtn.dataset.bound = 'true';
            collapseBtn.addEventListener('click', () => {
                const cats = container.querySelectorAll('.guide-category');
                const anyExpanded = [...cats].some(c => !c.classList.contains('guide-category-collapsed'));
                const shouldCollapse = anyExpanded;
                cats.forEach(c => c.classList.toggle('guide-category-collapsed', shouldCollapse));
                collapseBtn.textContent = shouldCollapse ? 'Expand Categories' : 'Collapse Categories';
            });
        }
    };

    // Scroll an Element Matchups / Families / Rarity popup fully into view when
    // it is opened. These popups (.element-guide-details, .family-description-popup,
    // .matchup-details, .rarity-description-popup) are positioned absolutely
    // from their trigger badge, so a badge near the edge of its scroll container
    // (Game Guide's .tips-content, or the starter selection screen on narrow/short
    // viewports) can open a popup that overflows past the visible area, requiring
    // the player to manually scroll to read it. Called right after the badge's
    // own toggle function runs, so the 'open' class is already applied by the
    // time this checks it. Used by both the Game Guide (Element Matchups,
    // Families) and the starter selection screen (element/rarity/family badges).
    UIController.prototype.scrollGuidePopupIntoView = function(trigger) {
        const parent = trigger.parentElement;
        if (!parent || !parent.classList.contains('open')) return;

        const popup = parent.querySelector('.element-guide-details, .family-description-popup, .matchup-details, .rarity-description-popup');
        if (!popup) return;

        popup.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
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

        // Resource Management: megin refill/discount
        setText('guide-megin-refill', `${Math.round(GAME_CONFIG.MEGIN_REFILL_RATE * 100)}%`);
        setText('guide-element-discount', `${Math.round(GAME_CONFIG.SAME_ELEMENT_MEGIN_DISCOUNT * 100)}%`);
        setText('guide-base-megin', GAME_CONFIG.BASE_MEGIN);
        setText('guide-megin-per-level', GAME_CONFIG.MEGIN_PER_LEVEL);

        // Resource Management: healing
        setText('guide-post-combat-heal', `${Math.round(GAME_CONFIG.POST_COMBAT_HEAL_PERCENT * 100)}%`);
        setText('guide-sacred-well-heal', `${Math.round(GAME_CONFIG.SACRED_WELL_HEAL_PERCENT * 100)}%`);
        setText('guide-correct-item-heal', `${Math.round(GAME_CONFIG.CORRECT_ITEM_HEAL_PERCENT * 100)}%`);
        setText('guide-wrong-item-heal', `${Math.round(GAME_CONFIG.WRONG_ITEM_HEAL_PERCENT * 100)}%`);

        // Experience & Leveling
        setText('guide-max-level', GAME_CONFIG.MAX_LEVEL);
        setText('guide-exp-killing', `${Math.round(GAME_CONFIG.EXP_KILLING_BLOW * 100)}%`);
        setText('guide-exp-participated', `${Math.round(GAME_CONFIG.EXP_PARTICIPATED_ON_FIELD * 100)}%`);
        setText('guide-exp-party', `${Math.round(GAME_CONFIG.EXP_IN_PARTY_NOT_FIELDED * 100)}%`);

        // Runes (max level for 2 runes)
        setText('guide-max-level-runes', GAME_CONFIG.TWO_RUNE_LEVEL);

        // Power & Damage
        setText('guide-damage-variance', `${Math.round(GAME_CONFIG.DAMAGE_RANGE_VARIANCE * 100)}%`);

        // Skills
        setText('guide-empower-amount', `${Math.round(GAME_CONFIG.TIER1_ATTACK_SKILL_EMPOWERMENT * 100)}%`);

        // Attribute Stages
        setText('guide-stage-modifier', `${Math.round(GAME_CONFIG.ATTRIBUTE_STAGE_MODIFIER * 100)}%`);
        setText('guide-min-stage', GAME_CONFIG.MIN_ATTRIBUTE_STAGE);
        setText('guide-max-stage', `+${GAME_CONFIG.MAX_ATTRIBUTE_STAGE}`);

        // Endless Tower
        setText('guide-endless-start', GAME_CONFIG.ENDLESS_TOWER_START_LEVEL);
        setText('guide-endless-heal', `${Math.round(GAME_CONFIG.ENDLESS_TOWER_HEAL_PERCENT * 100)}%`);
    };

    // Generate Level Milestones HTML from SKILL_LEARN_LEVELS, GAME_CONFIG.TWO_RUNE_LEVEL and GAME_CONFIG.MAX_LEVEL.
    // Lists which skill slot is learned at each level in SKILL_LEARN_LEVELS, plus the level
    // at which a second rune slot is unlocked and the max level, sorted ascending by level.
    UIController.prototype.generateLevelMilestonesHTML = function() {
        const milestones = [];

        SKILL_LEARN_LEVELS.forEach((level, index) => {
            milestones.push({ level, text: `Skill ${index + 1} learned` });
        });

        milestones.push({ level: GAME_CONFIG.TWO_RUNE_LEVEL, text: 'Second Rune Slot unlocked' });
        milestones.push({ level: GAME_CONFIG.MAX_LEVEL, text: 'Max level' });

        milestones.sort((a, b) => a.level - b.level);

        return milestones.map(m => `- Level ${m.level}: ${m.text}`).join('<br>');
    };

    // Generate Element Matchups HTML from ELEMENT_MATCHUPS constant
    UIController.prototype.generateElementMatchupsHTML = function() {
        const elements = Object.keys(ELEMENT_MATCHUPS);

        let html = `
            <div class="guide-category" data-cat="element-matchups">
                <h4 class="guide-category-title"><span class="guide-cat-chevron"></span>Elements<button class="guide-favorite-btn" type="button">☆</button></h4>
                <div class="guide-category-body">
                    <p><strong>Element Matchups</strong><br>Each väsen and skill belongs to an element, and each element has different potencies and weaknesses. Exploit them to maximize efficiency.</p>
                    <div class="element-guide-list">
        `;

        // Create a collapsible for each element
        elements.forEach(element => {
            html += `
                <div class="element-guide-collapsible">
                    <span class="element-badge element-${element.toLowerCase()} clickable-element" onclick="toggleElementMatchup(this, event); ui.scrollGuidePopupIntoView(this)">${elementIcon(element)}${element}</span>
                    <div class="element-guide-details">
                        <div class="guide-matchup-section">
                            ${this.generateAttackingMatchupsHTML(element)}
                        </div>
                        <div class="guide-matchup-section">
                            ${this.generateDefensiveMatchupsHTML(element, false)}
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                    </div>
                </div>
            </div>
        `;

        return html;
    };

    // Generate Families HTML from FAMILIES and FAMILY_DESCRIPTIONS constants
    UIController.prototype.generateFamiliesHTML = function() {
        let html = `
            <div class="guide-category" data-cat="families">
                <h4 class="guide-category-title"><span class="guide-cat-chevron"></span>Families<button class="guide-favorite-btn" type="button">☆</button></h4>
                <div class="guide-category-body">
                    <p><strong>Families</strong><br>Each väsen belongs to a family, and each family possesses a unique trait. Take note to gain a strategic advantage.</p>
                    <div class="family-guide-list">
        `;

        const families = Object.values(FAMILIES);
        const halfPoint = Math.ceil(families.length / 2); // Split in half (5 and 4)

        families.forEach((family, index) => {
            const description = FAMILY_DESCRIPTIONS[family] || 'No description available.';
            const passive = FAMILY_PASSIVES[family];
            
            html += `
                <div class="family-guide-collapsible">
                    <span class="family-badge clickable-family" onclick="toggleFamilyDescription(this, event); ui.scrollGuidePopupIntoView(this)">${family}</span>
                    <div class="family-description-popup">
                        <p><strong>${family}</strong><br>
                        ${description}</p>
                        
                        ${passive ? `
                            <hr style="margin: 8px 0; border: none; border-top: 1px solid var(--border-color);">
                            <p><strong>Trait: ${passive.name}</strong><br>
                            ${passive.description}</p>
                        ` : ''} 
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

        html += `
                    </div>
                </div>
            </div>
        `;

        return html;
    };

    // Generate Temperaments HTML from TEMPERAMENTS constant
    // Rendered as a matrix: rows are the attribute raised, columns are the
    // attribute lowered. Every attribute (including Strength and Wisdom) can
    // appear on both axes, and the diagonal (same attribute raised and
    // lowered) is filled by the neutral temperaments, so this is a full
    // square grid with no gaps. Each temperament name is clickable and opens
    // the same popup (flavor + effect) used everywhere else in the game.
    UIController.prototype.generateTemperamentsHTML = function() {
        // Build a lookup from "positive|negative" -> temperament
        const byPair = {};
        Object.values(TEMPERAMENTS).forEach(t => {
            byPair[`${t.positive}|${t.negative}`] = t;
        });

        const rowAttrs = ['strength', 'wisdom', 'defense', 'durability', 'health', 'megin'];
        const colAttrs = ['strength', 'wisdom', 'defense', 'durability', 'health', 'megin'];

        // Short labels keep the 7-column matrix (row header + 6 attributes)
        // narrow enough to fit the modal width without horizontal scrolling.
        const attrShortLabels = {
            strength: 'STR',
            wisdom: 'WIS',
            defense: 'DEF',
            durability: 'DUR',
            health: 'HP',
            megin: 'MP'
        };
        const attrLabel = (attr) => attrShortLabels[attr] || capitalize(attr);
        const modifier = GAME_CONFIG.TEMPERAMENT_MODIFIER;

        const tableStyle = 'width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: var(--spacing-sm); font-size: var(--font-size-xs);';
        const headerCellStyle = 'padding: 3px 2px; border: 1px solid var(--border-color); background: var(--bg-tertiary); color: var(--text-muted); text-align: center;';
        const cornerCellStyle = 'padding: 3px 2px; border: 1px solid var(--border-color); background: var(--bg-tertiary);';
        const rowHeaderStyle = 'padding: 3px 2px; border: 1px solid var(--border-color); background: var(--bg-tertiary); color: var(--text-muted); text-align: left;';
        const cellStyle = 'padding: 3px 2px; border: 1px solid var(--border-color); text-align: center; color: var(--text-primary); overflow-wrap: break-word; word-break: break-word;';
        const emptyCellStyle = 'padding: 3px 2px; border: 1px solid var(--border-color); text-align: center; color: var(--text-muted);';
        const cellModifierStyle = 'display: block; font-size: var(--font-size-xxs); color: var(--text-muted);';

        let html = `
            <div class="guide-category" data-cat="temperaments">
                <h4 class="guide-category-title"><span class="guide-cat-chevron"></span>Temperaments<button class="guide-favorite-btn" type="button">☆</button></h4>
                <div class="guide-category-body">
                    <p><strong>Temperaments</strong><br>Väsen you encounter and tame will all have different temperaments. Temperaments trade one property for another. Each modifier is a flat +${modifier}/-${modifier}. Click a temperament to see what it does.</p>
                    <table style="${tableStyle}">
                        <thead>
                            <tr>
                                <th style="${cornerCellStyle}"></th>
                                ${colAttrs.map(col => `<th style="${headerCellStyle}">&minus;${attrLabel(col)}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
        `;

        rowAttrs.forEach(row => {
            html += `<tr><th style="${rowHeaderStyle}">+${attrLabel(row)}</th>`;
            colAttrs.forEach(col => {
                const t = byPair[`${row}|${col}`];
                if (t) {
                    html += `<td style="${cellStyle}">${this.getTemperamentTextHTML(t)}<span style="${cellModifierStyle}">+${t.modifier}/-${t.modifier}</span></td>`;
                } else {
                    html += `<td style="${emptyCellStyle}">&mdash;</td>`;
                }
            });
            html += `</tr>`;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        return html;
    };
