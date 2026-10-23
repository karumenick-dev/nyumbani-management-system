const BASE_URL = 'http://127.0.0.1:8080';

async function request(endpoint, options = {}) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`API Request Error [${endpoint}]:`, error);
        throw error;
    }
}

export async function getTenants() {
    return await request('/tenants');
}

export async function addTenant(tenantData) {
    return await request('/tenants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenantData),
    });
}

export async function updateTenant(id, updateData) {
    return await request(`/tenants/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    });
}

export async function updateDefect(id, updateData) {
    return await request(`/defects/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    });
}

export async function removeTenant(id) {
    return await request(`/tenants/${id}`, {
        method: 'DELETE',
    });
}

export async function getDefects() {
    return await request('/defects');
}

export async function addDefect(defectData) {
    return await request('/defects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(defectData),
    });
}

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