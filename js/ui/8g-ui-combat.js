// =============================================================================
// 8g-ui-combat.js - Combat Rendering, Action Buttons, and Combat Animations
// =============================================================================

// Clickable temperament word. Clicking it opens a popup explaining what the
// temperament does (see toggleTemperamentDescription in 8a-ui-core.js).
UIController.prototype.getTemperamentTextHTML = function(temperament) {
    if (!temperament) return '';
    return `<span class="clickable-temperament" onclick="toggleTemperamentDescription(this, event)">${temperament.name}</span>`;
};

// Same as vasen.getDisplayName() ("Stoic Bäckahäst"), with the temperament word clickable.
UIController.prototype.getDisplayNameHTML = function(vasen) {
    return `${this.getTemperamentTextHTML(vasen.temperament)} ${vasen.species.name}`;
};

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

        // Remove resize listener and reset height
        if (this._boundSizeCombatLog) {
                window.removeEventListener('resize', this._boundSizeCombatLog);
        }
        this.combatLog.style.height = '';
};

UIController.prototype.renderCombat = function(combat) {
        if (!combat) return;

        // Render player side
        this.renderCombatantPanel('player', combat.playerTeam[combat.playerActiveIndex], combat);

        // Render enemy side
        this.renderCombatantPanel('enemy', combat.enemyTeam[combat.enemyActiveIndex], combat);

        // Render Endless Tower floor display if applicable
        const versusDiv = this.combatVersus;
        // "has-floor" keeps the element visible on stacked layouts (only the VS text is hidden there)
        if (combat.isEndlessTower && combat.currentFloor) {
            versusDiv.classList.add('has-floor');
            versusDiv.innerHTML = `
                <div class="endless-tower-floor">Floor ${combat.currentFloor}</div>
                <div class="combat-versus-text">VS</div>
            `;
        } else {
            versusDiv.classList.remove('has-floor');
            versusDiv.innerHTML = '<span class="combat-versus-text">VS</span>';
        }

        // Render action buttons
        this.renderActionButtons(combat);

        // Update party display
        this.renderParty();
};

UIController.prototype.renderCombatantPanel = function(side, vasen, combat) {
    const panel = document.getElementById(`${side}-panel`);
    if (!vasen) return;

    const healthPercent = (vasen.currentHealth / vasen.maxHealth) * 100;
    const meginPercent = (vasen.currentMegin / vasen.maxMegin) * 100;

    // Get party members (excluding active)
    const team = side === 'player' ? combat.playerTeam : combat.enemyTeam;
    const activeIndex = side === 'player' ? combat.playerActiveIndex : combat.enemyActiveIndex;

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
            <div class="party-portrait ${position} ${member.isKnockedOut() ? 'knocked-out' : ''}"
                 style="--aura-color: var(--element-${member.species.element.toLowerCase()})">
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

    // Runes + active bindrune as one compact row of clickable words under the
    // stats. Clicking a rune opens a popup with its effect (toggleRunePopup).
    const runesHtml = this.getRunesTextHTML(vasen, '')
        || '<span class="no-rune">None</span>';

    // Build attacking matchups for attack elements (enemy card only: your own
    // skills' element tags on the skill buttons already show their matchups)
    const attackElements = side === 'enemy' ? vasen.getAttackElements() : [];
    const attackElementsHtml = attackElements.map(e => {
        return `
            <div class="element-matchup-collapsible inline-collapsible">
                <span class="element-mini element-${e.toLowerCase()} clickable-element" onclick="toggleElementMatchup(this, event)">${elementIcon(e)}${e}</span>
                ${this.generateAttackingMatchupsHTML(e)}
            </div>
        `;
    }).join('');

     // Compute untamed indicator for enemy side in wild encounters
    const showUntamed = side === 'enemy' &&
        combat.isWildEncounter &&
        !gameState.vasenCollection.some(v => v.speciesName === vasen.speciesName);
    const untamedHtml = showUntamed
        ? '<span class="combatant-untamed">Untamed</span>'
        : '';

    // Build combatant panel
    panel.innerHTML = `
        <div class="combatant-scroll-inner">
        <span class="combat-card-toggle" onclick="ui.toggleCombatCards()">${this.combatCardsMinimized ? '»' : '«'}</span>
        <div class="combatant-header">
            ${untamedHtml}
            <h4 class="combatant-name">${this.getDisplayNameHTML(vasen)}</h4>
            <span class="combatant-level"><span class="combatant-level-main">Lvl ${this.getLevelText(vasen.level)}</span>${this.getDescriptionChipHTML(vasen)}</span>
        </div>

        <div class="combatant-image-wrapper">
            ${createPartyPortraitHTML(partyPortraits.left, 'left')}

            <div class="combatant-image-container ${vasen.isKnockedOut() ? 'knocked-out' : 'holo-' + vasen.species.rarity.toLowerCase()}"
                 style="--aura-color: var(--element-${vasen.species.element.toLowerCase()})">
                <img src="${vasen.species.image}" alt="${vasen.species.name}"
                     class="combatant-image ${vasen.isKnockedOut() ? 'knocked-out' : ''}">
                ${vasen.combatFlags.hasSwapSickness ? '<span class="status-icon swap-sickness">' + inlineIcon('preparing') + 'Preparing</span>' : ''}
                ${vasen.combatFlags.valnadPassiveTriggered ? '<span class="deathless-rune">ᛣ</span>' : ''}
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
                    ${elementIcon(vasen.species.element)}${vasen.species.element}
                </span>

                <div class="rarity-matchup-collapsible family-matchup-collapsible">
                    <span class="rarity-badge rarity-${vasen.species.rarity.toLowerCase()} clickable-rarity" onclick="toggleRarityDescription(this, event)">${vasen.species.rarity}</span>
                    <div class="rarity-description-popup">
                        <p><strong>${vasen.species.rarity}</strong><br>
                        ${RARITY_DESCRIPTIONS[vasen.species.rarity] || ''}</p>
                    </div>
                </div>

                ${this.generateDefensiveMatchupsHTML(vasen.species.element)}
            </div>

                    <div class="family-matchup-collapsible">
            <span class="family-badge clickable-family" onclick="toggleFamilyDescription(this, event)">${vasen.species.family}</span>
            <div class="family-description-popup">
                <p><strong>${vasen.species.family}</strong><br>
                ${FAMILY_DESCRIPTIONS[vasen.species.family] || 'No description available.'}</p>

                ${FAMILY_PASSIVES[vasen.species.family] ? `
                    <hr style="margin: 8px 0; border: none; border-top: 1px solid var(--border-color);">
                    <p><strong>Trait: ${FAMILY_PASSIVES[vasen.species.family].name}</strong><br>
                    ${FAMILY_PASSIVES[vasen.species.family].description}</p>
                ` : ''}
            </div>
        </div>
        </div>

        <div class="combatant-attributes">
            ${STAGEABLE_ATTRIBUTES.map(attr => this.renderCombatAttrHTML(vasen, attr)).join('')}
        </div>

        <div class="combatant-info-row">
            <span class="combatant-info-label">${(vasen.runes || []).length > 1 ? 'Runes' : 'Rune'}</span>
            <span class="combatant-runes">${runesHtml}</span>
        </div>

        ${side === 'enemy' ? `
        <div class="combatant-attack-elements">
            <span class="elements-label">Attack Elements:</span>
            ${attackElementsHtml}
        </div>` : ''}
        </div>
    `;

    // Apply minimized state if active
    panel.classList.toggle('minimized', this.combatCardsMinimized);

    // Apply Freya's Tears glow if active on this combatant.
    // Suppressed on the enemy side when taming-ready is active (taming glow takes priority).
    const tamingReady = side === 'enemy' && combat.correctItemGiven && combat.isWildEncounter && !vasen.isKnockedOut();
    const freyasTearsGlow = (side === 'player' ? combat.playerTeamFreyasTears > 0 : combat.enemyTeamFreyasTears > 0) && !tamingReady;
    panel.classList.toggle('freyas-tears-active', freyasTearsGlow);

    // Apply taming-ready glow when the correct item has been given to the active enemy
    panel.classList.toggle('taming-ready-active', tamingReady);

    // Reapply any active animations after re-render
    this.reapplyAnimations(side);
};

// One attribute cell on the combat card. Raised attributes show green with ▲N,
// lowered ones red with ▼N (N = number of stages), so stage changes are read
// directly on the stat instead of in a separate line.
UIController.prototype.renderCombatAttrHTML = function(vasen, attr) {
    const stage = vasen.attributeStages[attr] || 0;
    const stateClass = stage > 0 ? ' attr-raised' : stage < 0 ? ' attr-lowered' : '';
    const stageHtml = stage !== 0
        ? `<span class="combat-attr-stage">${stage > 0 ? '▲' : '▼'}${Math.abs(stage)}</span>`
        : '';
    return `<div class="combat-attr${stateClass}">
        <span class="combat-attr-name">${attr.substring(0, 3).toUpperCase()}</span>
        <span class="combat-attr-value">${vasen.getAttribute(attr)}${stageHtml}</span>
    </div>`;
};

UIController.prototype.createStandardVasenCardHTML = function(vasen, showCombatInfo = false) {
        // Build runes HTML
        // Runes + active bindrune as clickable words (popup shows what they do)
        const runesHtml = this.getRunesTextHTML(vasen);

        // Build attribute stages HTML (only for combat info)
        let stagesHtml = '';
        if (showCombatInfo) {
            STAGEABLE_ATTRIBUTES.forEach(attr => {
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
                    <span class="standard-vasen-name">${this.getDisplayNameHTML(vasen)}</span>
                    <span class="standard-vasen-level">Lvl ${this.getLevelText(vasen.level)}</span>
                </div>
                <div class="standard-vasen-badges">
                    <span class="element-badge element-${vasen.species.element.toLowerCase()}">${elementIcon(vasen.species.element)}${vasen.species.element}</span>
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

UIController.prototype.renderSwapOptions = function(combat) {
    const modal = document.getElementById('swap-modal');
    const list = document.getElementById('swap-modal-list');

    list.innerHTML = '';

    combat.playerTeam.forEach((vasen, index) => {
        if (index === combat.playerActiveIndex || vasen.isKnockedOut()) return;

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

// Determine the potency shine class for an attack skill button - 'potency-potent',
// 'potency-weak', or '' for neutral/utility skills. Accounts for active elemental
// conversion bind runes (e.g. Eihwaz+Kaunan) by converting the skill's element
// before checking the matchup, mirroring the same conversion Combat.calculateDamage
// applies when actually resolving damage.
UIController.prototype.getSkillPotencyClass = function(skill, skillElement, attacker, defender) {
    if (!skill || skill.type === ATTACK_TYPES.UTILITY) return '';
    if (!attacker || !defender) return '';

    let effectiveElement = skillElement;
    const eleConversionBR = getElementConversionBindRune(attacker);
    if (eleConversionBR && effectiveElement === eleConversionBR.sourceElement) {
        effectiveElement = eleConversionBR.convertedElement;
    }

    let matchup = getMatchupType(effectiveElement, defender.species.element);

    // Jätte passive: Jotun's Fury - a ONE-TIME upgrade that fires on the single attack
    // that first brings the väsen to/below the health threshold this combat. Once
    // combatFlags.jattePassiveTriggered is true, Combat.calculateDamage no longer
    // upgrades any further hits, so the indicator must only show when the passive
    // has NOT yet triggered and the attacker's current health is at/below the
    // threshold - i.e. exactly the condition that will cause the next attack to upgrade.
    const jattePassiveActive = attacker.species.family === FAMILIES.JATTE &&
        !attacker.combatFlags.jattePassiveTriggered &&
        (attacker.currentHealth / attacker.maxHealth) <= FAMILY_PASSIVE_CONFIG.JATTE_HEALTH_THRESHOLD;

    if (jattePassiveActive) {
        if (matchup === 'WEAK') {
            matchup = 'NEUTRAL';
        } else if (matchup === 'NEUTRAL') {
            matchup = 'POTENT';
        }
    }

    if (matchup === 'POTENT') return 'potency-potent';
    if (matchup === 'WEAK') return 'potency-weak';
    return '';
};

UIController.prototype.renderActionButtons = function(combat) {
    const actionsContainer = document.getElementById('skill-buttons');
    actionsContainer.innerHTML = '';

    const activeVasen = combat.playerTeam[combat.playerActiveIndex];
    if (!activeVasen || activeVasen.isKnockedOut()) return;

    const skills = activeVasen.getAvailableSkills();

    skills.forEach(skillName => {
        const skill = ABILITIES[skillName];
        if (!skill) return;

        const meginCost = activeVasen.getSkillMeginCost(skillName);
        const canUse = activeVasen.canUseSkill(skillName) && !activeVasen.combatFlags.hasSwapSickness;

        const skillElement = skill.element || activeVasen.species.element;

        const potencyClass = combat.enemyActive
            ? this.getSkillPotencyClass(skill, skillElement, activeVasen, combat.enemyActive)
            : '';

        const btn = document.createElement('button');
        btn.className = `skill-btn element-${skillElement.toLowerCase()} ${canUse ? '' : 'disabled'} ${potencyClass}`;
        btn.disabled = !canUse || !combat.waitingForPlayerAction || combat.isAutoBattle;
        btn.innerHTML = `
            <span class="skill-btn-name">${skill.name}</span>
            <span class="skill-btn-type">${skillTypeIcon(skill)}${skill.type}</span>
            <span class="skill-btn-attributes">
                <span class="skill-btn-element element-${skillElement.toLowerCase()} card-badge-clickable" onclick="toggleSkillElementPopup(this, event, '${skillElement}')">${elementIcon(skillElement)}${skillElement}</span>
                <span class="skill-btn-cost">Megin: ${meginCost}</span>
                ${skill.healthCost ? `<span class="skill-btn-health-cost">Health: ${Math.round(skill.healthCost * 100)}%</span>` : ''}
                ${skill.power ? `<span class="skill-btn-power">Power: ${getSkillPower(skillName, activeVasen.species.family)}</span>` : ''}
                ${this.getInitialBonusHTML(skill, 'skill-btn-initialbonus')}
            </span>
            <span class="skill-btn-desc">${this.linkifyKeywords(skill.mechanicsDescription)}</span>
        `;
        btn.onclick = () => game.handleSkillUse(skillName);
        actionsContainer.appendChild(btn);
    });

    // Update other action buttons
    document.getElementById('btn-swap').disabled =
        !combat.waitingForPlayerAction || activeVasen.combatFlags.hasSwapSickness || combat.isAutoBattle;

    const offerBtn = document.getElementById('btn-offer');
    offerBtn.disabled =
        !combat.waitingForPlayerAction || !combat.isWildEncounter || combat.isEndlessTower ||
        combat.giftsGiven >= GAME_CONFIG.MAX_OFFERS_PER_COMBAT || combat.correctItemGiven || combat.isAutoBattle;

    const interrogateBtn = document.getElementById('btn-interrogate');
    interrogateBtn.disabled =
        !combat.waitingForPlayerAction || !combat.isWildEncounter || combat.isEndlessTower ||
        activeVasen.combatFlags.hasSwapSickness || combat.correctItemGiven || combat.isAutoBattle;

    // New-player tutorial (see Game.getCombatTutorialStage): only when the enemy
    // desires an item the player owns - Interrogate glows first, then Offer Item.
    const tutorialStage = game.getCombatTutorialStage(combat);
    interrogateBtn.classList.toggle('tutorial-blink', tutorialStage === 'interrogate' && !interrogateBtn.disabled);
    offerBtn.classList.toggle('tutorial-blink', tutorialStage === 'offer' && !offerBtn.disabled);
    document.getElementById('btn-pass').disabled = !combat.waitingForPlayerAction || combat.isAutoBattle;
    document.getElementById('btn-surrender').disabled = combat.isAutoBattle;

    // Auto Battle button
    const autoBattleBtn = document.getElementById('btn-auto-combat');
    const autoBattleIcon = uiIcon('swords');
    if (combat.isAutoBattle) {
        autoBattleBtn.innerHTML = `${autoBattleIcon}Cancel Auto Battle`;
        autoBattleBtn.disabled = false;
        autoBattleBtn.classList.add('auto-combat-active');
    } else {
        autoBattleBtn.innerHTML = `${autoBattleIcon}Auto Battle`;
        autoBattleBtn.disabled = false;
        autoBattleBtn.classList.remove('auto-combat-active');
    }

    // Swap button opens the modal
    document.getElementById('btn-swap').onclick = () => {
        if (!combat.waitingForPlayerAction || activeVasen.combatFlags.hasSwapSickness || combat.isAutoBattle) return;
        this.renderSwapOptions(combat);
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
        while (this.combatLogMessages.length > GAME_CONFIG.MAX_COMBAT_LOG) {
            this.combatLogMessages.shift();
            this.combatLog.removeChild(this.combatLog.firstChild);
        }

        // Scroll to bottom
        this.combatLog.scrollTop = this.combatLog.scrollHeight;
};

UIController.prototype.colorCodeCombatMessage = function(message) {
    let result = message;

    // 1. Color megin references (blue)
    result = result.replace(/(\d+)\s+(megin)/gi, '<span class="combat-megin">$1 $2</span>');
    result = result.replace(/\b(megin)\b(?![^<]*>)/gi, '<span class="combat-megin">$1</span>');

    // 2. Color reflected damage (red)
    result = result.replace(/(\d+)\s+(reflected)\s+(damage)/gi,
        '<span class="combat-damage">$1 $2 $3</span>');

    // 3. Color damage numbers and the word "damage" (red)
    result = result.replace(/(deals|takes)\s+(\d+)\s+(damage)/gi,
        '$1 <span class="combat-damage">$2 $3</span>');
    result = result.replace(/(\d+)\s+(damage)/gi, '<span class="combat-damage">$1 $2</span>');

    // 4. Color HP sacrifices/losses (red)
    result = result.replace(/\b(\d+)\s+(HP)\b(?![^<]*>)/gi, '<span class="combat-damage">$1 $2</span>');

    // 5. Color positive stat changes (green)
    result = result.replace(/(raised|increased|boosted)(\s+by)?\s+(\d+)\s+(stages?)/gi,
        '<span class="combat-buff">$1$2 $3 $4</span>');
    result = result.replace(/\b(was)\s+(raised|increased|boosted)/gi,
        '<span class="combat-buff">$1 $2</span>');

    // 5b. Color cleanse stat changes (green)
    result = result.replace(/(cleansed)(\s+by)?\s+(\d+)\s+(stages?)/gi,
        '<span class="combat-buff">$1$2 $3 $4</span>');
    result = result.replace(/\b(was)\s+(cleansed)/gi,
        '<span class="combat-buff">$1 $2</span>');

    // 6. Color negative stat changes (red)
    result = result.replace(/(lowered|decreased|reduced)(\s+by)?\s+(\d+)\s+(stages?)/gi,
        '<span class="combat-debuff">$1$2 $3 $4</span>');
    result = result.replace(/\b(was)\s+(lowered|decreased|reduced)/gi,
        '<span class="combat-debuff">$1 $2</span>');

    // 7. Color "attributes were lowered" (red)
    result = result.replace(/\b(attributes)\s+(were)\s+(lowered)\b/gi,
        '<span class="combat-debuff">$1 $2 $3</span>');

    // 8. Color the rune symbol for the deathless passive (red)
    result = result.replace(/ᛣ/g, '<span class="combat-damage">ᛣ</span>');

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

UIController.prototype.triggerAttackAnimation = function(side, skillType) {
        const panel = document.getElementById(`${side}-panel`);
        if (!panel) return;

        // Check if higher priority animation is playing
        const currentPriority = parseInt(panel.dataset.animationPriority || '999');
        const newPriority = (skillType === ATTACK_TYPES.UTILITY) ? 3 : 2;

        // Block if higher or equal priority animation is playing
        if (currentPriority <= newPriority) {
            return; // Don't play this animation
        }

        // Don't clear animations - allow attack to play alongside hit flash

        // Determine animation type based on skill type
        let animationClass = '';
        let duration = 0;

        if (skillType === ATTACK_TYPES.UTILITY) {
            animationClass = 'using-utility';
            duration = 600;
        } else if (skillType === ATTACK_TYPES.STRENGTH ||
                   skillType === ATTACK_TYPES.WISDOM ||
                   skillType === ATTACK_TYPES.MIXED) {
            animationClass = side === 'player' ? 'attacking-player' : 'attacking-enemy';
            duration = 500;
        } else {
            // No animation for non-skill actions (pass, offer, interrogate, surrender)
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

UIController.prototype.toggleCombatLog = function() {
        const toggleBtn = document.getElementById('combat-log-toggle-btn');
        const collapsible = document.getElementById('combat-log-collapsible');
        const toggleText = toggleBtn.querySelector('.toggle-text');
        const toggleIcon = toggleBtn.querySelector('.toggle-icon');

        if (collapsible.classList.contains('collapsed')) {
            // Expand
            collapsible.classList.remove('collapsed');
            toggleBtn.classList.remove('collapsed');
            toggleText.textContent = 'Hide Combat Log';
            toggleIcon.textContent = '«';
            localStorage.setItem('combatLogCollapsed', 'false');
            // Re-size after expand transition
            setTimeout(() => this._sizeCombatLog(), 350);
        } else {
            // Collapse
            collapsible.classList.add('collapsed');
            toggleBtn.classList.add('collapsed');
            toggleText.textContent = 'Show Combat Log';
            toggleIcon.textContent = '»';
            localStorage.setItem('combatLogCollapsed', 'true');
        }
};

UIController.prototype.restoreCombatLogState = function() {
        const toggleBtn = document.getElementById('combat-log-toggle-btn');
        const collapsible = document.getElementById('combat-log-collapsible');
        const toggleText = toggleBtn ? toggleBtn.querySelector('.toggle-text') : null;
        const toggleIcon = toggleBtn ? toggleBtn.querySelector('.toggle-icon') : null;

        if (!toggleBtn || !collapsible || !toggleText || !toggleIcon) return;

        // Check if user has saved state, otherwise default to expanded
        const savedState = localStorage.getItem('combatLogCollapsed');
        const isCollapsed = savedState !== null ? savedState === 'true' : false;

        if (isCollapsed) {
            collapsible.classList.add('collapsed');
            toggleBtn.classList.add('collapsed');
            toggleText.textContent = 'Show Combat Log';
            toggleIcon.textContent = '»';
        } else {
            collapsible.classList.remove('collapsed');
            toggleBtn.classList.remove('collapsed');
            toggleText.textContent = 'Hide Combat Log';
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
