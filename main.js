/**
- Main Entry Point: Initializes the Nyumbani Management System application,
- fetches backend data via api.js, and binds UI event listeners.
 */
import { renderTenantTable, renderDefectsTable, updateDashboardStats } from './ui.js';
import { getTenants, addTenant, removeTenant, updateTenant, getDefects, removeDefect, updateDefect } from './api.js';

/**
- Initialize application state on DOM content load
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Nyumbani Management System initialized.");
    
    // 1. Load initial tenant data from JSON Server
    await loadTenantData();

    // 2. Set up event listeners for user actions
    setupEventListeners();

    // Enable sidebar interactivity
    setupSidebarNavigation();
});

/**
- Fetch tenants from the API and update the UI table
 */
async function loadTenantData() {
    try {
        const tenants = await getTenants();
        const defects = await getDefects();
        renderTenantTable(tenants);
        updateDashboardStats(tenants, defects);
    } catch (error) {
        console.error("Failed to load tenant roster:", error);
        const tableBody = document.getElementById('tenant-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: var(--danger-color); padding: 2rem;">
                        Failed to connect to JSON Server backend. Please ensure json-server is running on port 8080.
                    </td>
                </tr>
            `;
        }
    }
}

/**
- Bind click events, form submissions, and interactive buttons
 */
function setupEventListeners() {
    // Handle Add Tenant button click
    const addTenantBtn = document.getElementById('add-tenant-btn');
    if (addTenantBtn) {
        addTenantBtn.addEventListener('click', async () => {
            const unit = prompt("Enter Unit Number (e.g., 04):");
            if (!unit) return;
            try {
                const currentTenants = await getTenants();
                const unitExists = currentTenants.some(
                    t => t.unit.trim().toLowerCase() === unit.trim().toLowerCase()
                );

                if (unitExists) {
                    alert(`Unit ${unit} is already occupied! Please choose a different unit number.`);
                    return;
                }
            } catch (error) {
                console.error("Failed to validate unit availability:", error);
                alert("Error checking unit availability. Please try again.");
                return;
            }
            const name = prompt("Enter Tenant Full Name:");
            if (!name) return;
            const phone = prompt("Enter Phone Number:");
            const rentDueDate = prompt("Enter Rent Due Date (e.g., Nov 30, 2026):") || "Pending";
            const status = prompt("Enter Status (Paid / Overdue):") || "Paid";

            const newTenant = {
                unit: unit.trim(),
                name,
                phone: phone || "N/A",
                rentDueDate,
                status
            };

            try {
                await addTenant(newTenant);
                await loadTenantData();
            } catch (error) {
                alert("Failed to add new tenant. Check console for details.");
            }
        });
    }

    // Handle Table Actions (Edit & Delete for Tenants and Defects) via Event Delegation
    const tableBody = document.getElementById('tenant-table-body');
    if (tableBody) {
        tableBody.addEventListener('click', async (event) => {
            
            // --- 1. HANDLE TENANT DELETE ---
            if (event.target.classList.contains('btn-delete')) {
                const tenantId = event.target.getAttribute('data-id');
                if (confirm(`Are you sure you want to delete tenant ID ${tenantId}?`)) {
                    try {
                        await removeTenant(tenantId);
                        await loadTenantData();
                    } catch (error) {
                        alert("Failed to delete tenant record.");
                    }
                }
            }

            // --- 2. HANDLE TENANT EDIT ---
            if (event.target.classList.contains('btn-edit')) {
                const tenantId = event.target.getAttribute('data-id');
                try {
                    const tenants = await getTenants();
                    const tenantToEdit = tenants.find(t => t.id.toString() === tenantId.toString());

                    if (!tenantToEdit) return;

                    const newName = prompt("Edit Tenant Name:", tenantToEdit.name);
                    const newPhone = prompt("Edit Phone Number:", tenantToEdit.phone);
                    const newUnit = prompt("Edit Unit Number:", tenantToEdit.unit);
                    const newStatus = prompt("Edit Status (Paid / Overdue):", tenantToEdit.status);

                    if (newName !== null && newPhone !== null && newUnit !== null && newStatus !== null) {
                        const updatedData = {
                            name: newName.trim(),
                            phone: newPhone.trim(),
                            unit: newUnit.trim(),
                            status: newStatus.trim()
                        };

                        await updateTenant(tenantId, updatedData);
                        await loadTenantData();
                    }
                } catch (error) {
                    console.error("Failed to update tenant:", error);
                    alert("Failed to update tenant record.");
                }
            }

            // --- 3. HANDLE DEFECT DELETE ---
            if (event.target.classList.contains('btn-delete-defect')) {
                const defectId = event.target.getAttribute('data-id');
                if (confirm(`Are you sure you want to delete this defect record?`)) {
                    try {
                        await removeDefect(defectId);
                        const defects = await getDefects();
                        const tenants = await getTenants();
                        renderDefectsTable(defects);
                        updateDashboardStats(tenants, defects);
                    } catch (error) {
                        alert("Failed to delete defect record.");
                    }
                }
            }

            // --- 4. HANDLE DEFECT EDIT ---
            if (event.target.classList.contains('btn-edit-defect')) {
                const defectId = event.target.getAttribute('data-id');
                try {
                    const defects = await getDefects();
                    const defectToEdit = defects.find(d => d.id.toString() === defectId.toString());

                    if (!defectToEdit) return;

                    const newDescription = prompt("Edit Defect Description:", defectToEdit.description);
                    const newStatus = prompt("Edit Status (Pending / In Progress / Resolved):", defectToEdit.status);

                    if (newDescription !== null && newStatus !== null) {
                        const updatedData = {
                            description: newDescription.trim(),
                            status: newStatus.trim()
                        };

                        await updateDefect(defectId, updatedData);

                        const refreshedDefects = await getDefects();
                        const tenants = await getTenants();
                        renderDefectsTable(refreshedDefects);
                        updateDashboardStats(tenants, refreshedDefects);
                    }
                } catch (error) {
                    console.error("Failed to update defect:", error);
                    alert("Failed to update defect record.");
                }
            }
        });
    }
}

/**
- Handle sidebar navigation clicks to switch views and filter data
 */
function setupSidebarNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.querySelector('.page-title');

    navItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const sectionName = item.textContent.trim();
            if (pageTitle) {
                pageTitle.textContent = sectionName === 'Dashboard' ? 'Dashboard Overview' : sectionName;
            }

            try {
                if (sectionName === 'Residential Defects') {
                    const defects = await getDefects();
                    const tenants = await getTenants();
                    renderDefectsTable(defects);
                    updateDashboardStats(tenants, defects); 
                } else if (sectionName === 'Rent & Arrears') {
                    const tenants = await getTenants();
                    const defects = await getDefects();
                    const arrearsTenants = tenants.filter(t => t.status && t.status.toLowerCase() === 'overdue');
                    renderTenantTable(arrearsTenants);
                    updateDashboardStats(tenants, defects);
                } else {
                    const tenants = await getTenants();
                    const defects = await getDefects();
                    renderTenantTable(tenants);
                    updateDashboardStats(tenants, defects);
                }
            } catch (error) {
                console.error(`Failed to load view for ${sectionName}:`, error);
            }
        });
    });
}