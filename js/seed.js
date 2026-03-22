/* ================================================================
   FINANCEFLOW — SEED DATA
   ================================================================ */
function seedDatabase() {
    // Only seed if not already done
    if (Store.get('seeded')) return;

    // ---------- USERS ----------
    const users = [
        { id: 'u1', name: 'Kunal Kumar', email: 'kunal@company.com', role: 'admin', password: 'demo123', avatar: 'KK' },
        { id: 'u2', name: 'Aayushi Vishnoi', email: 'aayushi@company.com', role: 'accountant', password: 'demo123', avatar: 'AV' },
        { id: 'u3', name: 'Shashank Sukhralia', email: 'shashank@company.com', role: 'manager', password: 'demo123', avatar: 'SS' },
        { id: 'u4', name: 'Sumit Gandhi', email: 'sumit@company.com', role: 'ceo', password: 'demo123', avatar: 'SG' }
    ];
    Store.set('users', users);

    // ---------- CATEGORIES ----------
    const categories = [
        { id: 'c1', name: 'Marketing', budget: 1500000, color: '#6366f1', description: 'Marketing and advertising expenses', createdAt: '2025-01-01' },
        { id: 'c2', name: 'IT & Technology', budget: 2000000, color: '#3b82f6', description: 'Software, hardware, and IT infrastructure', createdAt: '2025-01-01' },
        { id: 'c3', name: 'Operations', budget: 1000000, color: '#10b981', description: 'Day-to-day operational costs', createdAt: '2025-01-01' },
        { id: 'c4', name: 'Human Resources', budget: 800000, color: '#f59e0b', description: 'HR related expenses, training, recruitment', createdAt: '2025-01-01' },
        { id: 'c5', name: 'Office & Admin', budget: 500000, color: '#ef4444', description: 'Office supplies, utilities, rent', createdAt: '2025-01-01' },
        { id: 'c6', name: 'Legal & Compliance', budget: 600000, color: '#8b5cf6', description: 'Legal fees, compliance, audits', createdAt: '2025-01-01' },
        { id: 'c7', name: 'Miscellaneous', budget: 300000, color: '#64748b', description: 'Other uncategorized expenses', createdAt: '2025-01-01' }
    ];
    Store.set('categories', categories);

    // ---------- VENDORS ----------
    const vendors = [
        { id: 'v1', name: 'TechNova Solutions', contact: 'Rahul Singh', phone: '9876543210', email: 'billing@technova.in', gst: '29AABCU9603R1ZM', bankName: 'HDFC Bank', accountNo: '50200012345678', ifsc: 'HDFC0001234', category: 'c2', address: '123 MG Road, Bngalore', createdAt: '2025-01-15' },
        { id: 'v2', name: 'Creative Minds Agency', contact: 'Neha Gupta', phone: '9876501234', email: 'finance@creativeminds.in', gst: '07AAACN2082D1ZR', bankName: 'ICICI Bank', accountNo: '00600200123456', ifsc: 'ICIC0006001', category: 'c1', address: '45 Nehru Place, New Delhi', createdAt: '2025-02-01' },
        { id: 'v3', name: 'FastTrack Logistics', contact: 'Suresh Rao', phone: '9988776655', email: 'accounts@fasttrack.in', gst: '27AADCF2180L1ZE', bankName: 'SBI', accountNo: '32010987654321', ifsc: 'SBIN0000321', category: 'c3', address: '78 Industrial Area, Mumbai', createdAt: '2025-01-20' },
        { id: 'v4', name: 'GreenLeaf Interiors', contact: 'Deepika Joshi', phone: '8877665544', email: 'sales@greenleaf.in', gst: '06AADCG3456M1ZP', bankName: 'Axis Bank', accountNo: '91700100456789', ifsc: 'UTIB0001234', category: 'c5', address: '12 Sector-14, Gurgaon', createdAt: '2025-03-01' },
        { id: 'v5', name: 'SecureShield Legal', contact: 'Vikram Mehta', phone: '9123456789', email: 'office@secureshield.in', gst: '29AADCS5678K1ZT', bankName: 'Kotak Mahindra', accountNo: '77880100567890', ifsc: 'KKBK0005678', category: 'c6', address: '90 Brigade Road, Bangalore', createdAt: '2025-02-15' },
        { id: 'v6', name: 'SkillUp Academy', contact: 'Anjali Desai', phone: '9012345678', email: 'payments@skillup.in', gst: '24AADCS2345J1ZQ', bankName: 'PNB', accountNo: '0012000345678', ifsc: 'PUNB0001234', category: 'c4', address: '34 CG Road, Ahmedabad', createdAt: '2025-01-10' },
        { id: 'v7', name: 'CloudStack Services', contact: 'Manish Tiwari', phone: '9876012345', email: 'billing@cloudstack.io', gst: '29AADCC7890L1ZR', bankName: 'Yes Bank', accountNo: '01234567890123', ifsc: 'YESB0001234', category: 'c2', address: '56 HSR Layout, Bangalore', createdAt: '2025-03-10' }
    ];
    Store.set('vendors', vendors);

    // ---------- INVOICES ----------
    const now = new Date();
    const invoices = [
        { id: 'inv1', invoiceNo: 'INV-2025-001', vendorId: 'v1', categoryId: 'c2', amount: 350000, description: 'Cloud infrastructure setup and configuration', invoiceDate: '2025-11-05', dueDate: '2025-12-05', status: 'paid', work: 'Cloud Migration Project', fileData: null, fileName: null,
          workflow: { received: { date: '2025-11-06', by: 'u2' }, verified: { date: '2025-11-08', by: 'u2' }, approved: { date: '2025-11-10', by: 'u3' }, ceoApproved: { date: '2025-11-11', by: 'u4' }, uploadedToBank: { date: '2025-11-12', by: 'u2' }, paid: { date: '2025-11-14', by: 'u2', method: 'Bank Transfer' } },
          comments: [{ id: 'cm1', userId: 'u2', text: 'Invoice verified against PO.', date: '2025-11-08' }, { id: 'cm2', userId: 'u3', text: 'Approved. Good pricing.', date: '2025-11-10' }],
          createdAt: '2025-11-05' },

        { id: 'inv2', invoiceNo: 'INV-2025-002', vendorId: 'v2', categoryId: 'c1', amount: 275000, description: 'Q4 Digital marketing campaign execution', invoiceDate: '2025-11-15', dueDate: '2025-12-15', status: 'approved', work: 'Q4 Marketing Campaign',  fileData: null, fileName: null,
          workflow: { received: { date: '2025-11-16', by: 'u2' }, verified: { date: '2025-11-18', by: 'u2' }, approved: { date: '2025-11-20', by: 'u3' }, ceoApproved: null, uploadedToBank: null, paid: null },
          comments: [{ id: 'cm3', userId: 'u3', text: 'Campaign ROI looks positive, approved.', date: '2025-11-20' }],
          createdAt: '2025-11-15' },

        { id: 'inv3', invoiceNo: 'INV-2025-003', vendorId: 'v3', categoryId: 'c3', amount: 125000, description: 'Monthly logistics and warehousing charges', invoiceDate: '2025-12-01', dueDate: '2026-01-01', status: 'verified', work: 'Monthly Logistics',  fileData: null, fileName: null,
          workflow: { received: { date: '2025-12-02', by: 'u2' }, verified: { date: '2025-12-04', by: 'u2' }, approved: null, ceoApproved: null, uploadedToBank: null, paid: null },
          comments: [],
          createdAt: '2025-12-01' },

        { id: 'inv4', invoiceNo: 'INV-2025-004', vendorId: 'v4', categoryId: 'c5', amount: 180000, description: 'Office renovation phase 2 — flooring and painting', invoiceDate: '2025-12-10', dueDate: '2026-01-10', status: 'received', work: 'Office Renovation Phase 2',  fileData: null, fileName: null,
          workflow: { received: { date: '2025-12-11', by: 'u2' }, verified: null, approved: null, ceoApproved: null, uploadedToBank: null, paid: null },
          comments: [],
          createdAt: '2025-12-10' },

        { id: 'inv5', invoiceNo: 'INV-2025-005', vendorId: 'v5', categoryId: 'c6', amount: 450000, description: 'Annual compliance audit and legal review', invoiceDate: '2025-10-20', dueDate: '2025-11-20', status: 'paid', work: 'Annual Compliance Audit',  fileData: null, fileName: null,
          workflow: { received: { date: '2025-10-21', by: 'u2' }, verified: { date: '2025-10-23', by: 'u2' }, approved: { date: '2025-10-25', by: 'u3' }, ceoApproved: { date: '2025-10-26', by: 'u4' }, uploadedToBank: { date: '2025-10-28', by: 'u2' }, paid: { date: '2025-10-30', by: 'u2', method: 'Bank Transfer' } },
          comments: [{ id: 'cm4', userId: 'u4', text: 'Critical compliance work. Priority payment.', date: '2025-10-26' }],
          createdAt: '2025-10-20' },

        { id: 'inv6', invoiceNo: 'INV-2025-006', vendorId: 'v6', categoryId: 'c4', amount: 95000, description: 'Employee training program — batch 3', invoiceDate: '2025-12-15', dueDate: '2026-01-15', status: 'received', work: 'Employee Training Batch 3',  fileData: null, fileName: null,
          workflow: { received: { date: '2025-12-16', by: 'u2' }, verified: null, approved: null, ceoApproved: null, uploadedToBank: null, paid: null },
          comments: [],
          createdAt: '2025-12-15' },

        { id: 'inv7', invoiceNo: 'INV-2025-007', vendorId: 'v7', categoryId: 'c2', amount: 620000, description: 'Annual cloud hosting subscription renewal', invoiceDate: '2025-11-01', dueDate: '2025-12-01', status: 'paid', work: 'Cloud Hosting Renewal',  fileData: null, fileName: null,
          workflow: { received: { date: '2025-11-02', by: 'u2' }, verified: { date: '2025-11-04', by: 'u2' }, approved: { date: '2025-11-06', by: 'u3' }, ceoApproved: { date: '2025-11-07', by: 'u4' }, uploadedToBank: { date: '2025-11-09', by: 'u2' }, paid: { date: '2025-11-11', by: 'u2', method: 'Bank Transfer' } },
          comments: [{ id: 'cm5', userId: 'u2', text: 'Renewal pricing same as last year.', date: '2025-11-04' }],
          createdAt: '2025-11-01' },

        { id: 'inv8', invoiceNo: 'INV-2025-008', vendorId: 'v1', categoryId: 'c2', amount: 175000, description: 'Security audit and penetration testing', invoiceDate: '2025-12-20', dueDate: '2026-01-20', status: 'verified', work: 'Security Audit Q4',  fileData: null, fileName: null,
          workflow: { received: { date: '2025-12-21', by: 'u2' }, verified: { date: '2025-12-23', by: 'u2' }, approved: null, ceoApproved: null, uploadedToBank: null, paid: null },
          comments: [],
          createdAt: '2025-12-20' },

        { id: 'inv9', invoiceNo: 'INV-2025-009', vendorId: 'v2', categoryId: 'c1', amount: 195000, description: 'Social media management — Jan to Mar', invoiceDate: '2026-01-05', dueDate: '2026-02-05', status: 'received', work: 'Social Media Q1 2026',  fileData: null, fileName: null,
          workflow: { received: { date: '2026-01-06', by: 'u2' }, verified: null, approved: null, ceoApproved: null, uploadedToBank: null, paid: null },
          comments: [],
          createdAt: '2026-01-05' },

        { id: 'inv10', invoiceNo: 'INV-2025-010', vendorId: 'v3', categoryId: 'c3', amount: 85000, description: 'Courier and shipping charges — December', invoiceDate: '2026-01-03', dueDate: '2026-02-03', status: 'received', work: 'Monthly Shipping',  fileData: null, fileName: null,
          workflow: { received: { date: '2026-01-04', by: 'u2' }, verified: null, approved: null, ceoApproved: null, uploadedToBank: null, paid: null },
          comments: [],
          createdAt: '2026-01-03' },

        { id: 'inv11', invoiceNo: 'INV-2025-011', vendorId: 'v1', categoryId: 'c2', amount: 750000, description: 'Enterprise software license for 50 users', invoiceDate: '2026-02-10', dueDate: '2026-03-10', status: 'received', work: 'Software Licensing',  fileData: null, fileName: null,
          workflow: { received: { date: '2026-02-11', by: 'u2' }, verified: null, approved: null, ceoApproved: null, uploadedToBank: null, paid: null },
          comments: [],
          createdAt: '2026-02-10' },

        { id: 'inv12', invoiceNo: 'INV-2025-012', vendorId: 'v4', categoryId: 'c5', amount: 65000, description: 'Office furniture — 10 ergonomic chairs', invoiceDate: '2026-03-01', dueDate: '2026-04-01', status: 'received', work: 'Furniture Purchase',  fileData: null, fileName: null,
          workflow: { received: { date: '2026-03-02', by: 'u2' }, verified: null, approved: null, ceoApproved: null, uploadedToBank: null, paid: null },
          comments: [],
          createdAt: '2026-03-01' }
    ];
    Store.set('invoices', invoices);

    // ---------- INITIAL AUDIT LOGS ----------
    const auditLogs = [
        { id: 'a1', action: 'Vendor Created', target: 'TechNova Solutions', details: '', userId: 'u1', userName: 'Kunal Kumar', userRole: 'admin', timestamp: '2025-01-15T10:30:00' },
        { id: 'a2', action: 'Invoice Created', target: 'INV-2025-001', details: '₹3,50,000 from TechNova Solutions', userId: 'u2', userName: 'Aayushi Vishnoi', userRole: 'accountant', timestamp: '2025-11-05T11:00:00' },
        { id: 'a3', action: 'Invoice Approved', target: 'INV-2025-001', details: 'Manager approval', userId: 'u3', userName: 'Shashank Sukhralia', userRole: 'manager', timestamp: '2025-11-10T14:30:00' },
        { id: 'a4', action: 'Payment Completed', target: 'INV-2025-001', details: 'Bank Transfer', userId: 'u2', userName: 'Aayushi Vishnoi', userRole: 'accountant', timestamp: '2025-11-14T16:00:00' },
        { id: 'a5', action: 'Invoice Created', target: 'INV-2025-005', details: '₹4,50,000 from SecureShield Legal', userId: 'u2', userName: 'Aayushi Vishnoi', userRole: 'accountant', timestamp: '2025-10-20T09:15:00' },
    ];
    Store.set('auditLogs', auditLogs);

    // ---------- INITIAL NOTIFICATIONS ----------
    const notifications = [
        { id: 'n1', title: 'New Invoice Pending', message: 'INV-2025-004 from GreenLeaf Interiors needs verification.', type: 'info', forRoles: ['accountant', 'admin'], read: false, createdAt: '2025-12-11T09:00:00' },
        { id: 'n2', title: 'Approval Required', message: 'INV-2025-003 is verified and waiting for manager approval.', type: 'warning', forRoles: ['manager', 'admin'], read: false, createdAt: '2025-12-04T15:00:00' },
        { id: 'n3', title: 'High Value Invoice', message: 'INV-2025-011 (₹7,50,000) flagged as high value.', type: 'warning', forRoles: ['admin', 'ceo', 'manager'], read: false, createdAt: '2026-02-11T10:00:00' },
        { id: 'n4', title: 'Payment Completed', message: 'INV-2025-007 paid successfully via Bank Transfer.', type: 'success', forRoles: ['admin', 'accountant'], read: true, createdAt: '2025-11-11T14:00:00' },
        { id: 'n5', title: 'CEO Approval Required', message: 'INV-2025-002 (₹2,75,000) approved by Manager. Awaiting CEO final approval.', type: 'warning', forRoles: ['ceo', 'admin'], read: false, createdAt: '2025-11-20T16:00:00' }
    ];
    Store.set('notifications', notifications);

    Store.set('seeded', true);
}
