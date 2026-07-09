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
        },
        UNIVERSITY: {
            GET_ALL: "/api/v1/admin/university",
            GET_BY_ID: (id: string) => `/api/v1/admin/university/${id}`,
            CREATE: "/api/v1/admin/university",
            UPDATE: (id: string) => `/api/v1/admin/university/${id}`,
            DELETE: (id: string) => `/api/v1/admin/university/${id}`,
        },
        COURSE: {
            GET_ALL: "/api/v1/admin/course",
            GET_BY_ID: (id: string) => `/api/v1/admin/course/${id}`,
            CREATE: "/api/v1/admin/course",
            UPDATE: (id: string) => `/api/v1/admin/course/${id}`,
            DELETE: (id: string) => `/api/v1/admin/course/${id}`,
        },
        SUBJECT: {
            GET_ALL: "/api/v1/admin/subject",
            GET_BY_ID: (id: string) => `/api/v1/admin/subject/${id}`,
            CREATE: "/api/v1/admin/subject",
            UPDATE: (id: string) => `/api/v1/admin/subject/${id}`,
            DELETE: (id: string) => `/api/v1/admin/subject/${id}`,
        },
        JOB_ROLE: {
            GET_ALL: "/api/v1/admin/jobRoles",
            GET_BY_ID: (id: string) => `/api/v1/admin/jobRoles/${id}`,
            CREATE: "/api/v1/admin/jobRoles",
            UPDATE: (id: string) => `/api/v1/admin/jobRoles/${id}`,
            DELETE: (id: string) => `/api/v1/admin/jobRoles/${id}`,
        }
    }
}