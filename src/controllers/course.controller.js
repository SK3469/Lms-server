import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const createCourse = async (req, res) => {
    try {
        const { courseTitle, category } = req.body;
        if (!courseTitle || !category) {
            return res.status(400).json({
                message: "Course-Title & Category Required.",
                success: false
            });
        }
        const course = await Course.create({
            courseTitle,
            category,
            creator: req.id
        })
        return res.status(201).json({
            course,
            message: "Course Added Successfully.",
            success: true,
        })
    } catch (error) {
        console.log(error);

    }
}

export const getCreaterCourses = async (req, res) => {
    try {
        const userId = req.id;
        const courses = await Course.find({ creator: userId });
        if (!courses || courses === 0) {
            return res.status(404).json({
                courses: [],
                message: "Course not found.",
                success: false
            })
        }
        return res.status(200).json({
            courses
        })
    } catch (error) {
        console.log(error)
    }
}

export const editCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const { courseTitle, subTitle, description, category, courseLevel,
            coursePrice } = req.body;
        const thumbnail = req.file;

        let course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course Not Found!", success: false })
        }

        let courseThumbnail;
        if (thumbnail) {
            if (course.courseThumbnail) {
                const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                await deleteMediaFromCloudinary(publicId)// delete old image
            }
            //upload thumbnail on cludinary
            courseThumbnail = await uploadMedia(thumbnail.path);
        }

        const updateData = {
            courseTitle, subTitle, description, category, courseLevel,
            coursePrice, courseThumbnail: courseThumbnail?.secure_url
        }

        course = await Course.findByIdAndUpdate(courseId, updateData, { new: true })
        return res.status(200).json({
            message: "Course Updated Successfully.",
            success: true,
            course
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "failed to fatch course", success: false })
    }
}
// GetPublishedCourses..
export const getPublishCourse = async (_, res) => {
    try {
        const courses = await Course.find({ isPublished: true }).populate({
            path: "creator",
            select: "name photoUrl"
        });
        if (!courses) {
            return res.status(404).json({
                message: "Published courses not found.",
                success: false
            })
        }
        return res.status(200).json({
            courses,
            success: true
        })
    } catch (error) {
        console.log(error);

    }
}
export const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({ message: "Course Not Found!", success: false })
        }
        return res.status(200).json({
            course,
            success: true
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Can't Get", success: false })
    }
}
//Remove course function..
export const removeCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findByIdAndDelete(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found.",
                success: false
            })
        }
        return res.status(200).json({
            message: "Course removed successfully.", success: true
        })

    } catch (error) {
        return res.status(500).json(
            {
                message: "Failed to remove course",
                success: false
            })
    }
}

export const searchCourse = async (req, res) => {
    try {
        const { query = "", categories = [], sortByPrice = '' } = req.query;
        //cratae search query
        const searchCriteria = {
            isPublished: true,
            $or: [
                { courseTitle: { $regex: query, $options: "i" } },
                { subTitle: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } },
            ]
        }
        //if catrgories selected
        if (categories.length > 0) {
            searchCriteria.category = { $in: categories }
        }
        // define sorting order
        const sortOptions = {};
        if (sortByPrice === "low") {
            sortOptions.coursePrice = 1; //sort to accending order
        }
        if (sortByPrice === "high") {
            sortOptions.coursePrice = -1; //sort to decending order
        }
        let courses = await Course.find(searchCriteria).populate({ path: "creator ", select: "name photoUrl" }).sort(sortOptions)

        return res.status(200).json({
            courses: courses || [],
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}
//create lecture function.
export const createLecture = async (req, res) => {
    try {
        const { lectureTitle } = req.body;
        const { courseId } = req.params;
        if (!lectureTitle || !courseId) {
            return res.status(404).json({
                message: "Lecture Title required to post a lecture.",
                success: true
            })
        }
        const lecture = await Lecture.create({ lectureTitle });
        const course = await Course.findById(courseId);
        if (course) {
            course.lectures.push(lecture._id);
            await course.save();
        }
        return res.status(201).json({
            lecture,
            message: "Lecture created successfully.",
            success: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Failed to create lecture.", success: false })
    }
}

//get course lecture function.
export const getCourseLecture = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId).populate("lectures");
        if (!course) {
            return res.status(404).json({
                message: "Courses not found.",
                success: true,
            })
        }
        return res.status(200).json({
            lectures: course.lectures
        })
    } catch (error) {
        return res.status(500).json(
            {
                message: "Can't Get Lectures",
                success: false
            })
    }
}

// Edit lecture function..
export const editLecture = async (req, res) => {
    try {
        const { lectureTitle, videoInfo, isPreviewFree } = req.body;
        const { courseId, lectureId } = req.params;
        console.log(courseId, lectureId)
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "No Lecture Found.",
                success: false
            })
        }
        //update Lecture..
        if (lectureTitle) lecture.lectureTitle = lectureTitle;
        if (videoInfo && typeof videoInfo === "object") {
            if (videoInfo.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
            if (videoInfo.publicId) lecture.publicId = videoInfo.publicId;
        }
        lecture.isPreviewFree = isPreviewFree;

        await lecture.save();
        // Ensure course still have lecture id if it wasn't added.
        const course = await Course.findById(courseId);

        if (course && !course.lectures.includes(lecture._id)) { //if present well N good if !course > lecture id the includes or push
            course.lectures.push(lecture._id);
            await course.save();
        }
        return res.status(200).json({
            lecture,
            message: "Lecture Updated Successfully",
            success: true
        })
    }
    catch (error) {
        return res.status(500).json(
            {
                message: "Failed to Update.",
                success: false
            })
    }
}

//Remove lecture function..
export const revomeLecture = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const lecture = await Lecture.findByIdAndDelete(lectureId);

        if (!lecture) {
            return res.status(404).json({
                message: "No Lecture Found!",
                success: false
            })
        }
        // delete lecture from cloudinary .
        if (lecture.publicId) {
            await deleteVideoFromCloudinary(lecture.publicId);
        }
        //remove the lecture referece form the associated course.
        await Course.updateOne(
            { lecture: lectureId }, //find the course conatins the lecture 
            { $pull: { lecture: lectureId } }
        );

        return res.status(200).json({
            message: "Lecture Removed Successfully!",
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to remove lecture.", success: false })

    }
}

//Get Lecture by Id function.
export const getLectureById = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "No Lecture Found!",
                success: false
            })
        }
        return res.status(200).json({
            lecture,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to get lectures.", success: false })
    }
}

//publish and unpublish function

export const togglePublishCourse = async (req, res) => {
    try {

        const { courseId } = req.params;
        const { publish } = req.query // either true or false..

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found", success: false })
        }
        //Publish status based on the query paramter ...
        course.isPublished = publish === "true";
        await course.save();

        const statusMassage = course.isPublished ? "Published" : "Unpublished";
        return res.status(200).json({
            message: `Course ${statusMassage} Successfully`,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `failed to ${statusMassage}`, success: false })
    }
}