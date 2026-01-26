// =============================================================================
// 8b-ui-screens.js - UI Controller Extension
// =============================================================================


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

