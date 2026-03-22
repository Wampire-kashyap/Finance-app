/* ================================================================
   FINANCEFLOW — DATA STORE (localStorage persistence)
   ================================================================ */
const Store = {
    get(key) {
        try {
            const data = localStorage.getItem('ff_' + key);
            return data ? JSON.parse(data) : null;
        } catch { return null; }
    },
    set(key, value) {
        try {
            localStorage.setItem('ff_' + key, JSON.stringify(value));
        } catch (e) { console.error('Store set error:', e); }
    },
    getAll(key) {
        return this.get(key) || [];
    },
    add(key, item) {
        const arr = this.getAll(key);
        arr.push(item);
        this.set(key, arr);
        return item;
    },
    update(key, id, updates) {
        const arr = this.getAll(key);
        const idx = arr.findIndex(i => i.id === id);
        if (idx !== -1) {
            arr[idx] = { ...arr[idx], ...updates, updatedAt: new Date().toISOString() };
            this.set(key, arr);
            return arr[idx];
        }
        return null;
    },
    remove(key, id) {
        const arr = this.getAll(key).filter(i => i.id !== id);
        this.set(key, arr);
    },
    find(key, id) {
        return this.getAll(key).find(i => i.id === id) || null;
    },
    // Clear all FinanceFlow data
    clearAll() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('ff_'));
        keys.forEach(k => localStorage.removeItem(k));
    }
};

// Audit logging helper
function addAuditLog(action, target, details = '') {
    const user = Store.get('currentUser');
    Store.add('auditLogs', {
        id: Utils.uid(),
        action,
        target,
        details,
        userId: user ? user.id : 'system',
        userName: user ? user.name : 'System',
        userRole: user ? user.role : 'system',
        timestamp: new Date().toISOString()
    });
}

// Notification helper
function addNotification(title, message, type = 'info', forRoles = []) {
    Store.add('notifications', {
        id: Utils.uid(),
        title,
        message,
        type,
        forRoles,
        read: false,
        createdAt: new Date().toISOString()
    });
}

// High-value threshold (configurable)
const HIGH_VALUE_THRESHOLD = 500000; // 5 Lakh
