export const API = {
  AUTH: {
    REGISTER: "/api/v1/auth/register",
    LOGIN: "/api/v1/auth/login",
    WHOAMI: "/api/v1/auth/whoami",
    UPDATE: "/api/v1/auth/update",
    GET_PROFILE: "/api/v1/auth/getProfile",
    CHANGE_PASSWORD: "/api/v1/auth/change-password",
    ONBOARDING: "/api/v1/auth/onboarding",
    GOOGLE_LOGIN: "/api/v1/auth/google",
    FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
    RESET_PASSWORD: "/api/v1/auth/reset-password",
  },

  UNIVERSITY: {
    GET_ALL: "/api/v1/university",
    GET_BY_ID: (id: string) => `/api/v1/university/${id}`,
    GET_COURSES: (id: string) => `/api/v1/university/${id}/courses`,
  },
  COURSE: {
    GET_BY_ID: (id: string) => `/api/v1/course/${id}`,
    GET_SUBJECTS: (id: string) => `/api/v1/course/${id}/subjects`,
  },
  JOB_ROLE: {
    GET_ALL: "/api/v1/jobRoles",
    GET_BY_ID: (id: string) => `/api/v1/jobRoles/${id}`,
  },
  JOB_POSTING: {
    GET_ALL: "/api/v1/job-postings",
    GET_BY_ID: (id: string) => `/api/v1/job-postings/${id}`,
  },
  DASHBOARD: {
    CAREER: "/api/v1/dashboard/career",
  },
  OPPORTUNITY: {
    GET_ALL: "/api/v1/opportunities",
    GET_BY_ID: (id: string) => `/api/v1/opportunities/${id}`,
  },
  PRACTICE_ATTEMPT: {
    START: "/api/v1/practice-attempts",
    GET_ALL: "/api/v1/practice-attempts",
    GET_BY_ID: (id: string) => `/api/v1/practice-attempts/${id}`,
    SUBMIT_ANSWER: (id: string) => `/api/v1/practice-attempts/${id}/answer`,
    COMPLETE: (id: string) => `/api/v1/practice-attempts/${id}/complete`,
    TRANSCRIBE: "/api/v1/practice-attempts/transcribe",
  },
  RESUME_ANALYSIS: {
    ANALYZE: "/api/v1/resume-analysis",
    GET_ALL: "/api/v1/resume-analysis",
    GET_LATEST: "/api/v1/resume-analysis/latest",
    GET_BY_ID: (id: string) => `/api/v1/resume-analysis/${id}`,
    DELETE: (id: string) => `/api/v1/resume-analysis/${id}`,
  },
  SKILL_PLANNER: {
    GET_BY_ROLE: (jobRoleId: string) => `/api/v1/skill-planner/${jobRoleId}`,
    GENERATE_RESOURCES: (jobRoleId: string) =>
      `/api/v1/skill-planner/${jobRoleId}/generate-resources`,
  },
  USER_PROGRESS: {
    TOUCH_ROADMAP_VISIT: (jobRoleId: string) =>
      `/api/v1/userProgress/roadmap/${jobRoleId}/visit`,
    COMPLETE_PROJECT: (jobRoleId: string) =>
      `/api/v1/userProgress/roadmap/${jobRoleId}/project`,
    COMPLETE_ROADMAP_STEP: (jobRoleId: string) =>
      `/api/v1/userProgress/roadmap/${jobRoleId}/step`,
    MARK_RESOURCE_WATCHED: (jobRoleId: string) =>
      `/api/v1/userProgress/roadmap/${jobRoleId}/resource`,
    SUBMIT_SELF_REPORTED_SKILL: (jobRoleId: string) =>
      `/api/v1/userProgress/skills/${jobRoleId}/report`,
  },
  PROJECT: {
    GET_ALL: "/api/v1/projects",
    GET_BY_ID: (id: string) => `/api/v1/projects/${id}`,
  },
  SAVED_JOB: {
    SAVE: "/api/v1/saved-jobs",
    GET_ALL: "/api/v1/saved-jobs",
    UNSAVE: (jobPostingId: string) => `/api/v1/saved-jobs/${jobPostingId}`,
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
      GET_COURSES: (id: string) => `/api/v1/admin/university/${id}/courses`,
      CREATE: "/api/v1/admin/university",
      UPDATE: (id: string) => `/api/v1/admin/university/${id}`,
      DELETE: (id: string) => `/api/v1/admin/university/${id}`,
    },
    COURSE: {
      GET_ALL: "/api/v1/admin/course",
      GET_BY_ID: (id: string) => `/api/v1/admin/course/${id}`,
      GET_SUBJECTS: (id: string) => `/api/v1/admin/course/${id}/subjects`,
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
    },
    JOB_POSTING: {
      SCRAPE: "/api/v1/admin/job-postings/scrape",
      UPDATE: (id: string) => `/api/v1/admin/job-postings/${id}`,
      DELETE: (id: string) => `/api/v1/admin/job-postings/${id}`,
    },
    OPPORTUNITY: {
      CREATE: "/api/v1/admin/opportunities",
      SCRAPE: "/api/v1/admin/opportunities/scrape",
      UPDATE: (id: string) => `/api/v1/admin/opportunities/${id}`,
      DELETE: (id: string) => `/api/v1/admin/opportunities/${id}`,
    },
    PROJECT: {
      CREATE: "/api/v1/admin/projects",
      UPDATE: (id: string) => `/api/v1/admin/projects/${id}`,
      DELETE: (id: string) => `/api/v1/admin/projects/${id}`,
    },
    CAREER_KNOWLEDGE: {
      GET_ALL: "/api/v1/admin/careerKnowledge",
      GET_BY_ROLE: (jobRoleId: string) =>
        `/api/v1/admin/careerKnowledge/${jobRoleId}`,
      GENERATE: (jobRoleId: string) =>
        `/api/v1/admin/careerKnowledge/${jobRoleId}`,
      REGENERATE: (jobRoleId: string) =>
        `/api/v1/admin/careerKnowledge/${jobRoleId}`,
      DELETE: (jobRoleId: string) =>
        `/api/v1/admin/careerKnowledge/${jobRoleId}`,
    },
  },
};
