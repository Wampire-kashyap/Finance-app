/* ================================================================
   FINANCEFLOW — PAYMENTS PAGE
   ================================================================ */
const PaymentsPage = {
    render(params = {}) {
        if (params.id) { this.renderDetail(params.id); return; }
        this.renderList();
    },

    renderList() {
        const invoices = Store.getAll('invoices');
        // Group by status for pipeline view
        const pipeline = {
            received: invoices.filter(i => i.status === 'received'),
            verified: invoices.filter(i => i.status === 'verified'),
            approved: invoices.filter(i => i.status === 'approved'),
            paid: invoices.filter(i => i.status === 'paid')
        };

        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="page-header">
                <div><h1>Payment Tracker</h1><div class="page-header-sub">Visual pipeline of all payment stages</div></div>
            </div>

            <!-- Summary KPIs -->
            <div class="kpi-grid">
                <div class="kpi-card info"><div class="kpi-label">Received</div><div class="kpi-value">${pipeline.received.length}</div><div class="kpi-change">${Utils.currency(pipeline.received.reduce((s,i)=>s+i.amount,0))}</div></div>
                <div class="kpi-card accent"><div class="kpi-label">Verified</div><div class="kpi-value">${pipeline.verified.length}</div><div class="kpi-change">${Utils.currency(pipeline.verified.reduce((s,i)=>s+i.amount,0))}</div></div>
                <div class="kpi-card warning"><div class="kpi-label">Approved</div><div class="kpi-value">${pipeline.approved.length}</div><div class="kpi-change">${Utils.currency(pipeline.approved.reduce((s,i)=>s+i.amount,0))}</div></div>
                <div class="kpi-card success"><div class="kpi-label">Paid</div><div class="kpi-value">${pipeline.paid.length}</div><div class="kpi-change">${Utils.currency(pipeline.paid.reduce((s,i)=>s+i.amount,0))}</div></div>
            </div>

            <!-- Pipeline columns -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;">
                ${Object.entries(pipeline).map(([status, items]) => `
                    <div class="card">
                        <div class="card-header">
                            <h3 style="display:flex;align-items:center;gap:6px">${Components.statusBadge(status)} <span>${items.length}</span></h3>
                        </div>
                        <div class="card-body" style="padding:10px;max-height:500px;overflow-y:auto">
                            ${items.length ? items.map(inv => `
                                <div class="approval-card" style="cursor:pointer" onclick="Router.navigate('invoices',{id:'${inv.id}'})">
                                    <div style="font-weight:600;font-size:var(--font-sm)">${Utils.escHtml(inv.invoiceNo)}</div>
                                    <div style="font-size:var(--font-xs);color:var(--text-tertiary);margin:4px 0">${Components.vendorName(inv.vendorId)}</div>
                                    <div style="font-weight:700;color:var(--accent)">${Utils.currency(inv.amount)}</div>
                                    <div style="font-size:var(--font-xs);color:var(--text-muted);margin-top:4px">${Utils.formatDate(inv.invoiceDate)}</div>
                                    ${inv.amount >= HIGH_VALUE_THRESHOLD ? '<div style="margin-top:6px">' + Components.highValueFlag(inv.amount) + '</div>' : ''}
                                </div>
                            `).join('') : '<div class="empty-state" style="padding:24px"><p style="font-size:var(--font-xs)">No items</p></div>'}
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Recent Payments Table -->
            <div class="card" style="margin-top:24px">
                <div class="card-header"><h3>Recent Payments</h3></div>
                <div class="table-wrap">
                    <table class="data-table">
                        <thead><tr><th>Invoice</th><th>Vendor</th><th>Amount</th><th>Method</th><th>Paid On</th><th>Paid By</th></tr></thead>
                        <tbody>
                            ${pipeline.paid.sort((a,b)=>new Date(b.workflow?.paid?.date||0)-new Date(a.workflow?.paid?.date||0)).slice(0,10).map(inv => `
                                <tr style="cursor:pointer" onclick="Router.navigate('invoices',{id:'${inv.id}'})">
                                    <td class="cell-primary">${Utils.escHtml(inv.invoiceNo)}</td>
                                    <td>${Components.vendorName(inv.vendorId)}</td>
                                    <td class="cell-primary">${Utils.currency(inv.amount)}</td>
                                    <td>${inv.workflow?.paid?.method || '—'}</td>
                                    <td>${Utils.formatDateTime(inv.workflow?.paid?.date)}</td>
                                    <td>${Components.userName(inv.workflow?.paid?.by)}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="6"><div class="empty-state"><p>No paid invoices yet</p></div></td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderDetail(invId) {
        // Redirect to invoice detail
        Router.navigate('invoices', { id: invId });
    }
};
