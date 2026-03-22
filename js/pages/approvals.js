/* ================================================================
   FINANCEFLOW — APPROVALS PAGE
   ================================================================ */
const ApprovalsPage = {
    render() {
        const user = Auth.getUser();
        const invoices = Store.getAll('invoices');

        // Items pending for current user's role
        let pendingItems = [];
        if (Auth.hasRole('manager', 'admin')) {
            pendingItems = pendingItems.concat(invoices.filter(i => i.status === 'verified'));
        }
        if (Auth.hasRole('ceo', 'admin')) {
            pendingItems = pendingItems.concat(invoices.filter(i => i.workflow?.approved && !i.workflow?.ceoApproved && i.status !== 'rejected'));
        }
        // Remove duplicates 
        const seen = new Set();
        pendingItems = pendingItems.filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true; });

        // Approval history
        const approvalLogs = Store.getAll('auditLogs')
            .filter(l => l.action.includes('Approved') || l.action.includes('Rejected') || l.action.includes('verify'))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 15);

        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="page-header">
                <div><h1>Approvals</h1><div class="page-header-sub">${pendingItems.length} items awaiting your review</div></div>
            </div>

            <div class="tabs">
                <div class="tab-item active" onclick="ApprovalsPage.switchTab(this, 'pending')">Pending (${pendingItems.length})</div>
                <div class="tab-item" onclick="ApprovalsPage.switchTab(this, 'history')">History</div>
            </div>

            <div id="approvals-tab-pending">
                ${pendingItems.length ? pendingItems.map(inv => {
                    const vendor = Store.find('vendors', inv.vendorId);
                    const isOverdue = new Date(inv.dueDate) < new Date();
                    const needsCEO = inv.workflow?.approved && !inv.workflow?.ceoApproved;
                    return `<div class="approval-card">
                        <div class="approval-card-header">
                            <div>
                                <div class="approval-card-title">${Utils.escHtml(inv.invoiceNo)} ${Components.highValueFlag(inv.amount)}</div>
                                <div style="font-size:var(--font-sm);color:var(--text-secondary)">${Utils.escHtml(inv.description)}</div>
                            </div>
                            <div style="text-align:right">
                                <div style="font-size:var(--font-lg);font-weight:700;color:var(--accent)">${Utils.currency(inv.amount)}</div>
                                ${Components.statusBadge(inv.status)}
                            </div>
                        </div>
                        <div class="approval-card-meta">
                            <div class="approval-meta-item">${Utils.icons.vendors} ${vendor ? vendor.name : '—'}</div>
                            <div class="approval-meta-item">${Utils.icons.calendar} ${Utils.formatDate(inv.invoiceDate)}</div>
                            <div class="approval-meta-item">${Utils.icons.clock} Due: ${Utils.formatDate(inv.dueDate)} ${isOverdue ? '<span style="color:var(--danger)"> (Overdue)</span>' : ''}</div>
                            <div class="approval-meta-item">${Utils.icons.categories} ${Components.categoryName(inv.categoryId)}</div>
                        </div>
                        ${Components.stepProgress(Components.getWorkflowSteps(inv))}
                        <div class="approval-actions" style="margin-top:12px">
                            <button class="btn btn-ghost btn-sm" onclick="Router.navigate('invoices',{id:'${inv.id}'})">${Utils.icons.eye} View Details</button>
                            ${needsCEO && Auth.hasRole('ceo','admin') ? `
                                <button class="btn btn-success btn-sm" onclick="InvoicesPage.advanceStatus('${inv.id}','ceoApprove')">✓ CEO Approve</button>
                                <button class="btn btn-danger btn-sm" onclick="InvoicesPage.rejectInvoice('${inv.id}')">✗ Reject</button>
                            ` : ''}
                            ${!needsCEO && Auth.hasRole('manager','admin') ? `
                                <button class="btn btn-success btn-sm" onclick="InvoicesPage.advanceStatus('${inv.id}','approve')">✓ Approve</button>
                                <button class="btn btn-danger btn-sm" onclick="InvoicesPage.rejectInvoice('${inv.id}')">✗ Reject</button>
                            ` : ''}
                        </div>
                    </div>`;
                }).join('') : '<div class="empty-state" style="padding:48px"><div class="empty-state-icon">${Utils.icons.approvals}</div><h3>All caught up!</h3><p>No pending approvals at the moment.</p></div>'}
            </div>

            <div id="approvals-tab-history" class="hidden">
                <div class="card">
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead><tr><th>Date</th><th>Action</th><th>Invoice</th><th>By</th><th>Details</th></tr></thead>
                            <tbody>
                                ${approvalLogs.map(l => `
                                    <tr>
                                        <td>${Utils.formatDateTime(l.timestamp)}</td>
                                        <td>${l.action.includes('Reject') ? '<span class="badge badge-danger">Rejected</span>' : '<span class="badge badge-success">Approved</span>'}</td>
                                        <td class="cell-primary">${Utils.escHtml(l.target)}</td>
                                        <td>${Utils.escHtml(l.userName)}</td>
                                        <td style="color:var(--text-tertiary)">${Utils.escHtml(l.details)}</td>
                                    </tr>
                                `).join('') || '<tr><td colspan="5"><div class="empty-state"><p>No approval history yet</p></div></td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    switchTab(el, tab) {
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
        document.getElementById('approvals-tab-pending').classList.toggle('hidden', tab !== 'pending');
        document.getElementById('approvals-tab-history').classList.toggle('hidden', tab !== 'history');
    }
};
