/* ================================================================
   FINANCEFLOW — SHARED UI COMPONENTS
   ================================================================ */
const Components = {
    // Reusable modal
    openModal(title, bodyHtml, footerHtml = '') {
        const overlay = document.getElementById('modal-overlay');
        const container = document.getElementById('modal-container');
        container.innerHTML = `
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" onclick="Components.closeModal()">${Utils.icons.x}</button>
            </div>
            <div class="modal-body">${bodyHtml}</div>
            ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
        `;
        overlay.classList.remove('hidden');
        overlay.onclick = (e) => { if (e.target === overlay) Components.closeModal(); };
    },
    closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    },

    // Confirm dialog
    confirm(message, onConfirm) {
        Components.openModal('Confirm', `<p style="color:var(--text-secondary)">${message}</p>`,
            `<button class="btn btn-ghost" onclick="Components.closeModal()">Cancel</button>
             <button class="btn btn-danger" onclick="Components.closeModal(); (${onConfirm.toString()})()">Confirm</button>`
        );
    },

    // Status badge
    statusBadge(status) {
        const map = {
            received: { cls: 'badge-info', label: 'Received' },
            verified: { cls: 'badge-accent', label: 'Verified' },
            approved: { cls: 'badge-warning', label: 'Approved' },
            uploaded: { cls: 'badge-info', label: 'Uploaded to Bank' },
            paid: { cls: 'badge-success', label: 'Paid' },
            rejected: { cls: 'badge-danger', label: 'Rejected' }
        };
        const s = map[status] || { cls: 'badge-neutral', label: status };
        return `<span class="badge ${s.cls}"><span class="badge-dot"></span>${s.label}</span>`;
    },

    // Pagination
    pagination(totalItems, currentPage, perPage, onPageChange) {
        const totalPages = Math.ceil(totalItems / perPage);
        if (totalPages <= 1) return '';
        let html = '<div class="pagination">';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="${onPageChange}(${i})">${i}</button>`;
        }
        html += '</div>';
        return html;
    },

    // Step progress bar
    stepProgress(steps) {
        let html = '<div class="step-progress">';
        steps.forEach((step, i) => {
            html += `<div class="step-dot ${step.status}" title="${step.label}">${step.status === 'completed' ? '✓' : i + 1}</div>`;
            if (i < steps.length - 1) html += `<div class="step-line ${step.status === 'completed' ? 'completed' : ''}"></div>`;
        });
        html += '</div>';
        return html;
    },

    // Vendor name lookup
    vendorName(vendorId) {
        const v = Store.find('vendors', vendorId);
        return v ? v.name : 'Unknown Vendor';
    },

    // Category name lookup
    categoryName(categoryId) {
        const c = Store.find('categories', categoryId);
        return c ? c.name : 'Uncategorized';
    },

    // User name lookup
    userName(userId) {
        const u = Store.find('users', userId);
        return u ? u.name : 'System';
    },

    // Invoice workflow status steps
    getWorkflowSteps(invoice) {
        const wf = invoice.workflow || {};
        return [
            { label: 'Received', status: wf.received ? 'completed' : (invoice.status === 'received' ? 'current' : 'pending'), data: wf.received },
            { label: 'Verified', status: wf.verified ? 'completed' : (invoice.status === 'verified' ? 'current' : 'pending'), data: wf.verified },
            { label: 'Manager Approved', status: wf.approved ? 'completed' : (invoice.status === 'approved' && !wf.approved ? 'current' : 'pending'), data: wf.approved },
            { label: 'CEO Approved', status: wf.ceoApproved ? 'completed' : (wf.approved && !wf.ceoApproved ? 'current' : 'pending'), data: wf.ceoApproved },
            { label: 'Uploaded to Bank', status: wf.uploadedToBank ? 'completed' : (wf.ceoApproved && !wf.uploadedToBank ? 'current' : 'pending'), data: wf.uploadedToBank },
            { label: 'Paid', status: wf.paid ? 'completed' : (wf.uploadedToBank && !wf.paid ? 'current' : 'pending'), data: wf.paid }
        ];
    },

    // High value flag
    highValueFlag(amount) {
        if (amount >= HIGH_VALUE_THRESHOLD) {
            return `<span class="flag-high-value">${Utils.icons.flag} High Value</span>`;
        }
        return '';
    },

    // Duplicate check
    checkDuplicate(invoiceNo, vendorId, amount, excludeId = null) {
        const invoices = Store.getAll('invoices');
        const hash = Utils.invoiceHash(invoiceNo, vendorId, amount);
        return invoices.find(inv => inv.id !== excludeId && Utils.invoiceHash(inv.invoiceNo, inv.vendorId, inv.amount) === hash);
    }
};
