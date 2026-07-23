/**
 * Canonical product API paths (consumer).
 * Prefer `/api/v1/*` — hub rewrites to `/internal/v1/*`.
 * Both work; SDK uses api/v1 for new clients.
 */

export const API_PREFIX = 'api/v1';

/** Build path without leading slash (axios baseURL-friendly). */
export function apiPath(...parts: string[]): string {
  const segs = parts
    .join('/')
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/');
  return segs;
}

export const Paths = {
  // Account / auth
  accountLogin: apiPath(API_PREFIX, 'account/login'),
  accountRegister: apiPath(API_PREFIX, 'account/register'),
  accountMe: apiPath(API_PREFIX, 'account/me'),
  accountAiSummary: apiPath(API_PREFIX, 'account/me/ai-summary'),
  accountProfile: apiPath(API_PREFIX, 'account/profile'),
  accountWorkspaces: apiPath(API_PREFIX, 'account/workspaces'),
  accountChangePassword: apiPath(API_PREFIX, 'account/me/password'),
  accountAvatar: apiPath(API_PREFIX, 'account/me/avatar'),
  accountForgotPassword: apiPath(API_PREFIX, 'account/forgot-password'),
  accountResetPassword: apiPath(API_PREFIX, 'account/reset-password'),
  accountResendVerification: apiPath(API_PREFIX, 'account/resend-verification'),
  accountLogout: apiPath(API_PREFIX, 'account/logout'),
  accountFirebaseChildToken: apiPath(API_PREFIX, 'account/auth/firebase/child-token'),
  accountFirebaseExchange: apiPath(API_PREFIX, 'account/auth/firebase/exchange'),
  accountFirebaseGoogle: apiPath(API_PREFIX, 'account/auth/firebase/google'),
  accountFirebaseGoogleLink: apiPath(API_PREFIX, 'account/auth/firebase/google/link'),
  familyChildAvatar: (id: string) => apiPath(API_PREFIX, `account/family/children/${id}/avatar`),

  // Family
  family: apiPath(API_PREFIX, 'account/family'),
  familyChildren: apiPath(API_PREFIX, 'account/family/children'),
  familyChild: (id: string) =>
    apiPath(API_PREFIX, `account/family/children/${id}`),
  familyChildPassword: (id: string) =>
    apiPath(API_PREFIX, `account/family/children/${id}/password`),
  familyChildAccount: (id: string) =>
    apiPath(API_PREFIX, `account/family/children/${id}/account`),
  familyChildConsent: (id: string) =>
    apiPath(API_PREFIX, `account/family/children/${id}/consent`),
  familyUsage: apiPath(API_PREFIX, 'account/family/usage'),
  familyUsageMe: apiPath(API_PREFIX, 'account/family/usage/me'),
  familyEnrollmentsClaim: apiPath(
    API_PREFIX,
    'account/family/enrollments/claim',
  ),
  familyMe: apiPath(API_PREFIX, 'account/family/me'),
  familyMeAvatar: apiPath(API_PREFIX, 'account/family/me/avatar'),
  accountWorkspaceSelect: (ipId: string) =>
    apiPath(API_PREFIX, `account/workspaces/${ipId}/select`),

  // Billing (via hub if routed; some hubs proxy billing)
  billingMeSubscription: apiPath(API_PREFIX, 'billing/me/subscription'),
  billingMeCheckout: apiPath(API_PREFIX, 'billing/me/checkout'),
  billingPlans: apiPath(API_PREFIX, 'billing/plans'),
  billingVoucherRedeem: apiPath(API_PREFIX, 'billing/me/vouchers/redeem'),
  billingCreditPackCheckout: apiPath(API_PREFIX, 'billing/me/credit-packs/checkout'),
  billingCreditPacks: apiPath(API_PREFIX, 'billing/credit-packs'),

  // Jobs / generate
  jobs: apiPath(API_PREFIX, 'jobs'),
  job: (id: string) => apiPath(API_PREFIX, `jobs/${id}`),

  // Media
  mediaUpload: apiPath(API_PREFIX, 'media/upload'),
  mediaGallery: apiPath(API_PREFIX, 'media/gallery'),
  mediaGalleryItem: (id: string) =>
    apiPath(API_PREFIX, `media/gallery/${id}`),

  // LMS
  lmsMyContext: apiPath(API_PREFIX, 'lms/me/context'),
  lmsCourses: apiPath(API_PREFIX, 'lms/courses'),
  lmsCourse: (idOrSlug: string) =>
    apiPath(API_PREFIX, `lms/courses/${idOrSlug}`),
  lmsEnrollments: apiPath(API_PREFIX, 'lms/enrollments'),
  lmsEnrollment: (id: string) =>
    apiPath(API_PREFIX, `lms/enrollments/${id}`),
  lmsLessonStart: (enrollmentId: string, lessonId: string) =>
    apiPath(
      API_PREFIX,
      `lms/enrollments/${enrollmentId}/lessons/${lessonId}/start`,
    ),
  lmsLessonComplete: (enrollmentId: string, lessonId: string) =>
    apiPath(
      API_PREFIX,
      `lms/enrollments/${enrollmentId}/lessons/${lessonId}/complete`,
    ),
  lmsFamilyChildEnrollments: (childProfileId: string) =>
    apiPath(
      API_PREFIX,
      `lms/family/children/${childProfileId}/enrollments`,
    ),
  lmsAuthoringCourses: apiPath(API_PREFIX, 'lms/authoring/courses'),
  lmsAuthoringCourse: (courseId: string) =>
    apiPath(API_PREFIX, `lms/authoring/courses/${courseId}`),
  lmsAuthoringDraft: (courseId: string) =>
    apiPath(API_PREFIX, `lms/authoring/courses/${courseId}/draft`),
  lmsAuthoringPublish: (courseId: string) =>
    apiPath(API_PREFIX, `lms/authoring/courses/${courseId}/publish`),
  lmsAuthoringProgress: (courseId: string) =>
    apiPath(API_PREFIX, `lms/authoring/courses/${courseId}/progress`),
  lmsClassrooms: apiPath(API_PREFIX, 'lms/classrooms'),
  lmsClassroom: (classroomId: string) =>
    apiPath(API_PREFIX, `lms/classrooms/${classroomId}`),
  lmsClassroomTeachers: (classroomId: string) =>
    apiPath(API_PREFIX, `lms/classrooms/${classroomId}/teachers`),
  lmsClassroomTeacher: (classroomId: string, userId: string) =>
    apiPath(API_PREFIX, `lms/classrooms/${classroomId}/teachers/${userId}`),
  lmsClassroomLearners: (classroomId: string) =>
    apiPath(API_PREFIX, `lms/classrooms/${classroomId}/learners`),
  lmsClassroomLearner: (classroomId: string, learnerId: string) =>
    apiPath(API_PREFIX, `lms/classrooms/${classroomId}/learners/${learnerId}`),
  lmsClassroomCourses: (classroomId: string) =>
    apiPath(API_PREFIX, `lms/classrooms/${classroomId}/courses`),
  lmsClassroomCourse: (classroomId: string, courseId: string) =>
    apiPath(API_PREFIX, `lms/classrooms/${classroomId}/courses/${courseId}`),
  lmsClassroomProgress: (classroomId: string) =>
    apiPath(API_PREFIX, `lms/classrooms/${classroomId}/progress`),
  lmsClassroomFeedback: (classroomId: string) =>
    apiPath(API_PREFIX, `lms/classrooms/${classroomId}/feedback`),
  lmsAudit: apiPath(API_PREFIX, 'lms/audit'),

  // Notifications
  notifications: apiPath(API_PREFIX, 'notifications'),
  notificationRead: (id: string) =>
    apiPath(API_PREFIX, `notifications/${id}/read`),
  notificationsReadAll: apiPath(API_PREFIX, 'notifications/read-all'),
  notificationPreferences: apiPath(API_PREFIX, 'notifications/preferences'),
  notificationDevices: apiPath(API_PREFIX, 'notifications/devices'),
  notificationDevice: (id: string) =>
    apiPath(API_PREFIX, `notifications/devices/${id}`),

  // Legacy internal aliases (same handlers via hub rewrite)
  internal: {
    accountLogin: apiPath('internal/v1/account/login'),
    accountRegister: apiPath('internal/v1/account/register'),
    accountMe: apiPath('internal/v1/account/me'),
    accountAiSummary: apiPath('internal/v1/account/me/ai-summary'),
    jobs: apiPath('internal/v1/jobs'),
    job: (id: string) => apiPath(`internal/v1/jobs/${id}`),
    mediaUpload: apiPath('internal/v1/media/upload'),
  },
} as const;
