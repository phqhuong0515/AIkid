/**
 * @storymee/sdk — product capability modules for multi-app clients.
 *
 * Usage:
 *   import { createStorymeeClient, createAuthApi, createGenerateApi, ... } from '@storymee/sdk';
 *   const client = createStorymeeClient({ baseURL, getAccessToken, ... });
 *   const auth = createAuthApi(client);
 */
export * from './core';
export * from './auth';
export * from './generate';
export * from './billing';
export * from './family';
export * from './profile';
export * from './media';
export * from './lms';
export * from './notifications';
import type { AxiosInstance } from 'axios';
/** Bundle all capability APIs on one client */
export declare function createStorymeeApis(client: AxiosInstance): {
    auth: {
        login(input: import("./auth").LoginInput): Promise<import("./core").AuthLoginResult>;
        register(input: import("./auth").RegisterInput): Promise<import("./core").AuthLoginResult>;
        me(): Promise<import("./core").PublicUser>;
        exchangeFirebaseToken(input: import("./auth").FirebaseExchangeInput): Promise<import("./core").AuthLoginResult>;
        signInWithFirebaseGoogle(input: import("./auth").FirebaseGoogleSignInInput): Promise<import("./core").AuthLoginResult & {
            created?: boolean;
        }>;
        linkFirebaseGoogle(input: import("./auth").FirebaseGoogleLinkInput): Promise<void>;
        getFirebaseGoogleStatus(): Promise<import("./auth").FirebaseGoogleLinkStatus>;
        unlinkFirebaseGoogle(password: string): Promise<void>;
        getFirebaseChildToken(login: string, password: string): Promise<string>;
        logout(): Promise<void>;
        changePassword(input: import("./core").ChangePasswordInput): Promise<void>;
        requestPasswordReset(email: string): Promise<void>;
        confirmPasswordReset(token: string, newPassword: string): Promise<void>;
        resendVerification(email: string): Promise<void>;
        deleteAccount(password: string): Promise<void>;
    };
    generate: {
        createJob(input: import("./generate").CreateGenerateJobInput): Promise<string>;
        createImageJob(input: Omit<import("./generate").CreateGenerateJobInput, "jobType">): Promise<string>;
        createVideoJob(input: Omit<import("./generate").CreateGenerateJobInput, "jobType">): Promise<string>;
        getJob(jobId: string): Promise<import("./core").JobRecord>;
        isTerminalOk(status: string): boolean;
        isTerminalFail(status: string): boolean;
    };
    billing: {
        listPlans(): Promise<import("./core").BillingPlan[]>;
        checkoutPlan(plan: string, idempotencyKey?: string): Promise<import("./core").BillingCheckoutResult>;
        listCreditPacks(): Promise<import("./core").CreditPack[]>;
        checkoutCreditPack(packId: string, idempotencyKey?: string): Promise<import("./core").BillingCheckoutResult>;
        redeemVoucher(rawCode: string): Promise<import("./core").VoucherRedeemResult>;
        getAiSummary(): Promise<import("./core").AiPlanSummary>;
        normalizeStorageSummary: typeof import("./billing").normalizeStorageSummary;
        formatStorageBytes: typeof import("./billing").formatStorageBytes;
    };
    family: {
        listFamily(): Promise<{
            children: import("./core").ChildProfile[];
        }>;
        createChild(input: import("./family").CreateChildInput): Promise<import("./core").ChildProfile>;
        setChildPassword(childId: string, password: string, opts?: {
            parentPassword?: string;
            loginEmail?: string;
            loginUsername?: string;
        }): Promise<import("./core").ChildProfile>;
        updateChildConsent(childId: string, consent: {
            allowAiCreate?: boolean;
            allowPhoto?: boolean;
            allowExport?: boolean;
        }): Promise<import("./core").ChildProfile>;
        resetChildPassword(childId: string, newPassword: string, parentPassword?: string): Promise<import("./core").ChildProfile>;
        resetChildPin(childId: string, newPin: string, parentPassword?: string): Promise<import("./core").ChildProfile>;
        uploadChildAvatar(childId: string, file: File | Blob | {
            uri: string;
            type?: string;
            name?: string;
        }): Promise<{
            avatarUrl: string;
        }>;
        updateMyAvatar(avatarUrl: string): Promise<import("./core").ChildProfile>;
        normalizeChild: (raw: Record<string, unknown>) => import("./core").ChildProfile;
    };
    profile: {
        getProfile(): Promise<import("./profile").ProfileResponse>;
        updateProfile(input: import("./core").UpdateProfileInput): Promise<import("./profile").ProfileResponse>;
    };
    media: {
        listGallery(params: Record<string, string | number | undefined>): Promise<import("./media").MediaGalleryPage>;
        upload(formData: FormData, params?: import("./media").MediaUploadParams): Promise<import("./media").MediaUploadResult>;
    };
    lms: {
        getMyContext(): Promise<import("./lms").LmsActorContext>;
        listCourses(): Promise<import("./lms").LmsCourseSummary[]>;
        getCourse(idOrSlug: string): Promise<Record<string, unknown>>;
        createCourse(input: import("./lms").CreateLmsCourseInput): Promise<Record<string, unknown>>;
        listAuthoringCourses(organizationId?: string): Promise<Array<Record<string, unknown>>>;
        getAuthoringCourse(courseId: string): Promise<Record<string, unknown>>;
        replaceDraft(courseId: string, curriculum: import("./lms").LmsCurriculumInput): Promise<Record<string, unknown>>;
        publishCourse(courseId: string): Promise<Record<string, unknown>>;
        enroll(input: {
            courseId?: string;
            courseSlug?: string;
        }): Promise<Record<string, unknown>>;
        listEnrollments(): Promise<Array<Record<string, unknown>>>;
        getEnrollment(id: string): Promise<Record<string, unknown>>;
        startLesson(enrollmentId: string, lessonId: string): Promise<Record<string, unknown>>;
        completeLesson(enrollmentId: string, lessonId: string, idempotencyKey: string, input: import("./lms").CompleteLmsLessonInput): Promise<Record<string, unknown>>;
        getCourseProgress(courseId: string): Promise<Record<string, unknown>>;
        listChildEnrollments(childProfileId: string): Promise<Array<Record<string, unknown>>>;
        listClassrooms(organizationId?: string): Promise<Array<Record<string, unknown>>>;
        createClassroom(input: import("./lms").CreateLmsClassroomInput): Promise<Record<string, unknown>>;
        getClassroom(classroomId: string): Promise<Record<string, unknown>>;
        addClassroomTeacher(classroomId: string, userId: string): Promise<Record<string, unknown>>;
        removeClassroomTeacher(classroomId: string, userId: string): Promise<void>;
        addClassroomLearner(classroomId: string, orgStudentEnrollmentId: string): Promise<Record<string, unknown>>;
        removeClassroomLearner(classroomId: string, learnerId: string): Promise<void>;
        assignClassroomCourse(classroomId: string, input: import("./lms").AssignLmsClassCourseInput): Promise<Record<string, unknown>>;
        removeClassroomCourse(classroomId: string, courseId: string): Promise<void>;
        getClassroomProgress(classroomId: string): Promise<Record<string, unknown>>;
        createTeacherFeedback(classroomId: string, input: {
            enrollmentId: string;
            lessonProgressId?: string;
            body: string;
            visibility?: "learner" | "staff";
        }): Promise<Record<string, unknown>>;
        listAudit(organizationId: string, limit?: number): Promise<Array<Record<string, unknown>>>;
    };
    notifications: {
        list(params?: {
            unreadOnly?: boolean;
            limit?: number;
        }): Promise<{
            items: import("./notifications").NotificationMessage[];
            unreadCount: number;
        }>;
        markRead(id: string): Promise<import("./notifications").NotificationMessage>;
        markAllRead(): Promise<number>;
        getPreferences(): Promise<Record<string, unknown>>;
        updatePreferences(input: {
            locale?: "vi" | "en";
            inboxEnabled?: boolean;
            pushEnabled?: boolean;
            emailEnabled?: boolean;
            timezone?: string;
            quietStart?: string | null;
            quietEnd?: string | null;
        }): Promise<Record<string, unknown>>;
        registerDevice(input: {
            platform: "ios" | "android" | "web";
            token: string;
        }): Promise<Record<string, unknown>>;
        revokeDevice(id: string): Promise<void>;
    };
    client: AxiosInstance;
};
export type StorymeeApis = ReturnType<typeof createStorymeeApis>;
//# sourceMappingURL=index.d.ts.map