"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getProfile = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const validation_1 = require("../utils/validation");
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const validation = (0, validation_1.validateRegistration)({ name, email, password });
        if (!validation.isValid) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
            return;
        }
        const sanitizedName = (0, validation_1.sanitizeUserInput)(name);
        const sanitizedEmail = email.trim().toLowerCase();
        if (!(0, validation_1.isEmailDomainAllowed)(sanitizedEmail)) {
            res.status(400).json({
                success: false,
                message: 'Email domain not allowed. Please use a different email address.',
                errors: ['Invalid email domain']
            });
            return;
        }
        const existingUser = await User_1.default.findOne({ email: sanitizedEmail });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'User already exists with this email address.',
                errors: ['Email already registered']
            });
            return;
        }
        const user = new User_1.default({
            name: sanitizedName,
            email: sanitizedEmail,
            password: password
        });
        await user.save();
        const token = (0, jwt_1.generateToken)(user);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user);
        const userData = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified
        };
        res.status(201).json({
            success: true,
            message: 'User registered successfully! Welcome to LearnHub.',
            data: {
                user: userData,
                token,
                refreshToken
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
            return;
        }
        if (error.code === 11000) {
            res.status(409).json({
                success: false,
                message: 'User already exists with this email address.',
                errors: ['Email already registered']
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again later.',
            errors: ['Internal server error']
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const validation = (0, validation_1.validateLogin)({ email, password });
        if (!validation.isValid) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
            return;
        }
        const sanitizedEmail = email.trim().toLowerCase();
        const user = await User_1.default.findOne({ email: sanitizedEmail }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
                errors: ['Invalid credentials']
            });
            return;
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
                errors: ['Invalid credentials']
            });
            return;
        }
        const token = (0, jwt_1.generateToken)(user);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user);
        const userData = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified
        };
        res.status(200).json({
            success: true,
            message: 'Login successful! Welcome back to LearnHub.',
            data: {
                user: userData,
                token,
                refreshToken
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again later.',
            errors: ['Internal server error']
        });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }
        const userData = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified
        };
        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: {
                user: userData
            }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile',
            errors: ['Internal server error']
        });
    }
};
exports.getProfile = getProfile;
const logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logged out successfully. Thank you for using LearnHub!'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            errors: ['Internal server error']
        });
    }
};
exports.logout = logout;
