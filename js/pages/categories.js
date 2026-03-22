/* ================================================================
   FINANCEFLOW — CATEGORIES PAGE
   ================================================================ */
const CategoriesPage = {
    render(params = {}) {
        if (params.id) { this.renderDetail(params.id); return; }
        this.renderList();
    },

    renderList() {
        const categories = Store.getAll('categories');
        const invoices = Store.getAll('invoices');

        const catData = categories.map(c => {
            const spent = invoices.filter(i => i.categoryId === c.id).reduce((s, i) => s + i.amount, 0);
            const pct = c.budget > 0 ? ((spent / c.budget) * 100).toFixed(0) : 0;
            return { ...c, spent, pct: Number(pct) };
        });

        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="page-header">
                <div><h1>Categories & Budget</h1><div class="page-header-sub">Manage expense categories and track budget utilization</div></div>
                <div class="page-header-actions">
                    ${Auth.hasRole('admin', 'accountant') ? `<button class="btn btn-primary" onclick="CategoriesPage.showForm()">${Utils.icons.plus} Add Category</button>` : ''}
                </div>
            </div>

            <div class="card" style="margin-bottom:24px">
                <div class="card-header"><h3>Budget vs Actual Spending</h3></div>
                <div class="card-body"><div id="budget-h-chart"></div></div>
            </div>

            <div class="card">
                <div class="table-wrap">
                    <table class="data-table">
                        <thead><tr><th>Category</th><th>Budget</th><th>Spent</th><th>Utilization</th><th>Invoices</th><th>Actions</th></tr></thead>
                        <tbody>
                            ${catData.map(c => {
                                const invCount = invoices.filter(i => i.categoryId === c.id).length;
                                const barClass = c.pct > 90 ? 'over' : c.pct > 70 ? 'near' : 'under';
                                return `<tr>
                                    <td class="cell-primary" style="cursor:pointer" onclick="Router.navigate('categories',{id:'${c.id}'})">${Utils.escHtml(c.name)}</td>
                                    <td>${Utils.currency(c.budget)}</td>
                                    <td class="cell-primary">${Utils.currency(c.spent)}</td>
                                    <td style="min-width:120px">
                                        <div style="display:flex;align-items:center;gap:8px">
                                            <div class="budget-bar-wrap" style="flex:1"><div class="budget-bar ${barClass}" style="width:${Math.min(c.pct, 100)}%"></div></div>
                                            <span style="font-size:var(--font-xs);font-weight:600;color:${c.pct > 90 ? 'var(--danger)' : c.pct > 70 ? 'var(--warning)' : 'var(--success)'}">${c.pct}%</span>
                                        </div>
                                    </td>
                                    <td>${invCount}</td>
                                    <td>
                                        <button class="btn btn-ghost btn-sm" onclick="Router.navigate('categories',{id:'${c.id}'})">${Utils.icons.eye}</button>
                                        ${Auth.hasRole('admin') ? `<button class="btn btn-ghost btn-sm" onclick="CategoriesPage.showForm('${c.id}')">${Utils.icons.edit}</button>
                                        <button class="btn btn-ghost btn-sm" onclick="CategoriesPage.deleteCategory('${c.id}')">${Utils.icons.trash}</button>` : ''}
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        setTimeout(() => {
            Charts.horizontalBar('budget-h-chart', catData.map(c => ({ label: c.name, value: c.spent, max: c.budget })), { format: 'currency' });
        }, 50);
    },

    renderDetail(catId) {
        const category = Store.find('categories', catId);
        if (!category) { Router.navigate('categories'); return; }
        const invoices = Store.getAll('invoices').filter(i => i.categoryId === catId);
        const spent = invoices.reduce((s, i) => s + i.amount, 0);
        const remaining = category.budget - spent;

        // Group by work/project
        const projects = {};
        invoices.forEach(inv => {
            const key = inv.work || 'General';
            if (!projects[key]) projects[key] = { name: key, total: 0, invoices: [] };
            projects[key].total += inv.amount;
            projects[key].invoices.push(inv);
        });

        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="page-header">
                <div>
                    <button class="btn btn-ghost btn-sm" onclick="Router.navigate('categories')" style="margin-bottom:8px">← Back to Categories</button>
                    <h1>${Utils.escHtml(category.name)}</h1>
                    <div class="page-header-sub">${Utils.escHtml(category.description || '')}</div>
                </div>
            </div>

            <div class="kpi-grid">
                <div class="kpi-card accent"><div class="kpi-label">Budget</div><div class="kpi-value">${Utils.currency(category.budget)}</div></div>
                <div class="kpi-card ${spent > category.budget ? 'danger' : 'success'}"><div class="kpi-label">Spent</div><div class="kpi-value">${Utils.currency(spent)}</div></div>
                <div class="kpi-card ${remaining < 0 ? 'danger' : 'info'}"><div class="kpi-label">Remaining</div><div class="kpi-value">${Utils.currency(remaining)}</div></div>
                <div class="kpi-card warning"><div class="kpi-label">Invoices</div><div class="kpi-value">${invoices.length}</div></div>
            </div>

            <div class="dashboard-bottom">
                <div class="card">
                    <div class="card-header"><h3>Projects / Work</h3></div>
                    <div class="card-body">
                        ${Object.values(projects).length ? Object.values(projects).map(p => `
                            <div style="padding:10px 0;border-bottom:1px solid var(--border-primary)">
                                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                                    <span style="font-weight:500">${Utils.escHtml(p.name)}</span>
                                    <span style="font-weight:600">${Utils.currency(p.total)}</span>
                                </div>
                                <div style="font-size:var(--font-xs);color:var(--text-tertiary)">${p.invoices.length} invoice(s)</div>
                            </div>
                        `).join('') : '<div class="empty-state"><p>No projects yet</p></div>'}
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><h3>Category Spending Chart</h3></div>
                    <div class="card-body"><div id="cat-detail-chart"></div></div>
                </div>
            </div>

            <div class="card" style="margin-top:20px">
                <div class="card-header"><h3>Invoices in this Category</h3></div>
                <div class="table-wrap">
                    <table class="data-table">
                        <thead><tr><th>Invoice</th><th>Vendor</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                        <tbody>
                            ${invoices.sort((a,b) => new Date(b.invoiceDate)-new Date(a.invoiceDate)).map(inv => `
                                <tr style="cursor:pointer" onclick="Router.navigate('invoices',{id:'${inv.id}'})">
                                    <td class="cell-primary">${Utils.escHtml(inv.invoiceNo)}</td>
                                    <td>${Components.vendorName(inv.vendorId)}</td>
                                    <td class="cell-primary">${Utils.currency(inv.amount)}</td>
                                    <td>${Utils.formatDate(inv.invoiceDate)}</td>
                                    <td>${Components.statusBadge(inv.status)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        setTimeout(() => {
            Charts.barChart('cat-detail-chart', Object.values(projects).map(p => ({ label: p.name, shortLabel: p.name.substring(0, 8), value: p.total })), { format: 'currency', multiColor: true });
        }, 50);
    },

    showForm(catId = null) {
        const cat = catId ? Store.find('categories', catId) : null;
        const body = `
            <div class="form-group"><label class="form-label">Category Name *</label><input type="text" class="form-input" id="cf-name" value="${cat ? Utils.escHtml(cat.name) : ''}"></div>
            <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="cf-desc" rows="2">${cat ? Utils.escHtml(cat.description) : ''}</textarea></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Budget (₹)</label><input type="number" class="form-input" id="cf-budget" value="${cat ? cat.budget : ''}"></div>
                <div class="form-group"><label class="form-label">Color</label><input type="color" class="form-input" id="cf-color" value="${cat ? cat.color : '#6366f1'}" style="height:38px;padding:2px"></div>
            </div>
        `;
        Components.openModal(cat ? 'Edit Category' : 'Add Category', body,
            `<button class="btn btn-ghost" onclick="Components.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CategoriesPage.saveCategory('${catId || ''}')">Save</button>`);
    },

    saveCategory(catId) {
        const name = document.getElementById('cf-name').value.trim();
        if (!name) { Utils.toast('Name required', 'error'); return; }
        const data = {
            name,
            description: document.getElementById('cf-desc').value.trim(),
            budget: Number(document.getElementById('cf-budget').value) || 0,
            color: document.getElementById('cf-color').value
        };
        if (catId) {
            Store.update('categories', catId, data);
            addAuditLog('Category Updated', name);
            Utils.toast('Category updated', 'success');
        } else {
            data.id = Utils.uid();
            data.createdAt = new Date().toISOString();
            Store.add('categories', data);
            addAuditLog('Category Created', name);
            Utils.toast('Category added', 'success');
        }
        Components.closeModal();
        this.renderList();
    },

    deleteCategory(id) {
        const cat = Store.find('categories', id);
        Components.confirm(`Delete category "${cat?.name}"?`, () => {
            Store.remove('categories', id);
            addAuditLog('Category Deleted', cat?.name || id);
            Utils.toast('Category deleted', 'success');
            this.renderList();
        });
    }
};
