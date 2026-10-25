const BASE_URL = 'https://6ade2a514e88f1bba4a4fd89.mockapi.io/api/v1';

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
        method: 'PUT',
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
    return await request(`/defects/${id}`, {
        method: 'DELETE',
    });
}
