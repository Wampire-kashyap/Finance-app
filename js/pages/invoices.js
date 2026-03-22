/* ================================================================
   FINANCEFLOW — INVOICES PAGE
   ================================================================ */
const InvoicesPage = {
    currentPage: 1,
    perPage: 10,
    filters: { search: '', vendor: '', status: '', category: '', dateFrom: '', dateTo: '' },

    render(params = {}) {
        if (params.id) { this.renderDetail(params.id); return; }
        this.renderList();
    },

    renderList() {
        let invoices = Store.getAll('invoices');
        const vendors = Store.getAll('vendors');
        const categories = Store.getAll('categories');
        const f = this.filters;

        // Apply filters
        if (f.search) { const q = f.search.toLowerCase(); invoices = invoices.filter(i => i.invoiceNo.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)); }
        if (f.vendor) invoices = invoices.filter(i => i.vendorId === f.vendor);
        if (f.status) invoices = invoices.filter(i => i.status === f.status);
        if (f.category) invoices = invoices.filter(i => i.categoryId === f.category);
        if (f.dateFrom) invoices = invoices.filter(i => i.invoiceDate >= f.dateFrom);
        if (f.dateTo) invoices = invoices.filter(i => i.invoiceDate <= f.dateTo);

        invoices.sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate));
        const total = invoices.length;
        const paged = invoices.slice((this.currentPage - 1) * this.perPage, this.currentPage * this.perPage);

        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="page-header">
                <div><h1>Invoices</h1><div class="page-header-sub">${total} invoices found</div></div>
                <div class="page-header-actions">
                    ${Auth.hasRole('admin', 'accountant') ? `<button class="btn btn-primary" onclick="InvoicesPage.showForm()">${Utils.icons.plus} New Invoice</button>` : ''}
                </div>
            </div>

            <div class="filter-bar">
                <input type="text" class="form-input" placeholder="Search invoices..." value="${Utils.escHtml(f.search)}" oninput="InvoicesPage.filters.search=this.value;InvoicesPage.currentPage=1;InvoicesPage.renderList()">
                <select class="form-select" onchange="InvoicesPage.filters.vendor=this.value;InvoicesPage.currentPage=1;InvoicesPage.renderList()">
                    <option value="">All Vendors</option>
                    ${vendors.map(v => `<option value="${v.id}" ${f.vendor === v.id ? 'selected' : ''}>${v.name}</option>`).join('')}
                </select>
                <select class="form-select" onchange="InvoicesPage.filters.status=this.value;InvoicesPage.currentPage=1;InvoicesPage.renderList()">
                    <option value="">All Status</option>
                    <option value="received" ${f.status === 'received' ? 'selected' : ''}>Received</option>
                    <option value="verified" ${f.status === 'verified' ? 'selected' : ''}>Verified</option>
                    <option value="approved" ${f.status === 'approved' ? 'selected' : ''}>Approved</option>
                    <option value="paid" ${f.status === 'paid' ? 'selected' : ''}>Paid</option>
                </select>
                <select class="form-select" onchange="InvoicesPage.filters.category=this.value;InvoicesPage.currentPage=1;InvoicesPage.renderList()">
                    <option value="">All Categories</option>
                    ${categories.map(c => `<option value="${c.id}" ${f.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
                <input type="date" class="form-input" style="min-width:140px" value="${f.dateFrom}" onchange="InvoicesPage.filters.dateFrom=this.value;InvoicesPage.currentPage=1;InvoicesPage.renderList()">
                <input type="date" class="form-input" style="min-width:140px" value="${f.dateTo}" onchange="InvoicesPage.filters.dateTo=this.value;InvoicesPage.currentPage=1;InvoicesPage.renderList()">
            </div>

            <div class="card">
                <div class="table-wrap">
                    <table class="data-table">
                        <thead><tr><th>Invoice No</th><th>Vendor</th><th>Category</th><th>Amount</th><th>Date</th><th>Due Date</th><th>Status</th><th>Flags</th><th>Actions</th></tr></thead>
                        <tbody>
                            ${paged.length ? paged.map(inv => {
                                const isOverdue = inv.status !== 'paid' && new Date(inv.dueDate) < new Date();
                                const isDuplicate = Components.checkDuplicate(inv.invoiceNo, inv.vendorId, inv.amount, inv.id);
                                return `<tr>
                                    <td class="cell-primary" style="cursor:pointer" onclick="Router.navigate('invoices',{id:'${inv.id}'})">${Utils.escHtml(inv.invoiceNo)}</td>
                                    <td>${Components.vendorName(inv.vendorId)}</td>
                                    <td><span class="badge badge-accent">${Components.categoryName(inv.categoryId)}</span></td>
                                    <td class="cell-primary">${Utils.currency(inv.amount)}</td>
                                    <td>${Utils.formatDate(inv.invoiceDate)}</td>
                                    <td style="${isOverdue ? 'color:var(--danger);font-weight:600' : ''}">${Utils.formatDate(inv.dueDate)} ${isOverdue ? '⚠' : ''}</td>
                                    <td>${Components.statusBadge(inv.status)}</td>
                                    <td>
                                        ${inv.amount >= HIGH_VALUE_THRESHOLD ? Components.highValueFlag(inv.amount) : ''}
                                        ${isDuplicate ? '<span class="flag-duplicate">⚠ Duplicate</span>' : ''}
                                    </td>
                                    <td>
                                        <button class="btn btn-ghost btn-sm" onclick="Router.navigate('invoices',{id:'${inv.id}'})">${Utils.icons.eye}</button>
                                        ${Auth.hasRole('admin','accountant') && inv.status === 'received' ? `<button class="btn btn-ghost btn-sm" onclick="InvoicesPage.showForm('${inv.id}')">${Utils.icons.edit}</button>` : ''}
                                        ${Auth.hasRole('admin') ? `<button class="btn btn-ghost btn-sm" onclick="InvoicesPage.deleteInvoice('${inv.id}')">${Utils.icons.trash}</button>` : ''}
                                    </td>
                                </tr>`;
                            }).join('') : '<tr><td colspan="9"><div class="empty-state"><h3>No invoices found</h3><p>Create your first invoice to get started.</p></div></td></tr>'}
                        </tbody>
                    </table>
                </div>
                ${Components.pagination(total, this.currentPage, this.perPage, 'InvoicesPage.goToPage')}
            </div>
        `;
    },

    goToPage(page) { this.currentPage = page; this.renderList(); },

    showForm(invId = null) {
        const inv = invId ? Store.find('invoices', invId) : null;
        const vendors = Store.getAll('vendors');
        const categories = Store.getAll('categories');
        const body = `
            <div class="form-row">
                <div class="form-group"><label class="form-label">Invoice Number *</label><input type="text" class="form-input" id="if-no" value="${inv ? Utils.escHtml(inv.invoiceNo) : `INV-${new Date().getFullYear()}-${String(Store.getAll('invoices').length + 1).padStart(3, '0')}`}"></div>
                <div class="form-group"><label class="form-label">Vendor *</label>
                    <select class="form-select" id="if-vendor">${vendors.map(v => `<option value="${v.id}" ${inv && inv.vendorId === v.id ? 'selected' : ''}>${v.name}</option>`).join('')}</select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Category *</label>
                    <select class="form-select" id="if-category">${categories.map(c => `<option value="${c.id}" ${inv && inv.categoryId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
                </div>
                <div class="form-group"><label class="form-label">Amount (₹) *</label><input type="number" class="form-input" id="if-amount" value="${inv ? inv.amount : ''}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Invoice Date *</label><input type="date" class="form-input" id="if-date" value="${inv ? inv.invoiceDate : new Date().toISOString().split('T')[0]}"></div>
                <div class="form-group"><label class="form-label">Due Date</label><input type="date" class="form-input" id="if-due" value="${inv ? inv.dueDate : ''}"></div>
            </div>
            <div class="form-group"><label class="form-label">Work / Project</label><input type="text" class="form-input" id="if-work" value="${inv ? Utils.escHtml(inv.work || '') : ''}"></div>
            <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="if-desc" rows="2">${inv ? Utils.escHtml(inv.description) : ''}</textarea></div>
            <div class="form-group">
                <label class="form-label">Attach Invoice File</label>
                <div class="file-upload-area" onclick="document.getElementById('if-file').click()">
                    <input type="file" id="if-file" style="display:none" accept=".pdf,.jpg,.png,.jpeg" onchange="InvoicesPage.handleFileSelect(this)">
                    ${Utils.icons.upload}
                    <p>Click to upload PDF, JPG, or PNG</p>
                    <div class="file-name" id="if-file-name">${inv && inv.fileName ? inv.fileName : ''}</div>
                </div>
            </div>
        `;
        Components.openModal(inv ? 'Edit Invoice' : 'New Invoice', body,
            `<button class="btn btn-ghost" onclick="Components.closeModal()">Cancel</button><button class="btn btn-primary" onclick="InvoicesPage.saveInvoice('${invId || ''}')">Save Invoice</button>`);
    },

    _tempFileData: null,
    _tempFileName: null,

    handleFileSelect(input) {
        const file = input.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { Utils.toast('File too large (max 5MB)', 'error'); return; }
        this._tempFileName = file.name;
        document.getElementById('if-file-name').textContent = file.name;
        const reader = new FileReader();
        reader.onload = (e) => { this._tempFileData = e.target.result; };
        reader.readAsDataURL(file);
    },

    saveInvoice(invId) {
        const invoiceNo = document.getElementById('if-no').value.trim();
        const vendorId = document.getElementById('if-vendor').value;
        const amount = Number(document.getElementById('if-amount').value);
        const invoiceDate = document.getElementById('if-date').value;
        if (!invoiceNo || !vendorId || !amount || !invoiceDate) { Utils.toast('Fill all required fields', 'error'); return; }

        // Duplicate check
        const dup = Components.checkDuplicate(invoiceNo, vendorId, amount, invId || null);
        if (dup) {
            Utils.toast(`Possible duplicate detected: ${dup.invoiceNo}`, 'warning');
        }

        const data = {
            invoiceNo,
            vendorId,
            categoryId: document.getElementById('if-category').value,
            amount,
            invoiceDate,
            dueDate: document.getElementById('if-due').value,
            work: document.getElementById('if-work').value.trim(),
            description: document.getElementById('if-desc').value.trim(),
        };
        if (this._tempFileData) { data.fileData = this._tempFileData; data.fileName = this._tempFileName; }

        if (invId) {
            Store.update('invoices', invId, data);
            addAuditLog('Invoice Updated', invoiceNo, `${Utils.currency(amount)}`);
            Utils.toast('Invoice updated', 'success');
        } else {
            data.id = Utils.uid();
            data.status = 'received';
            data.workflow = { received: { date: new Date().toISOString(), by: Auth.getUser().id }, verified: null, approved: null, ceoApproved: null, uploadedToBank: null, paid: null };
            data.comments = [];
            data.createdAt = new Date().toISOString();
            Store.add('invoices', data);
            addAuditLog('Invoice Created', invoiceNo, `${Utils.currency(amount)} from ${Components.vendorName(vendorId)}`);
            // High value notification
            if (amount >= HIGH_VALUE_THRESHOLD) {
                addNotification('High Value Invoice', `${invoiceNo} (${Utils.currency(amount)}) flagged as high value.`, 'warning', ['admin', 'ceo', 'manager']);
            }
            addNotification('New Invoice', `${invoiceNo} from ${Components.vendorName(vendorId)} received.`, 'info', ['accountant', 'admin']);
            Utils.toast('Invoice created', 'success');
        }
        this._tempFileData = null;
        this._tempFileName = null;
        Components.closeModal();
        Notifications.updateBadge();
        this.renderList();
    },

    deleteInvoice(id) {
        const inv = Store.find('invoices', id);
        Components.confirm(`Delete invoice "${inv?.invoiceNo}"?`, () => {
            Store.remove('invoices', id);
            addAuditLog('Invoice Deleted', inv?.invoiceNo || id);
            Utils.toast('Invoice deleted', 'success');
            this.renderList();
        });
    },

    renderDetail(invId) {
        const inv = Store.find('invoices', invId);
        if (!inv) { Router.navigate('invoices'); return; }
        const vendor = Store.find('vendors', inv.vendorId);
        const category = Store.find('categories', inv.categoryId);
        const steps = Components.getWorkflowSteps(inv);
        const isOverdue = inv.status !== 'paid' && new Date(inv.dueDate) < new Date();
        const isDuplicate = Components.checkDuplicate(inv.invoiceNo, inv.vendorId, inv.amount, inv.id);
        const user = Auth.getUser();

        // Determine available actions for current user
        let actionButtons = '';
        if (Auth.hasRole('accountant', 'admin') && inv.status === 'received') {
            actionButtons += `<button class="btn btn-primary btn-sm" onclick="InvoicesPage.advanceStatus('${inv.id}','verify')">✓ Verify</button>`;
        }
        if (Auth.hasRole('manager', 'admin') && inv.status === 'verified') {
            actionButtons += `<button class="btn btn-success btn-sm" onclick="InvoicesPage.advanceStatus('${inv.id}','approve')">✓ Approve</button>`;
            actionButtons += `<button class="btn btn-danger btn-sm" onclick="InvoicesPage.rejectInvoice('${inv.id}')">✗ Reject</button>`;
        }
        if (Auth.hasRole('ceo', 'admin') && inv.status === 'approved' && inv.workflow?.approved && !inv.workflow?.ceoApproved) {
            actionButtons += `<button class="btn btn-success btn-sm" onclick="InvoicesPage.advanceStatus('${inv.id}','ceoApprove')">✓ CEO Approve</button>`;
            actionButtons += `<button class="btn btn-danger btn-sm" onclick="InvoicesPage.rejectInvoice('${inv.id}')">✗ Reject</button>`;
        }
        if (Auth.hasRole('accountant', 'admin') && inv.workflow?.ceoApproved && !inv.workflow?.uploadedToBank) {
            actionButtons += `<button class="btn btn-primary btn-sm" onclick="InvoicesPage.advanceStatus('${inv.id}','uploadBank')">Upload to Bank</button>`;
        }
        if (Auth.hasRole('accountant', 'admin') && inv.workflow?.uploadedToBank && !inv.workflow?.paid) {
            actionButtons += `<button class="btn btn-success btn-sm" onclick="InvoicesPage.showPaymentForm('${inv.id}')">Mark as Paid</button>`;
        }

        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="page-header">
                <div>
                    <button class="btn btn-ghost btn-sm" onclick="Router.navigate('invoices')" style="margin-bottom:8px">← Back to Invoices</button>
                    <h1>${Utils.escHtml(inv.invoiceNo)}</h1>
                    <div class="page-header-sub">${Utils.escHtml(inv.description)}</div>
                </div>
                <div class="page-header-actions">${actionButtons}</div>
            </div>

            ${isDuplicate ? '<div style="padding:10px 16px;background:var(--warning-soft);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius-md);margin-bottom:16px;font-size:var(--font-sm);color:var(--warning)">⚠ Possible duplicate of invoice <strong>' + Utils.escHtml(isDuplicate.invoiceNo) + '</strong></div>' : ''}

            <!-- Step progress -->
            <div class="card" style="margin-bottom:20px">
                <div class="card-body" style="padding:16px 24px">
                    ${Components.stepProgress(steps)}
                    <div style="display:flex;justify-content:space-between;margin-top:8px">
                        ${steps.map(s => `<span style="font-size:9px;color:var(--text-muted);text-align:center;flex:1">${s.label}</span>`).join('')}
                    </div>
                </div>
            </div>

            <div class="invoice-detail-layout">
                <div>
                    <!-- Invoice Details -->
                    <div class="card" style="margin-bottom:20px">
                        <div class="card-header"><h3>Invoice Details</h3></div>
                        <div class="card-body">
                            <div class="detail-grid">
                                <div><div class="detail-label">Vendor</div><div class="detail-value">${vendor ? vendor.name : '—'}</div></div>
                                <div><div class="detail-label">Category</div><div class="detail-value">${category ? category.name : '—'}</div></div>
                                <div><div class="detail-label">Amount</div><div class="detail-value" style="font-size:var(--font-lg);font-weight:700;color:var(--accent)">${Utils.currency(inv.amount)} ${Components.highValueFlag(inv.amount)}</div></div>
                                <div><div class="detail-label">Status</div><div class="detail-value">${Components.statusBadge(inv.status)} ${isOverdue ? '<span class="badge badge-danger">Overdue</span>' : ''}</div></div>
                                <div><div class="detail-label">Invoice Date</div><div class="detail-value">${Utils.formatDate(inv.invoiceDate)}</div></div>
                                <div><div class="detail-label">Due Date</div><div class="detail-value" style="${isOverdue?'color:var(--danger);font-weight:600':''}">${Utils.formatDate(inv.dueDate)}</div></div>
                                <div><div class="detail-label">Work/Project</div><div class="detail-value">${Utils.escHtml(inv.work || '—')}</div></div>
                                <div><div class="detail-label">Created</div><div class="detail-value">${Utils.formatDateTime(inv.createdAt)}</div></div>
                            </div>
                            ${inv.fileName ? `<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border-primary)"><div class="detail-label">Attached File</div><a href="${inv.fileData || '#'}" download="${inv.fileName}" class="btn btn-secondary btn-sm" style="margin-top:6px">${Utils.icons.download} ${Utils.escHtml(inv.fileName)}</a></div>` : ''}
                        </div>
                    </div>

                    <!-- Workflow Timeline -->
                    <div class="card" style="margin-bottom:20px">
                        <div class="card-header"><h3>Workflow Timeline</h3></div>
                        <div class="card-body">
                            <div class="status-timeline">
                                ${steps.map(s => `
                                    <div class="timeline-item ${s.status}">
                                        <div class="timeline-step">${s.label}</div>
                                        ${s.data ? `<div class="timeline-meta">${Utils.formatDateTime(s.data.date)} · <span class="timeline-person">${Components.userName(s.data.by)}</span>${s.data.method ? ` · ${s.data.method}` : ''}</div>` : '<div class="timeline-meta" style="color:var(--text-muted)">Pending</div>'}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Side panel -->
                <div>
                    <!-- Comments -->
                    <div class="card">
                        <div class="card-header"><h3>Comments & Notes</h3></div>
                        <div class="card-body">
                            <div class="comment-list" id="invoice-comments">
                                ${(inv.comments || []).map(c => `
                                    <div class="comment-item">
                                        <div class="comment-header">
                                            <div class="comment-avatar">${Utils.initials(Components.userName(c.userId))}</div>
                                            <span class="comment-author">${Components.userName(c.userId)}</span>
                                            <span class="comment-time">${Utils.timeAgo(c.date)}</span>
                                        </div>
                                        <div class="comment-body">${Utils.escHtml(c.text)}</div>
                                    </div>
                                `).join('') || '<div class="empty-state" style="padding:16px"><p>No comments yet</p></div>'}
                            </div>
                            <div style="margin-top:12px">
                                <textarea class="form-textarea" id="inv-comment-input" rows="2" placeholder="Add a comment..."></textarea>
                                <button class="btn btn-primary btn-sm" style="margin-top:6px" onclick="InvoicesPage.addComment('${inv.id}')">Post Comment</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    addComment(invId) {
        const text = document.getElementById('inv-comment-input').value.trim();
        if (!text) return;
        const inv = Store.find('invoices', invId);
        if (!inv) return;
        const comment = { id: Utils.uid(), userId: Auth.getUser().id, text, date: new Date().toISOString() };
        inv.comments = inv.comments || [];
        inv.comments.push(comment);
        Store.update('invoices', invId, { comments: inv.comments });
        addAuditLog('Comment Added', inv.invoiceNo, text.substring(0, 50));
        this.renderDetail(invId);
    },

    advanceStatus(invId, action) {
        const inv = Store.find('invoices', invId);
        if (!inv) return;
        const user = Auth.getUser();
        const now = new Date().toISOString();
        const wf = inv.workflow || {};

        switch (action) {
            case 'verify':
                wf.verified = { date: now, by: user.id };
                inv.status = 'verified';
                addNotification('Invoice Verified', `${inv.invoiceNo} verified by ${user.name}. Awaiting manager approval.`, 'info', ['manager', 'admin']);
                break;
            case 'approve':
                wf.approved = { date: now, by: user.id };
                inv.status = 'approved';
                addNotification('Invoice Approved', `${inv.invoiceNo} approved by ${user.name}. Awaiting CEO approval.`, 'info', ['ceo', 'admin']);
                break;
            case 'ceoApprove':
                wf.ceoApproved = { date: now, by: user.id };
                addNotification('CEO Approved', `${inv.invoiceNo} approved by CEO. Ready for bank upload.`, 'success', ['accountant', 'admin']);
                break;
            case 'uploadBank':
                wf.uploadedToBank = { date: now, by: user.id };
                addNotification('Uploaded to Bank', `${inv.invoiceNo} uploaded to bank portal.`, 'info', ['admin', 'accountant']);
                break;
        }

        Store.update('invoices', invId, { status: inv.status, workflow: wf });
        addAuditLog(`Invoice ${action}`, inv.invoiceNo, `By ${user.name}`);
        Utils.toast(`Invoice ${action} completed`, 'success');
        Notifications.updateBadge();
        this.renderDetail(invId);
    },

    rejectInvoice(invId) {
        const body = `<div class="form-group"><label class="form-label">Reason for rejection *</label><textarea class="form-textarea" id="reject-reason" rows="3" placeholder="Enter reason..."></textarea></div>`;
        Components.openModal('Reject Invoice', body,
            `<button class="btn btn-ghost" onclick="Components.closeModal()">Cancel</button><button class="btn btn-danger" onclick="InvoicesPage.confirmReject('${invId}')">Reject</button>`);
    },

    confirmReject(invId) {
        const reason = document.getElementById('reject-reason').value.trim();
        if (!reason) { Utils.toast('Please provide a reason', 'error'); return; }
        const inv = Store.find('invoices', invId);
        Store.update('invoices', invId, { status: 'received', workflow: { ...inv.workflow, verified: null, approved: null, ceoApproved: null } });
        // Add rejection comment
        inv.comments = inv.comments || [];
        inv.comments.push({ id: Utils.uid(), userId: Auth.getUser().id, text: `❌ Rejected: ${reason}`, date: new Date().toISOString() });
        Store.update('invoices', invId, { comments: inv.comments });
        addAuditLog('Invoice Rejected', inv.invoiceNo, reason);
        addNotification('Invoice Rejected', `${inv.invoiceNo} was rejected: ${reason}`, 'warning', ['accountant', 'admin']);
        Utils.toast('Invoice rejected', 'warning');
        Components.closeModal();
        Notifications.updateBadge();
        this.renderDetail(invId);
    },

    showPaymentForm(invId) {
        const body = `
            <div class="form-group"><label class="form-label">Payment Method *</label>
                <select class="form-select" id="pay-method">
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                </select>
            </div>
            <div class="form-group"><label class="form-label">Reference / Transaction ID</label><input type="text" class="form-input" id="pay-ref"></div>
            <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="pay-notes" rows="2"></textarea></div>
        `;
        Components.openModal('Record Payment', body,
            `<button class="btn btn-ghost" onclick="Components.closeModal()">Cancel</button><button class="btn btn-success" onclick="InvoicesPage.recordPayment('${invId}')">Confirm Payment</button>`);
    },

    recordPayment(invId) {
        const method = document.getElementById('pay-method').value;
        const ref = document.getElementById('pay-ref').value.trim();
        const notes = document.getElementById('pay-notes').value.trim();
        const inv = Store.find('invoices', invId);
        const wf = inv.workflow || {};
        wf.paid = { date: new Date().toISOString(), by: Auth.getUser().id, method, reference: ref };
        Store.update('invoices', invId, { status: 'paid', workflow: wf });
        if (notes) {
            inv.comments = inv.comments || [];
            inv.comments.push({ id: Utils.uid(), userId: Auth.getUser().id, text: `💰 Payment recorded: ${method}${ref ? ` (Ref: ${ref})` : ''}. ${notes}`, date: new Date().toISOString() });
            Store.update('invoices', invId, { comments: inv.comments });
        }
        addAuditLog('Payment Completed', inv.invoiceNo, `${method} — ${Utils.currency(inv.amount)}`);
        addNotification('Payment Completed', `${inv.invoiceNo} (${Utils.currency(inv.amount)}) paid via ${method}.`, 'success', ['admin', 'accountant', 'ceo']);
        Utils.toast('Payment recorded', 'success');
        Components.closeModal();
        Notifications.updateBadge();
        this.renderDetail(invId);
    }
};
