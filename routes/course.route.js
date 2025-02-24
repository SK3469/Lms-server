import express from "express"
import { createCourse, createLecture, editCourse, editLecture, getCourseById, getCourseLecture, getCreaterCourses, getLectureById, getPublishCourse, removeCourse, revomeLecture, searchCourse, togglePublishCourse } from "../controllers/course.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import upload from "../utils/multer.js"

const router = express.Router();
router.route("/").post(isAuthenticated,createCourse);
router.route("/published-courses").get( getPublishCourse)
router.route("/").get(isAuthenticated, getCreaterCourses);
router.route("/:courseId").put(isAuthenticated,upload.single("courseThumbnail"), editCourse);
router.route("/:courseId").get(isAuthenticated, getCourseById);
router.route("/course/:courseId").delete(isAuthenticated , removeCourse)
router.route("/search").get(isAuthenticated,searchCourse)
router.route("/:courseId/lecture").post(isAuthenticated , createLecture)
router.route("/:courseId/lecture").get(isAuthenticated , getCourseLecture)
router.route("/:courseId/lecture/:lectureId").put(isAuthenticated ,editLecture);
router.route("/lecture/:lectureId").delete(isAuthenticated , revomeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated , getLectureById);
router.route("/:courseId").patch(isAuthenticated, togglePublishCourse)
export default router; 