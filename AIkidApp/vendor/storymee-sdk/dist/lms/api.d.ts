import type { AxiosInstance } from 'axios';
export type LmsActorContext = {
    actor: 'parent' | 'child' | 'teacher' | 'admin' | 'user';
    walletUserId: string;
    childProfileId?: string;
    organizationId?: string;
};
export type LmsCourseSummary = {
    id: string;
    slug: string;
    title: string;
    shortTitle?: string | null;
    description?: string | null;
    ageBand?: string | null;
    language: string;
    accessPolicy: string;
    metadata: Record<string, unknown>;
    versions: Array<{
        id: string;
        version: number;
        publishedAt?: string | null;
        _count: {
            modules: number;
        };
    }>;
};
export type CreateLmsCourseInput = {
    slug: string;
    title: string;
    shortTitle?: string;
    description?: string;
    ageBand?: string;
    language?: string;
    accessPolicy?: 'free' | 'plan_required' | 'organization_only' | 'invite_only';
    organizationId?: string;
    metadata?: Record<string, unknown>;
};
export type LmsCurriculumInput = {
    modules: Array<{
        slug: string;
        title: string;
        description?: string;
        metadata?: Record<string, unknown>;
        lessons: Array<{
            slug: string;
            title: string;
            description?: string;
            lessonType?: string;
            xpReward?: number;
            metadata?: Record<string, unknown>;
            stations: Array<{
                key: string;
                kind: 'video' | 'game' | 'practice' | 'check' | 'content';
                title?: string;
                required?: boolean;
                content?: Record<string, unknown>;
            }>;
        }>;
    }>;
};
export type CompleteLmsLessonInput = {
    answers?: unknown[];
    result?: Record<string, unknown>;
};
export type CreateLmsClassroomInput = {
    organizationId: string;
    name: string;
    code: string;
    metadata?: Record<string, unknown>;
};
export type AssignLmsClassCourseInput = {
    courseId: string;
    startsAt?: string;
    endsAt?: string;
    reminderAt?: string;
};
export declare function createLmsApi(client: AxiosInstance): {
    getMyContext(): Promise<LmsActorContext>;
    listCourses(): Promise<LmsCourseSummary[]>;
    getCourse(idOrSlug: string): Promise<Record<string, unknown>>;
    createCourse(input: CreateLmsCourseInput): Promise<Record<string, unknown>>;
    listAuthoringCourses(organizationId?: string): Promise<Array<Record<string, unknown>>>;
    getAuthoringCourse(courseId: string): Promise<Record<string, unknown>>;
    replaceDraft(courseId: string, curriculum: LmsCurriculumInput): Promise<Record<string, unknown>>;
    publishCourse(courseId: string): Promise<Record<string, unknown>>;
    enroll(input: {
        courseId?: string;
        courseSlug?: string;
    }): Promise<Record<string, unknown>>;
    listEnrollments(): Promise<Array<Record<string, unknown>>>;
    getEnrollment(id: string): Promise<Record<string, unknown>>;
    startLesson(enrollmentId: string, lessonId: string): Promise<Record<string, unknown>>;
    completeLesson(enrollmentId: string, lessonId: string, idempotencyKey: string, input: CompleteLmsLessonInput): Promise<Record<string, unknown>>;
    getCourseProgress(courseId: string): Promise<Record<string, unknown>>;
    listChildEnrollments(childProfileId: string): Promise<Array<Record<string, unknown>>>;
    listClassrooms(organizationId?: string): Promise<Array<Record<string, unknown>>>;
    createClassroom(input: CreateLmsClassroomInput): Promise<Record<string, unknown>>;
    getClassroom(classroomId: string): Promise<Record<string, unknown>>;
    addClassroomTeacher(classroomId: string, userId: string): Promise<Record<string, unknown>>;
    removeClassroomTeacher(classroomId: string, userId: string): Promise<void>;
    addClassroomLearner(classroomId: string, orgStudentEnrollmentId: string): Promise<Record<string, unknown>>;
    removeClassroomLearner(classroomId: string, learnerId: string): Promise<void>;
    assignClassroomCourse(classroomId: string, input: AssignLmsClassCourseInput): Promise<Record<string, unknown>>;
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
export type LmsApi = ReturnType<typeof createLmsApi>;
//# sourceMappingURL=api.d.ts.map