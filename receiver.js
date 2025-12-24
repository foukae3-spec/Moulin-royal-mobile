// Mobile Receiver for Picker Labels
// Uses WebSocket to receive labels pushed from the PC

class LabelReceiver {
    constructor() {
        this.labels = [];
        this.connectionCode = this.getOrCreateCode();
        this.ws = null;
        this.wsUrl = 'wss://free.blr2.piesocket.com/v3/moulinroyal?api_key=oCdCMcMPQpbvNjUIzqtvF1d2X2okWpDQQYAsgTUf&notify_self=1';

        this.init();
    }

    getOrCreateCode() {
        // Try to load saved code from localStorage
        const savedCode = localStorage.getItem('mr_mobile_connection_code');
        if (savedCode && savedCode.length === 4) {
            return savedCode;
        }
        // Generate new code and save it
        const newCode = Math.floor(1000 + Math.random() * 9000).toString();
        localStorage.setItem('mr_mobile_connection_code', newCode);
        return newCode;
    }

    init() {
        // Display connection code
        document.getElementById('connectionCode').textContent = this.connectionCode;

        // Setup clear button
        document.getElementById('clearBtn').addEventListener('click', () => this.clearLabels());

        // Setup regenerate code button
        const regenerateBtn = document.getElementById('regenerateCode');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => this.regenerateCode());
        }

        // Connect to WebSocket
        this.connect();

        // Load saved labels from localStorage
        this.loadSavedLabels();
    }

    regenerateCode() {
        if (confirm('هل تريد تغيير رمز الاتصال؟ ستحتاج لإدخال الرمز الجديد في التطبيق.')) {
            // Generate new code
            const newCode = Math.floor(1000 + Math.random() * 9000).toString();
            localStorage.setItem('mr_mobile_connection_code', newCode);
            this.connectionCode = newCode;

            // Update display
            document.getElementById('connectionCode').textContent = newCode;

            // Reconnect with new code
            if (this.ws) {
                this.ws.close();
            }
            this.connect();
        }
    }

    connect() {
        try {
            this.ws = new WebSocket(this.wsUrl);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                // Register this device with its code
                this.ws.send(JSON.stringify({
                    type: 'register',
                    code: this.connectionCode,
                    device: 'mobile'
                }));
                this.updateStatus(true);
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('Received:', data);

                    if (data.type === 'label' && data.targetCode === this.connectionCode) {
                        this.addLabel(data.label);
                        this.vibrate();
                    }
                } catch (e) {
                    console.error('Error parsing message:', e);
                }
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.updateStatus(false);
                // Reconnect after 3 seconds
                setTimeout(() => this.connect(), 3000);
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateStatus(false);
            };
        } catch (e) {
            console.error('Connection error:', e);
            this.updateStatus(false);
            setTimeout(() => this.connect(), 5000);
        }
    }

    updateStatus(connected) {
        const statusEl = document.getElementById('connectionStatus');
        const statusText = document.getElementById('statusText');

        if (connected) {
            statusEl.className = 'connection-status status-connected';
            statusText.textContent = 'متصل ✓';
        } else {
            statusEl.className = 'connection-status status-waiting';
            statusText.textContent = 'في انتظار الاتصال...';
        }
    }

    vibrate() {
        // Vibrate if supported
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }

        // Visual feedback
        const container = document.getElementById('labelsContainer');
        container.classList.add('vibrate');
        setTimeout(() => container.classList.remove('vibrate'), 500);

        // Play notification sound
        this.playSound();
    }

    playSound() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
            console.log('Could not play sound:', e);
        }
    }

    addLabel(label) {
        // Add timestamp
        label.receivedAt = new Date().toLocaleTimeString('ar-DZ');

        // Add to beginning of array
        this.labels.unshift(label);

        // Save to localStorage
        this.saveLabels();

        // Render
        this.renderLabels();
    }

    renderLabels() {
        const container = document.getElementById('labelsContainer');
        const emptyState = document.getElementById('emptyState');
        const clearBtn = document.getElementById('clearBtn');

        if (this.labels.length === 0) {
            emptyState.style.display = 'block';
            clearBtn.style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        clearBtn.style.display = 'block';

        // Keep empty state element but hide it
        let html = '<div class="empty-state" id="emptyState" style="display: none;"><div class="empty-icon">📦</div><p>لا توجد ملصقات بعد</p></div>';

        this.labels.forEach((label, index) => {
            // Calculate total units if not provided (backwards compatibility)
            const totalUnits = label.totalUnits || label.items.reduce((sum, item) => sum + item.quantity, 0);

            html += `
                <div class="label-card" ${index === 0 ? 'style="border-color: #f59e0b;"' : ''}>
                    <div class="label-header">
                        <span class="order-id">#${label.orderId}</span>
                        <span class="total-units-badge">${totalUnits} وحدة</span>
                        <span class="order-time">${label.receivedAt}</span>
                    </div>
                    <div class="customer-name">${label.customerName}</div>
                    <div class="items-list">
                        ${label.items.map(item => `
                            <div class="item-row">
                                <span class="item-qty">${item.quantity}</span>
                                <div class="item-details">
                                    <div class="item-name">${item.name}</div>
                                    ${item.meta ? `<div class="item-meta">${item.meta}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="label-footer">
                        <span class="total-check">✓ إجمالي: ${totalUnits} وحدة</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    clearLabels() {
        if (confirm('هل تريد مسح جميع الملصقات؟')) {
            this.labels = [];
            this.saveLabels();
            this.renderLabels();
        }
    }

    saveLabels() {
        try {
            localStorage.setItem('mr_mobile_labels', JSON.stringify(this.labels));
        } catch (e) {
            console.error('Could not save labels:', e);
        }
    }

    loadSavedLabels() {
        try {
            const saved = localStorage.getItem('mr_mobile_labels');
            if (saved) {
                this.labels = JSON.parse(saved);
                this.renderLabels();
            }
        } catch (e) {
            console.error('Could not load labels:', e);
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.labelReceiver = new LabelReceiver();

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then((reg) => console.log('Service Worker registered:', reg.scope))
            .catch((err) => console.error('Service Worker registration failed:', err));
    }
});
