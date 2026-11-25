// =============================================================================
// 8b-ui-screens.js - Screen Switching, Tab Navigation, and Starter Selection Screen
// =============================================================================

// Screen management
UIController.prototype.showScreen = function(screenId) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        this.screens[screenId].classList.add('active');
        this.currentScreen = screenId;
    };

    // Tab management
UIController.prototype.switchTab = function(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        this.tabs[tabName].classList.add('active');

        Object.values(this.tabContents).forEach(content => content.classList.remove('active'));
        this.tabContents[tabName].classList.add('active');

        this.currentTab = tabName;
        this.updateRuneTabGlow();

        // Show the details panel only on the väsen tab
        if (this.vasenDetailsPanel) {
            this.vasenDetailsPanel.style.display = tabName === 'vasen' ? '' : 'none';
        }

        this.refreshCurrentTab();
    };

UIController.prototype.refreshCurrentTab = function() {
        switch (this.currentTab) {
            case 'vasen':
                this.renderVasenInventory();
                break;
            case 'runes':
                this.renderRuneInventory();
                break;
            case 'items':
                this.renderItemInventory();
                break;
        }
    };

    // Refresh all UI
UIController.prototype.refreshAll = function() {
        this.renderParty();
        this.renderZones();
        this.updateZoneDescription();
        this.refreshCurrentTab();
        this.updatePlayerName();
        this.renderModeBadges();

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

        // Keep details panel visibility in sync with current tab
        if (this.vasenDetailsPanel) {
            this.vasenDetailsPanel.style.display = this.currentTab === 'vasen' ? '' : 'none';
        }
    };

    // Render the starter selection screen: one card per starter väsen plus the
    // Confirm button. Pure UI - the caller decides what selecting or confirming
    // actually does.
    //   starters:  array of VASEN_SPECIES keys (unknown keys are skipped)
    //   onSelect:  called with the species key when a card is clicked
    //   onConfirm: called when the Confirm button is clicked
UIController.prototype.renderStarterSelection = function(starters, onSelect, onConfirm, onBack) {
        const starterOptions = document.getElementById('starter-options');
        starterOptions.innerHTML = '';

        starters.forEach(speciesName => {
            const species = VASEN_SPECIES[speciesName];
            if (!species) return;

            const card = document.createElement('div');
            card.className = 'starter-card';
            card.innerHTML = `
                <div class="starter-image-container holo-${species.rarity.toLowerCase()}">
                    <img src="${species.image}" alt="${species.name}" class="starter-image">
                </div>
                <h3 class="starter-name">${species.name}</h3>
                <div class="starter-badges">
                    <div class="element-matchup-collapsible">
                        <span class="element-badge element-${species.element.toLowerCase()} clickable-element" onclick="toggleElementMatchup(this, event); ui.scrollGuidePopupIntoView(this)">${elementIcon(species.element)}${species.element}</span>
                        ${ui.generateDefensiveMatchupsHTML(species.element)}
                    </div>
                    <div class="rarity-matchup-collapsible family-matchup-collapsible">
                        <span class="rarity-badge rarity-${species.rarity.toLowerCase()} clickable-rarity" onclick="toggleRarityDescription(this, event); ui.scrollGuidePopupIntoView(this)">${species.rarity}</span>
                        <div class="rarity-description-popup">
                            <p><strong>${species.rarity}</strong><br>
                            ${RARITY_DESCRIPTIONS[species.rarity] || ''}</p>
                        </div>
                    </div>
                    <div class="family-matchup-collapsible">
                        <span class="family-badge clickable-family" onclick="toggleFamilyDescription(this, event); ui.scrollGuidePopupIntoView(this)">${species.family}</span>
                        <div class="family-description-popup">
                            <p><strong>${species.family}</strong><br>
                            ${FAMILY_DESCRIPTIONS[species.family] || 'No description available.'}</p>
                            ${FAMILY_PASSIVES[species.family] ? `
                                <hr style="margin: 8px 0; border: none; border-top: 1px solid var(--border-color);">
                                <p><strong>Passive: ${FAMILY_PASSIVES[species.family].name}</strong><br>
                                ${FAMILY_PASSIVES[species.family].description}</p>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <p class="starter-description">${species.description}</p>
                ${this.renderStarterSkillPreview(speciesName, species)}
            `;
            card.onclick = () => {
                // Remove selection from all cards, add it to the clicked card.
                // 'expanded' shows the card's skills; it's cleared again by
                // clicking the expanded card itself or anywhere outside the
                // cards (the selection stays either way).
                if (card.classList.contains('expanded')) {
                    card.classList.remove('expanded');
                    return;
                }
                document.querySelectorAll('.starter-card').forEach(c => c.classList.remove('selected', 'expanded'));
                card.classList.add('selected', 'expanded');
                onSelect(speciesName);
                document.getElementById('confirm-starter-btn').disabled = false;
            };
            starterOptions.appendChild(card);
        });

        // Clicking away from the cards minimizes the expanded skill list again.
        // Assigned (not addEventListener) so re-rendering never stacks handlers.
        document.getElementById('starter-select-screen').onclick = (e) => {
            if (e.target.closest('.starter-card')) return;
            // Clicks on or near the Confirm button are most likely a near-miss
            // at Confirm; collapsing then would shift the button away, so keep
            // the card expanded.
            const btnRect = document.getElementById('confirm-starter-btn').getBoundingClientRect();
            const NEAR_CONFIRM_MARGIN = 60;
            if (e.clientX >= btnRect.left - NEAR_CONFIRM_MARGIN && e.clientX <= btnRect.right + NEAR_CONFIRM_MARGIN &&
                e.clientY >= btnRect.top - NEAR_CONFIRM_MARGIN && e.clientY <= btnRect.bottom + NEAR_CONFIRM_MARGIN) return;
            document.querySelectorAll('.starter-card.expanded').forEach(c => c.classList.remove('expanded'));
        };

        const confirmBtn = document.getElementById('confirm-starter-btn');
        confirmBtn.disabled = true;
        confirmBtn.onclick = () => onConfirm();

        // Back to the previous screen (New Game), when the caller offers one
        const backBtn = document.getElementById('starter-back-btn');
        backBtn.hidden = !onBack;
        backBtn.onclick = onBack ? () => onBack() : null;
    };

    // Starter skill preview, hidden until the card is selected (CSS on
    // .starter-card.expanded). Shows every skill with its details at once, so no
    // further clicking is needed. Skills not yet known at
    // GAME_CONFIG.STARTER_LEVEL are dimmed and show their learn level.
UIController.prototype.renderStarterSkillPreview = function(speciesName, species) {
        const rows = species.skills.map((skillName, index) => {
            const skill = ABILITIES[skillName];
            if (!skill) return '';

            const learnLevel = SKILL_LEARN_LEVELS[index];
            const isLearned = learnLevel <= GAME_CONFIG.STARTER_LEVEL;
            const skillElement = skill.element || species.element;
            const elementClass = skillElement.toLowerCase();
            const meginCost = getSkillMeginCost(skillName, species.element);

            return `
                <div class="starter-skill element-${elementClass}${isLearned ? '' : ' locked'}">
                    <div class="starter-skill-head">
                        <span class="starter-skill-name">${skillTypeIcon(skill)}${skill.name}</span>
                        <span class="starter-skill-meta">${isLearned ? `<span class="skill-cost">Megin ${meginCost}</span>` : `<span class="starter-skill-lvl">Lvl ${learnLevel}</span>`}</span>
                    </div>
                    <div class="starter-skill-body">
                        <div class="skill-attributes">
                            <span class="skill-element element-${elementClass}">${elementIcon(skillElement)}${skillElement}</span>
                            <span class="skill-type-tag">${skill.type}</span>
                            ${skill.healthCost ? `<span class="skill-health-cost">Health: ${Math.round(skill.healthCost * 100)}%</span>` : ''}
                            ${skill.power ? `<span class="skill-power">Power: ${getSkillPower(skillName, species.family)}</span>` : ''}
                        </div>
                        <p class="skill-description">${this.linkifyKeywords(skill.mechanicsDescription)}</p>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="starter-skills">
                <div class="starter-skills-title">Skills</div>
                ${rows}
            </div>
        `;
    };
