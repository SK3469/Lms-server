import express from "express";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js"

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All field required", success: false })
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exist with this email id.", success: false });
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        await User.create({
            name,
            email,
            password: hashedPassword
        })
        return res.status(201).json({ message: "Acoount created successfully.", success: true })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server internal error", required: false })
    }
}

// login function..
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All field required.", success: false })
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Incorrect email or password", success: false });
        }
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            return res.status(400).json({ message: "Incorrect email or password", success: false });
        }
        generateToken(res, user, `Welcome Back ${user.name}!`)

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server internal error", required: false })
    }
}

// //logout function..

export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({ message: "Logged out successfully.", success: true })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: "Failed to logout.",
            success: false
        })
    }
}

// //getUserProfile Function..
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Profile not found.", success: false })
        }
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "Unable to get profile try again later!" })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { name } = req.body;
        const profilePhoto = req.file;

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found.", success: true })
        }
        if (user.photoUrl) {
            //extract public id of the old image from the url exists and destroy.
            const publicId = user.photoUrl.split("/").pop().split(".")[0];// extract public id.
            deleteMediaFromCloudinary(publicId)
        }
        //upload new photo
        const cloudResponse = await uploadMedia(profilePhoto.path);
        const photoUrl = cloudResponse.secure_url;
        const updatedData = { name, photoUrl };
        const updatedUser = await User.findByIdAndUpdate(user, updatedData, { new: true }).select("-password");
        return res.status(200).json({
            user: updatedUser,
            success: true,
            message: "Updated Profile Successfully."
        })

    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "Unable to update profile try again later!" })
    }
}
