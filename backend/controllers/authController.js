const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Config = require('../config');
const sendEmail = require('../config/email');

const generateToken = (user, res) => {
    if (!Config.JWT_SECRET) {
        console.error("JWT_SECRET is undefined! Check .env file.");
        throw new Error("JWT_SECRET is missing.");
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        Config.JWT_SECRET,
        { expiresIn: "1d" }
    );

    // Set token in HTTP-Only cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure only in production
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return token;
};

// Register a user (Admin or HR)
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!["admin", "hr"].includes(role)) {
            return res.status(400).json({ message: "Invalid role assigned" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const user = await User.create({ name, email, password, role });

        res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // Ensure bcrypt.compare() is used to match password correctly
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(user, res);

        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Create a User (HR or Admin only) + Send Credentials via Email
exports.createUser = async (req, res) => {
    try {
        if (!["admin", "hr"].includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const user = await User.create({ name, email, password, role: "user" });

        // Send login credentials to the new user via email
        const emailSubject = "Your Account Credentials";
        const emailText = `Hello ${name},\n\nYour account has been created.\n\nLogin Details:\nEmail: ${email}\nPassword: ${password}\n\nPlease Use this password for logging in.\n\nRegards,\nDropBox Team`;


        await sendEmail(email, emailSubject, emailText);

        res.status(201).json({ message: "User created successfully and email sent", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Logout user and clear the cookie
exports.logout = async (req, res) => {
    res.cookie("token", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
};

// Get All Users (Admin Only)
exports.getUsers = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied! Only Admin can view users." });
        }

        const users = await User.find({ isDelete: false }).select('-password'); // Exclude deleted users
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update User (Admin Only)

exports.updateUser = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied! Only Admin can update users." });
        }

        const { id } = req.params;
        const { name, email, role, password } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isDelete) {
            return res.status(400).json({ message: "Cannot update a deleted user" });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;

        // If password is updated, hash it correctly    
        if (password) {
            user.password = password; // Assign new password directly

            // Send email notification with the new password
            const emailSubject = "Your Password Has Been Updated";
            const emailText = `Hello ${user.name},\n\nYour password has been successfully updated.\n\nNew Password: ${password}\n\nPlease Use this password for logging in.\n\nRegards,\nDropBox Team`;

            await sendEmail(user.email, emailSubject, emailText);
        }

        await user.save();

        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Soft Delete User (Admin Only)
exports.deleteUser = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied! Only Admin can delete users." });
        }

        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isDelete) {
            return res.status(400).json({ message: "User is already deleted" });
        }

        user.isDelete = true;
        await user.save();

        res.status(200).json({ message: "User deleted successfully (soft delete)" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};  