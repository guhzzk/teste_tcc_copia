// ===== TOAST NOTIFICATION SYSTEM =====
// Substitui os alert() do navegador por notificações bonitas

(function() {
    const ICONS = {
        success: '✅',
        error:   '❌',
        info:    'ℹ️',
        warning: '⚠️'
    };

    function getOrCreateContainer() {
        let c = document.getElementById('toast-container');
        if (!c) {
            c = document.createElement('div');
            c.id = 'toast-container';
            document.body.appendChild(c);
        }
        return c;
    }

    window.showToast = function(message, type = 'info', duration = 3500) {
        const container = getOrCreateContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.setProperty('--dur', duration + 'ms');

        // limpa emojis duplicados do começo da mensagem
        const limpa = message.replace(/^[✅❌⚠️ℹ️📧🔄]\s*/u, '');

        toast.innerHTML = `<span class="toast-icon">${ICONS[type] || ICONS.info}</span><span>${limpa}</span>`;
        toast.addEventListener('click', () => removeToast(toast));

        container.appendChild(toast);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('show'));
        });

        setTimeout(() => removeToast(toast), duration);
    };

    function removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 350);
    }

    // Atalhos
    window.toastSucesso  = (msg, dur) => showToast(msg, 'success', dur);
    window.toastErro     = (msg, dur) => showToast(msg, 'error', dur);
    window.toastInfo     = (msg, dur) => showToast(msg, 'info', dur);
    window.toastAviso    = (msg, dur) => showToast(msg, 'warning', dur);
})();
