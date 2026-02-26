// =============================================================================
// 8g-ui-combat.js - Combat Rendering, Action Buttons, and Battle Animations
// =============================================================================

UIController.prototype._sizeCombatLog = function() {
        if (!this.combatLog || this.combatLog.offsetParent === null) return;
        // Only auto-size on desktop (>768px width)
        if (window.innerWidth <= 768) {
                this.combatLog.style.height = '';
                return;
        }
        const rect = this.combatLog.getBoundingClientRect();
        const remaining = window.innerHeight - rect.top - 16; // 16px bottom padding
        const minH = 145;
        this.combatLog.style.height = Math.max(minH, remaining) + 'px';
};

UIController.prototype.showCombatUI = function() {
        this.zoneDescription.style.display = 'none';
        this.combatArea.style.display = 'flex';
        this.combatUI.style.display = 'flex';
        this.combatUI.classList.add('active');
        this.combatLogMessages = [];
        this.combatLog.innerHTML = '';

        // Zone image is now hidden — no point animating the SVG wave filter
        this.pauseZoneAnimation();

        // Auto-size combat log to fill remaining viewport on desktop
        if (!this._boundSizeCombatLog) {
                this._boundSizeCombatLog = this._sizeCombatLog.bind(this);
        }
        window.addEventListener('resize', this._boundSizeCombatLog);
        // Initial sizing after layout settles
        requestAnimationFrame(() => this._sizeCombatLog());
};

UIController.prototype.hideCombatUI = function() {
        this.combatArea.style.display = 'none';
        this.combatUI.style.display = 'none';
        this.combatUI.classList.remove('active');
        this.zoneDescription.style.display = 'block';

        // Zone image is visible again — resume the SVG wave filter animation
        this.resumeZoneAnimation();

        // Remove resize listener and reset height
        if (this._boundSizeCombatLog) {
                window.removeEventListener('resize', this._boundSizeCombatLog);
        }
        this.combatLog.style.height = '';
};

UIController.prototype.renderCombat = function(battle) {
        if (!battle) return;

        // Render player side
        this.renderCombatantPanel('player', battle.playerTeam[battle.playerActiveIndex], battle);

        // Render enemy side
        this.renderCombatantPanel('enemy', battle.enemyTeam[battle.enemyActiveIndex], battle);

        // Render Endless Tower floor display if applicable
        const versusDiv = this.combatVersus;
        if (battle.isEndlessTower && battle.currentFloor) {
            versusDiv.innerHTML = `
                <div class="endless-tower-floor">Floor ${battle.currentFloor}</div>
                <div>VS</div>
            `;
        } else {
            versusDiv.innerHTML = 'VS';
        }

        // Render action buttons
        this.renderActionButtons(battle);

        // Update party display
        this.renderParty();
};

UIController.prototype.renderCombatantPanel = function(side, vasen, battle) {
    const panel = document.getElementById(`${side}-panel`);
    if (!vasen) return;

    const healthPercent = (vasen.currentHealth / vasen.maxHealth) * 100;
    const meginPercent = (vasen.currentMegin / vasen.maxMegin) * 100;

    // Get party members (excluding active)
    const team = side === 'player' ? battle.playerTeam : battle.enemyTeam;
    const activeIndex = side === 'player' ? battle.playerActiveIndex : battle.enemyActiveIndex;

    // Get party member portraits (member 2 on left, member 3 on right)
    const partyPortraits = {
        left: null,
        right: null
    };

    // Find the two other team members
    const otherMembers = team.map((member, index) => ({ member, index }))
        .filter(({index}) => index !== activeIndex);

    if (otherMembers.length >= 1) {
        partyPortraits.left = otherMembers[0].member;
    }
    if (otherMembers.length >= 2) {
        partyPortraits.right = otherMembers[1].member;
    }

    // Helper function to create party portrait HTML
    const createPartyPortraitHTML = (member, position) => {
        if (!member) return '';

        const hpPercent = (member.currentHealth / member.maxHealth) * 100;
        const meginPercent = (member.currentMegin / member.maxMegin) * 100;

        return `
            <div class="party-portrait ${position} ${member.isKnockedOut() ? 'knocked-out' : ''}">
                <img src="${member.species.image}"
                     alt="${member.species.name}"
                     class="party-portrait-image">
                <div class="party-portrait-hp-bar">
                    <div class="party-portrait-hp-fill" style="width: ${hpPercent}%"></div>
                </div>
                <div class="party-portrait-megin-bar">
                    <div class="party-portrait-megin-fill" style="width: ${meginPercent}%"></div>
                </div>
            </div>
        `;
    };

    // Build runes HTML with collapsible descriptions
    const runeOpen = this.runeDescriptionsVisible ? 'open' : '';
    const runesHtml = vasen.runes.length > 0
        ? `${vasen.runes.map(r => {
                const rune = RUNES[r];
                if (!rune) return '';

                return `
                    <div class="rune-collapsible ${runeOpen}">
                        <div class="rune-collapsible-header" onclick="toggleRuneDescriptions()">
                            <span class="toggle-icon"></span>
                            ${rune.symbol} ${rune.name}
                        </div>
                        <div class="rune-collapsible-body">
                            ${rune.effect}
                        </div>
                    </div>
                `;
           }).join('')}`
        : '<span class="runes-label">Rune:</span> <span class="no-rune">None</span>';

    // Build attacking matchups for attack elements
    const attackElements = vasen.getAttackElements();
    const attackElementsHtml = attackElements.map(e => {
        return `
            <div class="element-matchup-collapsible inline-collapsible">
                <span class="element-mini element-${e.toLowerCase()} clickable-element" onclick="toggleElementMatchup(this, event)">${e}</span>
                ${this.generateAttackingMatchupsHTML(e)}
            </div>
        `;
    }).join('');

    // Build combatant panel
    panel.innerHTML = `
        <div class="combatant-scroll-inner">
        <span class="combat-card-toggle" onclick="ui.toggleCombatCards()">${this.combatCardsMinimized ? '»' : '«'}</span>
        <div class="combatant-header">
            <h4 class="combatant-name">${vasen.getDisplayName()}</h4>
            <span class="combatant-level">Lvl ${vasen.level}</span>
        </div>

        <div class="combatant-image-wrapper">
            ${createPartyPortraitHTML(partyPortraits.left, 'left')}

            <div class="combatant-image-container ${vasen.isKnockedOut() ? '' : 'holo-' + vasen.species.rarity.toLowerCase()}">
                <img src="${vasen.species.image}" alt="${vasen.species.name}"
                     class="combatant-image ${vasen.isKnockedOut() ? 'knocked-out' : ''}">
                ${vasen.battleFlags.hasSwapSickness ? '<span class="status-icon swap-sickness">Preparing</span>' : ''}
            </div>

            ${createPartyPortraitHTML(partyPortraits.right, 'right')}
        </div>

        <div class="combatant-bars">
            <div class="combat-bar health-bar">
                <div class="combat-bar-fill health-fill" style="width: ${healthPercent}%"></div>
                <span class="combat-bar-text">HP: ${vasen.currentHealth} / ${vasen.maxHealth}</span>
            </div>
            <div class="combat-bar megin-bar">
                <div class="combat-bar-fill megin-fill" style="width: ${meginPercent}%"></div>
                <span class="combat-bar-text">MP: ${vasen.currentMegin} / ${vasen.maxMegin}</span>
            </div>
        </div>

        <div class="combatant-info">
            <div class="element-matchup-collapsible">

                <span class="element-badge element-${vasen.species.element.toLowerCase()} clickable-element"
                      onclick="toggleElementMatchup(this, event)">
                    ${vasen.species.element}
                </span>

                <span class="rarity-badge rarity-${vasen.species.rarity.toLowerCase()}">
                    ${vasen.species.rarity}
                </span>

                ${this.generateDefensiveMatchupsHTML(vasen.species.element)}
            </div>

            <div class="family-matchup-collapsible">
                <span class="family-badge clickable-family" onclick="toggleFamilyDescription(this, event)">${vasen.species.family}</span>
                <div class="family-description-popup">
                    ${FAMILY_PASSIVES[vasen.species.family] ? `
                        <p><strong>Passive: ${FAMILY_PASSIVES[vasen.species.family].name}</strong><br>
                        ${FAMILY_PASSIVES[vasen.species.family].description}</p>
                        <hr style="margin: 8px 0; border: none; border-top: 1px solid var(--border-color);">
                    ` : ''}
                    <p>${FAMILY_DESCRIPTIONS[vasen.species.family] || 'No description available.'}</p>
                </div>
            </div>
        </div>

        <div class="combatant-attributes">
            <div class="combat-attr"><span class="combat-attr-name">Str</span><span class="combat-attr-value">${vasen.getAttribute('strength')}</span></div>
            <div class="combat-attr"><span class="combat-attr-name">Wis</span><span class="combat-attr-value">${vasen.getAttribute('wisdom')}</span></div>
            <div class="combat-attr"><span class="combat-attr-name">Def</span><span class="combat-attr-value">${vasen.getAttribute('defense')}</span></div>
            <div class="combat-attr"><span class="combat-attr-name">Dur</span><span class="combat-attr-value">${vasen.getAttribute('durability')}</span></div>
        </div>

        <div class="combatant-description">
            <div class="rune-collapsible ${this.combatDescriptionVisible ? 'open' : ''}">
                <div class="rune-collapsible-header" onclick="toggleCombatDescriptions()">
                    <span class="toggle-icon"></span>
                    <span class="label-full">Description</span>
                    <span class="label-short">Desc</span>
                </div>
                <div class="rune-collapsible-body">
                    ${vasen.species.description}
                </div>
            </div>
        </div>

        <div class="combatant-runes">
            ${runesHtml}
        </div>

        <div class="combatant-stages">
            ${this.renderAttributeStages(vasen)}
        </div>

        <div class="combatant-attack-elements">
            <span class="elements-label">Attack Elements:</span>
            ${attackElementsHtml}
        </div>
        </div>
    `;

    // Apply minimized state if active
    panel.classList.toggle('minimized', this.combatCardsMinimized);

    // Reapply any active animations after re-render
    this.reapplyAnimations(side);
};

UIController.prototype.renderAttributeStages = function(vasen) {
        const stages = vasen.attributeStages;
        let html = '';

        ['strength', 'wisdom', 'defense', 'durability'].forEach(attr => {
            const stage = stages[attr];
            if (stage !== 0) {
                const stageClass = stage > 0 ? 'positive' : 'negative';
                const stageText = stage > 0 ? `+${stage}` : stage;
                html += `<span class="stage-indicator ${stageClass}">${capitalize(attr).substring(0, 3)} ${stageText}</span>`;
            }
        });

        return html || '<span class="no-stages">No attribute changes</span>';
};

UIController.prototype.createStandardVasenCardHTML = function(vasen, showCombatInfo = false) {
        // Build runes HTML
        let runesHtml = '';
        if (vasen.runes && vasen.runes.length > 0) {
            runesHtml = vasen.runes.map(runeId => {
                const rune = RUNES[runeId];
                return rune ? `<span class="mini-rune">${rune.symbol} ${rune.name}</span>` : '';
            }).join('');
        }

        // Build attribute stages HTML (only for combat info)
        let stagesHtml = '';
        if (showCombatInfo) {
            ['strength', 'wisdom', 'defense', 'durability'].forEach(attr => {
                const stage = vasen.attributeStages[attr];
                if (stage !== 0) {
                    const stageClass = stage > 0 ? 'positive' : 'negative';
                    const stageText = stage > 0 ? `+${stage}` : stage;
                    stagesHtml += `<span class="mini-stage ${stageClass}">${capitalize(attr).substring(0, 3)} ${stageText}</span>`;
                }
            });
        }

        // For combat displays, use getAttribute (includes stages)
        // For non-combat displays, use calculateAttribute (base + runes only)
        const getAttrValue = (attr) => showCombatInfo ? vasen.getAttribute(attr) : vasen.calculateAttribute(attr);

        return `
            <div class="standard-vasen-img-container holo-${vasen.species.rarity.toLowerCase()}">
                <img src="${vasen.species.image}" alt="${vasen.species.name}" class="standard-vasen-img">
            </div>
            <div class="standard-vasen-info">
                <div class="standard-vasen-header">
                    <span class="standard-vasen-name">${vasen.getDisplayName()}</span>
                    <span class="standard-vasen-level">Lvl ${vasen.level}</span>
                </div>
                <div class="standard-vasen-badges">
                    <span class="element-badge element-${vasen.species.element.toLowerCase()}">${vasen.species.element}</span>
                    <span class="rarity-badge rarity-${vasen.species.rarity.toLowerCase()}">${vasen.species.rarity}</span>
                    <span class="family-badge">${vasen.species.family}</span>
                </div>
                <div class="standard-vasen-bars">
                    <div class="combat-bar combat-bar-small health-bar">
                        <div class="combat-bar-fill health-fill" style="width: ${(vasen.currentHealth / vasen.maxHealth) * 100}%"></div>
                        <span class="combat-bar-text">HP: ${vasen.currentHealth} / ${vasen.maxHealth}</span>
                    </div>
                    <div class="combat-bar combat-bar-small megin-bar">
                        <div class="combat-bar-fill megin-fill" style="width: ${(vasen.currentMegin / vasen.maxMegin) * 100}%"></div>
                        <span class="combat-bar-text">MP: ${vasen.currentMegin} / ${vasen.maxMegin}</span>
                    </div>
                </div>
                <div class="standard-vasen-attributes">
                    <span class="mini-attr"><span class="attr-label">STR</span> ${getAttrValue('strength')}</span>
                    <span class="mini-attr"><span class="attr-label">WIS</span> ${getAttrValue('wisdom')}</span>
                    <span class="mini-attr"><span class="attr-label">DEF</span> ${getAttrValue('defense')}</span>
                    <span class="mini-attr"><span class="attr-label">DUR</span> ${getAttrValue('durability')}</span>
                </div>
                ${stagesHtml ? `<div class="standard-vasen-stages">${stagesHtml}</div>` : ''}
                ${runesHtml ? `<div class="standard-vasen-runes">${runesHtml}</div>` : ''}
            </div>
        `;
};

UIController.prototype.renderSwapOptions = function(battle) {
    const modal = document.getElementById('swap-modal');
    const list = document.getElementById('swap-modal-list');

    list.innerHTML = '';

    battle.playerTeam.forEach((vasen, index) => {
        if (index === battle.playerActiveIndex || vasen.isKnockedOut()) return;

        const btn = document.createElement('button');
        btn.className = 'swap-modal-btn';
        btn.innerHTML = this.createStandardVasenCardHTML(vasen, true); // true = show combat info

        btn.onclick = () => {
            modal.classList.remove('active');
            ui.checkAndHideOverlay();
            // Prevent focus issues
            if (document.activeElement) {
                document.activeElement.blur();
            }
            // Focus on a non-input element to prevent cursor
            document.body.focus();
            setTimeout(() => document.body.blur(), 0);
            game.handleSwap(index);
        };

        list.appendChild(btn);
    });

    document.getElementById('close-swap-modal').onclick =
        () => {
            modal.classList.remove('active');
            ui.checkAndHideOverlay();
            if (document.activeElement) {
                document.activeElement.blur();
            }
            document.body.focus();
            setTimeout(() => document.body.blur(), 0);
        };

    ui.showModalOverlay();
    modal.classList.add('active');
};

UIController.prototype.renderActionButtons = function(battle) {
    const actionsContainer = document.getElementById('ability-buttons');
    actionsContainer.innerHTML = '';

    const activeVasen = battle.playerTeam[battle.playerActiveIndex];
    if (!activeVasen || activeVasen.isKnockedOut()) return;

    const abilities = activeVasen.getAvailableAbilities();

    abilities.forEach(abilityName => {
        const ability = ABILITIES[abilityName];
        if (!ability) return;

        const meginCost = activeVasen.getAbilityMeginCost(abilityName);
        const canUse = activeVasen.canUseAbility(abilityName) && !activeVasen.battleFlags.hasSwapSickness;

        const abilityElement = ability.element || activeVasen.species.element;

        const btn = document.createElement('button');
        btn.className = `ability-btn element-${abilityElement.toLowerCase()} ${canUse ? '' : 'disabled'}`;
        btn.disabled = !canUse || !battle.waitingForPlayerAction || battle.isAutoBattle;
        btn.innerHTML = `
            <span class="ability-btn-name">${ability.name}</span>
            <span class="ability-btn-type">${ability.type}</span>
            <span class="ability-btn-stats">
                <span class="ability-btn-element element-${abilityElement.toLowerCase()}">${abilityElement}</span>
                ${ability.power ? `<span class="ability-btn-power">Power: ${getAbilityPower(abilityName, activeVasen.species.family)}</span>` : ''}
                <span class="ability-btn-cost">Megin: ${meginCost}</span>
            </span>
            <span class="ability-btn-desc">${ability.mechanicsDescription}</span>
        `;
        btn.onclick = () => game.handleAbilityUse(abilityName);
        actionsContainer.appendChild(btn);
    });

    // Update other action buttons
    document.getElementById('btn-swap').disabled =
        !battle.waitingForPlayerAction || activeVasen.battleFlags.hasSwapSickness || battle.isAutoBattle;

    const offerBtn = document.getElementById('btn-offer');
    offerBtn.disabled =
        !battle.waitingForPlayerAction || !battle.isWildEncounter ||
        battle.offersGiven >= GAME_CONFIG.MAX_OFFERS_PER_COMBAT || battle.correctItemGiven || battle.isAutoBattle;

    // NEW: First combat tutorial - blink Offer Item button if player has matching item
    if (!gameState.firstCombatTutorialShown && battle.isWildEncounter && !offerBtn.disabled) {
        // Check if player has the correct taming item for this enemy
        const enemySpecies = battle.enemyActive.speciesName;
        const correctItem = VASEN_SPECIES[enemySpecies]?.tamingItem;

        if (correctItem && gameState.itemInventory[correctItem] && gameState.itemInventory[correctItem] > 0) {
            offerBtn.classList.add('tutorial-blink');
        } else {
            offerBtn.classList.remove('tutorial-blink');
        }
    } else {
        offerBtn.classList.remove('tutorial-blink');
    }

    document.getElementById('btn-ask').disabled =
        !battle.waitingForPlayerAction || !battle.isWildEncounter ||
        activeVasen.battleFlags.hasSwapSickness || battle.isAutoBattle;
    document.getElementById('btn-pass').disabled = !battle.waitingForPlayerAction || battle.isAutoBattle;
    document.getElementById('btn-surrender').disabled = battle.isAutoBattle;

    // Auto Battle button
    const autoBattleBtn = document.getElementById('btn-auto-battle');
    if (battle.isAutoBattle) {
        autoBattleBtn.textContent = 'Cancel Auto Battle';
        autoBattleBtn.disabled = false;
        autoBattleBtn.classList.add('auto-battle-active');
    } else {
        autoBattleBtn.textContent = 'Auto Battle';
        autoBattleBtn.disabled = false;
        autoBattleBtn.classList.remove('auto-battle-active');
    }

    // Swap button opens the modal
    document.getElementById('btn-swap').onclick = () => {
        if (!battle.waitingForPlayerAction || activeVasen.battleFlags.hasSwapSickness || battle.isAutoBattle) return;
        this.renderSwapOptions(battle);
    };
};

UIController.prototype.addCombatLog = function(message, type = 'normal') {
        const logEntry = document.createElement('div');
        logEntry.className = `combat-log-entry combat-log-${type}`;

        // Apply color coding to the message
        const coloredMessage = this.colorCodeCombatMessage(message);
        logEntry.innerHTML = coloredMessage;

        this.combatLog.appendChild(logEntry);
        this.combatLogMessages.push({ message: coloredMessage, type });

        // Cap at max messages
        while (this.combatLogMessages.length > GAME_CONFIG.MAX_BATTLE_LOG) {
            this.combatLogMessages.shift();
            this.combatLog.removeChild(this.combatLog.firstChild);
        }

        // Scroll to bottom
        this.combatLog.scrollTop = this.combatLog.scrollHeight;
};

UIController.prototype.colorCodeCombatMessage = function(message) {
        let result = message;

        // 1. Color megin references (blue)
        // Matches: "used X megin", "X megin", "megin"
        result = result.replace(/(\d+)\s+(megin)/gi, '<span class="combat-megin">$1 $2</span>');
        result = result.replace(/\b(megin)\b(?![^<]*>)/gi, '<span class="combat-megin">$1</span>');

        // 2. Color reflected damage (red) - MUST come before general damage
        // Matches: "X reflected damage"
        result = result.replace(/(\d+)\s+(reflected)\s+(damage)/gi,
            '<span class="combat-damage">$1 $2 $3</span>');

        // 3. Color damage numbers and the word "damage" (red)
        // Matches: "deals X damage", "X damage", "takes X damage"
        result = result.replace(/(deals|takes)\s+(\d+)\s+(damage)/gi,
            '$1 <span class="combat-damage">$2 $3</span>');
        result = result.replace(/(\d+)\s+(damage)/gi, '<span class="combat-damage">$1 $2</span>');

        // 4. Color positive stat changes (green)
        // Matches: "raised by X stage", "raised by X stages", "increased X stage", etc.
        result = result.replace(/(raised|increased|boosted)(\s+by)?\s+(\d+)\s+(stages?)/gi,
            '<span class="combat-buff">$1$2 $3 $4</span>');
        // Also matches: "was raised", "was increased", "was boosted"
        result = result.replace(/\b(was)\s+(raised|increased|boosted)/gi,
            '<span class="combat-buff">$1 $2</span>');

        // 5. Color negative stat changes (red)
        // Matches: "lowered by X stage", "lowered by X stages", "decreased X stage", etc.
        result = result.replace(/(lowered|decreased|reduced)(\s+by)?\s+(\d+)\s+(stages?)/gi,
            '<span class="combat-debuff">$1$2 $3 $4</span>');
        // Also matches: "was lowered", "was decreased", "was reduced"
        result = result.replace(/\b(was)\s+(lowered|decreased|reduced)/gi,
            '<span class="combat-debuff">$1 $2</span>');

        //Color "attributes were lowered" (red)
result = result.replace(/\b(attributes)\s+(were)\s+(lowered)\b/gi,
    '<span class="combat-debuff">$1 $2 $3</span>');

        return result;
};

UIController.prototype.clearCombatLog = function() {
        this.combatLog.innerHTML = '';
        this.combatLogMessages = [];
};

UIController.prototype.flashCombatant = function(side, matchup = 'NEUTRAL') {
    const panel = document.getElementById(`${side}-panel`);
    if (!panel) return;

    // Determine the hit class based on matchup
    let hitClass = 'hit-neutral';
    let animationDuration = 400;

    if (matchup === 'KNOCKOUT') {
        hitClass = 'hit-knockout';
        animationDuration = 180; // Very fast for knockout
    } else if (matchup === 'POTENT') {
        hitClass = 'hit-potent';
    } else if (matchup === 'WEAK') {
        hitClass = 'hit-weak';
    } else if (matchup === 'DEBUFF') {
        hitClass = 'hit-debuff';
    }

    // Don't clear attack animations - allow hit flash to play simultaneously with attack movement

    panel.dataset.hitAnimation = 'true';
    panel.dataset.hitAnimationTime = Date.now();
    panel.dataset.hitAnimationClass = hitClass;
    panel.dataset.animationPriority = '1';

    const imageContainer = panel.querySelector('.combatant-image-container');
    if (imageContainer) {
        imageContainer.classList.add(hitClass);
    }

    // Only shake on POTENT hits
    if (matchup === 'POTENT' || matchup === 'KNOCKOUT') {
        panel.classList.remove('hit-shake');
        void panel.offsetWidth; // restart animation
        panel.classList.add('hit-shake');
    }

    setTimeout(() => {
        const panel = document.getElementById(`${side}-panel`);
        if (panel) {
            delete panel.dataset.hitAnimation;
            delete panel.dataset.hitAnimationTime;
            delete panel.dataset.hitAnimationClass;
            delete panel.dataset.animationPriority;

            const imageContainer = panel.querySelector('.combatant-image-container');
            if (imageContainer) {
                imageContainer.classList.remove('hit-potent', 'hit-neutral', 'hit-weak', 'hit-knockout', 'hit-debuff');
            }

            // Always remove shake after duration
            panel.classList.remove('hit-shake');
        }
    }, animationDuration);
};

UIController.prototype.triggerAttackAnimation = function(side, abilityType) {
        const panel = document.getElementById(`${side}-panel`);
        if (!panel) return;

        // Check if higher priority animation is playing
        const currentPriority = parseInt(panel.dataset.animationPriority || '999');
        const newPriority = (abilityType === ATTACK_TYPES.UTILITY) ? 3 : 2;

        // Block if higher or equal priority animation is playing
        if (currentPriority <= newPriority) {
            return; // Don't play this animation
        }

        // Don't clear animations - allow attack to play alongside hit flash

        // Determine animation type based on ability type
        let animationClass = '';
        let duration = 0;

        if (abilityType === ATTACK_TYPES.UTILITY) {
            animationClass = 'using-utility';
            duration = 600;
        } else if (abilityType === ATTACK_TYPES.STRENGTH ||
                   abilityType === ATTACK_TYPES.WISDOM ||
                   abilityType === ATTACK_TYPES.MIXED) {
            animationClass = side === 'player' ? 'attacking-player' : 'attacking-enemy';
            duration = 500;
        } else {
            // No animation for non-ability actions (pass, offer, ask, surrender)
            return;
        }

        // Store animation state with priority
        panel.dataset.attackAnimation = 'true';
        panel.dataset.attackAnimationTime = Date.now();
        panel.dataset.attackAnimationClass = animationClass;
        panel.dataset.animationPriority = newPriority.toString();

        const imageContainer = panel.querySelector('.combatant-image-container');
        if (imageContainer) {
            imageContainer.classList.add(animationClass);
        }

        setTimeout(() => {
            const panel = document.getElementById(`${side}-panel`);
            if (panel) {
                delete panel.dataset.attackAnimation;
                delete panel.dataset.attackAnimationTime;
                const storedClass = panel.dataset.attackAnimationClass;
                delete panel.dataset.attackAnimationClass;
                delete panel.dataset.animationPriority;
                const imageContainer = panel.querySelector('.combatant-image-container');
                if (imageContainer && storedClass) {
                    imageContainer.classList.remove(storedClass);
                }
            }
        }, duration);
};

UIController.prototype.clearAllAnimations = function(panel) {
    if (!panel) return;

    const imageContainer = panel.querySelector('.combatant-image-container');
    if (imageContainer) {
        imageContainer.classList.remove('hit-potent', 'hit-neutral', 'hit-weak', 'hit-knockout', 'hit-debuff');
    }

    // Remove shake from panel
    panel.classList.remove('hit-shake');

    delete panel.dataset.hitAnimation;
    delete panel.dataset.hitAnimationTime;
    delete panel.dataset.hitAnimationClass;
    delete panel.dataset.attackAnimation;
    delete panel.dataset.attackAnimationTime;
    delete panel.dataset.attackAnimationClass;
    delete panel.dataset.animationPriority;
};

UIController.prototype.reapplyAnimations = function(side) {
    const panel = document.getElementById(`${side}-panel`);
    if (!panel) return;

    const now = Date.now();
    const imageContainer = panel.querySelector('.combatant-image-container');
    if (!imageContainer) return;

    // Hit animation
    if (panel.dataset.hitAnimation === 'true') {
        const elapsed = now - parseInt(panel.dataset.hitAnimationTime || 0);
        if (elapsed < 400) {
            const hitClass = panel.dataset.hitAnimationClass || 'hit-neutral';
            imageContainer.classList.add(hitClass);
        }
    }

    // Attack animation
    if (panel.dataset.attackAnimation === 'true') {
        const elapsed = now - parseInt(panel.dataset.attackAnimationTime || 0);
        if (elapsed < 400) {
            const attackClass = panel.dataset.attackAnimationClass;
            if (attackClass) {
                imageContainer.classList.add(attackClass);
            }
        }
    }
};

UIController.prototype.toggleBattleLog = function() {
        const toggleBtn = document.getElementById('battle-log-toggle-btn');
        const collapsible = document.getElementById('battle-log-collapsible');
        const toggleText = toggleBtn.querySelector('.toggle-text');
        const toggleIcon = toggleBtn.querySelector('.toggle-icon');

        if (collapsible.classList.contains('collapsed')) {
            // Expand
            collapsible.classList.remove('collapsed');
            toggleBtn.classList.remove('collapsed');
            toggleText.textContent = 'Hide Battle Log';
            toggleIcon.textContent = '«';
            localStorage.setItem('battleLogCollapsed', 'false');
            // Re-size after expand transition
            setTimeout(() => this._sizeCombatLog(), 350);
        } else {
            // Collapse
            collapsible.classList.add('collapsed');
            toggleBtn.classList.add('collapsed');
            toggleText.textContent = 'Show Battle Log';
            toggleIcon.textContent = '»';
            localStorage.setItem('battleLogCollapsed', 'true');
        }
};

UIController.prototype.restoreBattleLogState = function() {
        const toggleBtn = document.getElementById('battle-log-toggle-btn');
        const collapsible = document.getElementById('battle-log-collapsible');
        const toggleText = toggleBtn ? toggleBtn.querySelector('.toggle-text') : null;
        const toggleIcon = toggleBtn ? toggleBtn.querySelector('.toggle-icon') : null;

        if (!toggleBtn || !collapsible || !toggleText || !toggleIcon) return;

        // Check if user has saved state, otherwise default to expanded
        const savedState = localStorage.getItem('battleLogCollapsed');
        const isCollapsed = savedState !== null ? savedState === 'true' : false;

        if (isCollapsed) {
            collapsible.classList.add('collapsed');
            toggleBtn.classList.add('collapsed');
            toggleText.textContent = 'Show Battle Log';
            toggleIcon.textContent = '»';
        } else {
            collapsible.classList.remove('collapsed');
            toggleBtn.classList.remove('collapsed');
            toggleText.textContent = 'Hide Battle Log';
            toggleIcon.textContent = '«';
        }
};

UIController.prototype.toggleCombatCards = function() {
        this.combatCardsMinimized = !this.combatCardsMinimized;
        localStorage.setItem('combatCardsMinimized', this.combatCardsMinimized ? 'true' : 'false');

        const icon = this.combatCardsMinimized ? '»' : '«';

        document.querySelectorAll('.combatant-panel').forEach(panel => {
            panel.classList.toggle('minimized', this.combatCardsMinimized);
            const toggle = panel.querySelector('.combat-card-toggle');
            if (toggle) toggle.textContent = icon;
        });
};

UIController.prototype.restoreCombatCardsState = function() {
        // State is applied during renderCombatantPanel, nothing to restore on init
};
