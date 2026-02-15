// =============================================================================
// 8f-ui-zones.js - Zone Selection, Descriptions, and Exploration UI
// =============================================================================

    // Render zones
UIController.prototype.renderZones = function() {
    this.zoneList.innerHTML = '';

    ZONE_ORDER.forEach(zoneId => {
        const zone = ZONES[zoneId];
        const isUnlocked = gameState.isZoneUnlocked(zoneId);
        const isSelected = gameState.currentZone === zoneId;
        const isCleared = gameState.defeatedGuardians.has(zoneId);

        // FIX: use zone-item instead of zone-btn
        const zoneBtn = document.createElement('button');
        zoneBtn.className = `zone-item ${isUnlocked ? '' : 'locked'} ${isSelected ? 'selected' : ''} ${isCleared ? 'cleared' : ''}`;
        zoneBtn.disabled = !isUnlocked;

        if (isUnlocked) {
            zoneBtn.innerHTML = `
                <span class="zone-name">${zone.name}</span>
                <span class="zone-level">Lvl ${zone.levelRange[0]}-${zone.levelRange[1]}</span>
                ${isCleared ? '<span class="zone-status cleared">Cleared</span>' : ''}
            `;
            zoneBtn.onclick = () => this.selectZone(zoneId);
        } else {
            const prevZone = this.getPreviousZone(zoneId);
            zoneBtn.innerHTML = `
                <span class="zone-name">${zone.name}</span>
                <span class="zone-status locked">Defeat ${prevZone ? ZONES[prevZone].guardian?.name || 'Guardian' : 'Guardian'} to unlock</span>
            `;
        }

        this.zoneList.appendChild(zoneBtn);
    });

    this.updateExploreButton();
};


    // Get previous zone
UIController.prototype.getPreviousZone = function(zoneId) {
        const index = ZONE_ORDER.indexOf(zoneId);
        return index > 0 ? ZONE_ORDER[index - 1] : null;
    };

    // Select zone
UIController.prototype.selectZone = function(zoneId) {
        gameState.currentZone = zoneId;

        // Update selection class without full re-render to avoid flash
        const zoneButtons = this.zoneList.querySelectorAll('.zone-item');
        ZONE_ORDER.forEach((id, index) => {
            if (zoneButtons[index]) {
                zoneButtons[index].classList.toggle('selected', id === zoneId);
            }
        });

        this.updateZoneDescription();
        this.updateExploreButton();
        gameState.saveGame();
    };

    // Update zone description
UIController.prototype.updateZoneDescription = function() {
        const zone = ZONES[gameState.currentZone];

        this.zoneDescription.innerHTML = `
            ${zone.image ? `<img src="${zone.image}" alt="${zone.name}" class="zone-image">` : ''}
            <h3>${zone.name}</h3>
            <p>${zone.description}</p>
            <div class="zone-meta">
                <span>Level Range: ${zone.levelRange[0]} - ${zone.levelRange[1]}</span>
                ${zone.guardian ? `<span>Guardian: ${zone.guardian.name} (Lvl ${zone.guardian.team[0].level})</span>` : ''}
            </div>
        `;
    };

    // Update explore button
UIController.prototype.updateExploreButton = function() {
        const zone = ZONES[gameState.currentZone];
        const hasParty = gameState.party.some(p => p !== null);

        if (zone) {
            this.exploreBtn.innerHTML = `Explore <span class="btn-hint">(Lvl ${zone.levelRange[0]}-${zone.levelRange[1]})</span>`;
            this.exploreBtn.disabled = !hasParty || gameState.inCombat;

            // NEW: Explore tutorial - blink Explore button until first combat
            if (!gameState.firstExploreTutorialShown && hasParty && !gameState.inCombat) {
                if (!this.exploreTutorialActive) {
                    this.exploreBtn.classList.add('tutorial-blink');
                    this.exploreTutorialActive = true;
                }
            } else {
                this.exploreBtn.classList.remove('tutorial-blink');
                this.exploreTutorialActive = false;
            }

            // Show/hide challenge button
            if (zone.guardian) {
                this.challengeBtn.style.display = 'block';
                this.challengeBtn.innerHTML = `Challenge Guardian <span class="btn-hint">(Lvl ${zone.guardian.team[0].level})</span>`;
                this.challengeBtn.disabled = !hasParty || gameState.inCombat;
            } else if (gameState.currentZone === 'GINNUNGAGAP') {
                // Show Endless Tower button in Ginnungagap
                this.challengeBtn.style.display = 'block';
                this.challengeBtn.innerHTML = `Challenge Endless Tower <span class="btn-hint">(Starts at Lvl 30)</span>`;
                this.challengeBtn.disabled = !hasParty || gameState.inCombat;
            } else {
                this.challengeBtn.style.display = 'none';
            }
        }
    };

    // Show message
UIController.prototype.showMessage = function(text, type = 'info') {
        const messageContainer = document.getElementById('message-container');
        const message = document.createElement('div');
        message.className = `game-message ${type}`;
        message.innerHTML = text;
        messageContainer.appendChild(message);

        setTimeout(() => {
            message.classList.add('fade-out');
            setTimeout(() => message.remove(), 300);
        }, 3000);
    };
