/* ================================================================
   FINANCEFLOW — USERS PAGE (Admin only)
   ================================================================ */
const UsersPage = {
    render() {
        const users = Store.getAll('users');
        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="page-header">
                <div><h1>User Management</h1><div class="page-header-sub">${users.length} registered users</div></div>
                <div class="page-header-actions">
                    <button class="btn btn-primary" onclick="UsersPage.showForm()">${Utils.icons.plus} Add User</button>
                </div>
            </div>

            <div class="user-grid">
                ${users.map(u => `
                    <div class="user-card">
                        <div class="user-card-avatar">${Utils.initials(u.name)}</div>
                        <div class="user-card-name">${Utils.escHtml(u.name)}</div>
                        <div class="user-card-role"><span class="badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'ceo' ? 'badge-warning' : u.role === 'manager' ? 'badge-accent' : 'badge-info'}">${Auth.roleName(u.role)}</span></div>
                        <div class="user-card-email">${Utils.escHtml(u.email)}</div>
                        <div class="user-card-actions">
                            <button class="btn btn-secondary btn-sm" onclick="UsersPage.showForm('${u.id}')">${Utils.icons.edit} Edit</button>
                            ${u.id !== Auth.getUser().id ? `<button class="btn btn-danger btn-sm" onclick="UsersPage.deleteUser('${u.id}')">${Utils.icons.trash}</button>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Activity log summary per user -->
            <div class="card" style="margin-top:24px">
                <div class="card-header"><h3>User Activity Summary</h3></div>
                <div class="table-wrap">
                    <table class="data-table">
                        <thead><tr><th>User</th><th>Role</th><th>Total Actions</th><th>Last Activity</th></tr></thead>
                        <tbody>
                            ${users.map(u => {
                                const logs = Store.getAll('auditLogs').filter(l => l.userId === u.id);
                                const lastLog = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                                return `<tr>
                                    <td class="cell-primary">${Utils.escHtml(u.name)}</td>
                                    <td>${Auth.roleName(u.role)}</td>
                                    <td>${logs.length}</td>
                                    <td>${lastLog ? Utils.timeAgo(lastLog.timestamp) + ' — ' + Utils.escHtml(lastLog.action) : '—'}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    showForm(userId = null) {
        const user = userId ? Store.find('users', userId) : null;
        const body = `
            <div class="form-group"><label class="form-label">Full Name *</label><input type="text" class="form-input" id="uf-name" value="${user ? Utils.escHtml(user.name) : ''}"></div>
            <div class="form-group"><label class="form-label">Email *</label><input type="email" class="form-input" id="uf-email" value="${user ? Utils.escHtml(user.email) : ''}"></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Role *</label>
                    <select class="form-select" id="uf-role">
                        <option value="accountant" ${user && user.role === 'accountant' ? 'selected' : ''}>Accountant</option>
                        <option value="manager" ${user && user.role === 'manager' ? 'selected' : ''}>Manager</option>
                        <option value="ceo" ${user && user.role === 'ceo' ? 'selected' : ''}>CEO</option>
                        <option value="admin" ${user && user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>
                <div class="form-group"><label class="form-label">Password</label><input type="text" class="form-input" id="uf-password" value="${user ? user.password : 'demo123'}" placeholder="Enter password"></div>
            </div>
        `;
        Components.openModal(user ? 'Edit User' : 'Add User', body,
            `<button class="btn btn-ghost" onclick="Components.closeModal()">Cancel</button><button class="btn btn-primary" onclick="UsersPage.saveUser('${userId || ''}')">Save User</button>`);
    },

    saveUser(userId) {
        const name = document.getElementById('uf-name').value.trim();
        const email = document.getElementById('uf-email').value.trim();
        if (!name || !email) { Utils.toast('Fill all required fields', 'error'); return; }
        const data = {
            name, email,
            role: document.getElementById('uf-role').value,
            password: document.getElementById('uf-password').value || 'demo123',
            avatar: Utils.initials(name)
        };
        if (userId) {
            Store.update('users', userId, data);
            addAuditLog('User Updated', name);
            Utils.toast('User updated', 'success');
        } else {
            data.id = Utils.uid();
            Store.add('users', data);
            addAuditLog('User Created', name, `Role: ${data.role}`);
            Utils.toast('User added', 'success');
        }
        // Update login dropdown
        const select = document.getElementById('login-user');
        if (select) {
            select.innerHTML = Store.getAll('users').map(u => `<option value="${u.id}">${u.name} (${Auth.roleName(u.role)})</option>`).join('');
        }
        Components.closeModal();
        this.render();
    },

    deleteUser(id) {
        const user = Store.find('users', id);
        Components.confirm(`Delete user "${user?.name}"?`, () => {
            Store.remove('users', id);
            addAuditLog('User Deleted', user?.name || id);
            Utils.toast('User deleted', 'success');
            this.render();
        });
    }
};
