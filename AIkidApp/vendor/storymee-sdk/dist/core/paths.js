"use strict";
/**
 * Canonical product API paths (consumer).
 * Prefer `/api/v1/*` — hub rewrites to `/internal/v1/*`.
 * Both work; SDK uses api/v1 for new clients.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paths = exports.API_PREFIX = void 0;
exports.apiPath = apiPath;
exports.API_PREFIX = 'api/v1';
/** Build path without leading slash (axios baseURL-friendly). */
function apiPath(...parts) {
    const segs = parts
        .join('/')
        .replace(/^\/+/, '')
        .replace(/\/+/g, '/');
    return segs;
}
exports.Paths = {
    // Account / auth
    accountLogin: apiPath(exports.API_PREFIX, 'account/login'),
    accountRegister: apiPath(exports.API_PREFIX, 'account/register'),
    accountMe: apiPath(exports.API_PREFIX, 'account/me'),
    accountAiSummary: apiPath(exports.API_PREFIX, 'account/me/ai-summary'),
    accountProfile: apiPath(exports.API_PREFIX, 'account/profile'),
    accountWorkspaces: apiPath(exports.API_PREFIX, 'account/workspaces'),
    accountChangePassword: apiPath(exports.API_PREFIX, 'account/me/password'),
    accountAvatar: apiPath(exports.API_PREFIX, 'account/me/avatar'),
    accountForgotPassword: apiPath(exports.API_PREFIX, 'account/forgot-password'),
    accountResetPassword: apiPath(exports.API_PREFIX, 'account/reset-password'),
    accountResendVerification: apiPath(exports.API_PREFIX, 'account/resend-verification'),
    accountLogout: apiPath(exports.API_PREFIX, 'account/logout'),
    accountFirebaseChildToken: apiPath(exports.API_PREFIX, 'account/auth/firebase/child-token'),
    accountFirebaseExchange: apiPath(exports.API_PREFIX, 'account/auth/firebase/exchange'),
    accountFirebaseGoogle: apiPath(exports.API_PREFIX, 'account/auth/firebase/google'),
    accountFirebaseGoogleLink: apiPath(exports.API_PREFIX, 'account/auth/firebase/google/link'),
    familyChildAvatar: (id) => apiPath(exports.API_PREFIX, `account/family/children/${id}/avatar`),
    // Family
    family: apiPath(exports.API_PREFIX, 'account/family'),
    familyChildren: apiPath(exports.API_PREFIX, 'account/family/children'),
    familyChild: (id) => apiPath(exports.API_PREFIX, `account/family/children/${id}`),
    familyChildPassword: (id) => apiPath(exports.API_PREFIX, `account/family/children/${id}/password`),
    familyChildAccount: (id) => apiPath(exports.API_PREFIX, `account/family/children/${id}/account`),
    familyChildConsent: (id) => apiPath(exports.API_PREFIX, `account/family/children/${id}/consent`),
    familyUsage: apiPath(exports.API_PREFIX, 'account/family/usage'),
    familyUsageMe: apiPath(exports.API_PREFIX, 'account/family/usage/me'),
    familyEnrollmentsClaim: apiPath(exports.API_PREFIX, 'account/family/enrollments/claim'),
    familyMe: apiPath(exports.API_PREFIX, 'account/family/me'),
    familyMeAvatar: apiPath(exports.API_PREFIX, 'account/family/me/avatar'),
    accountWorkspaceSelect: (ipId) => apiPath(exports.API_PREFIX, `account/workspaces/${ipId}/select`),
    // Billing (via hub if routed; some hubs proxy billing)
    billingMeSubscription: apiPath(exports.API_PREFIX, 'billing/me/subscription'),
    billingMeCheckout: apiPath(exports.API_PREFIX, 'billing/me/checkout'),
    billingPlans: apiPath(exports.API_PREFIX, 'billing/plans'),
    billingVoucherRedeem: apiPath(exports.API_PREFIX, 'billing/me/vouchers/redeem'),
    billingCreditPackCheckout: apiPath(exports.API_PREFIX, 'billing/me/credit-packs/checkout'),
    billingCreditPacks: apiPath(exports.API_PREFIX, 'billing/credit-packs'),
    // Jobs / generate
    jobs: apiPath(exports.API_PREFIX, 'jobs'),
    job: (id) => apiPath(exports.API_PREFIX, `jobs/${id}`),
    // Media
    mediaUpload: apiPath(exports.API_PREFIX, 'media/upload'),
    mediaGallery: apiPath(exports.API_PREFIX, 'media/gallery'),
    mediaGalleryItem: (id) => apiPath(exports.API_PREFIX, `media/gallery/${id}`),
    // LMS
    lmsMyContext: apiPath(exports.API_PREFIX, 'lms/me/context'),
    lmsCourses: apiPath(exports.API_PREFIX, 'lms/courses'),
    lmsCourse: (idOrSlug) => apiPath(exports.API_PREFIX, `lms/courses/${idOrSlug}`),
    lmsEnrollments: apiPath(exports.API_PREFIX, 'lms/enrollments'),
    lmsEnrollment: (id) => apiPath(exports.API_PREFIX, `lms/enrollments/${id}`),
    lmsLessonStart: (enrollmentId, lessonId) => apiPath(exports.API_PREFIX, `lms/enrollments/${enrollmentId}/lessons/${lessonId}/start`),
    lmsLessonComplete: (enrollmentId, lessonId) => apiPath(exports.API_PREFIX, `lms/enrollments/${enrollmentId}/lessons/${lessonId}/complete`),
    lmsFamilyChildEnrollments: (childProfileId) => apiPath(exports.API_PREFIX, `lms/family/children/${childProfileId}/enrollments`),
    lmsAuthoringCourses: apiPath(exports.API_PREFIX, 'lms/authoring/courses'),
    lmsAuthoringCourse: (courseId) => apiPath(exports.API_PREFIX, `lms/authoring/courses/${courseId}`),
    lmsAuthoringDraft: (courseId) => apiPath(exports.API_PREFIX, `lms/authoring/courses/${courseId}/draft`),
    lmsAuthoringPublish: (courseId) => apiPath(exports.API_PREFIX, `lms/authoring/courses/${courseId}/publish`),
    lmsAuthoringProgress: (courseId) => apiPath(exports.API_PREFIX, `lms/authoring/courses/${courseId}/progress`),
    lmsClassrooms: apiPath(exports.API_PREFIX, 'lms/classrooms'),
    lmsClassroom: (classroomId) => apiPath(exports.API_PREFIX, `lms/classrooms/${classroomId}`),
    lmsClassroomTeachers: (classroomId) => apiPath(exports.API_PREFIX, `lms/classrooms/${classroomId}/teachers`),
    lmsClassroomTeacher: (classroomId, userId) => apiPath(exports.API_PREFIX, `lms/classrooms/${classroomId}/teachers/${userId}`),
    lmsClassroomLearners: (classroomId) => apiPath(exports.API_PREFIX, `lms/classrooms/${classroomId}/learners`),
    lmsClassroomLearner: (classroomId, learnerId) => apiPath(exports.API_PREFIX, `lms/classrooms/${classroomId}/learners/${learnerId}`),
    lmsClassroomCourses: (classroomId) => apiPath(exports.API_PREFIX, `lms/classrooms/${classroomId}/courses`),
    lmsClassroomCourse: (classroomId, courseId) => apiPath(exports.API_PREFIX, `lms/classrooms/${classroomId}/courses/${courseId}`),
    lmsClassroomProgress: (classroomId) => apiPath(exports.API_PREFIX, `lms/classrooms/${classroomId}/progress`),
    lmsClassroomFeedback: (classroomId) => apiPath(exports.API_PREFIX, `lms/classrooms/${classroomId}/feedback`),
    lmsAudit: apiPath(exports.API_PREFIX, 'lms/audit'),
    // Notifications
    notifications: apiPath(exports.API_PREFIX, 'notifications'),
    notificationRead: (id) => apiPath(exports.API_PREFIX, `notifications/${id}/read`),
    notificationsReadAll: apiPath(exports.API_PREFIX, 'notifications/read-all'),
    notificationPreferences: apiPath(exports.API_PREFIX, 'notifications/preferences'),
    notificationDevices: apiPath(exports.API_PREFIX, 'notifications/devices'),
    notificationDevice: (id) => apiPath(exports.API_PREFIX, `notifications/devices/${id}`),
    // Legacy internal aliases (same handlers via hub rewrite)
    internal: {
        accountLogin: apiPath('internal/v1/account/login'),
        accountRegister: apiPath('internal/v1/account/register'),
        accountMe: apiPath('internal/v1/account/me'),
        accountAiSummary: apiPath('internal/v1/account/me/ai-summary'),
        jobs: apiPath('internal/v1/jobs'),
        job: (id) => apiPath(`internal/v1/jobs/${id}`),
        mediaUpload: apiPath('internal/v1/media/upload'),
    },
};
//# sourceMappingURL=paths.js.map