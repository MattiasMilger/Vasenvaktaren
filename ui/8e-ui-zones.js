// =============================================================================
// 8e-ui-zones.js - UI Controller Extension
// =============================================================================


    };

    // Select zone
UIController.prototype.selectZone = function(zoneId) {
        gameState.currentZone = zoneId;
        this.renderZones();
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

