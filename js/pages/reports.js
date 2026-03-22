/* ================================================================
   FINANCEFLOW — REPORTS PAGE
   ================================================================ */
const ReportsPage = {
    filters: { vendor: '', status: '', category: '', dateFrom: '', dateTo: '' },

    render() {
        const invoices = Store.getAll('invoices');
        const vendors = Store.getAll('vendors');
        const categories = Store.getAll('categories');
        const f = this.filters;

        let filtered = [...invoices];
        if (f.vendor) filtered = filtered.filter(i => i.vendorId === f.vendor);
        if (f.status) filtered = filtered.filter(i => i.status === f.status);
        if (f.category) filtered = filtered.filter(i => i.categoryId === f.category);
        if (f.dateFrom) filtered = filtered.filter(i => i.invoiceDate >= f.dateFrom);
        if (f.dateTo) filtered = filtered.filter(i => i.invoiceDate <= f.dateTo);

        const totalAmount = filtered.reduce((s, i) => s + i.amount, 0);
        const paidAmount = filtered.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
        const pendingAmount = totalAmount - paidAmount;

        // Category chart data
        const catChart = categories.map(c => {
            const val = filtered.filter(i => i.categoryId === c.id).reduce((s, i) => s + i.amount, 0);
            return { label: c.name, value: val, color: c.color };
        }).filter(d => d.value > 0);

        // Vendor spending
        const vendorSpend = {};
        filtered.forEach(inv => {
            const vn = Components.vendorName(inv.vendorId);
            vendorSpend[vn] = (vendorSpend[vn] || 0) + inv.amount;
        });
        const vendorChartData = Object.entries(vendorSpend).map(([label, value]) => ({ label, shortLabel: label.substring(0, 6), value })).sort((a, b) => b.value - a.value).slice(0, 8);

        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="page-header">
                <div><h1>Reports</h1><div class="page-header-sub">Generate filtered reports and export data</div></div>
                <div class="page-header-actions">
                    <button class="btn btn-secondary" onclick="ReportsPage.exportCSV()">${Utils.icons.download} Export CSV</button>
                </div>
            </div>

            <div class="filter-bar">
                <select class="form-select" onchange="ReportsPage.filters.vendor=this.value;ReportsPage.render()">
                    <option value="">All Vendors</option>
                    ${vendors.map(v => `<option value="${v.id}" ${f.vendor === v.id ? 'selected' : ''}>${v.name}</option>`).join('')}
                </select>
                <select class="form-select" onchange="ReportsPage.filters.status=this.value;ReportsPage.render()">
                    <option value="">All Status</option>
                    <option value="received" ${f.status==='received'?'selected':''}>Received</option>
                    <option value="verified" ${f.status==='verified'?'selected':''}>Verified</option>
                    <option value="approved" ${f.status==='approved'?'selected':''}>Approved</option>
                    <option value="paid" ${f.status==='paid'?'selected':''}>Paid</option>
                </select>
                <select class="form-select" onchange="ReportsPage.filters.category=this.value;ReportsPage.render()">
                    <option value="">All Categories</option>
                    ${categories.map(c => `<option value="${c.id}" ${f.category===c.id?'selected':''}>${c.name}</option>`).join('')}
                </select>
                <input type="date" class="form-input" style="min-width:140px" value="${f.dateFrom}" onchange="ReportsPage.filters.dateFrom=this.value;ReportsPage.render()">
                <input type="date" class="form-input" style="min-width:140px" value="${f.dateTo}" onchange="ReportsPage.filters.dateTo=this.value;ReportsPage.render()">
                <button class="btn btn-ghost btn-sm" onclick="ReportsPage.filters={vendor:'',status:'',category:'',dateFrom:'',dateTo:''};ReportsPage.render()">Clear Filters</button>
            </div>

            <!-- Summary -->
            <div class="report-summary-cards">
                <div class="kpi-card accent"><div class="kpi-label">Total Amount</div><div class="kpi-value">${Utils.currency(totalAmount)}</div><div class="kpi-change">${filtered.length} invoices</div></div>
                <div class="kpi-card success"><div class="kpi-label">Paid</div><div class="kpi-value">${Utils.currency(paidAmount)}</div></div>
                <div class="kpi-card warning"><div class="kpi-label">Pending</div><div class="kpi-value">${Utils.currency(pendingAmount)}</div></div>
            </div>

            <!-- Charts -->
            <div class="dashboard-charts" style="margin-bottom:24px">
                <div class="card">
                    <div class="card-header"><h3>Vendor-wise Spending</h3></div>
                    <div class="card-body"><div id="report-vendor-chart"></div></div>
                </div>
                <div class="card">
                    <div class="card-header"><h3>Category Breakdown</h3></div>
                    <div class="card-body" style="display:flex;flex-direction:column;align-items:center"><div id="report-cat-chart"></div></div>
                </div>
            </div>

            <!-- Data Table -->
            <div class="card">
                <div class="card-header"><h3>Filtered Results (${filtered.length})</h3></div>
                <div class="table-wrap">
                    <table class="data-table">
                        <thead><tr><th>Invoice</th><th>Vendor</th><th>Category</th><th>Amount</th><th>Date</th><th>Due</th><th>Status</th><th>Work</th></tr></thead>
                        <tbody>
                            ${filtered.sort((a,b)=>new Date(b.invoiceDate)-new Date(a.invoiceDate)).map(inv => `
                                <tr style="cursor:pointer" onclick="Router.navigate('invoices',{id:'${inv.id}'})">
                                    <td class="cell-primary">${Utils.escHtml(inv.invoiceNo)}</td>
                                    <td>${Components.vendorName(inv.vendorId)}</td>
                                    <td>${Components.categoryName(inv.categoryId)}</td>
                                    <td class="cell-primary">${Utils.currency(inv.amount)}</td>
                                    <td>${Utils.formatDate(inv.invoiceDate)}</td>
                                    <td>${Utils.formatDate(inv.dueDate)}</td>
                                    <td>${Components.statusBadge(inv.status)}</td>
                                    <td>${Utils.escHtml(Utils.truncate(inv.work, 20))}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="8"><div class="empty-state"><p>No data for selected filters</p></div></td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        setTimeout(() => {
            Charts.barChart('report-vendor-chart', vendorChartData, { format: 'currency', multiColor: true });
            Charts.donutChart('report-cat-chart', catChart, { size: 200, centerLabel: 'Total', centerFormat: 'currency' });
        }, 50);
    },

    exportCSV() {
        const invoices = Store.getAll('invoices');
        const f = this.filters;
        let filtered = [...invoices];
        if (f.vendor) filtered = filtered.filter(i => i.vendorId === f.vendor);
        if (f.status) filtered = filtered.filter(i => i.status === f.status);
        if (f.category) filtered = filtered.filter(i => i.categoryId === f.category);
        if (f.dateFrom) filtered = filtered.filter(i => i.invoiceDate >= f.dateFrom);
        if (f.dateTo) filtered = filtered.filter(i => i.invoiceDate <= f.dateTo);

        const exportData = filtered.map(inv => ({
            'Invoice No': inv.invoiceNo,
            'Vendor': Components.vendorName(inv.vendorId),
            'Category': Components.categoryName(inv.categoryId),
            'Amount': inv.amount,
            'Invoice Date': inv.invoiceDate,
            'Due Date': inv.dueDate,
            'Status': inv.status,
            'Work/Project': inv.work || '',
            'Description': inv.description || '',
            'Payment Method': inv.workflow?.paid?.method || '',
            'Paid Date': inv.workflow?.paid?.date ? Utils.formatDate(inv.workflow.paid.date) : ''
        }));
        Utils.exportCSV(exportData, `FinanceFlow_Report_${new Date().toISOString().split('T')[0]}.csv`);
        Utils.toast('Report exported as CSV', 'success');
        addAuditLog('Report Exported', 'CSV', `${filtered.length} records`);
    }
};
