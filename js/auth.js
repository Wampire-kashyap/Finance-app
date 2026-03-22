/* ================================================================
   FINANCEFLOW — AUTH MODULE
   ================================================================ */
const Auth = {
    currentUser: null,

    init() {
        const saved = Store.get('currentUser');
        if (saved) {
            this.currentUser = saved;
            return true;
        }
        return false;
    },

    login(userId, password) {
        const users = Store.getAll('users');
        const user = users.find(u => u.id === userId);
        if (!user) return { ok: false, error: 'User not found' };
        if (user.password !== password) return { ok: false, error: 'Invalid password' };
        this.currentUser = user;
        Store.set('currentUser', user);
        addAuditLog('Login', user.name, `Logged in as ${user.role}`);
        return { ok: true, user };
    },

    logout() {
        addAuditLog('Logout', this.currentUser?.name || 'Unknown', '');
        this.currentUser = null;
        Store.set('currentUser', null);
    },

    getUser() {
        return this.currentUser;
    },

    hasRole(...roles) {
        if (!this.currentUser) return false;
        return roles.includes(this.currentUser.role);
    },

    canAccess(page) {
        const roleMap = {
            dashboard: ['admin', 'accountant', 'manager', 'ceo'],
            vendors: ['admin', 'accountant', 'manager', 'ceo'],
            categories: ['admin', 'accountant', 'manager'],
            invoices: ['admin', 'accountant', 'manager', 'ceo'],
            payments: ['admin', 'accountant', 'manager', 'ceo'],
            approvals: ['admin', 'manager', 'ceo'],
            reports: ['admin', 'accountant', 'manager', 'ceo'],
            users: ['admin'],
            audit: ['admin', 'ceo']
        };
        const allowed = roleMap[page] || ['admin'];
        return this.hasRole(...allowed);
    },

    // Get role display name
    roleName(role) {
        const names = { admin: 'Administrator', accountant: 'Accountant', manager: 'Manager', ceo: 'CEO' };
        return names[role] || role;
    }
};
