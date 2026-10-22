/**
 * Main Entry Point: Initializes the Nyumbani Management System application,
 * fetches backend data via api.js, and binds UI event listeners.
 */
import { renderTenantTable, renderDefectsTable, updateDashboardStats } from './ui.js';
import { getTenants, addTenant, removeTenant, updateTenant, getDefects, removeDefect, updateDefect } from './api.js';

/**
 * Initialize application state on DOM content load
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Nyumbani Management System initialized.");
    
    // 1. Load initial tenant data from JSON Server
    await loadTenantData();

    // 2. Set up event listeners for user actions
    setupEventListeners();

    // 3. Enable sidebar interactivity
    setupSidebarNavigation();
});

/**
 * Fetch tenants from the API and update the UI table
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
 * Bind click events, form submissions, and interactive buttons
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
                    t => t.unit && t.unit.toString().trim().toLowerCase() === unit.trim().toLowerCase()
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

    // Handle Table Actions via Event Delegation
    const tableBody = document.getElementById('tenant-table-body');
    if (tableBody) {
        tableBody.addEventListener('click', async (event) => {
            
            // 1. HANDLE TENANT / DEFECT DELETE
            if (event.target.classList.contains('btn-delete')) {
                const recordId = event.target.getAttribute('data-id');
                const activeNav = document.querySelector('.nav-item.active');
                const viewName = activeNav ? activeNav.innerText.trim() : '';

                if (viewName.includes('Residential Defects')) {
                    if (confirm(`Are you sure you want to delete this defect record?`)) {
                        try {
                            await removeDefect(recordId);
                            const defects = await getDefects();
                            const tenants = await getTenants();
                            renderDefectsTable(defects, tenants);
                            updateDashboardStats(tenants, defects);
                        } catch (error) {
                            alert("Failed to delete defect record.");
                        }
                    }
                } else {
                    if (confirm(`Are you sure you want to delete tenant record ID ${recordId}?`)) {
                        try {
                            await removeTenant(recordId);
                            await loadTenantData();
                        } catch (error) {
                            alert("Failed to delete tenant record.");
                        }
                    }
                }
            }

            // 2. HANDLE EDIT (TENANT, DEFECT, OR ARREARS)
            if (event.target.classList.contains('btn-edit')) {
                const recordId = event.target.getAttribute('data-id');
                const activeNav = document.querySelector('.nav-item.active');
                const viewName = activeNav ? activeNav.innerText.trim() : '';

                try {
                    if (viewName.includes('Residential Defects')) {
                        // --- EDIT RESIDENTIAL DEFECT STATUS ONLY ---
                        const defects = await getDefects();
                        const defectToEdit = defects.find(d => d.id.toString() === recordId.toString());

                        if (!defectToEdit) return;

                        const newStatus = prompt(
                            `Update Defect Status for Unit ${defectToEdit.unit}:\nEnter status (FIXED / IN PROGRESS):`,
                            defectToEdit.status || 'IN PROGRESS'
                        );

                        if (newStatus !== null) {
                            const trimmedStatus = newStatus.trim().toUpperCase();
                            if (trimmedStatus === 'FIXED' || trimmedStatus === 'IN PROGRESS') {
                                await updateDefect(recordId, { status: trimmedStatus });
                                
                                // Refresh Defects Table
                                const updatedDefects = await getDefects();
                                const tenants = await getTenants();
                                renderDefectsTable(updatedDefects, tenants);
                                updateDashboardStats(tenants, updatedDefects);
                            } else {
                                alert("Invalid status! Please enter either 'FIXED' or 'IN PROGRESS'.");
                            }
                        }
                    } else if (viewName.includes('Rent & Arrears')) {
                        // --- EDIT RENT & ARREARS STATUS ONLY ---
                        const tenants = await getTenants();
                        const tenantToEdit = tenants.find(t => t.id.toString() === recordId.toString());

                        if (!tenantToEdit) return;

                        const newStatus = prompt(
                            `Update Rent Status for Unit ${tenantToEdit.unit} (${tenantToEdit.name}):\nEnter status (Paid / Overdue):`,
                            tenantToEdit.status || 'Paid'
                        );

                        if (newStatus !== null) {
                            const trimmedStatus = newStatus.trim();
                            const formattedStatus = trimmedStatus.charAt(0).toUpperCase() + trimmedStatus.slice(1).toLowerCase();
                            
                            if (formattedStatus === 'Paid' || formattedStatus === 'Overdue') {
                                await updateTenant(recordId, { ...tenantToEdit, status: formattedStatus });
                                
                                // Refresh Rent & Arrears Table
                                const updatedTenants = await getTenants();
                                const arrearsTenants = updatedTenants.filter(t => t.status && t.status.toLowerCase() === 'overdue');
                                const defects = await getDefects();
                                renderTenantTable(arrearsTenants);
                                updateDashboardStats(updatedTenants, defects);
                            } else {
                                alert("Invalid status! Please enter either 'Paid' or 'Overdue'.");
                            }
                        }
                    } else {
                        // --- EDIT FULL TENANT ROSTER ---
                        const tenants = await getTenants();
                        const tenantToEdit = tenants.find(t => t.id.toString() === recordId.toString());

                        if (!tenantToEdit) return;

                        const newName = prompt("Edit Tenant Name:", tenantToEdit.name);
                        if (newName === null) return;

                        const newPhone = prompt("Edit Phone Number:", tenantToEdit.phone);
                        if (newPhone === null) return;

                        const newUnit = prompt("Edit Unit Number:", tenantToEdit.unit);
                        if (newUnit === null) return;

                        const newStatus = prompt("Edit Status (Paid / Overdue):", tenantToEdit.status);
                        if (newStatus === null) return;

                        const updatedData = {
                            name: newName.trim(),
                            phone: newPhone.trim(),
                            unit: newUnit.trim(),
                            status: newStatus.trim()
                        };

                        await updateTenant(recordId, updatedData);
                        await loadTenantData();
                    }
                } catch (error) {
                    console.error("Failed to update record:", error);
                    alert("Failed to update record.");
                }
            }
        });
    }
}

/**
 * Handle sidebar navigation clicks using innerText (ignores SVGs cleanly)
 */
function setupSidebarNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.querySelector('.page-title');

    navItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // innerText extracts ONLY visible link text, ignoring SVG tags cleanly
            const sectionName = item.innerText.trim();

            if (pageTitle) {
                pageTitle.textContent = sectionName === 'Dashboard' ? 'Dashboard Overview' : sectionName;
            }

            try {
                const tenants = await getTenants();
                const defects = await getDefects();

                if (sectionName.includes('Residential Defects')) {
                    renderDefectsTable(defects, tenants);
                    updateDashboardStats(tenants, defects); 
                } else if (sectionName.includes('Rent & Arrears')) {
                    const arrearsTenants = tenants.filter(t => t.status && t.status.toLowerCase() === 'overdue');
                    renderTenantTable(arrearsTenants);
                    updateDashboardStats(tenants, defects);
                } else {
                    renderTenantTable(tenants);
                    updateDashboardStats(tenants, defects);
                }
            } catch (error) {
                console.error(`Failed to load view for ${sectionName}:`, error);
            }
        });
    });
}