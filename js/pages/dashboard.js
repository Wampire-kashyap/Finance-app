/* ================================================================
   FINANCEFLOW — DASHBOARD PAGE
   ================================================================ */
const DashboardPage = {
    selectedMonth: '',  // '' = all months
    selectedYear: '',   // '' = all years

    render() {
        const allInvoices = Store.getAll('invoices');
        const vendors = Store.getAll('vendors');
        const categories = Store.getAll('categories');

        // Build year/month options from invoice data
        const years = [...new Set(allInvoices.map(i => new Date(i.invoiceDate).getFullYear()))].sort((a, b) => b - a);
        const months = [
            { value: 0, label: 'January' }, { value: 1, label: 'February' }, { value: 2, label: 'March' },
            { value: 3, label: 'April' }, { value: 4, label: 'May' }, { value: 5, label: 'June' },
            { value: 6, label: 'July' }, { value: 7, label: 'August' }, { value: 8, label: 'September' },
            { value: 9, label: 'October' }, { value: 10, label: 'November' }, { value: 11, label: 'December' }
        ];

        // Filter invoices by selected month/year
        let invoices = allInvoices;
        let filterLabel = 'All Time';
        if (this.selectedYear !== '') {
            invoices = invoices.filter(i => new Date(i.invoiceDate).getFullYear() === Number(this.selectedYear));
            filterLabel = this.selectedYear;
        }
        if (this.selectedMonth !== '') {
            invoices = invoices.filter(i => new Date(i.invoiceDate).getMonth() === Number(this.selectedMonth));
            filterLabel = months[Number(this.selectedMonth)].label + ' ' + (this.selectedYear || '');
        }

        // Compute KPIs based on filtered invoices
        const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
        const totalPending = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
        const pendingCount = invoices.filter(i => i.status !== 'paid').length;
        const overdueInvoices = invoices.filter(i => i.status !== 'paid' && new Date(i.dueDate) < new Date());
        const overdueAmount = overdueInvoices.reduce((s, i) => s + i.amount, 0);
        const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);

        // Monthly expenses for trend chart (always last 12 months from all data, not filtered)
        const monthlyData = [];
        for (let m = 11; m >= 0; m--) {
            const d = new Date();
            d.setMonth(d.getMonth() - m);
            const month = d.getMonth();
            const year = d.getFullYear();
            const monthName = d.toLocaleString('en', { month: 'short' }) + ' ' + String(year).slice(2);
            const total = allInvoices.filter(i => {
                const id = new Date(i.invoiceDate);
                return id.getMonth() === month && id.getFullYear() === year;
            }).reduce((s, i) => s + i.amount, 0);
            monthlyData.push({ label: monthName, value: total });
        }

        // Category breakdown (filtered)
        const catData = categories.map(c => {
            const spent = invoices.filter(i => i.categoryId === c.id).reduce((s, i) => s + i.amount, 0);
            return { label: c.name, value: spent, color: c.color };
        }).filter(d => d.value > 0);

        // Recent audit
        const recentLogs = Store.getAll('auditLogs').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8);

        // Payment delay analysis (from all paid invoices)
        const paidInvoices = allInvoices.filter(i => i.status === 'paid' && i.workflow?.paid?.date && i.invoiceDate);
        const vendorDelays = {};
        paidInvoices.forEach(inv => {
            const days = Utils.daysBetween(inv.invoiceDate, inv.workflow.paid.date);
            if (!vendorDelays[inv.vendorId]) vendorDelays[inv.vendorId] = { total: 0, count: 0 };
            vendorDelays[inv.vendorId].total += days;
            vendorDelays[inv.vendorId].count++;
        });
        const delayData = Object.entries(vendorDelays).map(([vid, d]) => ({
            vendor: Components.vendorName(vid),
            avgDays: Math.round(d.total / d.count)
        })).sort((a, b) => b.avgDays - a.avgDays).slice(0, 5);
        const maxDelay = Math.max(...delayData.map(d => d.avgDays), 1);

        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <div class="page-header-sub">Financial overview — <strong>${filterLabel}</strong> (${invoices.length} invoices)</div>
                </div>
                <div class="page-header-actions">
                    <select class="form-select" style="min-width:130px" onchange="DashboardPage.selectedYear=this.value;DashboardPage.render()">
                        <option value="">All Years</option>
                        ${years.map(y => `<option value="${y}" ${this.selectedYear == y ? 'selected' : ''}>${y}</option>`).join('')}
                    </select>
                    <select class="form-select" style="min-width:140px" onchange="DashboardPage.selectedMonth=this.value;DashboardPage.render()">
                        <option value="">All Months</option>
                        ${months.map(m => `<option value="${m.value}" ${this.selectedMonth !== '' && Number(this.selectedMonth) === m.value ? 'selected' : ''}>${m.label}</option>`).join('')}
                    </select>
                    <button class="btn btn-ghost btn-sm" onclick="DashboardPage.selectedMonth='';DashboardPage.selectedYear='';DashboardPage.render()" title="Clear Filters">${Utils.icons.x} Clear</button>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="kpi-grid">
                <div class="kpi-card accent">
                    <div class="kpi-icon accent">${Utils.icons.dollarSign}</div>
                    <div class="kpi-label">Total Paid</div>
                    <div class="kpi-value">${Utils.currency(totalPaid)}</div>
                    <div class="kpi-change up">${Utils.icons.arrowUp} ${invoices.filter(i => i.status === 'paid').length} invoices</div>
                </div>
                <div class="kpi-card warning">
                    <div class="kpi-icon warning">${Utils.icons.clock}</div>
                    <div class="kpi-label">Pending Payments</div>
                    <div class="kpi-value">${Utils.currency(totalPending)}</div>
                    <div class="kpi-change">${pendingCount} invoices awaiting</div>
                </div>
                <div class="kpi-card danger">
                    <div class="kpi-icon danger">${Utils.icons.alertTriangle}</div>
                    <div class="kpi-label">Overdue</div>
                    <div class="kpi-value">${Utils.currency(overdueAmount)}</div>
                    <div class="kpi-change down">${Utils.icons.arrowDown} ${overdueInvoices.length} overdue invoices</div>
                </div>
                <div class="kpi-card info">
                    <div class="kpi-icon info">${Utils.icons.trendingUp}</div>
                    <div class="kpi-label">Total Invoiced</div>
                    <div class="kpi-value">${Utils.currency(totalAmount)}</div>
                    <div class="kpi-change">${Utils.icons.calendar} ${filterLabel}</div>
                </div>
            </div>

            <!-- Charts Row -->
            <div class="dashboard-charts">
                <div class="card">
                    <div class="card-header"><h3>Monthly Expense Trend (12 months)</h3></div>
                    <div class="card-body"><div class="chart-container" id="chart-monthly-trend"></div></div>
                </div>
                <div class="card">
                    <div class="card-header"><h3>Category Breakdown</h3></div>
                    <div class="card-body" style="display:flex;flex-direction:column;align-items:center"><div class="chart-container" id="chart-category-donut"></div></div>
                </div>
            </div>

            <!-- Bottom Row -->
            <div class="dashboard-bottom">
                <div class="card">
                    <div class="card-header">
                        <h3>Recent Activity</h3>
                        <button class="btn btn-text" onclick="Router.navigate('audit')">View All</button>
                    </div>
                    <div class="card-body">
                        <div class="recent-activity-list">
                            ${recentLogs.length ? recentLogs.map(log => `
                                <div class="activity-item">
                                    <div class="activity-icon" style="background:var(--accent-soft);color:var(--accent)">${Utils.icons.audit}</div>
                                    <div>
                                        <div class="activity-text"><strong>${Utils.escHtml(log.userName)}</strong> ${Utils.escHtml(log.action)} — ${Utils.escHtml(log.target)}</div>
                                        <div class="activity-time">${Utils.timeAgo(log.timestamp)}</div>
                                    </div>
                                </div>
                            `).join('') : '<div class="empty-state"><p>No recent activity</p></div>'}
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><h3>Payment Delay Analysis</h3></div>
                    <div class="card-body">
                        ${delayData.length ? `<div class="delay-list">
                            ${delayData.map(d => {
                                const pct = (d.avgDays / maxDelay) * 100;
                                const color = d.avgDays > 20 ? 'var(--danger)' : d.avgDays > 10 ? 'var(--warning)' : 'var(--success)';
                                return `<div class="delay-item">
                                    <span class="delay-vendor">${Utils.escHtml(d.vendor)}</span>
                                    <div class="delay-bar-wrap"><div class="delay-bar" style="width:${pct}%;background:${color}"></div></div>
                                    <span class="delay-days" style="color:${color}">${d.avgDays} days</span>
                                </div>`;
                            }).join('')}
                        </div>` : '<div class="empty-state"><p>No payment data yet</p></div>'}
                    </div>
                </div>
            </div>
        `;

        // Render charts after DOM is ready
        setTimeout(() => {
            Charts.lineChart('chart-monthly-trend', monthlyData, { color: '#6366f1', width: 500, height: 200 });
            Charts.donutChart('chart-category-donut', catData, { size: 200, centerLabel: 'Spent', centerFormat: 'currency' });
        }, 50);
    }
};
