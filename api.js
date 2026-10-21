// Base URL for your JSON Server mock backend
const BASE_URL = 'http://127.0.0.1:8080';

/**
 * Generic helper function for handling fetch requests and errors.
 * @param {string} endpoint - The API route (e.g., '/tenants')
 * @param {Object} options - Fetch configuration options (method, headers, body)
 * @returns {Promise<any>} - Parsed JSON response data
 */
async function request(endpoint, options = {}) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        
        // Handle server-side errors
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Return null for successful 204 No Content responses (common on DELETE)
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`API Request Error [${endpoint}]:`, error);
        throw error; // Re-throw so UI modules can catch and display feedback
    }
}

/* ==========================================================================
   Tenant CRUD Operations
   ========================================================================== */

/**
 * Fetch all tenants from the JSON Server (GET)
 */
export async function getTenants() {
    return await request('/tenants');
}

/**
 * Add a new tenant to the roster (POST)
 * @param {Object} tenantData - { unit, name, phone, rentDueDate, status }
 */
export async function addTenant(tenantData) {
    return await request('/tenants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenantData),
    });
}

/**
 * Update an existing tenant record (PATCH)
 * @param {number|string} id - Tenant ID
 * @param {Object} updateData - Fields to update
 */
export async function updateTenant(id, updateData) {
    return await request(`/tenants/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    });
}
/**
 * Updates an existing residential defect record (PATCH)
 * @param {number|string} id - Defect ID
 * @param {Object} updateData - Fields to update
 */
export async function updateDefect(id, updateData) {
    return await request(`/defects/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    });
}
/**
 * Delete a tenant from the roster (DELETE)
 * @param {number|string} id - Tenant ID
 */
export async function removeTenant(id) {
    return await request(`/tenants/${id}`, {
        method: 'DELETE',
    });
}

/* ==========================================================================
   Residential Defects Operations
   ========================================================================== */

/**
 * Fetch all logged residential defects (GET)
 */
export async function getDefects() {
    return await request('/defects');
}

/**
 * Log a new residential defect (POST)
 * @param {Object} defectData - { unit, description, status }
 */
export async function addDefect(defectData) {
    return await request('/defects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(defectData),
    });
}

/**
 * Deletes a defect record by its unique ID from the backend API.
 * 
 * @param {string|number} id - The ID of the defect to delete
 * @returns {Promise<Object>} The response data from the server
 */
export async function removeDefect(id) {
    try {
        const response = await fetch(`http://localhost:8080/defects/${id}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) 
            throw new Error(`Failed to delete defect. Status: ${response.status}`);
        
        return await response.json();
    } catch (error) {
        console.error(`Error deleting defect ID ${id}:`, error);
        throw error;
    }
}