export const API = {
    AUTH: {
        REGISTER: '/api/v1/auth/register', 
        LOGIN: '/api/v1/auth/login', 
        WHOAMI: "/api/v1/auth/whoami",
        UPDATE: "/api/v1/auth/update",
        GET_PROFILE: '/api/v1/auth/getProfile',
        CHANGE_PASSWORD: '/api/v1/auth/change-password',
    }, 

    ADMIN: {
        USERS: {
            GET_ALL: "/api/v1/admin/users",
            GET_BY_ID: (id: string) => `/api/v1/admin/users/${id}`,
            CREATE: "/api/v1/admin/users",
            UPDATE: (id: string) => `/api/v1/admin/users/${id}`,
            UPDATE_PASSWORD: (id: string) => `/api/v1/admin/users/${id}/password`,
            DELETE: (id: string) => `/api/v1/admin/users/${id}`,
        }
    }
}