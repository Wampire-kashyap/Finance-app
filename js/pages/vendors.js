/* ================================================================
   FINANCEFLOW — VENDORS PAGE
   ================================================================ */
const VendorsPage = {
    currentPage: 1,
    perPage: 10,
    searchTerm: '',
    filterCategory: '',

    render(params = {}) {
        if (params.id) {
            this.renderDetail(params.id);
            return;
        }
        this.renderList();
    },

    renderList() {
        let vendors = Store.getAll('vendors');
        const categories = Store.getAll('categories');
        const invoices = Store.getAll('invoices');

        // Filter
        if (this.searchTerm) {
            const q = this.searchTerm.toLowerCase();
            vendors = vendors.filter(v => v.name.toLowerCase().includes(q) || v.contact.toLowerCase().includes(q) || v.email.toLowerCase().includes(q));
        }
        if (this.filterCategory) {
            vendors = vendors.filter(v => v.category === this.filterCategory);
        }

        const total = vendors.length;
        const paged = vendors.slice((this.currentPage - 1) * this.perPage, this.currentPage * this.perPage);

        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Vendors</h1>
                    <div class="page-header-sub">${total} vendors registered</div>
                </div>
                <div class="page-header-actions">
                    ${Auth.hasRole('admin', 'accountant') ? `<button class="btn btn-primary" onclick="VendorsPage.showForm()">${Utils.icons.plus} Add Vendor</button>` : ''}
                </div>
            </div>

            <div class="filter-bar">
                <input type="text" class="form-input" placeholder="Search vendors..." value="${Utils.escHtml(this.searchTerm)}" oninput="VendorsPage.searchTerm=this.value;VendorsPage.currentPage=1;VendorsPage.renderList()">
                <select class="form-select" onchange="VendorsPage.filterCategory=this.value;VendorsPage.currentPage=1;VendorsPage.renderList()">
                    <option value="">All Categories</option>
                    ${categories.map(c => `<option value="${c.id}" ${this.filterCategory === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
            </div>

            <div class="card">
                <div class="table-wrap">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Vendor Name</th>
                                <th>Contact</th>
                                <th>Category</th>
                                <th>GST</th>
                                <th>Total Billed</th>
                                <th>Invoices</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${paged.length ? paged.map(v => {
                                const vInvoices = invoices.filter(i => i.vendorId === v.id);
                                const totalBilled = vInvoices.reduce((s, i) => s + i.amount, 0);
                                const cat = categories.find(c => c.id === v.category);
                                return `<tr>
                                    <td class="cell-primary" style="cursor:pointer" onclick="Router.navigate('vendors',{id:'${v.id}'})">${Utils.escHtml(v.name)}</td>
                                    <td>${Utils.escHtml(v.contact)}<br><span style="font-size:var(--font-xs);color:var(--text-muted)">${Utils.escHtml(v.email)}</span></td>
                                    <td><span class="badge badge-accent">${cat ? cat.name : '—'}</span></td>
                                    <td style="font-size:var(--font-xs)">${Utils.escHtml(v.gst || '—')}</td>
                                    <td class="cell-primary">${Utils.currency(totalBilled)}</td>
                                    <td>${vInvoices.length}</td>
                                    <td>
                                        <button class="btn btn-ghost btn-sm" onclick="Router.navigate('vendors',{id:'${v.id}'})" title="View">${Utils.icons.eye}</button>
                                        ${Auth.hasRole('admin','accountant') ? `<button class="btn btn-ghost btn-sm" onclick="VendorsPage.showForm('${v.id}')" title="Edit">${Utils.icons.edit}</button>` : ''}
                                        ${Auth.hasRole('admin') ? `<button class="btn btn-ghost btn-sm" onclick="VendorsPage.deleteVendor('${v.id}')" title="Delete">${Utils.icons.trash}</button>` : ''}
                                    </td>
                                </tr>`;
                            }).join('') : '<tr><td colspan="7"><div class="empty-state"><h3>No vendors found</h3><p>Add your first vendor to get started.</p></div></td></tr>'}
                        </tbody>
                    </table>
                </div>
                ${Components.pagination(total, this.currentPage, this.perPage, 'VendorsPage.goToPage')}
            </div>
        `;
    },

    goToPage(page) {
        this.currentPage = page;
        this.renderList();
    },

    showForm(vendorId = null) {
        const vendor = vendorId ? Store.find('vendors', vendorId) : null;
        const categories = Store.getAll('categories');
        const title = vendor ? 'Edit Vendor' : 'Add Vendor';
        const body = `
            <div class="form-group"><label class="form-label">Vendor Name *</label><input type="text" class="form-input" id="vf-name" value="${vendor ? Utils.escHtml(vendor.name) : ''}" required></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Contact Person</label><input type="text" class="form-input" id="vf-contact" value="${vendor ? Utils.escHtml(vendor.contact) : ''}"></div>
                <div class="form-group"><label class="form-label">Phone</label><input type="text" class="form-input" id="vf-phone" value="${vendor ? Utils.escHtml(vendor.phone) : ''}"></div>
            </div>
            <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" id="vf-email" value="${vendor ? Utils.escHtml(vendor.email) : ''}"></div>
            <div class="form-group"><label class="form-label">Address</label><textarea class="form-textarea" id="vf-address" rows="2">${vendor ? Utils.escHtml(vendor.address) : ''}</textarea></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">GST Number</label><input type="text" class="form-input" id="vf-gst" value="${vendor ? Utils.escHtml(vendor.gst) : ''}"></div>
                <div class="form-group"><label class="form-label">Category</label>
                    <select class="form-select" id="vf-category">
                        <option value="">Select Category</option>
                        ${categories.map(c => `<option value="${c.id}" ${vendor && vendor.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Bank Name</label><input type="text" class="form-input" id="vf-bank" value="${vendor ? Utils.escHtml(vendor.bankName) : ''}"></div>
                <div class="form-group"><label class="form-label">Account No</label><input type="text" class="form-input" id="vf-accno" value="${vendor ? Utils.escHtml(vendor.accountNo) : ''}"></div>
            </div>
            <div class="form-group"><label class="form-label">IFSC Code</label><input type="text" class="form-input" id="vf-ifsc" value="${vendor ? Utils.escHtml(vendor.ifsc) : ''}"></div>
        `;
        const footer = `
            <button class="btn btn-ghost" onclick="Components.closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="VendorsPage.saveVendor('${vendorId || ''}')">Save Vendor</button>
        `;
        Components.openModal(title, body, footer);
    },

    saveVendor(vendorId) {
        const name = document.getElementById('vf-name').value.trim();
        if (!name) { Utils.toast('Vendor name is required', 'error'); return; }
        const data = {
            name,
            contact: document.getElementById('vf-contact').value.trim(),
            phone: document.getElementById('vf-phone').value.trim(),
            email: document.getElementById('vf-email').value.trim(),
            address: document.getElementById('vf-address').value.trim(),
            gst: document.getElementById('vf-gst').value.trim(),
            category: document.getElementById('vf-category').value,
            bankName: document.getElementById('vf-bank').value.trim(),
            accountNo: document.getElementById('vf-accno').value.trim(),
            ifsc: document.getElementById('vf-ifsc').value.trim()
        };

        if (vendorId) {
            Store.update('vendors', vendorId, data);
            addAuditLog('Vendor Updated', name);
            Utils.toast('Vendor updated', 'success');
        } else {
            data.id = Utils.uid();
            data.createdAt = new Date().toISOString();
            Store.add('vendors', data);
            addAuditLog('Vendor Created', name);
            Utils.toast('Vendor added', 'success');
        }
        Components.closeModal();
        this.renderList();
    },

    deleteVendor(id) {
        const vendor = Store.find('vendors', id);
        Components.confirm(`Delete vendor "${vendor?.name}"? This cannot be undone.`, () => {
            Store.remove('vendors', id);
            addAuditLog('Vendor Deleted', vendor?.name || id);
            Utils.toast('Vendor deleted', 'success');
            this.renderList();
        });
    },

    renderDetail(vendorId) {
        const vendor = Store.find('vendors', vendorId);
        if (!vendor) { Router.navigate('vendors'); return; }
        const invoices = Store.getAll('invoices').filter(i => i.vendorId === vendorId);
        const totalBilled = invoices.reduce((s, i) => s + i.amount, 0);
        const paidAmount = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
        const pendingAmount = totalBilled - paidAmount;
        const category = Store.find('categories', vendor.category);

        // Monthly spending trend for this vendor
        const monthlyData = [];
        for (let m = 5; m >= 0; m--) {
            const d = new Date();
            d.setMonth(d.getMonth() - m);
            const month = d.getMonth();
            const year = d.getFullYear();
            const monthName = d.toLocaleString('en', { month: 'short' });
            const total = invoices.filter(i => {
                const id = new Date(i.invoiceDate);
                return id.getMonth() === month && id.getFullYear() === year;
            }).reduce((s, i) => s + i.amount, 0);
            monthlyData.push({ label: monthName, value: total });
        }

        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="page-header">
                <div>
                    <button class="btn btn-ghost btn-sm" onclick="Router.navigate('vendors')" style="margin-bottom:8px">← Back to Vendors</button>
                    <h1>Vendor Profile</h1>
                </div>
                <div class="page-header-actions">
                    ${Auth.hasRole('admin','accountant') ? `<button class="btn btn-secondary" onclick="VendorsPage.showForm('${vendorId}')">${Utils.icons.edit} Edit</button>` : ''}
                </div>
            </div>

            <div class="vendor-profile-header">
                <div class="vendor-avatar-lg">${Utils.initials(vendor.name)}</div>
                <div class="vendor-profile-info">
                    <h2>${Utils.escHtml(vendor.name)}</h2>
                    <p>${Utils.escHtml(vendor.contact)} · ${Utils.escHtml(vendor.email)}</p>
                    <p style="font-size:var(--font-xs);color:var(--text-muted)">GST: ${Utils.escHtml(vendor.gst || 'N/A')} · Category: ${category ? category.name : 'N/A'}</p>
                </div>
                <div class="vendor-stats">
                    <div class="vendor-stat"><div class="vendor-stat-value" style="color:var(--accent)">${Utils.currency(totalBilled)}</div><div class="vendor-stat-label">Total Billed</div></div>
                    <div class="vendor-stat"><div class="vendor-stat-value" style="color:var(--success)">${Utils.currency(paidAmount)}</div><div class="vendor-stat-label">Paid</div></div>
                    <div class="vendor-stat"><div class="vendor-stat-value" style="color:var(--warning)">${Utils.currency(pendingAmount)}</div><div class="vendor-stat-label">Pending</div></div>
                </div>
            </div>

            <div class="dashboard-charts" style="margin-bottom:20px">
                <div class="card">
                    <div class="card-header"><h3>Spending Trend</h3></div>
                    <div class="card-body"><div class="chart-container" id="vendor-trend-chart"></div></div>
                </div>
                <div class="card">
                    <div class="card-header"><h3>Bank Details</h3></div>
                    <div class="card-body">
                        <div class="detail-grid">
                            <div><div class="detail-label">Bank</div><div class="detail-value">${Utils.escHtml(vendor.bankName || '—')}</div></div>
                            <div><div class="detail-label">Account No</div><div class="detail-value">${Utils.escHtml(vendor.accountNo || '—')}</div></div>
                            <div><div class="detail-label">IFSC</div><div class="detail-value">${Utils.escHtml(vendor.ifsc || '—')}</div></div>
                            <div><div class="detail-label">Address</div><div class="detail-value">${Utils.escHtml(vendor.address || '—')}</div></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h3>Transaction History (${invoices.length})</h3></div>
                <div class="table-wrap">
                    <table class="data-table">
                        <thead><tr><th>Invoice</th><th>Date</th><th>Amount</th><th>Work</th><th>Status</th></tr></thead>
                        <tbody>
                            ${invoices.length ? invoices.sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)).map(inv => `
                                <tr style="cursor:pointer" onclick="Router.navigate('invoices',{id:'${inv.id}'})">
                                    <td class="cell-primary">${Utils.escHtml(inv.invoiceNo)}</td>
                                    <td>${Utils.formatDate(inv.invoiceDate)}</td>
                                    <td class="cell-primary">${Utils.currency(inv.amount)} ${inv.amount >= HIGH_VALUE_THRESHOLD ? Components.highValueFlag(inv.amount) : ''}</td>
                                    <td>${Utils.escHtml(Utils.truncate(inv.work, 30))}</td>
                                    <td>${Components.statusBadge(inv.status)}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="5"><div class="empty-state"><p>No transactions found</p></div></td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        setTimeout(() => {
            Charts.barChart('vendor-trend-chart', monthlyData, { color: '#6366f1', format: 'currency' });
        }, 50);
    }
};
