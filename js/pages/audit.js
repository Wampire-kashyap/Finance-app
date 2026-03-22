/* ================================================================
   FINANCEFLOW — AUDIT LOG PAGE
   ================================================================ */
const AuditPage = {
    currentPage: 1,
    perPage: 25,
    filters: { action: '', user: '', dateFrom: '', dateTo: '' },

    render() {
        let logs = Store.getAll('auditLogs').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const users = Store.getAll('users');
        const f = this.filters;

        if (f.action) logs = logs.filter(l => l.action.toLowerCase().includes(f.action.toLowerCase()));
        if (f.user) logs = logs.filter(l => l.userId === f.user);
        if (f.dateFrom) logs = logs.filter(l => l.timestamp >= f.dateFrom);
        if (f.dateTo) logs = logs.filter(l => l.timestamp <= f.dateTo + 'T23:59:59');

        const total = logs.length;
        const paged = logs.slice((this.currentPage - 1) * this.perPage, this.currentPage * this.perPage);

        // Action color
        const actionColor = (action) => {
            if (action.includes('Created') || action.includes('Login')) return 'badge-success';
            if (action.includes('Deleted') || action.includes('Rejected')) return 'badge-danger';
            if (action.includes('Updated') || action.includes('Approved')) return 'badge-accent';
            if (action.includes('Payment')) return 'badge-info';
            if (action.includes('Export')) return 'badge-warning';
            return 'badge-neutral';
        };

        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="page-header">
                <div><h1>Audit Trail</h1><div class="page-header-sub">${total} audit entries</div></div>
                <div class="page-header-actions">
                    <button class="btn btn-secondary" onclick="AuditPage.exportAudit()">${Utils.icons.download} Export Log</button>
                </div>
            </div>

            <div class="filter-bar">
                <input type="text" class="form-input" placeholder="Filter by action..." value="${Utils.escHtml(f.action)}" oninput="AuditPage.filters.action=this.value;AuditPage.currentPage=1;AuditPage.render()">
                <select class="form-select" onchange="AuditPage.filters.user=this.value;AuditPage.currentPage=1;AuditPage.render()">
                    <option value="">All Users</option>
                    ${users.map(u => `<option value="${u.id}" ${f.user === u.id ? 'selected' : ''}>${u.name}</option>`).join('')}
                </select>
                <input type="date" class="form-input" style="min-width:140px" value="${f.dateFrom}" onchange="AuditPage.filters.dateFrom=this.value;AuditPage.currentPage=1;AuditPage.render()">
                <input type="date" class="form-input" style="min-width:140px" value="${f.dateTo}" onchange="AuditPage.filters.dateTo=this.value;AuditPage.currentPage=1;AuditPage.render()">
                <button class="btn btn-ghost btn-sm" onclick="AuditPage.filters={action:'',user:'',dateFrom:'',dateTo:''};AuditPage.currentPage=1;AuditPage.render()">Clear</button>
            </div>

            <div class="card">
                <div class="table-wrap">
                    <table class="data-table">
                        <thead><tr><th>Timestamp</th><th>User</th><th>Role</th><th>Action</th><th>Target</th><th>Details</th></tr></thead>
                        <tbody>
                            ${paged.map(l => `
                                <tr>
                                    <td style="white-space:nowrap">${Utils.formatDateTime(l.timestamp)}</td>
                                    <td class="cell-primary">${Utils.escHtml(l.userName)}</td>
                                    <td><span class="badge badge-neutral">${Auth.roleName(l.userRole)}</span></td>
                                    <td><span class="badge ${actionColor(l.action)}">${Utils.escHtml(l.action)}</span></td>
                                    <td class="cell-primary">${Utils.escHtml(l.target)}</td>
                                    <td style="color:var(--text-tertiary);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${Utils.escHtml(l.details)}">${Utils.escHtml(l.details || '—')}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="6"><div class="empty-state"><p>No audit records</p></div></td></tr>'}
                        </tbody>
                    </table>
                </div>
                ${Components.pagination(total, this.currentPage, this.perPage, 'AuditPage.goToPage')}
            </div>
        `;
    },

    goToPage(page) { this.currentPage = page; this.render(); },

    exportAudit() {
        const logs = Store.getAll('auditLogs').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const data = logs.map(l => ({
            'Timestamp': Utils.formatDateTime(l.timestamp),
            'User': l.userName,
            'Role': l.userRole,
            'Action': l.action,
            'Target': l.target,
            'Details': l.details
        }));
        Utils.exportCSV(data, `FinanceFlow_AuditLog_${new Date().toISOString().split('T')[0]}.csv`);
        Utils.toast('Audit log exported', 'success');
    }
};
