"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLmsApi = createLmsApi;
const paths_1 = require("../core/paths");
const unwrap_1 = require("../core/unwrap");
function createLmsApi(client) {
    return {
        async getMyContext() {
            const { data } = await client.get(paths_1.Paths.lmsMyContext);
            const body = (0, unwrap_1.unwrapData)(data);
            const context = body?.context ??
                data?.context;
            if (!context)
                throw new Error('Không xác định được ngữ cảnh học tập');
            return context;
        },
        async listCourses() {
            const { data } = await client.get(paths_1.Paths.lmsCourses);
            return (0, unwrap_1.unwrapData)(data).courses ?? [];
        },
        async getCourse(idOrSlug) {
            const { data } = await client.get(paths_1.Paths.lmsCourse(idOrSlug));
            return (0, unwrap_1.unwrapData)(data).course;
        },
        async createCourse(input) {
            const { data } = await client.post(paths_1.Paths.lmsAuthoringCourses, input);
            return (0, unwrap_1.unwrapData)(data).course;
        },
        async listAuthoringCourses(organizationId) {
            const { data } = await client.get(paths_1.Paths.lmsAuthoringCourses, {
                params: organizationId ? { organizationId } : undefined,
            });
            return (0, unwrap_1.unwrapData)(data)
                .courses ?? [];
        },
        async getAuthoringCourse(courseId) {
            const { data } = await client.get(paths_1.Paths.lmsAuthoringCourse(courseId));
            return (0, unwrap_1.unwrapData)(data).course;
        },
        async replaceDraft(courseId, curriculum) {
            const { data } = await client.put(paths_1.Paths.lmsAuthoringDraft(courseId), curriculum);
            return (0, unwrap_1.unwrapData)(data).version;
        },
        async publishCourse(courseId) {
            const { data } = await client.post(paths_1.Paths.lmsAuthoringPublish(courseId));
            return (0, unwrap_1.unwrapData)(data).version;
        },
        async enroll(input) {
            const { data } = await client.post(paths_1.Paths.lmsEnrollments, input);
            return (0, unwrap_1.unwrapData)(data).enrollment;
        },
        async listEnrollments() {
            const { data } = await client.get(paths_1.Paths.lmsEnrollments);
            return (0, unwrap_1.unwrapData)(data)
                .enrollments ?? [];
        },
        async getEnrollment(id) {
            const { data } = await client.get(paths_1.Paths.lmsEnrollment(id));
            return (0, unwrap_1.unwrapData)(data).enrollment;
        },
        async startLesson(enrollmentId, lessonId) {
            const { data } = await client.post(paths_1.Paths.lmsLessonStart(enrollmentId, lessonId));
            return (0, unwrap_1.unwrapData)(data).progress;
        },
        async completeLesson(enrollmentId, lessonId, idempotencyKey, input) {
            const { data } = await client.post(paths_1.Paths.lmsLessonComplete(enrollmentId, lessonId), input, { headers: { 'Idempotency-Key': idempotencyKey } });
            return (0, unwrap_1.unwrapData)(data);
        },
        async getCourseProgress(courseId) {
            const { data } = await client.get(paths_1.Paths.lmsAuthoringProgress(courseId));
            return (0, unwrap_1.unwrapData)(data);
        },
        async listChildEnrollments(childProfileId) {
            const { data } = await client.get(paths_1.Paths.lmsFamilyChildEnrollments(childProfileId));
            return (0, unwrap_1.unwrapData)(data)
                .enrollments ?? [];
        },
        async listClassrooms(organizationId) {
            const { data } = await client.get(paths_1.Paths.lmsClassrooms, {
                params: organizationId ? { organizationId } : undefined,
            });
            return (0, unwrap_1.unwrapData)(data)
                .classrooms ?? [];
        },
        async createClassroom(input) {
            const { data } = await client.post(paths_1.Paths.lmsClassrooms, input);
            return (0, unwrap_1.unwrapData)(data).classroom;
        },
        async getClassroom(classroomId) {
            const { data } = await client.get(paths_1.Paths.lmsClassroom(classroomId));
            return (0, unwrap_1.unwrapData)(data).classroom;
        },
        async addClassroomTeacher(classroomId, userId) {
            const { data } = await client.post(paths_1.Paths.lmsClassroomTeachers(classroomId), { userId });
            return (0, unwrap_1.unwrapData)(data).teacher;
        },
        async removeClassroomTeacher(classroomId, userId) {
            await client.delete(paths_1.Paths.lmsClassroomTeacher(classroomId, userId));
        },
        async addClassroomLearner(classroomId, orgStudentEnrollmentId) {
            const { data } = await client.post(paths_1.Paths.lmsClassroomLearners(classroomId), { orgStudentEnrollmentId });
            return (0, unwrap_1.unwrapData)(data).learner;
        },
        async removeClassroomLearner(classroomId, learnerId) {
            await client.delete(paths_1.Paths.lmsClassroomLearner(classroomId, learnerId));
        },
        async assignClassroomCourse(classroomId, input) {
            const { data } = await client.post(paths_1.Paths.lmsClassroomCourses(classroomId), input);
            return (0, unwrap_1.unwrapData)(data).assignment;
        },
        async removeClassroomCourse(classroomId, courseId) {
            await client.delete(paths_1.Paths.lmsClassroomCourse(classroomId, courseId));
        },
        async getClassroomProgress(classroomId) {
            const { data } = await client.get(paths_1.Paths.lmsClassroomProgress(classroomId));
            return (0, unwrap_1.unwrapData)(data).report;
        },
        async createTeacherFeedback(classroomId, input) {
            const { data } = await client.post(paths_1.Paths.lmsClassroomFeedback(classroomId), input);
            return (0, unwrap_1.unwrapData)(data).feedback;
        },
        async listAudit(organizationId, limit = 50) {
            const { data } = await client.get(paths_1.Paths.lmsAudit, {
                params: { organizationId, limit },
            });
            return (0, unwrap_1.unwrapData)(data)
                .entries ?? [];
        },
    };
}
//# sourceMappingURL=api.js.map