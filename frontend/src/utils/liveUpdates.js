import { CapacitorUpdater } from '@capgo/capacitor-updater';

/**
 * Live Updates Manager using Capgo
 * Handles OTA updates for the mobile app
 */

class LiveUpdatesManager {
    constructor() {
        this.isInitialized = false;
        this.updateAvailable = false;
    }

    /**
     * Initialize the live updates system
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Only run on mobile devices
            if (!this.isMobile()) {
                console.log('Live updates: Skipping on web platform');
                return;
            }

            console.log('🔄 Initializing live updates...');

            // Listen for update events
            CapacitorUpdater.addListener('updateAvailable', (info) => {
                console.log('✅ Update available:', info);
                this.updateAvailable = true;
                this.notifyUser(info);
            });

            CapacitorUpdater.addListener('downloadComplete', (info) => {
                console.log('📥 Download complete:', info);
            });

            CapacitorUpdater.addListener('updateFailed', (info) => {
                console.error('❌ Update failed:', info);
            });

            // Notify current version
            const current = await CapacitorUpdater.current();
            console.log('📱 Current version:', current);

            // Check for updates
            await this.checkForUpdate();

            this.isInitialized = true;
        } catch (error) {
            console.error('Error initializing live updates:', error);
        }
    }

    /**
     * Check if running on mobile device
     */
    isMobile() {
        return window.Capacitor && window.Capacitor.isNativePlatform();
    }

    /**
     * Check for available updates
     */
    async checkForUpdate() {
        try {
            const update = await CapacitorUpdater.download({
                url: 'https://api.capgo.app/updates'
            });

            if (update) {
                console.log('🎉 New update downloaded:', update);
                return true;
            }
        } catch (error) {
            console.error('Error checking for updates:', error);
        }
        return false;
    }

    /**
     * Notify user about available update
     */
    notifyUser(updateInfo) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideUp 0.3s ease;
        `;

        notification.innerHTML = `
            <span style="font-size: 24px;">🎉</span>
            <div>
                <div style="font-size: 14px; margin-bottom: 4px;">New update available!</div>
                <div style="font-size: 12px; opacity: 0.9;">Restart app to apply</div>
            </div>
            <button style="
                background: white;
                color: #667eea;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                margin-left: 12px;
            " onclick="window.location.reload()">
                Restart Now
            </button>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            notification.remove();
        }, 10000);
    }

    /**
     * Manually trigger update installation
     */
    async installUpdate() {
        try {
            await CapacitorUpdater.set({
                id: this.updateAvailable
            });
            window.location.reload();
        } catch (error) {
            console.error('Error installing update:', error);
        }
    }

    /**
     * Get current app version
     */
    async getCurrentVersion() {
        try {
            const current = await CapacitorUpdater.current();
            return current.bundle;
        } catch (error) {
            console.error('Error getting current version:', error);
            return null;
        }
    }
}

// Export singleton instance
export const liveUpdates = new LiveUpdatesManager();
export default liveUpdates;
