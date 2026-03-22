/* ================================================================
   FINANCEFLOW — APPLICATION BOOTSTRAP
   ================================================================ */
(function () {
    'use strict';

    // Seed database with demo data
    seedDatabase();

    // Navigation config
    const NAV_ITEMS = [
        { section: 'Main' },
        { page: 'dashboard', label: 'Dashboard', icon: Utils.icons.dashboard, roles: ['admin', 'accountant', 'manager', 'ceo'] },
        { page: 'invoices', label: 'Invoices', icon: Utils.icons.invoices, roles: ['admin', 'accountant', 'manager', 'ceo'] },
        { page: 'payments', label: 'Payments', icon: Utils.icons.payments, roles: ['admin', 'accountant', 'manager', 'ceo'] },
        { page: 'approvals', label: 'Approvals', icon: Utils.icons.approvals, roles: ['admin', 'manager', 'ceo'], badge: true },
        { section: 'Management' },
        { page: 'vendors', label: 'Vendors', icon: Utils.icons.vendors, roles: ['admin', 'accountant', 'manager', 'ceo'] },
        { page: 'categories', label: 'Categories', icon: Utils.icons.categories, roles: ['admin', 'accountant', 'manager'] },
        { page: 'reports', label: 'Reports', icon: Utils.icons.reports, roles: ['admin', 'accountant', 'manager', 'ceo'] },
        { section: 'System' },
        { page: 'users', label: 'Users', icon: Utils.icons.users, roles: ['admin'] },
        { page: 'audit', label: 'Audit Trail', icon: Utils.icons.audit, roles: ['admin', 'ceo'] }
    ];

    // Build sidebar navigation
    function buildNav() {
        const nav = document.getElementById('sidebar-nav');
        const user = Auth.getUser();
        let html = '';
        NAV_ITEMS.forEach(item => {
            if (item.section) {
                html += `<div class="nav-section-title">${item.section}</div>`;
                return;
            }
            if (!item.roles.includes(user.role)) return;
            let badge = '';
            if (item.badge && item.page === 'approvals') {
                const invoices = Store.getAll('invoices');
                let count = 0;
                if (Auth.hasRole('manager', 'admin')) count += invoices.filter(i => i.status === 'verified').length;
                if (Auth.hasRole('ceo', 'admin')) count += invoices.filter(i => i.workflow?.approved && !i.workflow?.ceoApproved).length;
                if (count > 0) badge = `<span class="nav-badge">${count}</span>`;
            }
            html += `<div class="nav-item" data-page="${item.page}" onclick="Router.navigate('${item.page}')">${item.icon}<span class="nav-label">${item.label}</span>${badge}</div>`;
        });
        nav.innerHTML = html;
    }

    // Update user info in sidebar
    function updateUserInfo() {
        const user = Auth.getUser();
        if (!user) return;
        document.getElementById('sidebar-avatar').textContent = Utils.initials(user.name);
        document.getElementById('sidebar-username').textContent = user.name;
        document.getElementById('sidebar-userrole').textContent = Auth.roleName(user.role);
    }

    // Login
    function handleLogin() {
        const userId = document.getElementById('login-user').value;
        const password = document.getElementById('login-password').value;
        const result = Auth.login(userId, password);
        if (result.ok) {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('app-shell').classList.remove('hidden');
            buildNav();
            updateUserInfo();
            Notifications.init();
            Router.init();
        } else {
            Utils.toast(result.error, 'error');
        }
    }

    // Logout
    function handleLogout() {
        Auth.logout();
        document.getElementById('app-shell').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        window.location.hash = '';
    }

    // Global search
    function setupGlobalSearch() {
        const input = document.getElementById('global-search');
        const dropdown = document.getElementById('search-results-dropdown');

        input.addEventListener('input', Utils.debounce(function () {
            const q = this.value.toLowerCase().trim();
            if (q.length < 2) { dropdown.classList.add('hidden'); return; }

            const results = [];
            // Search vendors
            Store.getAll('vendors').forEach(v => {
                if (v.name.toLowerCase().includes(q) || v.contact.toLowerCase().includes(q)) {
                    results.push({ type: 'vendor', label: v.name, sub: v.contact, id: v.id, page: 'vendors' });
                }
            });
            // Search invoices
            Store.getAll('invoices').forEach(i => {
                if (i.invoiceNo.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)) {
                    results.push({ type: 'invoice', label: i.invoiceNo, sub: Utils.currency(i.amount), id: i.id, page: 'invoices' });
                }
            });

            if (results.length === 0) {
                dropdown.innerHTML = '<div class="search-result-item"><span style="color:var(--text-tertiary)">No results found</span></div>';
            } else {
                dropdown.innerHTML = results.slice(0, 10).map(r => `
                    <div class="search-result-item" onclick="Router.navigate('${r.page}',{id:'${r.id}'});document.getElementById('search-results-dropdown').classList.add('hidden');document.getElementById('global-search').value='';">
                        <span class="search-result-type ${r.type}">${r.type}</span>
                        <div><div style="font-weight:500;font-size:var(--font-sm)">${Utils.escHtml(r.label)}</div><div style="font-size:var(--font-xs);color:var(--text-tertiary)">${Utils.escHtml(r.sub)}</div></div>
                    </div>
                `).join('');
            }
            dropdown.classList.remove('hidden');
        }, 250));

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!document.getElementById('global-search-box').contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }

    // Initialize
    function init() {
        // Populate login select
        const users = Store.getAll('users');
        const loginSelect = document.getElementById('login-user');
        loginSelect.innerHTML = users.map(u => `<option value="${u.id}">${u.name} (${Auth.roleName(u.role)})</option>`).join('');

        // Login button
        document.getElementById('login-btn').addEventListener('click', handleLogin);
        document.getElementById('login-password').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });

        // Password toggle
        document.getElementById('password-toggle').addEventListener('click', () => {
            const input = document.getElementById('login-password');
            input.type = input.type === 'password' ? 'text' : 'password';
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', handleLogout);

        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });

        // Mobile menu
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // Global search
        setupGlobalSearch();

        // Auto-login if session exists
        if (Auth.init()) {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('app-shell').classList.remove('hidden');
            buildNav();
            updateUserInfo();
            Notifications.init();
            Router.init();
        }
    }

    // Boot
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
