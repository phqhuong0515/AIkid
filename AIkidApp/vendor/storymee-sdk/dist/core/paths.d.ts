/**
 * Canonical product API paths (consumer).
 * Prefer `/api/v1/*` — hub rewrites to `/internal/v1/*`.
 * Both work; SDK uses api/v1 for new clients.
 */
export declare const API_PREFIX = "api/v1";
/** Build path without leading slash (axios baseURL-friendly). */
export declare function apiPath(...parts: string[]): string;
export declare const Paths: {
    readonly accountLogin: string;
    readonly accountRegister: string;
    readonly accountMe: string;
    readonly accountAiSummary: string;
    readonly accountProfile: string;
    readonly accountWorkspaces: string;
    readonly accountChangePassword: string;
    readonly accountAvatar: string;
    readonly accountForgotPassword: string;
    readonly accountResetPassword: string;
    readonly accountResendVerification: string;
    readonly accountLogout: string;
    readonly accountFirebaseChildToken: string;
    readonly accountFirebaseExchange: string;
    readonly accountFirebaseGoogle: string;
    readonly accountFirebaseGoogleLink: string;
    readonly familyChildAvatar: (id: string) => string;
    readonly family: string;
    readonly familyChildren: string;
    readonly familyChild: (id: string) => string;
    readonly familyChildPassword: (id: string) => string;
    readonly familyChildAccount: (id: string) => string;
    readonly familyChildConsent: (id: string) => string;
    readonly familyUsage: string;
    readonly familyUsageMe: string;
    readonly familyEnrollmentsClaim: string;
    readonly familyMe: string;
    readonly familyMeAvatar: string;
    readonly accountWorkspaceSelect: (ipId: string) => string;
    readonly billingMeSubscription: string;
    readonly billingMeCheckout: string;
    readonly billingPlans: string;
    readonly billingVoucherRedeem: string;
    readonly billingCreditPackCheckout: string;
    readonly billingCreditPacks: string;
    readonly jobs: string;
    readonly job: (id: string) => string;
    readonly mediaUpload: string;
    readonly mediaGallery: string;
    readonly mediaGalleryItem: (id: string) => string;
    readonly lmsMyContext: string;
    readonly lmsCourses: string;
    readonly lmsCourse: (idOrSlug: string) => string;
    readonly lmsEnrollments: string;
    readonly lmsEnrollment: (id: string) => string;
    readonly lmsLessonStart: (enrollmentId: string, lessonId: string) => string;
    readonly lmsLessonComplete: (enrollmentId: string, lessonId: string) => string;
    readonly lmsFamilyChildEnrollments: (childProfileId: string) => string;
    readonly lmsAuthoringCourses: string;
    readonly lmsAuthoringCourse: (courseId: string) => string;
    readonly lmsAuthoringDraft: (courseId: string) => string;
    readonly lmsAuthoringPublish: (courseId: string) => string;
    readonly lmsAuthoringProgress: (courseId: string) => string;
    readonly lmsClassrooms: string;
    readonly lmsClassroom: (classroomId: string) => string;
    readonly lmsClassroomTeachers: (classroomId: string) => string;
    readonly lmsClassroomTeacher: (classroomId: string, userId: string) => string;
    readonly lmsClassroomLearners: (classroomId: string) => string;
    readonly lmsClassroomLearner: (classroomId: string, learnerId: string) => string;
    readonly lmsClassroomCourses: (classroomId: string) => string;
    readonly lmsClassroomCourse: (classroomId: string, courseId: string) => string;
    readonly lmsClassroomProgress: (classroomId: string) => string;
    readonly lmsClassroomFeedback: (classroomId: string) => string;
    readonly lmsAudit: string;
    readonly notifications: string;
    readonly notificationRead: (id: string) => string;
    readonly notificationsReadAll: string;
    readonly notificationPreferences: string;
    readonly notificationDevices: string;
    readonly notificationDevice: (id: string) => string;
    readonly internal: {
        readonly accountLogin: string;
        readonly accountRegister: string;
        readonly accountMe: string;
        readonly accountAiSummary: string;
        readonly jobs: string;
        readonly job: (id: string) => string;
        readonly mediaUpload: string;
    };
};
//# sourceMappingURL=paths.d.ts.map