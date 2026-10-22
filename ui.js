/**
 * UI Module: Handles DOM rendering and updates for the application interface.
 */

/**
 * Renders the tenant roster data into the HTML table body.
 * 
 * @param {Array<Object>} tenants Array of tenant objects from the API
 */
export function renderTenantTable(tenants) {
    const tableBody = document.getElementById('tenant-table-body');
    
    if (!tableBody) {
        console.error("Table body element ('tenant-table-body') not found in DOM.");
        return;
    }

    // Clear existing static placeholder rows
    tableBody.innerHTML = '';

    // Handle empty state
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

    // Loop through each tenant and construct their table row
    tenants.forEach(tenant => {
        const row = document.createElement('tr');

        // Format status badge CSS class dynamically
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

/**
 * Simple helper to prevent XSS / sanitize dynamic string text
 */
function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Renders residential defects data into the table body
 */
export function renderDefectsTable(defects) {
    const tableBody = document.getElementById('tenant-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!defects || defects.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No active defects found.</td></tr>`;
        return;
    }

    defects.forEach(defect => {
        const statusVal = defect.status ? defect.status.trim().toLowerCase() : '';
        
        let statusClass = 'overdue';
        if (statusVal === 'fixed') {
            statusClass = 'paid'; 
        } else if (statusVal === 'in progress') {
            statusClass = 'pending';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Unit ${escapeHTML(defect.unit)}</td>
            <td colspan="2">${escapeHTML(defect.description)}</td>
            <td>-</td>
            <td>
                <span class="status-badge ${statusClass}">${escapeHTML(defect.status)}</span>
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
        rentCollectedElement.textContent = `KSh ${rentCollected.toLocaleString()}`;
    }

    const pendingArrearsElement = document.getElementById('pending-arrears-value');
    if (pendingArrearsElement) {
        pendingArrearsElement.textContent = `KSh ${pendingArrears.toLocaleString()}`;
    }

    const activeDefectsElement = document.getElementById('active-defects-count');
    if (activeDefectsElement) {
        const defectCount = safeDefects.length;
        activeDefectsElement.textContent = `${defectCount} ${defectCount === 1 ? 'Issue' : 'Issues'}`;
    }
}