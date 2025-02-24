import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import cors from "cors"
import connectDB from "./src/utils/db.js";
import userRoute from "./src/routes/user.route.js"
import courseRoute from "./src/routes/course.route.js"
import mediaRoute from "./src/routes/media.route.js"
import purchaseRoute from "./src/routes/purchaseCourse.route.js"
import courseProgressRoute from "./src/routes/courseProgress.route.js"

dotenv.config();
connectDB();
const app = express();
const PORT = 8000;
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true,
    }
))


//Routes
app.use("/api/v1/user", userRoute)
app.use("/api/v1/course", courseRoute)
app.use("/api/v1/media", mediaRoute)
app.use("/api/v1/purchase", purchaseRoute)
app.use("/api/v1/courseprogress", courseProgressRoute)






app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});