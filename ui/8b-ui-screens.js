// =============================================================================
// 8b-ui-screens.js - Screen Switching and Tab Navigation
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
    };
