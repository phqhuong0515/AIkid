import type { AxiosInstance } from 'axios';
import { Paths } from '../core/paths';
import { unwrapData } from '../core/unwrap';

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
    _count: { modules: number };
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

export function createLmsApi(client: AxiosInstance) {
  return {
    async getMyContext(): Promise<LmsActorContext> {
      const { data } = await client.get<unknown>(Paths.lmsMyContext);
      const body = unwrapData<{ context?: LmsActorContext }>(data);
      const context =
        body?.context ??
        (data as { context?: LmsActorContext } | null)?.context;
      if (!context) throw new Error('Không xác định được ngữ cảnh học tập');
      return context;
    },

    async listCourses(): Promise<LmsCourseSummary[]> {
      const { data } = await client.get<unknown>(Paths.lmsCourses);
      return unwrapData<{ courses: LmsCourseSummary[] }>(data).courses ?? [];
    },

    async getCourse(idOrSlug: string): Promise<Record<string, unknown>> {
      const { data } = await client.get<unknown>(Paths.lmsCourse(idOrSlug));
      return unwrapData<{ course: Record<string, unknown> }>(data).course;
    },

    async createCourse(input: CreateLmsCourseInput): Promise<Record<string, unknown>> {
      const { data } = await client.post<unknown>(Paths.lmsAuthoringCourses, input);
      return unwrapData<{ course: Record<string, unknown> }>(data).course;
    },

    async listAuthoringCourses(
      organizationId?: string,
    ): Promise<Array<Record<string, unknown>>> {
      const { data } = await client.get<unknown>(Paths.lmsAuthoringCourses, {
        params: organizationId ? { organizationId } : undefined,
      });
      return unwrapData<{ courses: Array<Record<string, unknown>> }>(data)
        .courses ?? [];
    },

    async getAuthoringCourse(courseId: string): Promise<Record<string, unknown>> {
      const { data } = await client.get<unknown>(
        Paths.lmsAuthoringCourse(courseId),
      );
      return unwrapData<{ course: Record<string, unknown> }>(data).course;
    },

    async replaceDraft(
      courseId: string,
      curriculum: LmsCurriculumInput,
    ): Promise<Record<string, unknown>> {
      const { data } = await client.put<unknown>(
        Paths.lmsAuthoringDraft(courseId),
        curriculum,
      );
      return unwrapData<{ version: Record<string, unknown> }>(data).version;
    },

    async publishCourse(courseId: string): Promise<Record<string, unknown>> {
      const { data } = await client.post<unknown>(
        Paths.lmsAuthoringPublish(courseId),
      );
      return unwrapData<{ version: Record<string, unknown> }>(data).version;
    },

    async enroll(input: {
      courseId?: string;
      courseSlug?: string;
    }): Promise<Record<string, unknown>> {
      const { data } = await client.post<unknown>(Paths.lmsEnrollments, input);
      return unwrapData<{ enrollment: Record<string, unknown> }>(data).enrollment;
    },

    async listEnrollments(): Promise<Array<Record<string, unknown>>> {
      const { data } = await client.get<unknown>(Paths.lmsEnrollments);
      return unwrapData<{ enrollments: Array<Record<string, unknown>> }>(data)
        .enrollments ?? [];
    },

    async getEnrollment(id: string): Promise<Record<string, unknown>> {
      const { data } = await client.get<unknown>(Paths.lmsEnrollment(id));
      return unwrapData<{ enrollment: Record<string, unknown> }>(data).enrollment;
    },

    async startLesson(
      enrollmentId: string,
      lessonId: string,
    ): Promise<Record<string, unknown>> {
      const { data } = await client.post<unknown>(
        Paths.lmsLessonStart(enrollmentId, lessonId),
      );
      return unwrapData<{ progress: Record<string, unknown> }>(data).progress;
    },

    async completeLesson(
      enrollmentId: string,
      lessonId: string,
      idempotencyKey: string,
      input: CompleteLmsLessonInput,
    ): Promise<Record<string, unknown>> {
      const { data } = await client.post<unknown>(
        Paths.lmsLessonComplete(enrollmentId, lessonId),
        input,
        { headers: { 'Idempotency-Key': idempotencyKey } },
      );
      return unwrapData<Record<string, unknown>>(data);
    },

    async getCourseProgress(courseId: string): Promise<Record<string, unknown>> {
      const { data } = await client.get<unknown>(
        Paths.lmsAuthoringProgress(courseId),
      );
      return unwrapData<Record<string, unknown>>(data);
    },

    async listChildEnrollments(
      childProfileId: string,
    ): Promise<Array<Record<string, unknown>>> {
      const { data } = await client.get<unknown>(
        Paths.lmsFamilyChildEnrollments(childProfileId),
      );
      return unwrapData<{ enrollments: Array<Record<string, unknown>> }>(data)
        .enrollments ?? [];
    },

    async listClassrooms(
      organizationId?: string,
    ): Promise<Array<Record<string, unknown>>> {
      const { data } = await client.get<unknown>(Paths.lmsClassrooms, {
        params: organizationId ? { organizationId } : undefined,
      });
      return unwrapData<{ classrooms: Array<Record<string, unknown>> }>(data)
        .classrooms ?? [];
    },

    async createClassroom(
      input: CreateLmsClassroomInput,
    ): Promise<Record<string, unknown>> {
      const { data } = await client.post<unknown>(Paths.lmsClassrooms, input);
      return unwrapData<{ classroom: Record<string, unknown> }>(data).classroom;
    },

    async getClassroom(classroomId: string): Promise<Record<string, unknown>> {
      const { data } = await client.get<unknown>(Paths.lmsClassroom(classroomId));
      return unwrapData<{ classroom: Record<string, unknown> }>(data).classroom;
    },

    async addClassroomTeacher(
      classroomId: string,
      userId: string,
    ): Promise<Record<string, unknown>> {
      const { data } = await client.post<unknown>(
        Paths.lmsClassroomTeachers(classroomId),
        { userId },
      );
      return unwrapData<{ teacher: Record<string, unknown> }>(data).teacher;
    },

    async removeClassroomTeacher(classroomId: string, userId: string): Promise<void> {
      await client.delete(Paths.lmsClassroomTeacher(classroomId, userId));
    },

    async addClassroomLearner(
      classroomId: string,
      orgStudentEnrollmentId: string,
    ): Promise<Record<string, unknown>> {
      const { data } = await client.post<unknown>(
        Paths.lmsClassroomLearners(classroomId),
        { orgStudentEnrollmentId },
      );
      return unwrapData<{ learner: Record<string, unknown> }>(data).learner;
    },

    async removeClassroomLearner(classroomId: string, learnerId: string): Promise<void> {
      await client.delete(Paths.lmsClassroomLearner(classroomId, learnerId));
    },

    async assignClassroomCourse(
      classroomId: string,
      input: AssignLmsClassCourseInput,
    ): Promise<Record<string, unknown>> {
      const { data } = await client.post<unknown>(
        Paths.lmsClassroomCourses(classroomId),
        input,
      );
      return unwrapData<{ assignment: Record<string, unknown> }>(data).assignment;
    },

    async removeClassroomCourse(classroomId: string, courseId: string): Promise<void> {
      await client.delete(Paths.lmsClassroomCourse(classroomId, courseId));
    },

    async getClassroomProgress(classroomId: string): Promise<Record<string, unknown>> {
      const { data } = await client.get<unknown>(
        Paths.lmsClassroomProgress(classroomId),
      );
      return unwrapData<{ report: Record<string, unknown> }>(data).report;
    },

    async createTeacherFeedback(
      classroomId: string,
      input: {
        enrollmentId: string;
        lessonProgressId?: string;
        body: string;
        visibility?: 'learner' | 'staff';
      },
    ): Promise<Record<string, unknown>> {
      const { data } = await client.post<unknown>(
        Paths.lmsClassroomFeedback(classroomId),
        input,
      );
      return unwrapData<{ feedback: Record<string, unknown> }>(data).feedback;
    },

    async listAudit(
      organizationId: string,
      limit = 50,
    ): Promise<Array<Record<string, unknown>>> {
      const { data } = await client.get<unknown>(Paths.lmsAudit, {
        params: { organizationId, limit },
      });
      return unwrapData<{ entries: Array<Record<string, unknown>> }>(data)
        .entries ?? [];
    },
  };
}

export type LmsApi = ReturnType<typeof createLmsApi>;
