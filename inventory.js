/**
 * CASE FILES - Inventory & Evidence System
 */

const InventorySystem = {
    init() {
        // Setup evidence collection handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('evidence-collect')) {
                this.collectCurrentEvidence();
            }
        });
    },
    
    collectCurrentEvidence() {
        // Get current evidence from popup
        const popup = document.querySelector('.evidence-popup');
        if (!popup) return;
        
        const evidenceId = popup.dataset.evidenceId;
        const evidence = this.pendingEvidence;
        
        if (evidence) {
            const added = GameState.addEvidence(evidence);
            
            if (added) {
                // Play collection animation/sound
                AudioManager.play('whoosh');
                
                // Show notification
                this.showCollectionNotification(evidence.name);
            }
        }
        
        // Close popup
        popup.classList.add('hidden');
        this.pendingEvidence = null;
    },
    
    showEvidencePopup(evidence) {
        const popup = document.querySelector('.evidence-popup');
        if (!popup) return;
        
        this.pendingEvidence = evidence;
        popup.dataset.evidenceId = evidence.id;
        
        const image = popup.querySelector('.evidence-image');
        const description = popup.querySelector('.evidence-description');
        
        if (image && evidence.image) {
            image.style.backgroundImage = `url(${evidence.image})`;
            image.style.backgroundSize = 'contain';
            image.style.backgroundPosition = 'center';
            image.style.backgroundRepeat = 'no-repeat';
        }
        
        if (description) {
            description.textContent = evidence.description;
        }
        
        popup.classList.remove('hidden');
    },
    
    hideEvidencePopup() {
        const popup = document.querySelector('.evidence-popup');
        if (popup) {
            popup.classList.add('hidden');
            this.pendingEvidence = null;
        }
    },
    
    showCollectionNotification(itemName) {
        // Create floating notification
        const notification = document.createElement('div');
        notification.className = 'collection-notification';
        notification.innerHTML = `
            <span class="collection-icon">📎</span>
            <span class="collection-text">Evidence collected: ${itemName}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(201, 162, 39, 0.9);
            color: #0a0a0a;
            padding: 12px 24px;
            font-family: var(--font-mono);
            font-size: 0.9rem;
            border-radius: 4px;
            z-index: 100;
            animation: fade-in-up 0.3s ease-out forwards;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fade-out 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    },
    
    hasEvidence(evidenceId) {
        return GameState.evidence.some(e => e.id === evidenceId);
    },
    
    getEvidence(evidenceId) {
        return GameState.evidence.find(e => e.id === evidenceId);
    },
};

window.InventorySystem = InventorySystem;
