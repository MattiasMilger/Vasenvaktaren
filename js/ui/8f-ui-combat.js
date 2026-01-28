// =============================================================================
// 8f-ui-combat.js - UI Controller Extension
// =============================================================================


UIController.prototype.showCombatUI = function() {
        this.zoneDescription.style.display = 'none';
        this.combatArea.style.display = 'flex';
        this.combatUI.style.display = 'flex';
        this.combatUI.classList.add('active');
        this.combatLogMessages = [];
        this.combatLog.innerHTML = '';
    };

UIController.prototype.hideCombatUI = function() {
        this.combatArea.style.display = 'none';
        this.combatUI.style.display = 'none';
        this.combatUI.classList.remove('active');
        this.zoneDescription.style.display = 'block';
    };

    // Render combat state
UIController.prototype.renderCombat = function(battle) {
        if (!battle) return;

        // Render player side
        this.renderCombatantPanel('player', battle.playerTeam[battle.playerActiveIndex], battle);

        // Render enemy side
        this.renderCombatantPanel('enemy', battle.enemyTeam[battle.enemyActiveIndex], battle);

        // Render Endless Tower floor display if applicable
        const versusDiv = document.querySelector('.combat-versus');
        if (battle.isEndlessTower && battle.currentFloor) {
            versusDiv.innerHTML = `
                <div class="endless-tower-floor">Floor ${battle.currentFloor}</div>
                <div>VS</div>
            `;
        } else {
            versusDiv.innerHTML = 'VS';
        };

        // Render action buttons
        this.renderActionButtons(battle);

        // Update party display
        this.renderParty();
    };

    // Show väsen menu
UIController.prototype.showAddVasenMenu = function(slotIndex) {
    const modal = document.getElementById('add-vasen-modal');
    const list = document.getElementById('add-vasen-list');
    list.innerHTML = '';

    // Sort: favorites first, then by family, then name
    const sorted = [...gameState.vasenCollection].sort((a, b) => {
        // Favorites first
        const aFav = gameState.isFavorite(a.id) ? 1 : 0;
        const bFav = gameState.isFavorite(b.id) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
        
        if (a.species.family !== b.species.family)
            return a.species.family.localeCompare(b.species.family);
        return a.getDisplayName().localeCompare(b.getDisplayName());
    });

    sorted.forEach(vasen => {
        const btn = document.createElement('button');
        btn.className = 'add-vasen-btn';
        const isFavorite = gameState.isFavorite(vasen.id);
        const isInParty = gameState.party.some(p => p && p.id === vasen.id);

        btn.innerHTML = `
            ${isFavorite ? '<span class="add-vasen-favorite-star">★</span>' : ''}
            ${this.createStandardVasenCardHTML(vasen, false)}
            ${isInParty ? '<span class="add-vasen-in-party-badge">In Party</span>' : ''}
        `;

        btn.onclick = () => {
            modal.classList.remove('active');
            this.addToParty(vasen.id, slotIndex);
        };

        list.appendChild(btn);
    });

    document.getElementById('close-add-vasen-modal').onclick = () => {
        modal.classList.remove('active');
        document.activeElement.blur();
    };
    modal.classList.add('active');
};

    // Render combatant panel
UIController.prototype.renderCombatantPanel = function(side, vasen, battle) {
    const panel = document.getElementById(`${side}-panel`);
    if (!vasen) return;

    const healthPercent = (vasen.currentHealth / vasen.maxHealth) * 100;
    const meginPercent = (vasen.currentMegin / vasen.maxMegin) * 100;

    // Build runes HTML with "Rune:" label
    const runesHtml = vasen.runes.length > 0
        ? `<span class="runes-label">Rune:</span>
           ${vasen.runes.map(r => {
                const rune = RUNES[r];
                if (!rune) return '';

                return `
                    <div class="rune-collapsible open">
                        <div class="rune-collapsible-header" onclick="this.parentElement.classList.toggle('open')">
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
        <div class="combatant-header">
            <h4 class="combatant-name">${vasen.getDisplayName()}</h4>
            <span class="combatant-level">Lvl ${vasen.level}</span>
        </div>

        <div class="combatant-image-container ${vasen.isKnockedOut() ? '' : 'holo-' + vasen.species.rarity.toLowerCase()}">
            <img src="${vasen.species.image}" alt="${vasen.species.name}" 
                 class="combatant-image ${vasen.isKnockedOut() ? 'knocked-out' : ''}">
            ${vasen.battleFlags.hasSwapSickness ? '<span class="status-icon swap-sickness">Preparing</span>' : ''}
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

        <div class="combatant-description">
            <div class="rune-collapsible">
                <div class="rune-collapsible-header" onclick="this.parentElement.classList.toggle('open')">
                    <span class="toggle-icon">▶</span>
                    Description
                </div>
                <div class="rune-collapsible-body">
                    ${vasen.species.description}
                </div>
            </div>
        </div>
    `;
    
    // Reapply any active animations after re-render
    this.reapplyAnimations(side);
};

    // Render attribute stages
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

    // Create standardized väsen card info HTML
    // showCombatInfo: if true, uses current combat stats (with stages) and shows stage indicators
    //                 if false, uses base stats (with runes only, no stages)
UIController.prototype.createStandardVasenCardHTML = function(vasen, showCombatInfo = false) {
        // Build runes HTML
        let runesHtml = '';
        if (vasen.runes && vasen.runes.length > 0) {
            runesHtml = vasen.runes.map(runeId => {
                const rune = RUNES[runeId];
                return rune ? `<span class="mini-rune">${rune.symbol} ${rune.name}</span>` : '';
            }).join('');
        };

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
        };

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

    // Render swap options
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
            // Prevent focus issues
            if (document.activeElement) {
                document.activeElement.blur();
            };
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
            if (document.activeElement) {
                document.activeElement.blur();
            }
            document.body.focus();
            setTimeout(() => document.body.blur(), 0);
        };

    modal.classList.add('active');
};


    // Render action buttons
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

        // Helper function to highlight key phrases in ability descriptions
        const highlightDescription = (desc) => {
            if (!desc) return '';
            
            // Patterns to highlight (case insensitive)
            const patterns = [
                // Stage changes
                /(\d+\s+stages?)/gi,
                /(raises?|lowers?|increases?|decreases?)\s+[^.]+?(\d+\s+stages?)/gi,
                // Damage/healing percentages
                /(\d+%\s+(?:more|less|of)\s+(?:damage|health|healing))/gi,
                // Attribute changes
                /((?:raises?|lowers?|increases?|decreases?)\s+(?:their|its|your|enemy|opponent|allies?|all)\s+[^.]+?attributes?[^.]*)/gi,
                // Specific attribute mentions with modifications
                /((?:raises?|lowers?|increases?|decreases?)\s+(?:their|its|your|enemy|opponent)\s+(?:strength|wisdom|defense|durability|health)[^.]*)/gi,
                // Status effects
                /(blocks?|prevents?|removes?|drains?|restores?)[^.]+?(?:megin|health|attributes?|stages?)/gi,
            ];
            
            let highlighted = desc;
            patterns.forEach(pattern => {
                highlighted = highlighted.replace(pattern, (match) => {
                    return `<span class="ability-highlight">${match}</span>`;
                });
            });
            
            return highlighted;
        };

        const btn = document.createElement('button');
        btn.className = `ability-btn element-${abilityElement.toLowerCase()} ${canUse ? '' : 'disabled'}`;
        btn.disabled = !canUse || !battle.waitingForPlayerAction;
        btn.innerHTML = `
            <span class="ability-btn-name">${ability.name}</span>
            <span class="ability-btn-type">${ability.type}</span>
            <span class="ability-btn-stats">
                <span class="ability-btn-element element-${abilityElement.toLowerCase()}">${abilityElement}</span>
                ${ability.power ? `<span class="ability-btn-power">Power: ${getAbilityPower(abilityName, activeVasen.species.family)}</span>` : ''}
                <span class="ability-btn-cost">Megin: ${meginCost}</span>
            </span>
            <span class="ability-btn-desc">${highlightDescription(ability.description)}</span>
        `;
        btn.onclick = () => game.handleAbilityUse(abilityName);
        actionsContainer.appendChild(btn);
    });

    // Update other action buttons
    document.getElementById('btn-swap').disabled =
        !battle.waitingForPlayerAction || activeVasen.battleFlags.hasSwapSickness;
    document.getElementById('btn-offer').disabled =
        !battle.waitingForPlayerAction || !battle.isWildEncounter ||
        battle.offersGiven >= GAME_CONFIG.MAX_OFFERS_PER_COMBAT || battle.correctItemGiven;
    document.getElementById('btn-ask').disabled =
        !battle.waitingForPlayerAction || !battle.isWildEncounter ||
        activeVasen.battleFlags.hasSwapSickness;
    document.getElementById('btn-pass').disabled = !battle.waitingForPlayerAction;
    document.getElementById('btn-surrender').disabled = false;

    // Swap button opens the modal
    document.getElementById('btn-swap').onclick = () => {
        if (!battle.waitingForPlayerAction || activeVasen.battleFlags.hasSwapSickness) return;
        this.renderSwapOptions(battle);
    };
};


    // Add combat log message
UIController.prototype.addCombatLog = function(message, type = 'normal') {
        const logEntry = document.createElement('div');
        logEntry.className = `combat-log-entry ${type}`;
        logEntry.textContent = message;

        this.combatLog.appendChild(logEntry);
        this.combatLogMessages.push({ message, type });

        // Cap at max messages
        while (this.combatLogMessages.length > GAME_CONFIG.MAX_BATTLE_LOG) {
            this.combatLogMessages.shift();
            this.combatLog.removeChild(this.combatLog.firstChild);
        };

        // Scroll to bottom
        this.combatLog.scrollTop = this.combatLog.scrollHeight;
    };

    // Clear combat log
UIController.prototype.clearCombatLog = function() {
        this.combatLog.innerHTML = '';
        this.combatLogMessages = [];
    };

    // Flash combatant (when hit)
UIController.prototype.flashCombatant = function(side) {
        const panel = document.getElementById(`${side}-panel`);
        if (!panel) return;
        
        // Clear any existing animations (hit has highest priority)
        this.clearAllAnimations(panel);
        
        // Store animation state with priority
        panel.dataset.hitAnimation = 'true';
        panel.dataset.hitAnimationTime = Date.now();
        panel.dataset.animationPriority = '1'; // Highest priority
        
        const imageContainer = panel.querySelector('.combatant-image-container');
        if (imageContainer) {
            imageContainer.classList.add('hit');
        };
        
        setTimeout(() => {
            const panel = document.getElementById(`${side}-panel`);
            if (panel) {
                delete panel.dataset.hitAnimation;
                delete panel.dataset.hitAnimationTime;
                delete panel.dataset.animationPriority;
                const imageContainer = panel.querySelector('.combatant-image-container');
                if (imageContainer) {
                    imageContainer.classList.remove('hit');
                }
            }
        }, 400);
    };
    
    // Trigger attack animation
UIController.prototype.triggerAttackAnimation = function(side, abilityType) {
        const panel = document.getElementById(`${side}-panel`);
        if (!panel) return;
        
        // Check if higher priority animation is playing
        const currentPriority = parseInt(panel.dataset.animationPriority || '999');
        const newPriority = (abilityType === ATTACK_TYPES.UTILITY) ? 3 : 2;
        
        // Block if higher or equal priority animation is playing
        if (currentPriority <= newPriority) {
            return; // Don't play this animation
        };
        
        // Clear any lower priority animations
        this.clearAllAnimations(panel);
        
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
        };
        
        // Store animation state with priority
        panel.dataset.attackAnimation = 'true';
        panel.dataset.attackAnimationTime = Date.now();
        panel.dataset.attackAnimationClass = animationClass;
        panel.dataset.animationPriority = newPriority.toString();
        
        const imageContainer = panel.querySelector('.combatant-image-container');
        if (imageContainer) {
            imageContainer.classList.add(animationClass);
        };
        
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
    
    // Clear all animations from a panel
UIController.prototype.clearAllAnimations = function(panel) {
        if (!panel) return;
        
        const imageContainer = panel.querySelector('.combatant-image-container');
        if (imageContainer) {
            // Remove all possible animation classes
            imageContainer.classList.remove('hit', 'attacking-player', 'attacking-enemy', 'using-utility');
        };
        
        // Clear all animation data attributes
        delete panel.dataset.hitAnimation;
        delete panel.dataset.hitAnimationTime;
        delete panel.dataset.attackAnimation;
        delete panel.dataset.attackAnimationTime;
        delete panel.dataset.attackAnimationClass;
        delete panel.dataset.animationPriority;
    };
    
    // Reapply active animations after panel re-render
UIController.prototype.reapplyAnimations = function(side) {
        const panel = document.getElementById(`${side}-panel`);
        if (!panel) return;
        
        const now = Date.now();
        
        // Check for hit animation first (highest priority)
        if (panel.dataset.hitAnimation === 'true') {
            const elapsed = now - parseInt(panel.dataset.hitAnimationTime || 0);
            if (elapsed < 400) {
                const imageContainer = panel.querySelector('.combatant-image-container');
                if (imageContainer) {
                    imageContainer.classList.add('hit');
                }
                return; // Don't check other animations if hit is active
            }
        };
        
        // Check for attack/utility animation (lower priority)
        if (panel.dataset.attackAnimation === 'true') {
            const elapsed = now - parseInt(panel.dataset.attackAnimationTime || 0);
            const animationClass = panel.dataset.attackAnimationClass;
            
            // Determine max duration based on animation type
            let maxDuration = 500; // default for attack animations
            if (animationClass === 'using-utility') {
                maxDuration = 600;
            };
            
            if (elapsed < maxDuration && animationClass) {
                const imageContainer = panel.querySelector('.combatant-image-container');
                if (imageContainer) {
                    imageContainer.classList.add(animationClass);
                }
            }
        }
    };

    // Show matchup flash on combatant panel
    // matchupType: 'POTENT', 'NEUTRAL', or 'WEAK'
    UIController.prototype.showAbilityAnimation = function(abilityName, targetSide, isPlayerAttacking, matchupType) {
        const ability = ABILITIES[abilityName];
        if (!ability) return;

        // Only flash for damaging abilities
        if (ability.type === ATTACK_TYPES.UTILITY) {
            return;
        }

        const panel = document.getElementById(`${targetSide}-panel`);
        if (!panel) return;

        // Add matchup flash class to the panel itself
        const flashClass = `matchup-flash-${matchupType.toLowerCase()}`;
        panel.classList.add(flashClass);

        // Remove flash class after animation (400ms)
        setTimeout(() => {
            panel.classList.remove(flashClass);
        }, 400);
    };

