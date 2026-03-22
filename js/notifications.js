/* ================================================================
   FINANCEFLOW — NOTIFICATIONS MODULE
   ================================================================ */
const Notifications = {
    init() {
        this.updateBadge();
        document.getElementById('notification-bell').addEventListener('click', () => this.togglePanel());
        document.getElementById('mark-all-read').addEventListener('click', () => this.markAllRead());
        // Close panel on outside click
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notification-panel');
            const bell = document.getElementById('notification-bell');
            if (!panel.contains(e.target) && !bell.contains(e.target)) {
                panel.classList.add('hidden');
            }
        });
    },

    getForUser() {
        const user = Auth.getUser();
        if (!user) return [];
        return Store.getAll('notifications')
            .filter(n => n.forRoles.length === 0 || n.forRoles.includes(user.role))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    getUnreadCount() {
        return this.getForUser().filter(n => !n.read).length;
    },

    updateBadge() {
        const count = this.getUnreadCount();
        const badge = document.getElementById('notification-count');
        badge.textContent = count > 9 ? '9+' : count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    },

    togglePanel() {
        const panel = document.getElementById('notification-panel');
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) this.renderList();
    },

    renderList() {
        const list = document.getElementById('notification-list');
        const notifications = this.getForUser().slice(0, 20);
        if (notifications.length === 0) {
            list.innerHTML = '<div class="notif-empty">No notifications</div>';
            return;
        }
        list.innerHTML = notifications.map(n => `
            <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}" onclick="Notifications.markRead('${n.id}')">
                <div class="notif-item-title">${Utils.escHtml(n.title)}</div>
                <div class="notif-item-desc">${Utils.escHtml(n.message)}</div>
                <div class="notif-item-time">${Utils.timeAgo(n.createdAt)}</div>
            </div>
        `).join('');
    },

    markRead(id) {
        Store.update('notifications', id, { read: true });
        this.renderList();
        this.updateBadge();
    },

    markAllRead() {
        const all = Store.getAll('notifications');
        all.forEach(n => n.read = true);
        Store.set('notifications', all);
        this.renderList();
        this.updateBadge();
    }
};
