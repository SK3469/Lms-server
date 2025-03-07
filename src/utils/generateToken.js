import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: "1d" });

    res.cookie("token", token, {
        httpOnly: true, 
        secure: true, // ✅ Required for HTTPS on Render
        sameSite: "none", // ✅ Required for cross-origin authentication
        domain: "lms-server-ksh2.onrender.com", // ✅ Ensures cookie is stored under backend domain
        maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
    });

    return res.status(200).json({
        success: true,
        message,
        user,
    });
};
