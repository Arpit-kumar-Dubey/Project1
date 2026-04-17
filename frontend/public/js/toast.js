/**
 * Toast Notification System
 * Usage: showToast('message', 'success' | 'error' | 'info' | 'warning')
 */
(function () {
    // Ensure container exists
    function getContainer() {
        let c = document.getElementById('toast-container');
        if (!c) {
            c = document.createElement('div');
            c.id = 'toast-container';
            document.body.appendChild(c);
        }
        return c;
    }

    const ICONS = {
        success: '✅',
        error:   '❌',
        info:    'ℹ️',
        warning: '⚠️'
    };

    window.showToast = function (message, type = 'info', duration = 3500) {
        const container = getContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        toast.innerHTML = `
            <span class="toast-icon">${ICONS[type] || 'ℹ️'}</span>
            <span class="toast-msg">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.35s ease forwards';
            setTimeout(() => toast.remove(), 350);
        }, duration);
    };

    // Check for flash messages from URL params (used by backend redirects)
    window.addEventListener('DOMContentLoaded', function () {
        const params = new URLSearchParams(window.location.search);
        const msg  = params.get('msg');
        const type = params.get('type') || 'info';
        if (msg) {
            showToast(decodeURIComponent(msg), type);
            // Remove query params from URL without reload
            const clean = window.location.pathname;
            window.history.replaceState({}, '', clean);
        }
    });
})();
