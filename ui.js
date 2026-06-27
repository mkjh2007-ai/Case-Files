/**
 * CASE FILES - UI Manager
 * Handles HUD, panels, cursor, and general UI interactions
 */

const UIManager = {
    cursor: null,
    cursorX: 0,
    cursorY: 0,
    currentCursorType: 'default',
    
    init() {
        this.cursor = document.getElementById('custom-cursor');
        this.setupCursor();
        this.setupHUD();
        this.setupPanels();
    },
    
    setupCursor() {
        if (!this.cursor) return;
        
        document.addEventListener('mousemove', (e) => {
            this.cursorX = e.clientX;
            this.cursorY = e.clientY;
            this.cursor.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
        });
        
        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            this.cursor.style.opacity = '0';
        });
        
        document.addEventListener('mouseenter', () => {
            this.cursor.style.opacity = '1';
        });
    },
    
    setCursor(type) {
        if (type === this.currentCursorType) return;
        
        // Hide all cursors
        const cursors = this.cursor.querySelectorAll('[class^="cursor-"]');
        cursors.forEach(c => c.classList.add('hidden'));
        
        // Show selected cursor
        const targetCursor = this.cursor.querySelector(`.cursor-${type}`);
        if (targetCursor) {
            targetCursor.classList.remove('hidden');
            this.currentCursorType = type;
            GameState.ui.cursorType = type;
        }
    },
    
    setupHUD() {
        const hud = document.getElementById('hud');
        if (!hud) return;
        
        // Panel buttons
        const panelButtons = hud.querySelectorAll('.hud-btn[data-panel]');
        panelButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const panelName = btn.dataset.panel;
                this.togglePanel(panelName);
                AudioManager.play('click');
            });
        });
    },
    
    setupPanels() {
        // Close buttons
        document.querySelectorAll('.panel-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllPanels();
                AudioManager.play('click');
            });
        });
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (GameState.ui.activePanel) {
                const panel = document.getElementById(`${GameState.ui.activePanel}-panel`);
                const hudBtn = document.querySelector(`[data-panel="${GameState.ui.activePanel}"]`);
                
                if (panel && !panel.contains(e.target) && !hudBtn?.contains(e.target)) {
                    this.closeAllPanels();
                }
            }
        });
        
        // Escape to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && GameState.ui.activePanel) {
                this.closeAllPanels();
            }
        });
    },
    
    showHUD() {
        const hud = document.getElementById('hud');
        if (hud) {
            hud.classList.remove('hidden');
            GameState.ui.hudVisible = true;
        }
    },
    
    hideHUD() {
        const hud = document.getElementById('hud');
        if (hud) {
            hud.classList.add('hidden');
            GameState.ui.hudVisible = false;
        }
        this.closeAllPanels();
    },
    
    togglePanel(panelName) {
        const panel = document.getElementById(`${panelName}-panel`);
        const btn = document.querySelector(`[data-panel="${panelName}"]`);
        
        if (!panel) return;
        
        // Close if already open
        if (GameState.ui.activePanel === panelName) {
            this.closeAllPanels();
            return;
        }
        
        // Close any open panel first
        this.closeAllPanels();
        
        // Open new panel
        panel.classList.remove('hidden');
        panel.classList.add('visible');
        btn?.classList.add('active');
        GameState.ui.activePanel = panelName;
        
        // Refresh panel content
        this.refreshPanelContent(panelName);
    },
    
    closeAllPanels() {
        document.querySelectorAll('.side-panel').forEach(panel => {
            panel.classList.remove('visible');
            panel.classList.add('hidden');
        });
        
        document.querySelectorAll('.hud-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        GameState.ui.activePanel = null;
    },
    
    refreshPanelContent(panelName) {
        switch (panelName) {
            case 'evidence':
                this.refreshEvidencePanel();
                break;
            case 'people':
                this.refreshPeoplePanel();
                break;
            case 'map':
                this.refreshMapPanel();
                break;
            case 'phone':
                this.refreshPhonePanel();
                break;
            case 'notebook':
                this.refreshNotebookPanel();
                break;
        }
    },
    
    refreshEvidencePanel() {
        const grid = document.querySelector('.evidence-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        if (GameState.evidence.length === 0) {
            grid.innerHTML = '<p class="empty-message">No evidence collected yet.</p>';
            return;
        }
        
        GameState.evidence.forEach(item => {
            const div = document.createElement('div');
            div.className = 'evidence-item';
            div.innerHTML = `
                <div class="evidence-item-image" style="background: var(--black-soft);"></div>
                <div class="evidence-item-name">${item.name}</div>
                <div class="evidence-item-type">${item.type}</div>
            `;
            div.addEventListener('click', () => {
                this.showEvidenceDetail(item);
            });
            grid.appendChild(div);
        });
    },
    
    refreshPeoplePanel() {
        const list = document.querySelector('.people-list');
        if (!list) return;
        
        list.innerHTML = '';
        
        if (GameState.people.length === 0) {
            list.innerHTML = '<p class="empty-message">No one met yet.</p>';
            return;
        }
        
        GameState.people.forEach(person => {
            const div = document.createElement('div');
            div.className = 'person-card';
            div.innerHTML = `
                <div class="person-avatar"></div>
                <div class="person-info">
                    <div class="person-name">${person.name}</div>
                    <div class="person-role">${person.role || ''}</div>
                    ${person.suspect ? '<div class="person-status">Suspect</div>' : ''}
                </div>
            `;
            div.addEventListener('click', () => {
                this.showPersonDetail(person);
            });
            list.appendChild(div);
        });
    },
    
    refreshMapPanel() {
        const container = document.querySelector('.map-locations');
        if (!container) return;
        
        container.innerHTML = '';
        
        GameState.locations.forEach(location => {
            const marker = document.createElement('div');
            marker.className = 'map-location';
            marker.dataset.name = location.name;
            marker.style.left = `${location.mapX}%`;
            marker.style.top = `${location.mapY}%`;
            
            if (location.id === GameState.scene.id) {
                marker.classList.add('current');
            } else if (GameState.scene.visited.includes(location.id)) {
                marker.classList.add('visited');
            } else if (!location.unlocked) {
                marker.classList.add('locked');
            }
            
            if (location.unlocked && location.id !== GameState.scene.id) {
                marker.addEventListener('click', () => {
                    this.closeAllPanels();
                    TravelSystem.travelTo(location.id);
                });
            }
            
            container.appendChild(marker);
        });
    },
    
    refreshPhonePanel() {
        const notifs = document.querySelector('.phone-notifications');
        const incomingCall = document.querySelector('.phone-call-incoming');
        
        if (!notifs) return;
        
        // Check for incoming call
        if (GameState.phone.incomingCall) {
            incomingCall?.classList.remove('hidden');
            const callerId = incomingCall?.querySelector('.caller-id');
            if (callerId) {
                callerId.textContent = GameState.phone.incomingCall.name;
            }
        } else {
            incomingCall?.classList.add('hidden');
        }
        
        // Show notifications
        notifs.innerHTML = '';
        
        if (GameState.phone.notifications.length === 0 && !GameState.phone.incomingCall) {
            notifs.innerHTML = '<p class="empty-message">No notifications.</p>';
            return;
        }
        
        GameState.phone.notifications.forEach(notif => {
            const div = document.createElement('div');
            div.className = 'phone-notification';
            div.innerHTML = `
                <div class="phone-notification-time">${notif.time || 'Just now'}</div>
                <div class="phone-notification-text">${notif.text}</div>
            `;
            notifs.appendChild(div);
        });
    },
    
    refreshNotebookPanel() {
        const textarea = document.querySelector('.notebook-textarea');
        if (textarea) {
            textarea.value = GameState.player.notebookContent || '';
            
            // Save on change
            textarea.addEventListener('input', () => {
                GameState.player.notebookContent = textarea.value;
                GameState.save();
            });
        }
    },
    
    showEvidenceDetail(item) {
        // Could open a modal or dedicated view
        console.log('Show evidence detail:', item);
    },
    
    showPersonDetail(person) {
        // Could open a modal or dedicated view
        console.log('Show person detail:', person);
    },
    
    updateLocationIndicator(locationName) {
        const indicator = document.querySelector('.location-name');
        if (indicator) {
            indicator.textContent = locationName;
        }
    },
    
    addNotification(text, time = null) {
        GameState.phone.notifications.unshift({
            text,
            time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
        });
        
        // Update badge
        const badge = document.querySelector('[data-panel="phone"] .badge');
        if (badge) {
            const unread = GameState.phone.notifications.filter(n => !n.read).length;
            badge.textContent = unread;
            badge.style.display = unread > 0 ? 'flex' : 'none';
        }
    },
    
    showIncomingCall(caller) {
        GameState.phone.incomingCall = caller;
        
        // Show phone panel
        this.togglePanel('phone');
        
        // Setup call buttons
        const answerBtn = document.querySelector('.call-answer');
        const ignoreBtn = document.querySelector('.call-ignore');
        
        if (answerBtn) {
            answerBtn.onclick = () => {
                GameState.phone.incomingCall = null;
                this.closeAllPanels();
                document.dispatchEvent(new CustomEvent('phone:answered', { 
                    detail: { caller } 
                }));
            };
        }
        
        if (ignoreBtn) {
            ignoreBtn.onclick = () => {
                GameState.phone.missedCalls.push(caller);
                GameState.phone.incomingCall = null;
                this.refreshPhonePanel();
                document.dispatchEvent(new CustomEvent('phone:ignored', { 
                    detail: { caller } 
                }));
            };
        }
    },
};

window.UIManager = UIManager;
