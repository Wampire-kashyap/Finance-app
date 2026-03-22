/* ================================================================
   FINANCEFLOW — ROUTER (SPA hash-based routing)
   ================================================================ */
const Router = {
    current: 'dashboard',
    params: {},

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    navigate(page, params = {}) {
        this.params = params;
        let hash = '#/' + page;
        if (params.id) hash += '/' + params.id;
        window.location.hash = hash;
    },

    handleRoute() {
        const hash = window.location.hash.replace('#/', '') || 'dashboard';
        const parts = hash.split('/');
        const page = parts[0];
        if (parts[1]) this.params.id = parts[1];

        if (!Auth.canAccess(page)) {
            Utils.toast('Access denied', 'error');
            this.navigate('dashboard');
            return;
        }

        this.current = page;
        this.render();
        this.updateNav();
    },

    render() {
        const content = document.getElementById('page-content');
        content.style.animation = 'none';
        content.offsetHeight; // trigger reflow
        content.style.animation = 'fadeIn 0.3s ease';

        switch (this.current) {
            case 'dashboard': DashboardPage.render(); break;
            case 'vendors': VendorsPage.render(this.params); break;
            case 'categories': CategoriesPage.render(this.params); break;
            case 'invoices': InvoicesPage.render(this.params); break;
            case 'payments': PaymentsPage.render(this.params); break;
            case 'approvals': ApprovalsPage.render(); break;
            case 'reports': ReportsPage.render(); break;
            case 'users': UsersPage.render(); break;
            case 'audit': AuditPage.render(); break;
            default: DashboardPage.render();
        }
        // Reset params after render
        this.params = {};
    },

    updateNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === this.current);
        });
    }
};
