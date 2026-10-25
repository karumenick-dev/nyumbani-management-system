export function renderTenantTable(tenants) {
    tenants.sort((a, b) => parseInt(a.unit, 10) - parseInt(b.unit, 10));
    const addTenantBtn = document.getElementById('add-tenant-btn');
    const addDefectBtn = document.getElementById('add-defect-btn');
    if (addTenantBtn) addTenantBtn.style.display = 'inline-block';
    if (addDefectBtn) addDefectBtn.style.display = 'none';

    const tableContainer = document.querySelector('.tenant-table');
    if (tableContainer) {
        const thead = tableContainer.querySelector('thead');
        if (thead) {
            thead.innerHTML = `
                <tr>
                    <th>Unit Number</th>
                    <th>Tenant Name</th>
                    <th>Contact Details</th>
                    <th>Rent Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            `;
        }
    }

    const tableBody = document.getElementById('tenant-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!tenants || tenants.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    No tenant records found. Click "+ Add Tenant" to create one.
                </td>
            </tr>
        `;
        return;
    }

    tenants.forEach(tenant => {
        const row = document.createElement('tr');
        const statusClass = tenant.status && tenant.status.toLowerCase() === 'paid' ? 'paid' : 'overdue';

        row.innerHTML = `
            <td>${escapeHTML(tenant.unit)}</td>
            <td>${escapeHTML(tenant.name)}</td>
            <td>${escapeHTML(tenant.phone)}</td>
            <td>${escapeHTML(tenant.rentDueDate)}</td>
            <td><span class="status-badge ${statusClass}">${escapeHTML(tenant.status)}</span></td>
            <td>
                <button class="btn-edit" data-id="${tenant.id}">Edit</button>
                <button class="btn-delete" data-id="${tenant.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function renderDefectsTable(defects, tenants = []) {
    const tableContainer = document.querySelector('.tenant-table');
    if (tableContainer) {
        const thead = tableContainer.querySelector('thead');
        if (thead) {
            thead.innerHTML = `
                <tr>
                    <th>Unit Number</th>
                    <th>Tenant Name</th>
                    <th>Contact Details</th>
                    <th>Active Defect</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            `;
        }
    }

    const tableBody = document.getElementById('tenant-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!defects || defects.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No active defects found.</td></tr>`;
        return;
    }

    // Normalizes unit strings like "Unit 01", "01", "1" -> "1"
    const normalizeUnit = (u) => {
        if (!u) return '';
        return u.toString().replace(/unit/gi, '').trim().replace(/^0+/, '');
    };

    defects.forEach(defect => {
        const rawStatus = defect.status ? defect.status.toString().trim() : 'Pending';
        const statusVal = rawStatus.toLowerCase();
        
        let statusClass = 'overdue';
        if (statusVal === 'fixed') {
            statusClass = 'paid'; 
        } else if (statusVal === 'in progress') {
            statusClass = 'pending';
        }

        const defectUnitClean = normalizeUnit(defect.unit);
        const matchingTenant = tenants.find(t => normalizeUnit(t.unit) === defectUnitClean);

        const tenantName = matchingTenant ? matchingTenant.name : 'Unassigned';
        const contactDetails = matchingTenant ? matchingTenant.phone : '-';
        const defectText = defect.description || defect.issue || defect.title || 'Reported Issue';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHTML(defect.unit.toString().replace(/unit/gi, '').trim())}</td>
            <td>${escapeHTML(tenantName)}</td>
            <td>${escapeHTML(contactDetails)}</td>
            <td>${escapeHTML(defectText)}</td>
            <td>
                <span class="status-badge ${statusClass}">${escapeHTML(rawStatus.toUpperCase())}</span>
            </td>
            <td>
                <button class="btn-edit" data-id="${defect.id}">Edit</button>
                <button class="btn-delete" data-id="${defect.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

export function updateDashboardStats(tenants, defects = []) {
    const safeTenants = tenants || [];
    const safeDefects = defects || [];

    const totalUnitsElement = document.getElementById('total-units-count');
    if (totalUnitsElement) {
        const occupiedCount = safeTenants.length;
        totalUnitsElement.textContent = `${occupiedCount}/16`;
    }

    const RENT_PER_UNIT = 25000;

    const paidTenants = safeTenants.filter(t => t.status && t.status.toLowerCase() === 'paid');
    const rentCollected = paidTenants.length * RENT_PER_UNIT;

    const overdueTenants = safeTenants.filter(t => t.status && t.status.toLowerCase() === 'overdue');
    const pendingArrears = overdueTenants.length * RENT_PER_UNIT;

    const rentCollectedElement = document.getElementById('rent-collected-value');
    if (rentCollectedElement) {
        rentCollectedElement.textContent = `KSH ${rentCollected.toLocaleString()}`;
    }

    const pendingArrearsElement = document.getElementById('pending-arrears-value');
    if (pendingArrearsElement) {
        pendingArrearsElement.textContent = `KSH ${pendingArrears.toLocaleString()}`;
    }

    const activeDefectsElement = document.getElementById('active-defects-count');
    if (activeDefectsElement) {
        // Exclude fixed defects so only active/unresolved ones are counted
        const unresolvedDefects = safeDefects.filter(d => {
            const status = d.status ? d.status.toString().trim().toLowerCase() : '';
            return status !== 'fixed';
        });
        const defectCount = unresolvedDefects.length;
        activeDefectsElement.textContent = `${defectCount} ${defectCount === 1 ? 'Issue' : 'Issues'}`;
    }
}

