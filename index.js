import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import cors from "cors"
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js"
import courseRoute from "./routes/course.route.js"
import mediaRoute from "./routes/media.route.js"
import purchaseRoute from "./routes/purchaseCourse.route.js"
import courseProgressRoute from "./routes/courseProgress.route.js"

dotenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT||3000;
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors(
    {
        origin:"http://localhost:5173",
        credentials:true,
    }
))


//Routes
app.use("/api/v1/user", userRoute)
app.use("/api/v1/course", courseRoute)
app.use("/api/v1/media", mediaRoute)
app.use("/api/v1/purchase",purchaseRoute)
app.use("/api/v1/courseprogress", courseProgressRoute)




//cheking server status 
// app.get("/", (req,res)=>{
//     return res.status(200).json({
//         message:` server listen at  ${PORT}`,
//         success:true
//     })
// });

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});